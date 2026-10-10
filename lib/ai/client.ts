import { cleanAndParseJson } from '../utils/helpers';
import { ApiConfig, AiConnectionTestResult } from '../../types/analysis';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 2026 Compatible Gemini models with separate quota buckets
const GEMINI_QUOTA_FAILOVER_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.0-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

// Pool of confirmed-free models on OpenRouter (used as fallback when OpenRouter model is not specified)
const FREE_MODEL_POOL = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'liquid/lfm-2.5-2.6b:free',
];

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Execute a single request to Google Gemini API
 */
async function callGeminiDirectOnce(
  apiKey: string,
  targetModel: string,
  systemPrompt: string,
  userIdea: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
  const promptText = `${systemPrompt}\n\nUser Idea to evaluate:\n"${userIdea}"\n\nCRITICAL: Return ONLY valid JSON adhering strictly to the requested schema.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[Gemini API ${response.status}] ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error(`[Gemini] Empty response received from model ${targetModel}`);
  }

  return text;
}

/**
 * Call Google Gemini API with automatic rate-limit (429) quota failover across model buckets
 */
async function callGeminiDirect(
  apiKey: string,
  preferredModel: string | undefined,
  systemPrompt: string,
  userIdea: string
): Promise<string> {
  const primary = preferredModel?.trim() || 'gemini-3.8-flash';
  const modelsToTry = [primary, ...GEMINI_QUOTA_FAILOVER_MODELS.filter((m) => m !== primary)];

  let lastError: Error = new Error('No Gemini models responded');

  for (let i = 0; i < modelsToTry.length; i++) {
    const targetModel = modelsToTry[i];
    try {
      return await callGeminiDirectOnce(apiKey, targetModel, systemPrompt, userIdea);
    } catch (err: any) {
      lastError = err;
      const msg = err.message || '';

      if (
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('Quota exceeded') ||
        msg.includes('404')
      ) {
        console.warn(`[Gemini Quota] ${targetModel} hit quota/error. Checking next model or failover...`);
        await new Promise((r) => setTimeout(r, 150));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

/**
 * Call OpenRouter / OpenAI compatible Chat Completion API
 */
async function callChatCompletion(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  customHeaders: Record<string, string> = {}
): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...customHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const retryResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          ...customHeaders,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          max_tokens: 1500,
        }),
      });

      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        const text = retryData?.choices?.[0]?.message?.content;
        if (text) return text;
      }
    }

    const errorText = await response.text();
    throw new Error(`[API ${response.status}] ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(`[empty] Model ${model} returned no content`);
  }

  return content;
}

/**
 * Call OpenRouter with exact user model or failover pool
 */
export async function callOpenRouterWithFallback(
  apiKey: string,
  preferredModel: string | undefined,
  messages: ChatMessage[]
): Promise<string> {
  if (preferredModel && preferredModel.trim().length > 0) {
    return await callChatCompletion(
      'https://openrouter.ai/api/v1/chat/completions',
      apiKey,
      preferredModel.trim(),
      messages,
      {
        'HTTP-Referer': 'https://multi-agent-innovation.local',
        'X-Title': 'AI Multi-Agent Innovation Analyzer',
      }
    );
  }

  const pool = shuffled(FREE_MODEL_POOL);
  let lastError: Error = new Error('No models available');

  for (const model of pool) {
    try {
      const result = await callChatCompletion(
        'https://openrouter.ai/api/v1/chat/completions',
        apiKey,
        model,
        messages,
        {
          'HTTP-Referer': 'https://multi-agent-innovation.local',
          'X-Title': 'AI Multi-Agent Innovation Analyzer',
        }
      );
      return result;
    } catch (err: any) {
      lastError = err;
      const msg = err.message || '';
      const isRetryable =
        msg.includes('429') ||
        msg.includes('404') ||
        msg.includes('[empty]') ||
        msg.includes('upstream') ||
        msg.includes('Provider returned error');
      if (!isRetryable) break;
    }
  }

  throw new Error(`All OpenRouter models failed. Last error: ${lastError.message}`);
}

/**
 * Unified Agent Execution with Hybrid Gemini + OpenRouter Failover
 */
export async function runAgentWithPrompt<T>(
  systemPrompt: string,
  userIdea: string,
  config?: ApiConfig
): Promise<T> {
  const provider = config?.provider;

  // Resolve keys
  const geminiKey =
    config?.geminiApiKey ||
    (provider === 'gemini' ? config?.apiKey : null) ||
    process.env.GEMINI_API_KEY;

  const openRouterKey =
    config?.openrouterApiKey ||
    (provider === 'openrouter' ? config?.apiKey : null) ||
    process.env.OPENROUTER_API_KEY;

  const geminiModel =
    config?.geminiModel ||
    (provider === 'gemini' ? config?.model : null) ||
    process.env.GEMINI_MODEL ||
    'gemini-3.8-flash';

  const openRouterModel =
    config?.openrouterModel ||
    (provider === 'openrouter' ? config?.model : null) ||
    process.env.OPENROUTER_MODEL;

  const chatMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Please analyze this business/technical idea and respond with ONLY a valid JSON object, no extra text, no markdown, no explanation before or after the JSON:\n\n"${userIdea}"`,
    },
  ];

  // 1. HYBRID DUAL-ENGINE MODE:
  // Runs Gemini first. If ANY agent hits 429 quota exhaustion or fails, OpenRouter instantly takes over that agent's workload!
  if (provider === 'hybrid' || (geminiKey && openRouterKey)) {
    try {
      const rawResponse = await callGeminiDirect(geminiKey!, geminiModel, systemPrompt, userIdea);
      return cleanAndParseJson<T>(rawResponse);
    } catch (geminiErr: any) {
      console.warn(
        `[Hybrid Failover] Gemini rate-limited or failed (${geminiErr.message}). Seamlessly handing off this agent to OpenRouter...`
      );

      // Instantly delegate ONLY this agent to OpenRouter
      try {
        const rawResponse = await callOpenRouterWithFallback(
          openRouterKey!,
          openRouterModel,
          chatMessages
        );
        return cleanAndParseJson<T>(rawResponse);
      } catch (openRouterErr: any) {
        throw new Error(
          `Both primary Gemini and OpenRouter backup failed: ${openRouterErr.message || geminiErr.message}`
        );
      }
    }
  }

  // 2. Pure Gemini Direct
  if (provider === 'gemini' || (geminiKey && !openRouterKey)) {
    if (!geminiKey) throw new Error('Google Gemini API key is required.');
    const rawResponse = await callGeminiDirect(geminiKey, geminiModel, systemPrompt, userIdea);
    return cleanAndParseJson<T>(rawResponse);
  }

  // 3. Custom Gateway
  if (provider === 'custom' && config?.baseUrl) {
    const apiKey = config.apiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('API key is required for custom gateway.');
    const endpoint = config.baseUrl.replace(/\/+$/, '') + '/chat/completions';
    const rawResponse = await callChatCompletion(endpoint, apiKey, config.model || 'gpt-4o-mini', chatMessages);
    return cleanAndParseJson<T>(rawResponse);
  }

  // 4. OpenRouter Only
  if (openRouterKey) {
    const rawResponse = await callOpenRouterWithFallback(openRouterKey, openRouterModel, chatMessages);
    return cleanAndParseJson<T>(rawResponse);
  }

  throw new Error('No active AI key configured. Open AI Setup to configure your Gemini or OpenRouter credentials.');
}

/**
 * Ping / Test AI Connection with real-time latency measurement
 */
export async function testAiConnection(config: ApiConfig): Promise<AiConnectionTestResult> {
  const startTime = Date.now();
  const testSystemPrompt = 'You are a test agent. Respond ONLY with valid JSON: {"status":"connected","system":"ok"}';
  const testIdea = 'Simple test connectivity check';

  // If Hybrid, test both Gemini and OpenRouter
  if (config.provider === 'hybrid') {
    const geminiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    const openRouterKey = config.openrouterApiKey || process.env.OPENROUTER_API_KEY;

    if (!geminiKey) {
      return { success: false, message: 'Gemini API key is required for Hybrid mode', provider: 'hybrid' };
    }
    if (!openRouterKey) {
      return { success: false, message: 'OpenRouter API key is required for Hybrid mode', provider: 'hybrid' };
    }

    try {
      // Test Gemini
      const geminiStart = Date.now();
      await callGeminiDirectOnce(
        geminiKey,
        config.geminiModel || 'gemini-3.8-flash',
        testSystemPrompt,
        testIdea
      );
      const geminiLatency = Date.now() - geminiStart;

      // Test OpenRouter
      const openRouterStart = Date.now();
      await callOpenRouterWithFallback(
        openRouterKey,
        config.openrouterModel,
        [
          { role: 'system', content: testSystemPrompt },
          { role: 'user', content: `Respond with JSON: {"status":"connected"}` },
        ]
      );
      const openRouterLatency = Date.now() - openRouterStart;

      return {
        success: true,
        latencyMs: geminiLatency,
        message: `Hybrid Dual-Engine Active: Gemini (${geminiLatency}ms) + OpenRouter (${openRouterLatency}ms backup ready)`,
        model: `${config.geminiModel || 'gemini-3.8-flash'} + ${config.openrouterModel || 'OpenRouter Pool'}`,
        provider: 'hybrid',
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        message: err.message || 'Hybrid test failed',
        provider: 'hybrid',
      };
    }
  }

  try {
    const raw = await runAgentWithPrompt<{ status: string; system: string }>(
      testSystemPrompt,
      testIdea,
      config
    );
    const latencyMs = Date.now() - startTime;

    if (raw && raw.status === 'connected') {
      return {
        success: true,
        latencyMs,
        message: `Successfully connected in ${latencyMs}ms`,
        model: config.model || (config.provider === 'gemini' ? 'gemini-3.8-flash' : 'openrouter-default'),
        provider: config.provider,
      };
    }

    return {
      success: true,
      latencyMs,
      message: `Connected in ${latencyMs}ms`,
      model: config.model,
      provider: config.provider,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      message: err.message || 'Connection test failed',
      provider: config.provider,
    };
  }
}

import { NextResponse } from 'next/server';
import { AgentName, ProgressEvent, ApiConfig } from '../../../types/analysis';
import { analyzeFeasibility } from '../../../lib/agents/feasibility';
import { analyzeMarket } from '../../../lib/agents/market';
import { analyzeTechnical } from '../../../lib/agents/technical';
import { analyzeInnovation } from '../../../lib/agents/innovation';
import { analyzeRisk } from '../../../lib/agents/risk';
import { analyzeLegal } from '../../../lib/agents/legal';
import { analyzeSuggestion } from '../../../lib/agents/suggestion';
import { DEMO_IDEA, DEMO_REPORT } from '../../../lib/ai/fallback';

export const runtime = 'nodejs'; // Node runtime supports streaming

export async function POST(req: Request) {
  try {
    const { idea, apiConfig }: { idea: string; apiConfig?: ApiConfig } = await req.json();

    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
      return NextResponse.json({ error: 'Please enter a valid idea description.' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const effectiveApiKey =
      apiConfig?.geminiApiKey ||
      apiConfig?.openrouterApiKey ||
      apiConfig?.apiKey ||
      process.env.OPENROUTER_API_KEY ||
      process.env.GEMINI_API_KEY;

    const hasCustomKey = !!(apiConfig?.apiKey || apiConfig?.geminiApiKey || apiConfig?.openrouterApiKey);
    const isDemoIdea = idea.trim().toLowerCase() === DEMO_IDEA.trim().toLowerCase();
    const isExplicitDemo = apiConfig?.provider === 'demo';

    // Fallback to demo simulation if explicitly requested, or if no API key is available
    if (!effectiveApiKey || isExplicitDemo || (isDemoIdea && !hasCustomKey)) {
      const stream = new ReadableStream({
        async start(controller) {
          const sendEvent = (event: ProgressEvent) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          };

          const agentNames: AgentName[] = [
            'feasibility',
            'market',
            'technical',
            'innovation',
            'risk',
            'legal',
            'suggestion',
          ];
          for (const name of agentNames) {
            sendEvent({ type: 'start', agent: name });
          }

          const staggeredCompletions = [
            { name: 'feasibility', delay: 600, result: DEMO_REPORT.results.feasibility },
            { name: 'market', delay: 1100, result: DEMO_REPORT.results.market },
            { name: 'technical', delay: 800, result: DEMO_REPORT.results.technical },
            { name: 'innovation', delay: 1400, result: DEMO_REPORT.results.innovation },
            { name: 'risk', delay: 950, result: DEMO_REPORT.results.risk },
            { name: 'legal', delay: 1250, result: DEMO_REPORT.results.legal },
            { name: 'suggestion', delay: 1600, result: DEMO_REPORT.results.suggestion },
          ];

          await Promise.all(
            staggeredCompletions.map(async (item) => {
              await new Promise((resolve) => setTimeout(resolve, item.delay));
              sendEvent({
                type: 'success',
                agent: item.name as AgentName,
                result: item.result,
              });
            })
          );

          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    // Active API Key available - run parallel agents with live LLM
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: ProgressEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        const agents = [
          { name: 'feasibility' as AgentName, fn: analyzeFeasibility },
          { name: 'market' as AgentName, fn: analyzeMarket },
          { name: 'technical' as AgentName, fn: analyzeTechnical },
          { name: 'innovation' as AgentName, fn: analyzeInnovation },
          { name: 'risk' as AgentName, fn: analyzeRisk },
          { name: 'legal' as AgentName, fn: analyzeLegal },
          { name: 'suggestion' as AgentName, fn: analyzeSuggestion },
        ];

        // Trigger execution of all 7 agents in parallel with slight micro-staggering to prevent 429 burst rate-limits
        const promises = agents.map(async (agent, index) => {
          // Stagger calls by 120ms to stay within free-tier concurrency windows
          if (index > 0) {
            await new Promise((resolve) => setTimeout(resolve, index * 120));
          }

          sendEvent({ type: 'start', agent: agent.name });
          try {
            const result = await agent.fn(idea, apiConfig);
            sendEvent({ type: 'success', agent: agent.name, result });
          } catch (error: any) {
            console.error(`Agent ${agent.name} failed:`, error);
            sendEvent({
              type: 'error',
              agent: agent.name,
              error: error.message || 'Analysis agent failed',
            });
          }
        });

        await Promise.all(promises);
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Unhandled API exception:', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}

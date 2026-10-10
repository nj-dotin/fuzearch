import { NextResponse } from 'next/server';
import { testAiConnection } from '../../../lib/ai/client';
import { ApiConfig } from '../../../types/analysis';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const config: ApiConfig = await req.json();

    if (!config || !config.provider) {
      return NextResponse.json(
        { success: false, message: 'Provider configuration is missing' },
        { status: 400 }
      );
    }

    if (config.provider === 'demo') {
      return NextResponse.json({
        success: true,
        latencyMs: 12,
        message: 'Offline Demo Matrix active (Local fallback simulation ready)',
        model: 'local-simulation-matrix',
        provider: 'demo',
      });
    }

    const hasKey =
      config.apiKey ||
      config.geminiApiKey ||
      config.openrouterApiKey ||
      process.env.OPENROUTER_API_KEY ||
      process.env.GEMINI_API_KEY;

    if (!hasKey) {
      return NextResponse.json(
        { success: false, message: 'Please provide an API key for ' + config.provider },
        { status: 400 }
      );
    }

    const result = await testAiConnection(config);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Connection test encountered an error',
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  let provider: 'openrouter' | 'gemini' | 'none' = 'none';
  if (hasGemini) provider = 'gemini';
  else if (hasOpenRouter) provider = 'openrouter';

  return NextResponse.json({
    serverConfigured: hasOpenRouter || hasGemini,
    provider,
    model: process.env.OPENROUTER_MODEL || process.env.GEMINI_MODEL || (hasGemini ? 'gemini-2.5-flash' : 'google/gemini-2.5-flash'),
  });
}

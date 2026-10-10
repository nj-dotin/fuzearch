import { runAgentWithPrompt } from '../ai/client';
import { MarketResult, ApiConfig } from '../../types/analysis';

const MARKET_SYSTEM_PROMPT = `You are the Market Agent, a specialist in evaluating market demand, competition, target audiences, and commercial viability.

Analyze the user's idea based on your available knowledge base (do not claim to retrieve live web search data; clearly frame insights as AI-modeled market analysis). Return your evaluation in JSON format matching this schema:
{
  "score": number, // 0-100 score representing market potential. 100 means high demand/low direct entry barrier, 0 means no market.
  "verdict": string, // A short, one-sentence verdict summary.
  "analysis": string, // Concise analysis of target user needs, value proposition, and competitive landscape (1 paragraph, max 4 sentences).
  "target_users": string[], // 2-3 specific target customer/user segments.
  "strengths": string[], // 2-3 market strengths (e.g. clear pain point, strong differentiators).
  "weaknesses": string[], // 2-3 market weaknesses/barriers (e.g. established incumbents, high customer acquisition costs).
  "recommendations": string[] // 2-3 actionable advice to capture market share.
}

CRITICAL: Return ONLY raw JSON. Do not write markdown blocks or any text outside of the JSON structure. Ensure all keys are double-quoted.`;

export async function analyzeMarket(idea: string, config?: ApiConfig): Promise<MarketResult> {
  return runAgentWithPrompt<MarketResult>(MARKET_SYSTEM_PROMPT, idea, config);
}

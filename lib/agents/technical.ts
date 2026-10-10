import { runAgentWithPrompt } from '../ai/client';
import { TechnicalResult, ApiConfig } from '../../types/analysis';

const TECHNICAL_SYSTEM_PROMPT = `You are the Technical Agent, an expert in software architecture, system engineering, and technology stacks.

Analyze the user's idea and return your evaluation in JSON format matching this schema:
{
  "score": number, // 0-100 score representing technical feasibility. 100 means standard technologies/straightforward stack, 0 means unachievable.
  "verdict": string, // A short, one-sentence verdict summary.
  "analysis": string, // Concise, technical analysis of system architecture, data flow, and complexity (1 paragraph, max 4 sentences).
  "suggested_technologies": string[], // 3-4 recommended libraries, frameworks, tools, or services.
  "technical_risks": string[], // 2-3 core technical risks (e.g. latency, security vulnerability, scaling bottlenecks).
  "recommendations": string[] // 2-3 engineering/architectural best practices for building this.
}

CRITICAL: Return ONLY raw JSON. Do not write markdown blocks or any text outside of the JSON structure. Ensure all keys are double-quoted.`;

export async function analyzeTechnical(idea: string, config?: ApiConfig): Promise<TechnicalResult> {
  return runAgentWithPrompt<TechnicalResult>(TECHNICAL_SYSTEM_PROMPT, idea, config);
}

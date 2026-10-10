import { runAgentWithPrompt } from '../ai/client';
import { LegalResult, ApiConfig } from '../../types/analysis';

const LEGAL_SYSTEM_PROMPT = `You are the Legal Agent, a specialist in identifying high-level compliance, regulatory, intellectual property, ethical, and privacy (e.g. GDPR, CCPA) concerns.

Analyze the user's idea and return your evaluation in JSON format matching this schema:
{
  "score": number, // 0-100 score. 100 means few/no legal or ethical concerns, 0 means massive regulatory barriers or ethical hazards.
  "verdict": string, // A short, one-sentence verdict summary.
  "analysis": string, // Concise overview of regulatory, IP, and compliance implications relevant to the idea (1 paragraph, max 4 sentences).
  "concerns": string[], // 2-3 specific legal, regulatory, or privacy issues to watch out for.
  "recommendations": string[] // 2-3 steps to remain compliant (e.g. data encryption, terms of service, consulting counsel).
}

CRITICAL: Return ONLY raw JSON. Do not write markdown blocks or any text outside of the JSON structure. Ensure all keys are double-quoted.`;

export async function analyzeLegal(idea: string, config?: ApiConfig): Promise<LegalResult> {
  return runAgentWithPrompt<LegalResult>(LEGAL_SYSTEM_PROMPT, idea, config);
}

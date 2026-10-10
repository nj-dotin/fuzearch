export interface FeasibilityResult {
  score: number;
  verdict: string;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface MarketResult {
  score: number;
  verdict: string;
  analysis: string;
  target_users: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface TechnicalResult {
  score: number;
  verdict: string;
  analysis: string;
  suggested_technologies: string[];
  technical_risks: string[];
  recommendations: string[];
}

export interface InnovationResult {
  score: number;
  verdict: string;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface RiskResult {
  score: number; // 90 = low risk (favorable), 20 = high risk
  risk_level: string;
  analysis: string;
  major_risks: string[];
  mitigations: string[];
}

export interface LegalResult {
  score: number; // 100 = few concerns, 0 = serious concerns
  verdict: string;
  analysis: string;
  concerns: string[];
  recommendations: string[];
}

export interface SuggestionResult {
  summary: string;
  improvements: string[];
  recommended_features: string[];
  next_steps: string[];
}

export interface AgentResultsMap {
  feasibility?: FeasibilityResult;
  market?: MarketResult;
  technical?: TechnicalResult;
  innovation?: InnovationResult;
  risk?: RiskResult;
  legal?: LegalResult;
  suggestion?: SuggestionResult;
}

export interface AgentErrorsMap {
  feasibility?: string;
  market?: string;
  technical?: string;
  innovation?: string;
  risk?: string;
  legal?: string;
  suggestion?: string;
  [key: string]: string | undefined;
}

export interface AnalysisReport {
  id: string;
  idea: string;
  timestamp: string;
  overallScore: number;
  verdict: 'High Potential' | 'Moderate Potential' | 'Needs Improvement';
  explanation: string;
  results: AgentResultsMap;
  errors: AgentErrorsMap;
  isDemo?: boolean;
}

export type AgentName = 'feasibility' | 'market' | 'technical' | 'innovation' | 'risk' | 'legal' | 'suggestion';

export interface ProgressEvent {
  type: 'start' | 'success' | 'error';
  agent: AgentName;
  result?: any;
  error?: string;
}

export type AiProvider = 'gemini' | 'openrouter' | 'hybrid' | 'custom' | 'demo';

export interface ApiConfig {
  provider: AiProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  // Dual-key hybrid fields
  geminiApiKey?: string;
  geminiModel?: string;
  openrouterApiKey?: string;
  openrouterModel?: string;
}

export interface AiConnectionTestResult {
  success: boolean;
  latencyMs?: number;
  message: string;
  model?: string;
  provider?: string;
}

export interface AiEngineStatus {
  active: boolean;
  provider?: AiProvider;
  model?: string;
  source: 'env' | 'client' | 'fallback';
  message?: string;
}


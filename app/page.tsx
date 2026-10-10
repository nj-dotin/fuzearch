'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import HowItWorks from '../components/HowItWorks';
import IdeaInput from '../components/IdeaInput';
import AnalysisProgress, { AgentStatusMap } from '../components/AnalysisProgress';
import HistoryList from '../components/HistoryList';
import ApiConfigModal from '../components/ApiConfigModal';
import { AnalysisReport, ProgressEvent, AgentResultsMap, AgentErrorsMap, ApiConfig } from '../types/analysis';
import { calculateOverallScore, getVerdict, generateExplanation } from '../lib/utils/helpers';

const initialStatuses: AgentStatusMap = {
  feasibility: 'idle',
  market: 'idle',
  technical: 'idle',
  innovation: 'idle',
  risk: 'idle',
  legal: 'idle',
  suggestion: 'idle',
};

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agentStatuses, setAgentStatuses] = useState<AgentStatusMap>(initialStatuses);
  const [agentErrors, setAgentErrors] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<AnalysisReport[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Status for secret indicator
  const [isApiActive, setIsApiActive] = useState<boolean>(false);
  const [activeProvider, setActiveProvider] = useState<string>('fallback');
  const lastHeroTapRef = useRef<number>(0);

  // Check API health status
  const checkStatus = async () => {
    try {
      const stored = localStorage.getItem('innovation_analyzer_api_config');
      if (stored) {
        const parsed: ApiConfig = JSON.parse(stored);
        const hasGemini = !!(parsed.geminiApiKey && parsed.geminiApiKey.trim().length > 0);
        const hasOpenRouter = !!(parsed.openrouterApiKey && parsed.openrouterApiKey.trim().length > 0);
        const hasSingleKey = !!(parsed.apiKey && parsed.apiKey.trim().length > 0);

        if (hasGemini && hasOpenRouter) {
          setIsApiActive(true);
          setActiveProvider('Hybrid Dual-Engine');
          return;
        } else if (hasGemini) {
          setIsApiActive(true);
          setActiveProvider('Gemini Direct');
          return;
        } else if (hasOpenRouter) {
          setIsApiActive(true);
          setActiveProvider('OpenRouter');
          return;
        } else if (hasSingleKey) {
          setIsApiActive(true);
          setActiveProvider(parsed.provider === 'gemini' ? 'Gemini Direct' : parsed.provider === 'openrouter' ? 'OpenRouter' : 'Custom');
          return;
        }
      }

      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.serverConfigured) {
          setIsApiActive(true);
          setActiveProvider(data.provider === 'gemini' ? 'Gemini' : 'OpenRouter');
          return;
        }
      }

      setIsApiActive(false);
      setActiveProvider('Fallback Demo');
    } catch {
      setIsApiActive(false);
      setActiveProvider('Fallback Demo');
    }
  };

  useEffect(() => {
    checkStatus();
    const handleUpdate = () => checkStatus();
    window.addEventListener('ai-config-updated', handleUpdate);
    return () => window.removeEventListener('ai-config-updated', handleUpdate);
  }, []);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('innovation_analyzer_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history from localStorage:', e);
    }
  }, []);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('innovation_analyzer_history');
      setHistory([]);
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  };

  const handleHeroTouchEnd = () => {
    const now = Date.now();
    if (now - lastHeroTapRef.current < 350) {
      setIsConfigOpen(true);
    }
    lastHeroTapRef.current = now;
  };

  const handleAnalyzeIdea = async (idea: string) => {
    setIsLoading(true);
    setError('');
    setAgentErrors({});
    setAgentStatuses(initialStatuses);

    const tempResults: AgentResultsMap = {};
    const tempErrors: AgentErrorsMap = {};
    const analysisId = `analysis-${Date.now()}`;

    // Read client apiConfig if available
    let apiConfig: ApiConfig | undefined = undefined;
    try {
      const stored = localStorage.getItem('innovation_analyzer_api_config');
      if (stored) {
        apiConfig = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse api config:', e);
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, apiConfig }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error starting analysis.');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Your browser does not support response streaming.');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const dataStr = trimmed.slice(6);
            const event: ProgressEvent = JSON.parse(dataStr);

            setAgentStatuses((prev) => ({
              ...prev,
              [event.agent]: event.type === 'start' ? 'running' : event.type === 'success' ? 'success' : 'error',
            }));

            if (event.type === 'success') {
              tempResults[event.agent] = event.result;
            } else if (event.type === 'error') {
              const errMsg = event.error || 'Analysis agent failed';
              tempErrors[event.agent] = errMsg;
              setAgentErrors((prev) => ({ ...prev, [event.agent]: errMsg }));
            }
          } catch (e) {
            console.error('Error parsing line data:', trimmed, e);
          }
        }
      }

      const successCount = Object.keys(tempResults).length;

      if (successCount === 0) {
        throw new Error('All analysis agents failed to execute. Please verify your API key configurations.');
      }

      // Calculate aggregates mathematically
      const calculatedScore = calculateOverallScore({
        feasibility: tempResults.feasibility?.score,
        market: tempResults.market?.score,
        technical: tempResults.technical?.score,
        innovation: tempResults.innovation?.score,
        risk: tempResults.risk?.score,
        legal: tempResults.legal?.score,
      });

      const calculatedVerdict = getVerdict(calculatedScore);
      const programExplanation = generateExplanation(tempResults);

      const isDemoMode = !isApiActive || idea.trim().toLowerCase().includes('food waste');

      const newReport: AnalysisReport = {
        id: analysisId,
        idea: idea,
        timestamp: new Date().toISOString(),
        overallScore: calculatedScore,
        verdict: calculatedVerdict,
        explanation: programExplanation,
        results: tempResults,
        errors: tempErrors,
        isDemo: isDemoMode,
      };

      const currentHistory = [...history];
      currentHistory.unshift(newReport);
      localStorage.setItem('innovation_analyzer_history', JSON.stringify(currentHistory));
      setHistory(currentHistory);

      router.push(`/results/${analysisId}`);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An unexpected error occurred during analysis.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Editorial Hero Header */}
        <div className="text-center space-y-3 py-2 sm:py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200/60 mb-2">
            <span>Specialized Multi-Agent AI System</span>
            <span className="text-stone-300">|</span>
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <span
                className={`h-2 w-2 rounded-full ${
                  isApiActive ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                }`}
              />
              {isApiActive ? activeProvider : 'Demo Matrix'}
            </span>
          </div>

          {/* Interactive Title with Double-Tap Secret Trigger & Indicator Dot */}
          <div
            className="flex items-center justify-center gap-2.5 cursor-pointer group select-none"
            onDoubleClick={() => setIsConfigOpen(true)}
            onTouchEnd={handleHeroTouchEnd}
            title="Double-click to open Secret AI Configuration"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight">
              AI Multi-Agent Innovation Analyzer
            </h1>
            {/* Secret Dot Indicator */}
            <span
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                isApiActive
                  ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                  : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse'
              }`}
            />
          </div>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-stone-500 leading-relaxed font-normal">
            Evaluate concepts concurrently across 7 specialized dimensions — operational feasibility, market viability, technical stack, novelty, risk, compliance, and product roadmap.
          </p>
        </div>

        {/* Visual Multi-Agent Architecture Flow */}
        <HowItWorks />

        {/* Error Banner */}
        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200/80 p-4 text-xs sm:text-sm text-rose-800">
            <div className="flex gap-2.5">
              <span>⚠️</span>
              <div>
                <p className="font-bold">Evaluation Interrupted</p>
                <p className="mt-0.5 text-xs text-rose-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Input & Live Progress Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <IdeaInput onSubmit={handleAnalyzeIdea} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-5">
            {isLoading ? (
              <AnalysisProgress statuses={agentStatuses} errors={agentErrors} />
            ) : (
              <div className="rounded-2xl border border-stone-200/80 bg-stone-50/40 p-6 sm:p-8 text-center space-y-3">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-stone-200/80 text-stone-700 shadow-2xs">
                  ⚡
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight">
                  Ready for Evaluation
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                  Type your concept or pick a quick prompt to trigger all 7 agents in parallel. Total turnaround is approx 8–15 seconds.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Previous Reports Section */}
        <div className="border-t border-stone-200/80 pt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Historical Evaluations
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Locally cached evaluations on this browser session.
              </p>
            </div>
          </div>
          <HistoryList reports={history} onClearHistory={handleClearHistory} />
        </div>
      </main>

      {/* Secret AI Configuration Modal */}
      <ApiConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigSaved={() => checkStatus()}
      />
    </div>
  );
}

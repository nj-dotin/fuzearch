'use client';

import React, { useState, useEffect } from 'react';
import { ApiConfig, AiProvider, AiConnectionTestResult } from '../types/analysis';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: ApiConfig) => void;
}

const DEFAULT_CONFIG: ApiConfig = {
  provider: 'hybrid',
  apiKey: '',
  model: 'gemini-3.8-flash',
  baseUrl: '',
  geminiApiKey: '',
  geminiModel: 'gemini-3.8-flash',
  openrouterApiKey: '',
  openrouterModel: 'deepseek/deepseek-r1',
};

// 2026 Google Gemini Models lineup
const GEMINI_MODELS = [
  { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (Latest 2026 • Recommended)' },
  { id: 'gemini-3.6-flash', label: 'gemini-3.6-flash (Production Flash)' },
  { id: 'gemini-3.5-flash', label: 'gemini-3.5-flash' },
  { id: 'gemini-3.0-pro', label: 'gemini-3.0-pro (High Reasoning)' },
  { id: 'gemini-3.0-flash', label: 'gemini-3.0-flash' },
  { id: 'gemini-2.0-flash', label: 'gemini-2.0-flash' },
  { id: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
];

const OPENROUTER_SUGGESTIONS = [
  'deepseek/deepseek-r1',
  'deepseek/deepseek-chat',
  'anthropic/claude-3.5-sonnet',
  'meta-llama/llama-3.3-70b-instruct',
  'google/gemini-2.0-flash-001',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
];

export default function ApiConfigModal({ isOpen, onClose, onConfigSaved }: ApiConfigModalProps) {
  const [config, setConfig] = useState<ApiConfig>(DEFAULT_CONFIG);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<AiConnectionTestResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTestResult(null);
      setSavedSuccess(false);
      try {
        const stored = localStorage.getItem('innovation_analyzer_api_config');
        if (stored) {
          const parsed = JSON.parse(stored);
          setConfig({
            ...DEFAULT_CONFIG,
            ...parsed,
            geminiApiKey: parsed.geminiApiKey || (parsed.provider === 'gemini' ? parsed.apiKey : '') || '',
            openrouterApiKey: parsed.openrouterApiKey || (parsed.provider === 'openrouter' ? parsed.apiKey : '') || '',
          });
        }
      } catch (e) {
        console.error('Failed to load api config:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (provider: AiProvider) => {
    setTestResult(null);
    setConfig((prev) => ({
      ...prev,
      provider,
      apiKey: provider === 'gemini' ? prev.geminiApiKey : provider === 'openrouter' ? prev.openrouterApiKey : prev.apiKey,
    }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const payload: ApiConfig = {
        ...config,
        apiKey:
          config.provider === 'gemini'
            ? config.geminiApiKey
            : config.provider === 'openrouter'
            ? config.openrouterApiKey
            : config.apiKey,
      };

      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: AiConnectionTestResult = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    try {
      const toSave: ApiConfig = {
        ...config,
        apiKey:
          config.provider === 'gemini'
            ? config.geminiApiKey
            : config.provider === 'openrouter'
            ? config.openrouterApiKey
            : config.apiKey,
      };

      localStorage.setItem('innovation_analyzer_api_config', JSON.stringify(toSave));
      window.dispatchEvent(new Event('ai-config-updated'));
      if (onConfigSaved) onConfigSaved(toSave);
      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('innovation_analyzer_api_config');
    setConfig(DEFAULT_CONFIG);
    setTestResult(null);
    window.dispatchEvent(new Event('ai-config-updated'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-stone-200/80 transition-all z-10 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-bold text-stone-900 tracking-tight">
                AI Engine & API Gateway Setup
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Combine Google Gemini speed with instant OpenRouter rate-limit failover.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="pt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
              Architecture Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleProviderChange('hybrid')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  config.provider === 'hybrid'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 shadow-xs ring-1 ring-emerald-600'
                    : 'border-stone-200 bg-stone-50/60 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <span>✨ Hybrid Dual</span>
                <span className="text-[10px] font-normal text-emerald-700 mt-0.5">Gemini + OpenRouter</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  config.provider === 'gemini'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 shadow-xs ring-1 ring-emerald-600'
                    : 'border-stone-200 bg-stone-50/60 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <span>Google Gemini</span>
                <span className="text-[10px] font-normal text-stone-500 mt-0.5">Direct Only</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderChange('openrouter')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  config.provider === 'openrouter'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 shadow-xs ring-1 ring-emerald-600'
                    : 'border-stone-200 bg-stone-50/60 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <span>OpenRouter</span>
                <span className="text-[10px] font-normal text-stone-500 mt-0.5">Direct Only</span>
              </button>
            </div>
          </div>

          {/* HYBRID EXPLANATION BANNER */}
          {config.provider === 'hybrid' && (
            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-3 text-[11px] text-emerald-900 leading-relaxed flex items-start gap-2">
              <span className="text-base flex-shrink-0">⚡</span>
              <div>
                <strong>Zero Rate-Limit Fallback Pipeline:</strong> Agents dispatch on high-speed Gemini first. If any agent encounters Google&apos;s 5 RPM rate limit (429), OpenRouter immediately takes over <em>only that agent&apos;s job</em>. Entire analysis finishes in ~5–12 seconds!
              </div>
            </div>
          )}

          {/* 1. GOOGLE GEMINI CREDENTIALS (HYBRID OR GEMINI) */}
          {(config.provider === 'hybrid' || config.provider === 'gemini') && (
            <div className="space-y-3 p-3.5 rounded-xl border border-stone-200/90 bg-stone-50/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Google Gemini (Primary Engine)
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-700 hover:underline font-medium"
                >
                  Get free Gemini key &rarr;
                </a>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block mb-1">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={config.geminiApiKey || ''}
                    onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-900 font-mono placeholder:text-stone-400 focus:border-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-medium"
                  >
                    {showGeminiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block mb-1">
                  Gemini Model (2026 Lineup)
                </label>
                <select
                  value={config.geminiModel || 'gemini-3.8-flash'}
                  onChange={(e) => setConfig({ ...config, geminiModel: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-900 font-mono focus:border-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-800"
                >
                  {GEMINI_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 2. OPENROUTER CREDENTIALS (HYBRID OR OPENROUTER) */}
          {(config.provider === 'hybrid' || config.provider === 'openrouter') && (
            <div className="space-y-3 p-3.5 rounded-xl border border-stone-200/90 bg-stone-50/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  OpenRouter {config.provider === 'hybrid' ? '(Dynamic Failover Backup)' : '(Primary Engine)'}
                </span>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-700 hover:underline font-medium"
                >
                  Get OpenRouter key &rarr;
                </a>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block mb-1">
                  OpenRouter API Key
                </label>
                <div className="relative">
                  <input
                    type={showOpenRouterKey ? 'text' : 'password'}
                    placeholder="sk-or-v1-..."
                    value={config.openrouterApiKey || ''}
                    onChange={(e) => setConfig({ ...config, openrouterApiKey: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-900 font-mono placeholder:text-stone-400 focus:border-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-medium"
                  >
                    {showOpenRouterKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
                    OpenRouter Model Slug (paste any model)
                  </label>
                  <a
                    href="https://openrouter.ai/models"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-emerald-700 hover:underline font-medium"
                  >
                    Catalog &rarr;
                  </a>
                </div>
                <input
                  type="text"
                  placeholder="e.g. deepseek/deepseek-r1 or meta-llama/llama-3.3-70b-instruct"
                  value={config.openrouterModel || ''}
                  onChange={(e) => setConfig({ ...config, openrouterModel: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-900 font-mono placeholder:text-stone-400 focus:border-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-800"
                />

                {/* Clickable Suggestion Chips */}
                <div className="mt-2">
                  <span className="text-[10px] text-stone-400 block mb-1">
                    Quick suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {OPENROUTER_SUGGESTIONS.map((slug) => (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => setConfig({ ...config, openrouterModel: slug })}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
                          config.openrouterModel === slug
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        {slug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Connection Test Feedback Banner */}
          {testResult && (
            <div
              className={`rounded-xl p-3 text-xs border flex items-start justify-between gap-2 transition-all ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm">{testResult.success ? '✓' : '⚠️'}</span>
                <div>
                  <p className="font-semibold">{testResult.success ? 'Connectivity Verified' : 'Connection Error'}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed break-all">{testResult.message}</p>
                </div>
              </div>
              {testResult.latencyMs !== undefined && (
                <span className="flex-shrink-0 font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/80 border border-stone-200 text-stone-700 font-bold">
                  {testResult.latencyMs}ms
                </span>
              )}
            </div>
          )}

          {savedSuccess && (
            <div className="rounded-xl p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-center">
              ✓ Dual-Engine Hybrid credentials saved! Both APIs active.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-2.5 justify-between items-center">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-stone-400 hover:text-stone-700 py-1.5 px-2 transition-colors self-start sm:self-auto"
          >
            Reset
          </button>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex-1 sm:flex-none rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-3.5 py-2.5 text-xs font-semibold text-stone-700 shadow-2xs transition-all disabled:opacity-50"
            >
              {isTesting ? 'Testing Ping...' : 'Test Connection'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none rounded-xl bg-stone-900 hover:bg-stone-800 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

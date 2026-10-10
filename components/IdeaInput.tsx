'use client';

import React, { useState } from 'react';
import { DEMO_IDEA } from '../lib/ai/fallback';

interface IdeaInputProps {
  onSubmit: (idea: string) => void;
  isLoading: boolean;
}

const SAMPLE_IDEAS = [
  {
    label: 'Campus Food Waste AI',
    text: DEMO_IDEA,
  },
  {
    label: 'Autonomous Code Auditor',
    text: 'An autonomous multi-agent developer platform that reviews GitHub pull requests against OWASP Top 10 security standards, performs fuzz testing on API contracts, and submits auto-fixes directly as git patches.',
  },
  {
    label: 'Smart Domestic Water Monitor',
    text: 'An IoT and AI solution that attaches non-invasively to residential water pipes, models acoustic acoustic vibration patterns to predict hidden pipe leaks, and dispatches automated shutoff valves.',
  },
];

export default function IdeaInput({ onSubmit, isLoading }: IdeaInputProps) {
  const [idea, setIdea] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = idea.trim();
    if (!trimmed) {
      setError('Please provide a brief description of your concept.');
      return;
    }

    if (trimmed.length < 20) {
      setError('Please provide at least 20 characters so the 7 agents can generate an in-depth analysis.');
      return;
    }

    onSubmit(trimmed);
  };

  const handleDemoTrigger = () => {
    setError('');
    setIdea(DEMO_IDEA);
    onSubmit(DEMO_IDEA);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs transition-all"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <label
              htmlFor="idea-description"
              className="block text-sm font-bold text-stone-900"
            >
              Describe Your Innovation Concept
            </label>
            <p className="text-xs text-stone-500 mt-0.5">
              Specify the target users, core workflow, and technical or operational mechanism.
            </p>
          </div>
          <span className="text-[11px] font-mono text-stone-400 self-end sm:self-auto">
            {idea.length} characters
          </span>
        </div>

        {/* Input Textarea */}
        <div className="relative">
          <textarea
            id="idea-description"
            rows={5}
            className={`w-full rounded-xl border bg-stone-50/30 p-4 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                : 'border-stone-200 focus:border-stone-900'
            } disabled:bg-stone-50 disabled:text-stone-400`}
            placeholder="e.g. A peer-to-peer microgrid platform enabling residential solar owners to trade surplus clean electricity dynamically using smart meter telemetry and automated settlement..."
            value={idea}
            onChange={(e) => {
              setIdea(e.target.value);
              if (error) setError('');
            }}
            disabled={isLoading}
          />
        </div>

        {/* Quick Sample Inspiration Pills */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[11px] font-medium text-stone-400">Quick Prompts:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_IDEAS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setIdea(sample.text);
                  if (error) setError('');
                }}
                disabled={isLoading}
                className="rounded-lg border border-stone-200 bg-stone-50/70 hover:bg-stone-100 hover:border-stone-300 px-2.5 py-1 text-[11px] font-medium text-stone-700 transition-all disabled:opacity-50"
              >
                + {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200/80 px-3.5 py-2 text-xs text-rose-800 font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Action Triggers */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-stone-100">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-3 px-5 shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Evaluating Concurrently...
              </>
            ) : (
              'Run Multi-Agent Evaluation'
            )}
          </button>

          <button
            type="button"
            onClick={handleDemoTrigger}
            disabled={isLoading}
            className="rounded-xl border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold py-3 px-4 shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Try Demo Idea
          </button>
        </div>
      </div>
    </form>
  );
}

'use client';

import React from 'react';

interface OverallScoreProps {
  score: number;
  verdict: 'High Potential' | 'Moderate Potential' | 'Needs Improvement';
  explanation: string;
  isDemo?: boolean;
}

export default function OverallScore({ score, verdict, explanation, isDemo }: OverallScoreProps) {
  const verdictConfig = {
    'High Potential': {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-900',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      stroke: '#10b981',
      title: 'High Viability Concept',
    },
    'Moderate Potential': {
      bg: 'bg-amber-50/80',
      text: 'text-amber-900',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      stroke: '#f59e0b',
      title: 'Promising Dynamic Niche',
    },
    'Needs Improvement': {
      bg: 'bg-rose-50/80',
      text: 'text-rose-900',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      stroke: '#f43f5e',
      title: 'Refinement & Iteration Needed',
    },
  }[verdict] || {
    bg: 'bg-stone-50',
    text: 'text-stone-800',
    border: 'border-stone-200',
    dot: 'bg-stone-400',
    stroke: '#78716c',
    title: 'Evaluated Concept',
  };

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
      {/* Circular Gauge */}
      <div className="relative flex-shrink-0 flex items-center justify-center h-32 w-32 rounded-full bg-stone-50/50 border border-stone-200/60">
        <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="54"
            stroke="#f5f5f4"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r="54"
            stroke={verdictConfig.stroke}
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 54}
            strokeDashoffset={2 * Math.PI * 54 * (1 - score / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="text-center z-10">
          <span className="block text-3xl font-extrabold text-stone-900 font-mono leading-none tracking-tight">
            {score}
          </span>
          <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider mt-1 block">
            Overall / 100
          </span>
        </div>
      </div>

      {/* Narrative & Verdict Details */}
      <div className="flex-1 text-center md:text-left space-y-2.5">
        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
          <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">
            Evaluation Verdict:
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold border ${verdictConfig.bg} ${verdictConfig.text} ${verdictConfig.border}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${verdictConfig.dot}`} />
            {verdict}
          </span>
          {isDemo && (
            <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-semibold text-stone-600 border border-stone-200">
              Demo Simulation Mode
            </span>
          )}
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
          {verdictConfig.title}
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
          {explanation}
        </p>

        {isDemo && (
          <div className="text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded-xl px-3 py-2 text-left flex items-start gap-2 mt-2">
            <span>💡</span>
            <span>
              <strong>Fallback Simulation:</strong> Double-click the header title anytime to configure your real Google Gemini or OpenRouter API key for custom evaluations.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

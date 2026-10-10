'use client';

import React from 'react';

interface ScoreMetricProps {
  label: string;
  score?: number;
  verdict: string;
  tooltip?: string;
}

function ScoreMetric({ label, score, verdict, tooltip }: ScoreMetricProps) {
  const hasScore = typeof score === 'number' && score > 0;
  
  const getScoreColor = (val: number) => {
    if (val >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-700' };
    if (val >= 60) return { bar: 'bg-amber-500', text: 'text-amber-700' };
    return { bar: 'bg-rose-500', text: 'text-rose-700' };
  };

  const colors = hasScore ? getScoreColor(score) : { bar: 'bg-stone-200', text: 'text-stone-400' };

  return (
    <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-2xs hover:border-stone-300 transition-all flex flex-col justify-between gap-3">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-bold text-stone-900 tracking-tight block">
            {label}
          </span>
          <span className={`text-sm font-bold font-mono ${colors.text}`}>
            {hasScore ? `${score}/100` : '—/100'}
          </span>
        </div>
        <p className="text-[11px] text-stone-400 font-normal mt-0.5 leading-snug">
          {tooltip}
        </p>
      </div>

      {/* Progress Track */}
      <div>
        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
            style={{ width: `${hasScore ? score : 0}%` }}
          />
        </div>
        <div className="text-[11px] text-stone-600 font-medium mt-1.5 flex items-center justify-between">
          <span className="text-stone-400 font-normal">Verdict:</span>
          <span className="truncate max-w-[170px] text-right font-semibold text-stone-800">
            {verdict}
          </span>
        </div>
      </div>
    </div>
  );
}

interface ScoreCardProps {
  scores: {
    feasibility?: number;
    market?: number;
    technical?: number;
    innovation?: number;
    risk?: number;
    legal?: number;
  };
  verdicts: {
    feasibility?: string;
    market?: string;
    technical?: string;
    innovation?: string;
    risk?: string;
    legal?: string;
  };
}

export default function ScoreCard({ scores, verdicts }: ScoreCardProps) {
  const metrics = [
    {
      key: 'feasibility',
      label: 'Feasibility',
      tooltip: 'Operational complexity & deployment readiness',
      score: scores.feasibility,
      verdict: verdicts.feasibility ?? 'Not evaluated',
    },
    {
      key: 'market',
      label: 'Market Potential',
      tooltip: 'Customer demand & competitive positioning',
      score: scores.market,
      verdict: verdicts.market ?? 'Not evaluated',
    },
    {
      key: 'technical',
      label: 'Technical Execution',
      tooltip: 'Stack complexity & architectural risks',
      score: scores.technical,
      verdict: verdicts.technical ?? 'Not evaluated',
    },
    {
      key: 'innovation',
      label: 'Innovation Degree',
      tooltip: 'Novelty, moat & unique value differentiation',
      score: scores.innovation,
      verdict: verdicts.innovation ?? 'Not evaluated',
    },
    {
      key: 'risk',
      label: 'Risk Safety Profile',
      tooltip: 'Higher score = Lower risk / Safer execution',
      score: scores.risk,
      verdict: verdicts.risk ?? 'Not evaluated',
    },
    {
      key: 'legal',
      label: 'Regulatory & Ethics',
      tooltip: 'Compliance, copyright & privacy exposure',
      score: scores.legal,
      verdict: verdicts.legal ?? 'Not evaluated',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
      {metrics.map((metric) => (
        <ScoreMetric
          key={metric.key}
          label={metric.label}
          score={metric.score}
          verdict={metric.verdict}
          tooltip={metric.tooltip}
        />
      ))}
    </div>
  );
}

'use client';

import React from 'react';
import { AgentName, AgentErrorsMap } from '../types/analysis';

export interface AgentStatusMap {
  feasibility: 'idle' | 'running' | 'success' | 'error';
  market: 'idle' | 'running' | 'success' | 'error';
  technical: 'idle' | 'running' | 'success' | 'error';
  innovation: 'idle' | 'running' | 'success' | 'error';
  risk: 'idle' | 'running' | 'success' | 'error';
  legal: 'idle' | 'running' | 'success' | 'error';
  suggestion: 'idle' | 'running' | 'success' | 'error';
}

interface AnalysisProgressProps {
  statuses: AgentStatusMap;
  errors: AgentErrorsMap;
}

export default function AnalysisProgress({ statuses, errors }: AnalysisProgressProps) {
  const agentsList = [
    { key: 'feasibility' as AgentName, label: 'Feasibility Agent', desc: 'Resource limits & implementation viability' },
    { key: 'market' as AgentName, label: 'Market Agent', desc: 'Customer segment demand & competitors' },
    { key: 'technical' as AgentName, label: 'Technical Agent', desc: 'Stack architecture & complexity risks' },
    { key: 'innovation' as AgentName, label: 'Innovation Agent', desc: 'Differentiation & competitive moat' },
    { key: 'risk' as AgentName, label: 'Risk Agent', desc: 'Operational hurdles & mitigation safety' },
    { key: 'legal' as AgentName, label: 'Legal Agent', desc: 'Regulatory, privacy & ethics compliance' },
    { key: 'suggestion' as AgentName, label: 'Suggestion Agent', desc: 'Strategic milestones & feature roadmap' },
  ];

  const completedCount = Object.values(statuses).filter(
    (s) => s === 'success' || s === 'error'
  ).length;
  const progressPercent = Math.round((completedCount / agentsList.length) * 100);

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 001.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </div>
        );
      case 'running':
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 text-stone-800">
            <svg className="animate-spin h-3 w-3 text-stone-700" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <span className="text-[10px]">•</span>
          </div>
        );
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="text-[11px] font-semibold text-emerald-700">Finished</span>;
      case 'error':
        return <span className="text-[11px] font-semibold text-rose-600">Failed</span>;
      case 'running':
        return <span className="text-[11px] font-semibold text-stone-900 animate-pulse">Running</span>;
      case 'idle':
      default:
        return <span className="text-[11px] text-stone-400">Queued</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div>
          <h2 className="text-sm font-bold text-stone-900 tracking-tight">
            Parallel Agent Dispatch
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Streaming live evaluations simultaneously.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {completedCount} / {agentsList.length} Complete
        </span>
      </div>

      {/* Progress Track */}
      <div className="mt-3 w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-stone-900 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Agents Checklist */}
      <ul className="mt-4 space-y-2">
        {agentsList.map((agent) => {
          const status = statuses[agent.key];
          const hasError = status === 'error' && errors[agent.key];

          return (
            <li
              key={agent.key}
              className={`p-2.5 rounded-xl border transition-all ${
                status === 'running'
                  ? 'border-stone-300 bg-stone-50/70'
                  : status === 'success'
                  ? 'border-stone-100 bg-white'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {getStatusIndicator(status)}
                  <div>
                    <span className="text-xs font-semibold text-stone-900">
                      {agent.label}
                    </span>
                    <span className="hidden sm:inline-block text-[10px] text-stone-400 ml-1.5 font-normal">
                      · {agent.desc}
                    </span>
                  </div>
                </div>
                {getStatusLabel(status)}
              </div>

              {hasError && (
                <div className="mt-1.5 ml-7 rounded-lg bg-rose-50 border border-rose-100 p-2 text-[11px] text-rose-700">
                  ⚠️ {errors[agent.key]}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

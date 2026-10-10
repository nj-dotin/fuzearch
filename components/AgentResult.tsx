'use client';

import React, { useState } from 'react';
import { AgentResultsMap, AgentErrorsMap } from '../types/analysis';

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  icon: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
}

function AccordionItem({ title, isOpen, onToggle, icon, badge, badgeColor, children }: AccordionItemProps) {
  return (
    <div className="rounded-xl border border-stone-200/80 bg-white overflow-hidden shadow-2xs transition-all hover:border-stone-300">
      {/* Header Bar */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-stone-900 bg-white transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{icon}</span>
          <span className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight">{title}</span>
          {badge && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                badgeColor || 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-stone-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body Content */}
      <div
        className={`transition-all duration-300 ease-in-out border-t border-stone-100 ${
          isOpen ? 'block opacity-100' : 'hidden opacity-0'
        }`}
      >
        <div className="p-5 sm:p-6 bg-stone-50/40 space-y-4 text-xs sm:text-sm text-stone-700">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AgentResultProps {
  results: AgentResultsMap;
  errors: AgentErrorsMap;
}

export default function AgentResult({ results, errors }: AgentResultProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    feasibility: true,
    technical: true,
    suggestion: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const hasData = (key: keyof AgentResultsMap) => {
    return !!results[key] && !errors[key];
  };

  const getScoreBadge = (score?: number) => {
    if (typeof score !== 'number') return undefined;
    if (score >= 80) return { text: `${score}/100`, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    if (score >= 60) return { text: `${score}/100`, color: 'bg-amber-50 text-amber-800 border-amber-200' };
    return { text: `${score}/100`, color: 'bg-rose-50 text-rose-800 border-rose-200' };
  };

  const formatErrorMessage = (errorMsg: string): string => {
    if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('Quota exceeded')) {
      return 'Rate limit quota reached (429). The system tried failover models; please retry shortly.';
    }
    if (errorMsg.includes('404')) {
      return 'Selected model is unavailable (404). Please choose a valid 2026 model in AI Setup.';
    }
    if (errorMsg.includes('400') || errorMsg.includes('API_KEY_INVALID')) {
      return 'Invalid API key. Please check your credentials in the AI Engine Setup modal.';
    }
    try {
      const match = errorMsg.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed?.error?.message) return parsed.error.message.split('\n')[0];
      }
    } catch {}
    return errorMsg.length > 150 ? errorMsg.substring(0, 150) + '...' : errorMsg;
  };

  return (
    <div className="space-y-3">
      {/* 1. FEASIBILITY ANALYSIS */}
      <AccordionItem
        title="Feasibility Analysis"
        isOpen={openSections.feasibility}
        onToggle={() => toggleSection('feasibility')}
        icon="⚙️"
        badge={getScoreBadge(results.feasibility?.score)?.text}
        badgeColor={getScoreBadge(results.feasibility?.score)?.color}
      >
        {errors.feasibility ? (
          <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-800 font-medium">
            ⚠️ {formatErrorMessage(errors.feasibility)}
          </div>
        ) : hasData('feasibility') ? (
          <>
            <p className="font-semibold text-stone-900 leading-relaxed">{results.feasibility!.verdict}</p>
            <p className="leading-relaxed text-stone-600">{results.feasibility!.analysis}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider mb-2">
                  Key Feasibility Strengths
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                  {results.feasibility!.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-[11px] uppercase font-bold text-amber-800 tracking-wider mb-2">
                  Operational Bottlenecks & Constraints
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                  {results.feasibility!.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-stone-200/80 pt-3">
              <h4 className="text-[11px] uppercase font-bold text-stone-900 tracking-wider mb-2">
                Feasibility Recommendations
              </h4>
              <ul className="list-decimal pl-4 space-y-1.5 text-xs text-stone-600">
                {results.feasibility!.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-xs text-stone-400 italic">No feasibility evaluation data available.</p>
        )}
      </AccordionItem>

      {/* 2. MARKET ANALYSIS */}
      <AccordionItem
        title="Market Potential & Positioning"
        isOpen={openSections.market}
        onToggle={() => toggleSection('market')}
        icon="📈"
        badge={getScoreBadge(results.market?.score)?.text}
        badgeColor={getScoreBadge(results.market?.score)?.color}
      >
        {errors.market ? (
          <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-800 font-medium">
            ⚠️ {formatErrorMessage(errors.market)}
          </div>
        ) : hasData('market') ? (
          <>
            <p className="font-semibold text-stone-900 leading-relaxed">{results.market!.verdict}</p>
            <p className="leading-relaxed text-stone-600">{results.market!.analysis}</p>

            <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
              <h4 className="text-[11px] uppercase font-bold text-stone-900 tracking-wider mb-2">
                Target Customer Segments
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {results.market!.target_users.map((user, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-stone-100 text-stone-800 border border-stone-200/80 rounded-lg text-xs font-medium"
                  >
                    {user}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider mb-2">
                  Market Differentiators
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                  {results.market!.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-[11px] uppercase font-bold text-amber-800 tracking-wider mb-2">
                  Adoption Hurdles & Competitors
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                  {results.market!.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-stone-200/80 pt-3">
              <h4 className="text-[11px] uppercase font-bold text-stone-900 tracking-wider mb-2">
                Market Capture Strategy
              </h4>
              <ul className="list-decimal pl-4 space-y-1.5 text-xs text-stone-600">
                {results.market!.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-xs text-stone-400 italic">No market evaluation data available.</p>
        )}
      </AccordionItem>

      {/* 3. TECHNICAL ANALYSIS */}
      <AccordionItem
        title="Technical Implementation & Architecture"
        isOpen={openSections.technical}
        onToggle={() => toggleSection('technical')}
        icon="💻"
        badge={getScoreBadge(results.technical?.score)?.text}
        badgeColor={getScoreBadge(results.technical?.score)?.color}
      >
        {errors.technical ? (
          <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-800 font-medium">
            ⚠️ {formatErrorMessage(errors.technical)}
          </div>
        ) : hasData('technical') ? (
          <>
            <p className="font-semibold text-stone-900 leading-relaxed">{results.technical!.verdict}</p>
            <p className="leading-relaxed text-stone-600">{results.technical!.analysis}</p>

            <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
              <h4 className="text-[11px] uppercase font-bold text-stone-900 tracking-wider mb-2">
                Recommended Technology Stack
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {results.technical!.suggested_technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-stone-100 text-stone-900 border border-stone-200/90 rounded-lg text-xs font-mono font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
              <h4 className="text-[11px] uppercase font-bold text-rose-800 tracking-wider mb-2">
                Engineering & Architecture Risks
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                {results.technical!.technical_risks.map((tr, i) => (
                  <li key={i}>{tr}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-stone-200/80 pt-3">
              <h4 className="text-[11px] uppercase font-bold text-stone-900 tracking-wider mb-2">
                Engineering Best Practices
              </h4>
              <ul className="list-decimal pl-4 space-y-1.5 text-xs text-stone-600">
                {results.technical!.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-xs text-stone-400 italic">No technical data.</p>
        )}
      </AccordionItem>

      {/* 4. INNOVATION ANALYSIS */}
      <AccordionItem
        title="Innovation Novelty & Defensibility"
        isOpen={openSections.innovation}
        onToggle={() => toggleSection('innovation')}
        icon="💡"
        badge={getScoreBadge(results.innovation?.score)?.text}
        badgeColor={getScoreBadge(results.innovation?.score)?.color}
      >
        {errors.innovation ? (
          <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-800 font-medium">
            ⚠️ {formatErrorMessage(errors.innovation)}
          </div>
        ) : hasData('innovation') ? (
          <>
            <p className="font-semibold text-stone-900 leading-relaxed">{results.innovation!.verdict}</p>
            <p className="leading-relaxed text-stone-600">{results.innovation!.analysis}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider mb-2">
                  Novel Architectural Elements
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                  {results.innovation!.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-[11px] uppercase font-bold text-amber-800 tracking-wider mb-2">
                  Potential Defensibility Gaps
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                  {results.innovation!.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-stone-200/80 pt-3">
              <h4 className="text-[11px] uppercase font-bold text-stone-900 tracking-wider mb-2">
                Recommendations to Deepen Moat
              </h4>
              <ul className="list-decimal pl-4 space-y-1.5 text-xs text-stone-600">
                {results.innovation!.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-xs text-stone-400 italic">No innovation data.</p>
        )}
      </AccordionItem>

      {/* 5. RISK ANALYSIS */}
      <AccordionItem
        title="Risk & Security Assessment"
        isOpen={openSections.risk}
        onToggle={() => toggleSection('risk')}
        icon="⚠️"
        badge={results.risk ? `${results.risk.score}/100 (${results.risk.risk_level})` : undefined}
        badgeColor={
          results.risk?.score && results.risk.score >= 80
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : results.risk?.score && results.risk.score >= 60
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }
      >
        {errors.risk ? (
          <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-800 font-medium">
            ⚠️ {formatErrorMessage(errors.risk)}
          </div>
        ) : hasData('risk') ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">
                Risk Classification:
              </span>
              <span className="text-xs font-bold text-stone-900">{results.risk!.risk_level}</span>
            </div>
            <p className="leading-relaxed text-stone-600">{results.risk!.analysis}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-[11px] uppercase font-bold text-rose-800 tracking-wider mb-2">
                  Identified Threat Vectors
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                  {results.risk!.major_risks.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider mb-2">
                  Mitigation Countermeasures
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                  {results.risk!.mitigations.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-stone-400 italic">No risk data.</p>
        )}
      </AccordionItem>

      {/* 6. LEGAL & COMPLIANCE ANALYSIS */}
      <AccordionItem
        title="Regulatory & Ethics Evaluation"
        isOpen={openSections.legal}
        onToggle={() => toggleSection('legal')}
        icon="⚖️"
        badge={getScoreBadge(results.legal?.score)?.text}
        badgeColor={getScoreBadge(results.legal?.score)?.color}
      >
        {errors.legal ? (
          <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-800 font-medium">
            ⚠️ {formatErrorMessage(errors.legal)}
          </div>
        ) : hasData('legal') ? (
          <>
            <p className="font-semibold text-stone-900 leading-relaxed">{results.legal!.verdict}</p>
            <p className="leading-relaxed text-stone-600">{results.legal!.analysis}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-[11px] uppercase font-bold text-rose-800 tracking-wider mb-2">
                  Privacy & Compliance Hazards
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                  {results.legal!.concerns.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider mb-2">
                  Required Compliance Steps
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                  {results.legal!.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 bg-stone-100/70 border border-stone-200/70 rounded-xl px-3.5 py-2.5">
              ⚖️ <strong>Legal Notice:</strong> AI-modeled regulatory findings are diagnostic indicators and do not constitute formal legal counsel.
            </div>
          </>
        ) : (
          <p className="text-xs text-stone-400 italic">No legal data.</p>
        )}
      </AccordionItem>

      {/* 7. REFINEMENTS & ROADMAP */}
      <AccordionItem
        title="Actionable Product Roadmap"
        isOpen={openSections.suggestion}
        onToggle={() => toggleSection('suggestion')}
        icon="🎯"
        badge="Roadmap"
        badgeColor="bg-stone-100 text-stone-700 border-stone-200"
      >
        {errors.suggestion ? (
          <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-800 font-medium">
            ⚠️ {formatErrorMessage(errors.suggestion)}
          </div>
        ) : hasData('suggestion') ? (
          <>
            <p className="font-semibold text-stone-900 leading-relaxed">{results.suggestion!.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-[11px] uppercase font-bold text-stone-900 tracking-wider mb-2">
                  Strategic Enhancements
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                  {results.suggestion!.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs">
                <h4 className="text-[11px] uppercase font-bold text-stone-900 tracking-wider mb-2">
                  High-Impact Features
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600">
                  {results.suggestion!.recommended_features.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-stone-200/80 pt-3">
              <h4 className="text-[11px] uppercase font-bold text-stone-900 tracking-wider mb-2">
                Immediate Execution Milestones
              </h4>
              <ul className="list-decimal pl-4 space-y-1.5 text-xs text-stone-600">
                {results.suggestion!.next_steps.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-xs text-stone-400 italic">No suggestion data.</p>
        )}
      </AccordionItem>
    </div>
  );
}

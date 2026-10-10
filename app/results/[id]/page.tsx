'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import OverallScore from '../../../components/OverallScore';
import ScoreCard from '../../../components/ScoreCard';
import AgentResult from '../../../components/AgentResult';
import { AnalysisReport } from '../../../types/analysis';
import { formatDate } from '../../../lib/utils/helpers';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    try {
      const stored = localStorage.getItem('innovation_analyzer_history');
      if (stored) {
        const history: AnalysisReport[] = JSON.parse(stored);
        const found = history.find((item) => item.id === id);
        if (found) {
          setReport(found);
        }
      }
    } catch (e) {
      console.error('Failed to parse history from local storage:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <svg className="animate-spin h-7 w-7 text-stone-800 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-xs text-stone-500 font-medium">Retrieving evaluation report...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center bg-white border border-stone-200/80 rounded-2xl p-8 shadow-2xs space-y-4">
            <div className="text-3xl">⚠️</div>
            <h1 className="text-base font-bold text-stone-900">Report Not Found</h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              The evaluation report with identifier <code className="bg-stone-100 px-1.5 py-0.5 rounded text-rose-600 font-mono text-[11px]">{id}</code> was not found in local storage.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-2.5 px-4 shadow-xs transition-all"
              >
                Back to Analyzer
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const scores = {
    feasibility: report.results.feasibility?.score,
    market: report.results.market?.score,
    technical: report.results.technical?.score,
    innovation: report.results.innovation?.score,
    risk: report.results.risk?.score,
    legal: report.results.legal?.score,
  };

  const verdicts = {
    feasibility: report.results.feasibility?.verdict,
    market: report.results.market?.verdict,
    technical: report.results.technical?.verdict,
    innovation: report.results.innovation?.verdict,
    risk: report.results.risk?.risk_level,
    legal: report.results.legal?.verdict,
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Results Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div className="space-y-1">
            <Link
              href="/"
              className="text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors inline-flex items-center gap-1"
            >
              <span>&larr;</span> Analyze Another Concept
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Innovation Evaluation Dashboard
            </h1>
            <p className="text-xs text-stone-400 font-mono">
              Generated: {formatDate(report.timestamp)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold py-2 px-3.5 shadow-2xs transition-all"
            >
              🖨️ Print Report
            </button>
            <Link
              href="/"
              className="rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-2 px-4 shadow-xs transition-all text-center"
            >
              New Analysis
            </Link>
          </div>
        </div>

        {/* Submitted Concept Banner */}
        <div className="bg-stone-50/60 border border-stone-200/80 rounded-2xl p-5 sm:p-6">
          <h2 className="text-[11px] uppercase font-bold text-stone-400 tracking-wider mb-2">
            Evaluated Concept
          </h2>
          <blockquote className="text-xs sm:text-sm font-medium text-stone-800 border-l-2 border-stone-400 pl-4 italic whitespace-pre-wrap leading-relaxed">
            "{report.idea}"
          </blockquote>
        </div>

        {/* Overall Score Summary */}
        <OverallScore
          score={report.overallScore}
          verdict={report.verdict}
          explanation={report.explanation}
          isDemo={report.isDemo}
        />

        {/* Core Scoring Metrics Matrix */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-900 tracking-tight">
            Core Innovation Metrics
          </h3>
          <ScoreCard scores={scores} verdicts={verdicts} />
        </div>

        {/* Detailed Agent Analysis Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-900 tracking-tight">
            Detailed Agent Evaluations
          </h3>
          <AgentResult results={report.results} errors={report.errors} />
        </div>
      </main>
    </div>
  );
}

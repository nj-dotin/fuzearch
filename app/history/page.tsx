'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import HistoryList from '../../components/HistoryList';
import { AnalysisReport } from '../../types/analysis';

export default function HistoryPage() {
  const [reports, setReports] = useState<AnalysisReport[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('innovation_analyzer_history');
      if (stored) {
        setReports(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history from localStorage:', e);
    }
  }, []);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('innovation_analyzer_history');
      setReports([]);
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Evaluation History
            </h1>
            <p className="text-xs text-stone-500">
              Review and inspect previously analyzed innovation ideas.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-2 px-4 shadow-xs transition-all text-center"
          >
            &larr; Return to Analyzer
          </Link>
        </div>

        {/* History Table List */}
        <div className="pt-2">
          <HistoryList reports={reports} onClearHistory={handleClearHistory} />
        </div>
      </main>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { AnalysisReport } from '../types/analysis';
import { formatDate } from '../lib/utils/helpers';

interface HistoryListProps {
  reports: AnalysisReport[];
  onClearHistory: () => void;
}

export default function HistoryList({ reports, onClearHistory }: HistoryListProps) {
  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'High Potential':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Moderate Potential':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Needs Improvement':
      default:
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  if (reports.length === 0) {
    return (
      <div className="text-center p-8 sm:p-12 bg-white border border-stone-200/80 rounded-2xl shadow-2xs">
        <p className="text-xs sm:text-sm font-semibold text-stone-700">No evaluations recorded yet.</p>
        <p className="text-xs text-stone-400 mt-1">Submit your first idea above to generate an evaluation report.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl shadow-2xs overflow-hidden">
      {/* Title Header */}
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight">Saved Evaluation Reports</h2>
          <p className="text-[11px] text-stone-500">{reports.length} evaluation{reports.length === 1 ? '' : 's'} stored in local browser memory</p>
        </div>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to clear your local evaluation history?')) {
              onClearHistory();
            }
          }}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg px-2.5 py-1 transition-all"
        >
          Clear History
        </button>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-stone-800">
          <thead className="bg-stone-50/80 text-[10px] font-bold uppercase text-stone-400 border-b border-stone-100 font-mono tracking-wider">
            <tr>
              <th className="px-5 py-3">Timestamp</th>
              <th className="px-5 py-3">Evaluated Idea</th>
              <th className="px-5 py-3 text-center">Score</th>
              <th className="px-5 py-3 text-center">Verdict</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-5 py-4 whitespace-nowrap text-[11px] text-stone-400 font-mono">
                  {formatDate(report.timestamp)}
                </td>
                <td className="px-5 py-4 font-normal text-stone-900 max-w-[200px] sm:max-w-xs truncate">
                  {report.idea}
                </td>
                <td className="px-5 py-4 text-center font-bold font-mono text-xs sm:text-sm text-stone-900">
                  {report.overallScore}
                </td>
                <td className="px-5 py-4 text-center whitespace-nowrap">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold border ${getVerdictStyle(report.verdict)}`}>
                    {report.verdict}
                  </span>
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap text-xs">
                  <Link
                    href={`/results/${report.id}`}
                    className="font-semibold text-stone-900 hover:text-stone-600 hover:underline transition-colors"
                  >
                    View Report &rarr;
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

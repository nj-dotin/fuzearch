'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ApiConfigModal from './ApiConfigModal';
import { ApiConfig } from '../types/analysis';

export default function Navigation() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApiActive, setIsApiActive] = useState<boolean>(false);
  const [activeProvider, setActiveProvider] = useState<string>('fallback');
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const lastTapRef = useRef<number>(0);

  // Check API health / readiness on mount & on custom event
  const checkApiStatus = async () => {
    try {
      // 1. Check local client config
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
          setActiveProvider(parsed.provider === 'gemini' ? 'Gemini' : parsed.provider === 'openrouter' ? 'OpenRouter' : 'Custom');
          return;
        }
      }

      // 2. Check server environment config
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.serverConfigured) {
          setIsApiActive(true);
          setActiveProvider(data.provider === 'gemini' ? 'Gemini (Server)' : 'OpenRouter (Server)');
          return;
        }
      }

      // Default: Fallback Demo Mode
      setIsApiActive(false);
      setActiveProvider('Offline Fallback');
    } catch (e) {
      setIsApiActive(false);
      setActiveProvider('Offline Fallback');
    }
  };

  useEffect(() => {
    checkApiStatus();
    const handleUpdate = () => checkApiStatus();
    window.addEventListener('ai-config-updated', handleUpdate);
    return () => window.removeEventListener('ai-config-updated', handleUpdate);
  }, []);

  // Double-tap handler for touch devices
  const handleTouchEnd = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 350;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      setIsModalOpen(true);
    }
    lastTapRef.current = now;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/70 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand Title with Secret Indicator & Double-Tap Trigger */}
            <div className="flex items-center gap-3">
              <div
                className="group relative flex items-center gap-2 cursor-pointer select-none"
                onDoubleClick={() => setIsModalOpen(true)}
                onTouchEnd={handleTouchEnd}
                title="Double-click or double-tap to open Secret AI Configuration"
              >
                <span className="font-semibold text-base sm:text-lg tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
                  AI Multi-Agent <span className="font-bold text-stone-900">Innovation Analyzer</span>
                </span>

                {/* Secret AI Status Indicator Dot */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  onMouseEnter={() => setTooltipVisible(true)}
                  onMouseLeave={() => setTooltipVisible(false)}
                  className="relative flex items-center justify-center p-1 rounded-full focus:outline-none"
                  aria-label="AI Engine Status"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      isApiActive
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                        : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse'
                    }`}
                  />

                  {/* Micro Tooltip */}
                  {tooltipVisible && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[10px] whitespace-nowrap shadow-xl z-50 pointer-events-none">
                      {isApiActive ? (
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>AI Engine Live: {activeProvider}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                          <span>Fallback Mode (Click / double-tap to set API)</span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              </div>

              {/* Discreet Phase Tag */}
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200/80">
                Phase-2 Architecture
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  pathname === '/'
                    ? 'text-stone-900 font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Analyze Idea
              </Link>
              <Link
                href="/history"
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  pathname === '/history'
                    ? 'text-stone-900 font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                History
              </Link>

              {/* Discrete Config Icon Trigger */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                title="AI Engine Configuration"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Secret AI Configuration Modal */}
      <ApiConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfigSaved={() => checkApiStatus()}
      />
    </>
  );
}

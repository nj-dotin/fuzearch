'use client';

export default function HowItWorks() {
  const steps = [
    { num: '01', title: 'Idea Submission', desc: 'Concept statement & context' },
    { num: '02', title: 'Prompt Dispatch', desc: 'Normalized schema validation' },
    { num: '03', title: '7 Parallel Agents', desc: 'Domain-specific evaluation' },
    { num: '04', title: 'Streamed Output', desc: 'Low-latency SSE delivery' },
    { num: '05', title: 'Score Aggregation', desc: 'Deterministic mathematical calculation' },
    { num: '06', title: 'Verdict Grading', desc: 'Categorized feasibility potential' },
    { num: '07', title: 'Strategic Roadmap', desc: 'Actionable feature milestones' },
  ];

  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-stone-900">
            Multi-Agent Architecture Pipeline
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Concurrent asynchronous dispatch across 7 specialized evaluation domains.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Zero-Roundtrip Parallel
        </span>
      </div>

      {/* Visual Pipeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3 pt-2">
        {steps.map((step, index) => (
          <div key={step.num} className="relative flex flex-col">
            <div className="h-full flex flex-col justify-between p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300 transition-all">
              <div>
                <span className="text-[10px] font-mono font-bold text-stone-400 block mb-1">
                  {step.num}
                </span>
                <h3 className="text-xs font-semibold text-stone-900 leading-snug">
                  {step.title}
                </h3>
              </div>
              <p className="text-[11px] text-stone-500 mt-2 leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>

            {/* Desktop Chevron */}
            {index < steps.length - 1 && (
              <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-stone-300">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

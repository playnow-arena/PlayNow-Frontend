import React from 'react';

/**
 * LoadingFallback — shown by <Suspense> during lazy page transitions.
 * Dark background with glassmorphism spinner matching PlayNow theme.
 * No white flash, no layout shift.
 */
const LoadingFallback = () => (
  <div
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1c]"
    aria-label="Loading page…"
    role="status"
  >
    {/* Ambient glow — static, no animation cost */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#39FF14] opacity-5 rounded-full blur-[80px]" />
    </div>

    {/* Glassmorphic card */}
    <div className="relative z-10 flex flex-col items-center gap-5 px-8 py-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm">
      {/* Spinning ring */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#39FF14]/20" />
        <div className="absolute inset-0 rounded-full border-4 border-[#39FF14] border-t-transparent animate-spin" />
      </div>

      {/* Brand name */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[#39FF14] font-black text-sm uppercase tracking-[0.2em]">PlayNow</span>
        <span className="text-white/40 text-xs font-medium">Loading…</span>
      </div>
    </div>
  </div>
);

export default LoadingFallback;

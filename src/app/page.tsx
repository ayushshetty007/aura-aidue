import { Suspense } from 'react';
import { Shell } from '@/components/layout/Shell';

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
          Loading AURA Investment Copilot...
        </div>
      }
    >
      <Shell />
    </Suspense>
  );
}



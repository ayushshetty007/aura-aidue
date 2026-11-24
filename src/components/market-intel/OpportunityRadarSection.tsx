import React, { useEffect, useState } from 'react';
import { MOCK_OPPORTUNITY_CARDS, MOCK_RADAR_SIGNALS } from '@/lib/mockData';
import { Badge } from '@/components/ui/Badge';
import {
  Radar,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { OpportunityCardItem, OpportunityRadarSignal } from '@/types';

export const OpportunityRadarSection: React.FC = () => {
  const [signals, setSignals] = useState<OpportunityRadarSignal[]>(MOCK_RADAR_SIGNALS);
  const [cards, setCards] = useState<OpportunityCardItem[]>(MOCK_OPPORTUNITY_CARDS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetch('/api/market/radar')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        if (Array.isArray(data.signals)) setSignals(data.signals);
        if (Array.isArray(data.cards)) setCards(data.cards);
        setIsLive(Boolean(data.isLive));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                Autonomous Opportunity Radar
              </h2>
              <p className="text-xs text-slate-400">
                Real-time scan of positive signals, emerging risks, and catalyst events
              </p>
            </div>
          </div>
          <Badge variant="green">{isLive ? 'Live Market Scan' : 'Signals Scan'}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {signals.map((sig) => (
            <div
              key={sig.id}
              className={`p-4 rounded-xl border space-y-2 flex flex-col justify-between transition-all ${
                sig.type === 'opportunity'
                  ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                  : sig.type === 'signal'
                  ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40'
                  : sig.type === 'risk'
                  ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
                  : 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {sig.asset}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{sig.timeframe}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 font-mono leading-tight">
                  {sig.title}
                </h4>
                <p className="text-xs text-slate-400 leading-normal font-sans">{sig.detail}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Conviction Level</span>
                <span className="font-bold text-emerald-400">{sig.conviction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                Potential Investment Opportunities
              </h2>
              <p className="text-xs text-slate-400">
                Curated opportunity theses supported by live performance & risk factors
              </p>
            </div>
          </div>
          <Badge variant="blue">Evidence-Backed Theses</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cards.map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-emerald-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {opp.symbol}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 font-mono">
                        {opp.assetName}
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                      {opp.opportunityType}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono text-slate-400">1Y Performance</div>
                    <div
                      className={`text-sm font-bold font-mono ${
                        opp.historicalPerformance1Y >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {opp.historicalPerformance1Y >= 0 ? '+' : ''}
                      {opp.historicalPerformance1Y}%
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Factors Supporting the Thesis
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300 font-sans">
                    {opp.supportingFactors.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="text-xs font-bold text-rose-400 font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Risks to Monitor
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300 font-sans">
                    {opp.keyRisks.map((rk, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{rk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  AI Assessment Score:{' '}
                  <strong className="text-slate-100">{opp.confidenceScore}/100</strong>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold">
                  {opp.assessmentTag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

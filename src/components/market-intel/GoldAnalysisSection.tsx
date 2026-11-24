import React, { useState, useEffect } from 'react';
import { MOCK_GOLD_ANALYSIS } from '@/lib/mockData';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import {
  Coins,
  TrendingUp,
  ShieldAlert,
  Compass,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { GoldAnalysis } from '@/types';

export const GoldAnalysisSection: React.FC = () => {
  const [selectedTf, setSelectedTf] = useState<'1D' | '1W' | '1M' | '6M' | '1Y' | '5Y'>('1M');
  const [gold, setGold] = useState<GoldAnalysis & { isLive?: boolean }>({
    ...MOCK_GOLD_ANALYSIS,
    currency: 'USD',
  });

  useEffect(() => {
    fetch('/api/market/gold')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.gold) {
          setGold(data.gold);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100 font-mono">
                Gold Spot & Macro Commodities Surface
              </h2>
              <Badge variant="amber">{gold.isLive ? 'GC=F Live' : 'XAU / USD'}</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Institutional bullion pricing (USD/oz), real-yield sensitivity & monetary reserve flows
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-slate-100 font-mono">
            {formatCurrency(gold.price, 2, 'USD')}
          </span>
          <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {gold.change1d >= 0 ? '+' : ''}
            {gold.change1d} ({formatPercent(gold.changePercent1d)})
          </span>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            Multi-Period Returns & Historical Trajectory
          </h3>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            {(['1D', '1W', '1M', '6M', '1Y', '5Y'] as const).map((tf) => {
              const val = gold.performance[tf];
              return (
                <button
                  key={tf}
                  onClick={() => setSelectedTf(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedTf === tf
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}: {val >= 0 ? '+' : ''}
                  {val}%
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={gold.historicalChartData}>
              <defs>
                <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => [`$${Number(val).toLocaleString()} / oz`, 'Gold Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorGold)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              Primary Macro Drivers Affecting Gold
            </h3>
            <Badge variant="amber">Market Dynamics</Badge>
          </div>

          <div className="space-y-3">
            {gold.drivers.map((dr, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    {dr.title}
                  </span>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {dr.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">{dr.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Gold Risk Factors & AI Quantitative Model
            </h3>
            <Badge variant="red">Downside Risks</Badge>
          </div>

          <div className="space-y-3">
            {gold.risks.map((rk, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    {rk.title}
                  </span>
                  <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Severity: {rk.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">{rk.description}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed font-sans">
            <div className="flex items-center gap-2 font-mono font-bold text-amber-300 mb-1">
              <Sparkles className="w-4 h-4" />
              AI Gold Thesis Assessment:
            </div>
            {gold.aiAssessment}
          </div>
        </div>
      </div>
    </div>
  );
};

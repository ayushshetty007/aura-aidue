import React from 'react';
import { MOCK_STOCK_COMPARISON } from '@/lib/mockData';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Split, CheckCircle2, TrendingUp, Sparkles, Building2 } from 'lucide-react';

export const StockComparisonSection: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Split className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-mono">Cross-Stock Intelligence Matrix</h2>
            <p className="text-xs text-slate-400">Side-by-side comparative analysis of key financial & AI ratings</p>
          </div>
        </div>
        <Badge variant="green">3 Tech Mega-Caps</Badge>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono text-left text-slate-300 border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <th className="p-3.5 font-bold uppercase text-[10px]">Metric / Factor</th>
              {MOCK_STOCK_COMPARISON.map((stock) => (
                <th key={stock.ticker} className="p-3.5 font-bold text-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-sm font-extrabold">{stock.name}</div>
                      <div className="text-[10px] text-emerald-400 font-normal">${stock.ticker}</div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {/* Price */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">Current Demo Price</td>
              {MOCK_STOCK_COMPARISON.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-slate-100">
                  {formatCurrency(s.price)}
                </td>
              ))}
            </tr>

            {/* Daily Change */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">Today&apos;s Change</td>
              {MOCK_STOCK_COMPARISON.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-emerald-400">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{formatPercent(s.change1d)}
                  </span>
                </td>
              ))}
            </tr>

            {/* 1Y Performance */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">1-Year Performance</td>
              {MOCK_STOCK_COMPARISON.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-emerald-400">
                  +{s.change1y}%
                </td>
              ))}
            </tr>

            {/* 5Y Performance */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">5-Year Performance</td>
              {MOCK_STOCK_COMPARISON.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-blue-400">
                  +{s.change5y}%
                </td>
              ))}
            </tr>

            {/* Market Cap */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">Market Cap</td>
              {MOCK_STOCK_COMPARISON.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-slate-200">
                  {s.marketCap}
                </td>
              ))}
            </tr>

            {/* P/E Ratio */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">P/E Ratio</td>
              {MOCK_STOCK_COMPARISON.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-amber-400">
                  {s.peRatio}x
                </td>
              ))}
            </tr>

            {/* Revenue Growth */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">YoY Revenue Growth</td>
              {MOCK_STOCK_COMPARISON.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-emerald-400">
                  +{s.revenueGrowth}%
                </td>
              ))}
            </tr>

            {/* Primary Risk Factors */}
            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">Primary Risk Factors</td>
              {MOCK_STOCK_COMPARISON.map((s) => (
                <td key={s.ticker} className="p-3.5 text-slate-300 leading-normal font-sans">
                  {s.riskFactors}
                </td>
              ))}
            </tr>

            {/* AI Health Rating */}
            <tr className="bg-emerald-500/5">
              <td className="p-3.5 font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Health Rating
              </td>
              {MOCK_STOCK_COMPARISON.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-emerald-400">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 inline-block">
                    {s.aiRating}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

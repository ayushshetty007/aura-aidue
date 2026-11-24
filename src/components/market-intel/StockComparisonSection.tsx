import React, { useState, useEffect } from 'react';
import { MOCK_STOCK_COMPARISON } from '@/lib/mockData';
import { formatCurrency, formatPercent, inferCurrencyFromTicker } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Split, TrendingUp, Sparkles, Building2, Loader2, Plus } from 'lucide-react';
import { StockComparisonData } from '@/types';

export const StockComparisonSection: React.FC = () => {
  const [tickersInput, setTickersInput] = useState('TCS, RELIANCE, TATAMOTORS, NVDA');
  const [stocks, setStocks] = useState<StockComparisonData[]>(MOCK_STOCK_COMPARISON);
  const [isLoading, setIsLoading] = useState(false);

  const loadComparison = async (tickersStr: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/stocks/compare?tickers=${encodeURIComponent(tickersStr)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.comparison) && data.comparison.length > 0) {
        setStocks(data.comparison);
      }
    } catch {
      // Keep current
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/stocks/compare?tickers=${encodeURIComponent('TCS, RELIANCE, TATAMOTORS, NVDA')}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success && Array.isArray(data.comparison) && data.comparison.length > 0) {
          setStocks(data.comparison);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tickersInput.trim()) loadComparison(tickersInput);
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Split className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                Cross-Stock Intelligence Matrix
              </h2>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
            </div>
            <p className="text-xs text-slate-400">
              Live side-by-side comparison across Indian (NSE) & US tickers
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={tickersInput}
            onChange={(e) => setTickersInput(e.target.value)}
            placeholder="e.g. TCS, MARUTI, NVDA, AAPL"
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500 min-w-[230px]"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Compare
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono text-left text-slate-300 border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <th className="p-3.5 font-bold uppercase text-[10px]">Metric / Factor</th>
              {stocks.map((stock) => (
                <th key={stock.ticker} className="p-3.5 font-bold text-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-sm font-extrabold">{stock.name}</div>
                      <div className="text-[10px] text-emerald-400 font-normal">
                        {stock.ticker}
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">Live Share Price</td>
              {stocks.map((s) => {
                const cur = s.currency || inferCurrencyFromTicker(s.ticker);
                return (
                  <td key={s.ticker} className="p-3.5 font-bold text-slate-100">
                    {formatCurrency(s.price, 2, cur)}
                  </td>
                );
              })}
            </tr>

            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">Today&apos;s Change</td>
              {stocks.map((s) => (
                <td
                  key={s.ticker}
                  className={`p-3.5 font-bold ${
                    s.change1d >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {formatPercent(s.change1d)}
                  </span>
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">1-Year Performance</td>
              {stocks.map((s) => (
                <td
                  key={s.ticker}
                  className={`p-3.5 font-bold ${
                    s.change1y >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatPercent(s.change1y)}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">5-Year Performance</td>
              {stocks.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-blue-400">
                  {formatPercent(s.change5y)}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">Market Cap</td>
              {stocks.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-slate-200">
                  {s.marketCap}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">P/E Ratio</td>
              {stocks.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-amber-400">
                  {s.peRatio}x
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">Est. Growth Score</td>
              {stocks.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-emerald-400">
                  +{s.revenueGrowth}%
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/40">
              <td className="p-3.5 font-semibold text-slate-400">Primary Risk Factors</td>
              {stocks.map((s) => (
                <td key={s.ticker} className="p-3.5 text-slate-300 leading-normal font-sans">
                  {s.riskFactors}
                </td>
              ))}
            </tr>

            <tr className="bg-emerald-500/5">
              <td className="p-3.5 font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Rating
              </td>
              {stocks.map((s) => (
                <td key={s.ticker} className="p-3.5 font-bold text-emerald-400">
                  <Badge variant="green">{s.aiRating}</Badge>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

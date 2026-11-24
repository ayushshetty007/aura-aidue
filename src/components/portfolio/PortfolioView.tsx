import React, { useEffect, useState } from 'react';
import {
  MOCK_PORTFOLIO_SUMMARY,
  MOCK_HOLDINGS,
  MOCK_ASSET_ALLOCATION,
  MOCK_PORTFOLIO_HISTORY,
} from '@/lib/mockData';
import { formatCurrency, formatPercent, inferCurrencyFromTicker } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import {
  PieChart as PieIcon,
  IndianRupee,
  TrendingUp,
  ShieldAlert,
  Activity,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts';
import { Holding } from '@/types';

export const PortfolioView: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>(MOCK_HOLDINGS);
  const [summary, setSummary] = useState(MOCK_PORTFOLIO_SUMMARY);
  const [allocation, setAllocation] = useState(MOCK_ASSET_ALLOCATION);
  const [history, setHistory] = useState(MOCK_PORTFOLIO_HISTORY);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('100');
  const [avgCost, setAvgCost] = useState('1000');
  const [sector, setSector] = useState('Technology & AI');

  const loadPortfolio = () => {
    fetch('/api/portfolio')
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;
        if (Array.isArray(d.holdings)) setHoldings(d.holdings);
        if (d.summary) setSummary(d.summary);
        if (Array.isArray(d.allocation)) setAllocation(d.allocation);
        if (Array.isArray(d.history)) setHistory(d.history);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker.trim().toUpperCase(),
          shares: Number(shares),
          avgCost: Number(avgCost),
          sector,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTicker('');
        setIsAddOpen(false);
        loadPortfolio();
      }
    } catch {
      // Ignore error
    }
  };

  const handleRemoveHolding = async (id: string) => {
    await fetch(`/api/portfolio?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(
      () => {}
    );
    loadPortfolio();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              Fund Portfolio & Asset Allocation
            </h1>
            <Badge variant="green">Live Valuation</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Live equity holdings, asset class breakdown, unrealized returns, and persisted positions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Sharpe Ratio</div>
              <div className="text-sm font-bold text-emerald-400">{summary.sharpeRatio}</div>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Portfolio Beta</div>
              <div className="text-sm font-bold text-slate-200">{summary.beta}</div>
            </div>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Position
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Net Asset Value"
          value={formatCurrency(summary.totalValue, 2, 'INR')}
          change={summary.dailyChangePercent}
          changePeriod="24h Change"
          icon={IndianRupee}
        />
        <StatCard
          title="Unrealized Gain / Loss"
          value={formatCurrency(summary.totalReturn, 2, 'INR')}
          change={summary.totalReturnPercent}
          changePeriod="All-time PnL"
          icon={TrendingUp}
        />
        <StatCard
          title="1-Day Value at Risk (95%)"
          value={formatCurrency(summary.var95, 2, 'INR')}
          subtitle="Max expected 1-day drawdown"
          icon={ShieldAlert}
          badgeText="Low Risk"
          badgeVariant="green"
        />
        <StatCard
          title="Unallocated Capital"
          value={formatCurrency(summary.buyingPower, 2, 'INR')}
          subtitle="Dry powder ready for deployment"
          icon={Activity}
          badgeText="Liquid Cash"
          badgeVariant="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-slate-100 font-mono">
              Asset Allocation Breakdown
            </h2>
            <PieIcon className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => [formatCurrency(Number(val), 2, 'INR'), 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
            {allocation.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2 truncate pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-bold shrink-0">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-100 font-mono">
                Cumulative Performance Tracking
              </h2>
              <p className="text-xs text-slate-400">Portfolio NAV growth vs NIFTY 50 Benchmark</p>
            </div>
            <Badge variant="green">Outperforming Benchmark</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(Number(v), 1, 'INR')}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => [formatCurrency(Number(val), 2, 'INR'), 'Value']}
                />
                <Area
                  type="monotone"
                  dataKey="portfolio"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorNav)"
                />
                <Area
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100 font-mono">
            Current Equity Holdings ({holdings.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">Live Yahoo Finance Valuation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Asset / Ticker</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">Shares</th>
                <th className="py-3 px-4 text-right">Avg Price</th>
                <th className="py-3 px-4 text-right">Live Price</th>
                <th className="py-3 px-4 text-right">Market Value</th>
                <th className="py-3 px-4 text-right">Gain / Loss</th>
                <th className="py-3 px-4 text-center">AI Rating</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {holdings.map((h) => {
                const isPositive = h.unrealizedGain >= 0;
                const cur = h.currency || inferCurrencyFromTicker(h.ticker);
                return (
                  <tr key={h.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-500 border border-slate-700 font-bold">
                          {h.ticker}
                        </span>
                        <span className="font-sans font-semibold text-slate-200">{h.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-sans">{h.sector}</td>
                    <td className="py-3.5 px-4 text-right">{h.shares.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      {formatCurrency(h.avgCost, 2, cur)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                      {formatCurrency(h.currentPrice, 2, cur)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                      {formatCurrency(h.value, 2, cur)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatCurrency(h.unrealizedGain, 2, cur)} (
                        {formatPercent(h.unrealizedGainPercent)})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={h.aiHealthRating.startsWith('A') ? 'green' : 'amber'}>
                        {h.aiHealthRating}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRemoveHolding(h.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                        title="Remove position"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Equity Holding to Portfolio"
        subtitle="Automatically fetches live market price and calculates unrealized P&L"
      >
        <form onSubmit={handleAddHolding} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Ticker Symbol *</label>
            <input
              type="text"
              required
              placeholder="e.g. TATAMOTORS.NS, TCS, NVDA"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono uppercase focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Shares *</label>
              <input
                type="number"
                required
                min="1"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Avg Buy Cost *</label>
              <input
                type="number"
                required
                step="0.01"
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Sector</label>
            <input
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 cursor-pointer"
            >
              Save Holding
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React from 'react';
import { 
  MOCK_PORTFOLIO_SUMMARY, 
  MOCK_HOLDINGS, 
  MOCK_ASSET_ALLOCATION,
  MOCK_PORTFOLIO_HISTORY
} from '@/lib/mockData';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { 
  PieChart as PieIcon, 
  IndianRupee, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  BarChart2, 
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';

export const PortfolioView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              Fund Portfolio & Asset Allocation
            </h1>
            <Badge variant="green">Active Sleeve</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time equity holdings, asset class breakdown, unrealized returns, and risk diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Sharpe Ratio</div>
            <div className="text-sm font-bold text-emerald-400">{MOCK_PORTFOLIO_SUMMARY.sharpeRatio}</div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Portfolio Beta</div>
            <div className="text-sm font-bold text-slate-200">{MOCK_PORTFOLIO_SUMMARY.beta}</div>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Net Asset Value"
          value={formatCurrency(MOCK_PORTFOLIO_SUMMARY.totalValue)}
          change={MOCK_PORTFOLIO_SUMMARY.dailyChangePercent}
          changePeriod="24h Change"
          icon={IndianRupee}
        />
        <StatCard
          title="Unrealized Gain / Loss"
          value={formatCurrency(MOCK_PORTFOLIO_SUMMARY.totalReturn)}
          change={MOCK_PORTFOLIO_SUMMARY.totalReturnPercent}
          changePeriod="All-time PnL"
          icon={TrendingUp}
        />
        <StatCard
          title="1-Day Value at Risk (95%)"
          value={formatCurrency(MOCK_PORTFOLIO_SUMMARY.var95)}
          subtitle="Max expected 1-day drawdown"
          icon={ShieldAlert}
          badgeText="Low Risk"
          badgeVariant="green"
        />
        <StatCard
          title="Unallocated Capital"
          value={formatCurrency(MOCK_PORTFOLIO_SUMMARY.buyingPower)}
          subtitle="Dry powder ready for deployment"
          icon={Activity}
          badgeText="16.5% Cash"
          badgeVariant="amber"
        />
      </div>

      {/* Asset Allocation & Performance Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Allocation Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-slate-100 font-mono">Asset Allocation Breakdown</h2>
            <PieIcon className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_ASSET_ALLOCATION}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {MOCK_ASSET_ALLOCATION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
            {MOCK_ASSET_ALLOCATION.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-bold">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio vs Benchmark Performance Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-100 font-mono">Cumulative Performance Tracking</h2>
              <p className="text-xs text-slate-400">Portfolio NAV growth vs S&P 500 Benchmark</p>
            </div>
            <Badge variant="green">Outperforming Benchmark</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_PORTFOLIO_HISTORY}>
                <defs>
                  <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${(v / 1e6).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Value']}
                />
                <Area type="monotone" dataKey="portfolio" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNav)" />
                <Area type="monotone" dataKey="benchmark" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100 font-mono">Current Equity Holdings ({MOCK_HOLDINGS.length})</h2>
          <span className="text-xs text-slate-400 font-mono">Real-time Valuation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Asset / Ticker</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">Shares</th>
                <th className="py-3 px-4 text-right">Avg Price</th>
                <th className="py-3 px-4 text-right">Current Price</th>
                <th className="py-3 px-4 text-right">Market Value</th>
                <th className="py-3 px-4 text-right">Gain / Loss</th>
                <th className="py-3 px-4 text-center">AI Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {MOCK_HOLDINGS.map((h) => {
                const isPositive = h.unrealizedGain >= 0;
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
                    <td className="py-3.5 px-4 text-right">{formatCurrency(h.avgCost)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-100">{formatCurrency(h.currentPrice)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-100">{formatCurrency(h.value)}</td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatCurrency(h.unrealizedGain)} ({formatPercent(h.unrealizedGainPercent)})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={h.aiHealthRating.startsWith('A') ? 'green' : 'amber'}>
                        {h.aiHealthRating}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

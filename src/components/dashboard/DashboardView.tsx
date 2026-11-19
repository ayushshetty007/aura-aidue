import React from 'react';
import { 
  MOCK_PORTFOLIO_SUMMARY, 
  MOCK_MARKET_INDICES, 
  MOCK_AI_INSIGHTS, 
  MOCK_DUE_DILIGENCE_PROJECTS, 
  MOCK_WATCHLIST,
  MOCK_PORTFOLIO_HISTORY
} from '@/lib/mockData';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ArrowUpRight, 
  ShieldAlert, 
  Zap, 
  FileCheck2, 
  IndianRupee, 
  Activity,
  Layers,
  BarChart3
} from 'lucide-react';
import { NavigationTab } from '@/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenDeal: (dealId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenDeal }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Portfolio Overview
            </h1>
            <Badge variant="green">Live</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Summary of your current holdings, active deal reviews, and market movements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('due-diligence')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            + New Deal Review
          </button>
          <button 
            onClick={() => onNavigate('portfolio')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
            View Portfolio
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Value"
          value={formatCurrency(MOCK_PORTFOLIO_SUMMARY.totalValue)}
          change={MOCK_PORTFOLIO_SUMMARY.dailyChangePercent}
          changePeriod="Today (₹218.4K)"
          icon={IndianRupee}
          badgeText="Sharpe: 2.18"
          badgeVariant="green"
        />
        <StatCard
          title="Total Return"
          value={formatPercent(MOCK_PORTFOLIO_SUMMARY.totalReturnPercent)}
          change={2.8}
          changePeriod="vs benchmark (+29.9%)"
          icon={TrendingUp}
          badgeText="+ ₹3.42M"
          badgeVariant="blue"
        />
        <StatCard
          title="Available Cash"
          value={formatCurrency(MOCK_PORTFOLIO_SUMMARY.buyingPower)}
          icon={Activity}
          subtitle="Ready to deploy"
          badgeText="16.5% Cash"
          badgeVariant="amber"
        />
        <StatCard
          title="Risk Level"
          value={`${MOCK_PORTFOLIO_SUMMARY.riskScore}/100`}
          icon={ShieldAlert}
          subtitle="Est. 1-day risk: ₹184.5K"
          badgeText="Low Risk"
          badgeVariant="green"
        />
      </div>

      {/* Middle Row: Main Performance Chart & Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Performance vs Benchmark</h2>
              <p className="text-xs text-slate-400">Tracking portfolio growth against the S&P 500 index</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Portfolio
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-3">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Benchmark
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_PORTFOLIO_HISTORY}>
                <defs>
                  <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1e6).toFixed(1)}M`}
                  domain={['dataMin - 200000', 'dataMax + 200000']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Value']}
                />
                <Area type="monotone" dataKey="portfolio" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPortfolio)" />
                <Area type="monotone" dataKey="benchmark" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Overview Spark Cards */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-slate-100">Market Overview</h2>
            <button 
              onClick={() => onNavigate('market-intel')}
              className="text-xs text-emerald-500 hover:text-emerald-600 font-medium flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_MARKET_INDICES.slice(0, 4).map((idx) => (
              <div key={idx.symbol} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">{idx.symbol}</div>
                  <div className="text-[11px] text-slate-400">{idx.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-100">{idx.value.toLocaleString()}</div>
                  <div className={`text-xs font-medium ${idx.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {formatPercent(idx.changePercent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: AI Insights Feed & Due Diligence Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Copilot Signal Feed */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Market Insights & Alerts</h2>
              <p className="text-xs text-slate-400">Important changes and research flags for your portfolio</p>
            </div>
            <Badge variant="blue">Insights</Badge>
          </div>

          <div className="space-y-3">
            {MOCK_AI_INSIGHTS.map((ins) => (
              <div 
                key={ins.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={ins.sentiment === 'bullish' ? 'green' : ins.sentiment === 'bearish' ? 'red' : 'amber'}>
                      {ins.sentiment.toUpperCase()}
                    </Badge>
                    {ins.ticker && (
                      <span className="text-xs font-bold text-slate-200 font-mono px-2 py-0.5 rounded bg-slate-800">
                        ${ins.ticker}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-200">{ins.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{ins.timestamp}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-1">
                  {ins.description}
                </p>

                {ins.actionRequired && (
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/60 text-emerald-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Suggested Action: {ins.actionRequired}
                    </span>
                    <button 
                      onClick={() => onNavigate('due-diligence')}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 underline underline-offset-2"
                    >
                      Investigate <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Due Diligence Recent Projects */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-slate-100">Recent Deals</h2>
            <button 
              onClick={() => onNavigate('due-diligence')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              View All (4) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_DUE_DILIGENCE_PROJECTS.slice(0, 3).map((deal) => (
              <div 
                key={deal.id}
                onClick={() => {
                  onNavigate('due-diligence');
                  onOpenDeal(deal.id);
                }}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {deal.name}
                  </span>
                  <Badge variant={deal.status === 'High Conviction' ? 'green' : 'amber'}>
                    Score: {deal.score}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Target IRR: <strong className="text-slate-200">{deal.targetIrr}%</strong></span>
                  <span>Deal Size: <strong className="text-slate-200">{formatCurrency(deal.dealSize, 0)}</strong></span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
                  <span>{deal.stage}</span>
                  <span>Updated {deal.updatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

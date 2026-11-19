import React, { useState } from 'react';
import { 
  MOCK_MARKET_INDICES, 
  MOCK_ETFS,
  MOCK_SECTOR_PERFORMANCE,
  MOCK_WHAT_MOVED_TODAY
} from '@/lib/mockData';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { 
  Globe2, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Sparkles, 
  Flame,
  BarChart3,
  Layers,
  Split,
  UserCheck,
  Radar,
  ArrowUpRight,
  Newspaper,
  Compass
} from 'lucide-react';
import { StockAnalysisSection } from './StockAnalysisSection';
import { GoldAnalysisSection } from './GoldAnalysisSection';
import { StockComparisonSection } from './StockComparisonSection';
import { OpportunityRadarSection } from './OpportunityRadarSection';
import { InvestorProfileSimulator } from './InvestorProfileSimulator';

export const MarketIntelView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'stock-analysis' | 'gold' | 'opportunities' | 'comparison' | 'simulator'
  >('overview');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              Market Intelligence Hub
            </h1>
            <Badge variant="green">Macro & Equity Radar</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Institutional market overview, deep stock analysis, precious metals thesis, opportunity radar, and portfolio simulator.
          </p>
        </div>

        {/* Global Market Mood Gauge */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs">
          <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Fear & Greed Index</div>
            <div className="text-sm font-bold text-emerald-400">74 (Greed)</div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">VIX Volatility</div>
            <div className="text-sm font-bold text-slate-200">14.8 (-2.1%)</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono">
        {[
          { id: 'overview', label: 'Market Overview', icon: Globe2 },
          { id: 'stock-analysis', label: 'Stock Analysis', icon: BarChart3 },
          { id: 'gold', label: 'Gold Analysis', icon: Coins },
          { id: 'opportunities', label: 'Opportunities Radar', icon: Radar },
          { id: 'comparison', label: 'Stock Comparison', icon: Split },
          { id: 'simulator', label: 'Profile & Simulator', icon: UserCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'stock-analysis' | 'gold' | 'opportunities' | 'comparison' | 'simulator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Market Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Major Index Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {MOCK_MARKET_INDICES.map((idx) => {
              const isPos = idx.change >= 0;
              return (
                <div key={idx.symbol} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200">{idx.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{idx.symbol}</span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-lg font-bold text-slate-100">
                      {idx.symbol === 'US10Y' ? `${idx.value}%` : idx.value > 1000 ? formatCurrency(idx.value, 1) : idx.value}
                    </span>
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatPercent(idx.changePercent)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sector Performance Grid & Market Sentiment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sector Performance */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Sector Performance & Catalyst Drivers
                </h3>
                <Badge variant="blue">Today&apos;s Heatmap</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                {MOCK_SECTOR_PERFORMANCE.map((sec) => {
                  const isPos = sec.change1d >= 0;
                  return (
                    <div key={sec.name} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{sec.name}</span>
                        <span className={`font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatPercent(sec.change1d)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-1 font-sans">
                        <span>Driver: {sec.topDriver}</span>
                        <span className="font-mono text-emerald-400">{sec.sentiment}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Market Sentiment & Gold Snapshot Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    Macro Sentiment & Gold
                  </h3>
                  <Badge variant="amber">Macro Radar</Badge>
                </div>

                <div className="space-y-3 pt-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase">Institutional Macro Stance</div>
                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Moderately Bullish (Soft Landing Thesis)
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Gold Spot (XAU/USD)</div>
                      <div className="text-[10px] text-slate-400">₹2,658.90 / oz</div>
                    </div>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      +0.70%
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('gold')}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>View Deep Gold Analysis</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* "What Moved Today?" AI Explanation Cards */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-emerald-400" />
                &quot;What Moved Today?&quot; — AI Market Explanations
              </h3>
              <Badge variant="green">AI Disclosures Scan</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_WHAT_MOVED_TODAY.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                      {item.impactedAssets.map((ast: string) => (
                        <span key={ast} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          ${ast}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 font-mono">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-normal font-sans">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Thematic ETFs Preview */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Tracked Thematic Sector Funds & ETFs
              </h3>
              <span className="text-xs text-slate-400 font-mono">3 Strategies</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_ETFS.map((etf) => (
                <div key={etf.symbol} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 font-mono px-2 py-0.5 rounded bg-slate-950">
                        ${etf.symbol}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{etf.name}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">+{etf.change1y}% (1Y)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">{etf.aiThesis}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/40">
                    <span>AUM: {etf.aum}</span>
                    <span>Expense: {etf.expenseRatio}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Stock Analysis Tab */}
      {activeTab === 'stock-analysis' && <StockAnalysisSection />}

      {/* 3. Gold Analysis Tab */}
      {activeTab === 'gold' && <GoldAnalysisSection />}

      {/* 4. Opportunity Radar Tab */}
      {activeTab === 'opportunities' && <OpportunityRadarSection />}

      {/* 5. Stock Comparison Tab */}
      {activeTab === 'comparison' && <StockComparisonSection />}

      {/* 6. Profile & Simulator Tab */}
      {activeTab === 'simulator' && <InvestorProfileSimulator />}
    </div>
  );
};

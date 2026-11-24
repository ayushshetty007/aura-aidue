import React, { useState, useEffect } from 'react';
import {
  MOCK_MARKET_INDICES,
  MOCK_ETFS,
  MOCK_SECTOR_PERFORMANCE,
  MOCK_WHAT_MOVED_TODAY,
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
  Compass,
} from 'lucide-react';
import { StockAnalysisSection } from './StockAnalysisSection';
import { GoldAnalysisSection } from './GoldAnalysisSection';
import { StockComparisonSection } from './StockComparisonSection';
import { OpportunityRadarSection } from './OpportunityRadarSection';
import { InvestorProfileSimulator } from './InvestorProfileSimulator';
import { ETFItem, MarketIndex, SectorPerformance, WhatMovedToday } from '@/types';

interface MarketIntelViewProps {
  initialTicker?: string;
}

export const MarketIntelView: React.FC<MarketIntelViewProps> = ({ initialTicker }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'stock-analysis' | 'gold' | 'opportunities' | 'comparison' | 'simulator'
  >(initialTicker ? 'stock-analysis' : 'overview');
  const [prevInitialTicker, setPrevInitialTicker] = useState<string | undefined>(initialTicker);
  if (initialTicker !== prevInitialTicker) {
    setPrevInitialTicker(initialTicker);
    if (initialTicker) {
      setActiveTab('stock-analysis');
    }
  }

  const [indices, setIndices] = useState<MarketIndex[]>(MOCK_MARKET_INDICES);
  const [sectors, setSectors] = useState<SectorPerformance[]>(MOCK_SECTOR_PERFORMANCE);
  const [movers, setMovers] = useState<WhatMovedToday[]>(MOCK_WHAT_MOVED_TODAY);
  const [etfs, setEtfs] = useState<ETFItem[]>(MOCK_ETFS);
  const [vix, setVix] = useState({ value: 14.8, changePercent: -2.1 });
  const [fearGreed, setFearGreed] = useState({ score: 74, label: 'Greed' });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetch('/api/market/overview')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        if (Array.isArray(data.indices)) setIndices(data.indices);
        if (Array.isArray(data.sectors)) setSectors(data.sectors);
        if (Array.isArray(data.whatMovedToday)) setMovers(data.whatMovedToday);
        if (Array.isArray(data.etfs)) setEtfs(data.etfs);
        if (data.vix) setVix(data.vix);
        if (data.fearGreed) setFearGreed(data.fearGreed);
        setIsLive(Boolean(data.isLive));
      })
      .catch(() => {});
  }, []);

  const goldIdx = indices.find((i) => i.symbol === 'GOLD');

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              Market Intelligence Hub
            </h1>
            <Badge variant="green">{isLive ? 'Live Yahoo Finance' : 'Macro & Equity Radar'}</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Live NSE/BSE & global quotes, AI Buy/Hold/Sell advisory, gold macro surface, comparison & simulator.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs">
          <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Fear & Greed Index</div>
            <div className="text-sm font-bold text-emerald-400">
              {fearGreed.score} ({fearGreed.label})
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">VIX Volatility</div>
            <div className="text-sm font-bold text-slate-200">
              {vix.value} ({formatPercent(vix.changePercent)})
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono">
        {[
          { id: 'overview', label: 'Market Overview', icon: Globe2 },
          { id: 'stock-analysis', label: 'Stock Analysis & Buy/Sell', icon: BarChart3 },
          { id: 'gold', label: 'Gold Analysis', icon: Coins },
          { id: 'opportunities', label: 'Opportunities Radar', icon: Radar },
          { id: 'comparison', label: 'Stock Comparison', icon: Split },
          { id: 'simulator', label: 'Profile & Simulator', icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as
                    | 'overview'
                    | 'stock-analysis'
                    | 'gold'
                    | 'opportunities'
                    | 'comparison'
                    | 'simulator'
                )
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
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

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {indices.map((idx) => {
              const isPos = idx.change >= 0;
              return (
                <div
                  key={idx.symbol}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200 truncate">{idx.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0 ml-1">
                      {idx.symbol}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-base font-bold text-slate-100">
                      {idx.symbol === 'US10Y'
                        ? `${idx.value}%`
                        : idx.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                    <span
                      className={`text-xs font-bold flex items-center gap-0.5 ${
                        isPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {formatPercent(idx.changePercent)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Sector Performance & Catalyst Drivers
                </h3>
                <Badge variant="blue">Today&apos;s Heatmap</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                {sectors.map((sec) => {
                  const isPos = sec.change1d >= 0;
                  return (
                    <div
                      key={sec.name}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5"
                    >
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
                    <div className="text-[10px] text-slate-400 uppercase">
                      Institutional Macro Stance
                    </div>
                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      {fearGreed.score >= 55 ? 'Moderately Bullish' : 'Cautious / Defensive'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Gold Futures (GC=F)</div>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrency(goldIdx?.value ?? 2658.9, 2, 'USD')} / oz
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      {formatPercent(goldIdx?.changePercent ?? 0.7)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('gold')}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>View Deep Gold Analysis</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-emerald-400" />
                &quot;What Moved Today?&quot; — Live Market Movers
              </h3>
              <Badge variant="green">{isLive ? 'Live Movers' : 'Market Scan'}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movers.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                      {item.impactedAssets.map((ast) => (
                        <span key={ast} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {ast}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 font-mono">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-normal font-sans">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Tracked Thematic Sector Funds & ETFs
              </h3>
              <span className="text-xs text-slate-400 font-mono">{etfs.length} Strategies</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {etfs.map((etf) => (
                <div
                  key={etf.symbol}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 font-mono px-2 py-0.5 rounded bg-slate-950">
                        {etf.symbol}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{etf.name}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      +{etf.change1y}% (1Y)
                    </span>
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

      {activeTab === 'stock-analysis' && <StockAnalysisSection initialTicker={initialTicker} />}
      {activeTab === 'gold' && <GoldAnalysisSection />}
      {activeTab === 'opportunities' && <OpportunityRadarSection />}
      {activeTab === 'comparison' && <StockComparisonSection />}
      {activeTab === 'simulator' && <InvestorProfileSimulator />}
    </div>
  );
};

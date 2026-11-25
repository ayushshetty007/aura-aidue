import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import {
  CompanyFundamentalSnapshot,
  MarketCapTier,
  MarketUniverse,
  TerminalRecommendResponse,
} from '@/types';
import {
  Calculator,
  TrendingUp,
  Target,
  Clock,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  BookmarkPlus,
  Check,
  Loader2,
  ShieldCheck,
  Layers,
  RefreshCw,
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
  CartesianGrid,
} from 'recharts';

interface InvestorProfileSimulatorProps {
  onAnalyzeStock?: (ticker: string) => void;
}

type SortKey = 'return' | 'score' | 'pe' | 'roe';
type CapFilter = 'All' | MarketCapTier;

function compoundSingleCompany(
  lumpSum: number,
  monthlySip: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  let balance = Math.max(0, lumpSum);
  for (let m = 0; m < years * 12; m++) {
    balance = (balance + Math.max(0, monthlySip)) * (1 + monthlyRate);
  }
  return Math.round(balance);
}

export const InvestorProfileSimulator: React.FC<InvestorProfileSimulatorProps> = ({
  onAnalyzeStock,
}) => {
  const [universe, setUniverse] = useState<MarketUniverse>('IN');
  const [lumpSum, setLumpSum] = useState<number>(500000);
  const [monthlySip, setMonthlySip] = useState<number>(15000);
  const [durationYears, setDurationYears] = useState<number>(5);
  const [riskTolerance, setRiskTolerance] = useState<'Conservative' | 'Moderate' | 'Aggressive'>(
    'Moderate'
  );

  const [capFilter, setCapFilter] = useState<CapFilter>('All');
  const [sortBy, setSortBy] = useState<SortKey>('return');

  const [data, setData] = useState<TerminalRecommendResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addedWatchlist, setAddedWatchlist] = useState<Record<string, boolean>>({});
  const [addingTicker, setAddingTicker] = useState<string | null>(null);

  const fetchPlan = useCallback(
    async (params: {
      universe: MarketUniverse;
      lumpSum: number;
      monthlySip: number;
      durationYears: number;
      riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
    }) => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch('/api/terminal/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to compute investment advisory plan');
        }
        setData(json as TerminalRecommendResponse);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Unable to load terminal data');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlan({ universe, lumpSum, monthlySip, durationYears, riskTolerance });
    }, 260);
    return () => clearTimeout(timer);
  }, [universe, lumpSum, monthlySip, durationYears, riskTolerance, fetchPlan]);

  const handleUniverseSwitch = (next: MarketUniverse) => {
    if (next === universe) return;
    setUniverse(next);
    if (next === 'IN') {
      setLumpSum(500000);
      setMonthlySip(15000);
    } else {
      setLumpSum(25000);
      setMonthlySip(500);
    }
  };

  const handleAddWatchlist = async (ticker: string) => {
    setAddingTicker(ticker);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      });
      const json = await res.json();
      if (json.success) {
        setAddedWatchlist((prev) => ({ ...prev, [ticker]: true }));
      }
    } catch {
      // Ignore transient network errors
    } finally {
      setAddingTicker(null);
    }
  };

  const currency = universe === 'IN' ? 'INR' : 'USD';

  const capPieData = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Large Cap', value: data.recommendedSplit.largeCapPct, color: '#10b981' },
      { name: 'Mid Cap', value: data.recommendedSplit.midCapPct, color: '#3b82f6' },
      { name: 'Small Cap', value: data.recommendedSplit.smallCapPct, color: '#f59e0b' },
    ];
  }, [data]);

  const visibleCompanies = useMemo(() => {
    if (!data) return [];
    const pool: CompanyFundamentalSnapshot[] =
      capFilter === 'All'
        ? [...data.buckets.largeCap, ...data.buckets.midCap, ...data.buckets.smallCap]
        : capFilter === 'Large Cap'
        ? data.buckets.largeCap
        : capFilter === 'Mid Cap'
        ? data.buckets.midCap
        : data.buckets.smallCap;

    return [...pool].sort((a, b) => {
      if (sortBy === 'score') return b.fundamentalScore - a.fundamentalScore;
      if (sortBy === 'roe') return b.roePercent - a.roePercent;
      if (sortBy === 'pe') {
        const peA = a.peRatio > 0 ? a.peRatio : 999;
        const peB = b.peRatio > 0 ? b.peRatio : 999;
        return peA - peB;
      }
      return b.expectedAnnualReturnPercent - a.expectedAnnualReturnPercent;
    });
  }, [data, capFilter, sortBy]);

  const lumpPresets =
    universe === 'IN'
      ? [
          { label: '₹1L', val: 100000 },
          { label: '₹5L', val: 500000 },
          { label: '₹10L', val: 1000000 },
          { label: '₹25L', val: 2500000 },
        ]
      : [
          { label: '$5K', val: 5000 },
          { label: '$25K', val: 25000 },
          { label: '$50K', val: 50000 },
          { label: '$100K', val: 100000 },
        ];

  const sipPresets =
    universe === 'IN'
      ? [
          { label: '₹0', val: 0 },
          { label: '₹10K', val: 10000 },
          { label: '₹25K', val: 25000 },
          { label: '₹50K', val: 50000 },
        ]
      : [
          { label: '$0', val: 0 },
          { label: '$500', val: 500 },
          { label: '$1K', val: 1000 },
          { label: '$2.5K', val: 2500 },
        ];

  return (
    <div className="space-y-6">
      {/* 1. Terminal Controls Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-100 font-mono">
                  Investment Advisory Terminal
                </h2>
                {data && (
                  <Badge variant={data.isLiveMarketData ? 'green' : 'amber'}>
                    {data.isLiveMarketData ? 'Live Yahoo Finance' : 'Reference Fundamentals'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter your capital &amp; time horizon to model optimal returns across Large Cap, Mid Cap &amp; Small Cap equities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Market Universe Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => handleUniverseSwitch('IN')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  universe === 'IN'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                India (NSE ₹)
              </button>
              <button
                type="button"
                onClick={() => handleUniverseSwitch('US')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  universe === 'US'
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                US Equities ($)
              </button>
            </div>

            <Badge variant="amber" className="font-mono text-[10px]">
              Illustrative projections — not financial advice
            </Badge>
          </div>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Lump Sum */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Lump Sum ({currency})
              </span>
              <span className="text-emerald-400">{formatCurrency(lumpSum, 0, currency)}</span>
            </label>
            <input
              type="number"
              min={0}
              step={universe === 'IN' ? 10000 : 500}
              value={lumpSum}
              onChange={(e) => setLumpSum(Math.max(0, Number(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500/50"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              {lumpPresets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setLumpSum(p.val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                    lumpSum === p.val
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly SIP */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                Monthly SIP (Opt.)
              </span>
              <span className="text-blue-400">{formatCurrency(monthlySip, 0, currency)}/mo</span>
            </label>
            <input
              type="number"
              min={0}
              step={universe === 'IN' ? 1000 : 100}
              value={monthlySip}
              onChange={(e) => setMonthlySip(Math.max(0, Number(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500/50"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              {sipPresets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setMonthlySip(p.val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                    monthlySip === p.val
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Duration */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Time Duration
              </span>
              <span className="text-amber-400 font-bold">{durationYears} Years</span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={durationYears}
              onChange={(e) => setDurationYears(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer my-1"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              {[1, 3, 5, 10, 15].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setDurationYears(yr)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                    durationYears === yr
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {yr}Y
                </button>
              ))}
            </div>
          </div>

          {/* Risk Appetite */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5 flex flex-col justify-between">
            <label className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Risk Tolerance
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {(['Conservative', 'Moderate', 'Aggressive'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setRiskTolerance(level)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-mono font-semibold border text-left flex items-center justify-between cursor-pointer ${
                    riskTolerance === level
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{level}</span>
                  <span className="text-[10px] opacity-80">
                    {level === 'Conservative'
                      ? 'Large Cap Core'
                      : level === 'Moderate'
                      ? 'Balanced L/M/S'
                      : 'Growth Tilt'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => fetchPlan({ universe, lumpSum, monthlySip, durationYears, riskTolerance })}
              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && !data && (
        <div className="glass-card rounded-2xl p-12 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          <span>Screening Large Cap, Mid Cap &amp; Small Cap fundamentals...</span>
        </div>
      )}

      {data && (
        <>
          {/* 2. KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Capital Invested"
              value={formatCurrency(data.projectedSummary.totalInvested, 0, currency)}
              subtitle={`${formatCurrency(lumpSum, 0, currency)} + ${formatCurrency(monthlySip, 0, currency)}/mo`}
              icon={Target}
            />
            <StatCard
              title={`Expected Corpus (${durationYears}Y)`}
              value={formatCurrency(data.projectedSummary.expectedCorpus, 0, currency)}
              change={data.projectedSummary.expectedGainPercent}
              changePeriod={`over ${durationYears}Y`}
              subtitle={`Est. Gain: ${formatCurrency(data.projectedSummary.expectedGain, 0, currency)}`}
              icon={TrendingUp}
            />
            <StatCard
              title="Blended Est. Return"
              value={`${data.projectedSummary.blendedCagrPercent}% / yr`}
              subtitle={`Range: ${formatCurrency(data.projectedSummary.conservativeCorpus, 0, currency)} – ${formatCurrency(data.projectedSummary.optimisticCorpus, 0, currency)}`}
              icon={BarChart3}
            />
            <StatCard
              title="Cap Split (L / M / S)"
              value={`${data.recommendedSplit.largeCapPct}% / ${data.recommendedSplit.midCapPct}% / ${data.recommendedSplit.smallCapPct}%`}
              subtitle={`${riskTolerance} • ${durationYears}-Year Horizon`}
              icon={PieIcon}
            />
          </div>

          {/* 3. AI Portfolio Rationale */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
                <span>AURA Portfolio Construction Note</span>
                {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{data.aiCommentary}</p>
            </div>
          </div>

          {/* 4. Charts Row: Compounding Growth + Cap-Tier Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  {durationYears}-Year Wealth Compounding Trajectory (Conservative / Expected / Bullish)
                </h3>
                <span className="text-xs font-mono text-emerald-400">
                  {data.projectedSummary.blendedCagrPercent}% Blended CAGR
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.yearlyProjectionChart}>
                    <defs>
                      <linearGradient id="expectedFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(v) =>
                        currency === 'INR'
                          ? `₹${(v / 100000).toFixed(1)}L`
                          : `$${(v / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                      formatter={(val: unknown) => formatCurrency(Number(val) || 0, 0, currency)}
                    />
                    <Area
                      type="monotone"
                      dataKey="optimistic"
                      name="Optimistic"
                      stroke="#3b82f6"
                      strokeDasharray="4 4"
                      fill="none"
                      strokeWidth={1.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="expected"
                      name="Expected Corpus"
                      stroke="#10b981"
                      fill="url(#expectedFill)"
                      strokeWidth={2.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="invested"
                      name="Capital Invested"
                      stroke="#64748b"
                      fill="none"
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  Market-Cap Allocation
                </h3>
                <Badge variant="blue">{riskTolerance}</Badge>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={capPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {capPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(val: unknown) => `${val}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-xs font-mono">
                {capPieData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800"
                  >
                    <span className="flex items-center gap-2 text-slate-300">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-100">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Recommended Capital Deployment Plan */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Suggested Capital Deployment Across Top Picks
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Optimal allocation combining Large Cap stability with Mid &amp; Small Cap fundamental growth
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {data.topPortfolioPicks.length} Core Positions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="py-2.5 pr-3">Company</th>
                    <th className="py-2.5 px-3">Cap Tier</th>
                    <th className="py-2.5 px-3 text-right">Weight</th>
                    <th className="py-2.5 px-3 text-right">Lump Sum</th>
                    <th className="py-2.5 px-3 text-right">Monthly SIP</th>
                    <th className="py-2.5 px-3 text-right">Est. CAGR</th>
                    <th className="py-2.5 pl-3 text-right">Projected ({durationYears}Y)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.topPortfolioPicks.map((pick) => (
                    <tr key={pick.company.ticker} className="hover:bg-slate-900/40">
                      <td className="py-3 pr-3">
                        <div className="font-bold text-slate-100">{pick.company.ticker}</div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          {pick.company.name}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            pick.company.capTier === 'Large Cap'
                              ? 'green'
                              : pick.company.capTier === 'Mid Cap'
                              ? 'blue'
                              : 'amber'
                          }
                        >
                          {pick.company.capTier}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-200">
                        {pick.allocationPercent}%
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        {formatCurrency(pick.allocatedLumpSum, 0, currency)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        {formatCurrency(pick.allocatedMonthlySip, 0, currency)}/mo
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400">
                        +{pick.company.expectedAnnualReturnPercent}%
                      </td>
                      <td className="py-3 pl-3 text-right font-bold text-emerald-400">
                        {formatCurrency(pick.projectedValueBase, 0, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. Large Cap / Mid Cap / Small Cap Fundamental Company Screener */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 font-mono">
                  Company Screener by Market Cap &amp; Fundamentals
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {universe === 'IN'
                    ? 'India NSE Classification: Large Cap ≥ ₹20,000 Cr • Mid Cap ₹5,000–20,000 Cr • Small Cap < ₹5,000 Cr'
                    : 'US Classification: Large Cap ≥ $10B • Mid Cap $2B–10B • Small Cap < $2B'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Cap Tier Filter */}
                {(['All', 'Large Cap', 'Mid Cap', 'Small Cap'] as CapFilter[]).map((tier) => {
                  const count =
                    tier === 'All'
                      ? data.buckets.largeCap.length +
                        data.buckets.midCap.length +
                        data.buckets.smallCap.length
                      : tier === 'Large Cap'
                      ? data.buckets.largeCap.length
                      : tier === 'Mid Cap'
                      ? data.buckets.midCap.length
                      : data.buckets.smallCap.length;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setCapFilter(tier)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border cursor-pointer ${
                        capFilter === tier
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tier} ({count})
                    </button>
                  );
                })}

                {/* Sort Select */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="return">Sort: Best Est. Return</option>
                  <option value="score">Sort: Fundamental Score</option>
                  <option value="roe">Sort: Highest ROE %</option>
                  <option value="pe">Sort: Lowest P/E</option>
                </select>
              </div>
            </div>

            {visibleCompanies.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-400 border border-dashed border-slate-800 rounded-xl">
                No companies currently fall in this market-cap bucket for {universe}.
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {visibleCompanies.map((c) => {
                  const singleProjected = compoundSingleCompany(
                    lumpSum,
                    monthlySip,
                    c.expectedAnnualReturnPercent,
                    durationYears
                  );
                  const isAdded = addedWatchlist[c.ticker];
                  return (
                    <div
                      key={c.yahooSymbol}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-100 font-mono">
                              {c.ticker}
                            </span>
                            <Badge
                              variant={
                                c.capTier === 'Large Cap'
                                  ? 'green'
                                  : c.capTier === 'Mid Cap'
                                  ? 'blue'
                                  : 'amber'
                              }
                            >
                              {c.capTier}
                            </Badge>
                            <Badge
                              variant={
                                c.verdict === 'Strong Buy'
                                  ? 'green'
                                  : c.verdict === 'Accumulate'
                                  ? 'blue'
                                  : 'slate'
                              }
                            >
                              {c.verdict}
                            </Badge>
                          </div>
                          <div className="text-xs font-semibold text-slate-200">{c.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {c.sector} • MCap: {c.marketCapFormatted}
                          </div>
                        </div>

                        <div className="text-right font-mono shrink-0">
                          <div className="text-sm font-bold text-slate-100">
                            {formatCurrency(c.price, 2, currency)}
                          </div>
                          <div
                            className={`text-xs font-semibold ${
                              c.changePercent1d >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {formatPercent(c.changePercent1d)} today
                          </div>
                        </div>
                      </div>

                      {/* Return Highlight Bar */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Est. Return</div>
                          <div className="text-sm font-bold text-emerald-400">
                            +{c.expectedAnnualReturnPercent}% / yr
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">
                            If 100% ({durationYears}Y)
                          </div>
                          <div className="text-sm font-bold text-slate-100">
                            {formatCurrency(singleProjected, 0, currency)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 uppercase">Fund. Score</div>
                          <div className="text-sm font-bold text-blue-400">
                            {c.fundamentalScore}/100
                          </div>
                        </div>
                      </div>

                      {/* Core Fundamentals Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono text-xs">
                        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                          <div className="text-[10px] text-slate-400">P/E</div>
                          <div className="font-bold text-slate-200">
                            {c.peRatio > 0 ? `${c.peRatio.toFixed(1)}x` : 'N/A'}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                          <div className="text-[10px] text-slate-400">P/B</div>
                          <div className="font-bold text-slate-200">
                            {c.pbRatio > 0 ? `${c.pbRatio.toFixed(1)}x` : 'N/A'}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                          <div className="text-[10px] text-slate-400">ROE</div>
                          <div
                            className={`font-bold ${
                              c.roePercent >= 15 ? 'text-emerald-400' : 'text-slate-200'
                            }`}
                          >
                            {c.roePercent.toFixed(1)}%
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                          <div className="text-[10px] text-slate-400">Margin</div>
                          <div className="font-bold text-slate-200">
                            {c.netMarginPercent.toFixed(1)}%
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                          <div className="text-[10px] text-slate-400">Rev Gr.</div>
                          <div
                            className={`font-bold ${
                              c.revenueGrowthPercent >= 10 ? 'text-emerald-400' : 'text-slate-200'
                            }`}
                          >
                            {c.revenueGrowthPercent > 0 ? '+' : ''}
                            {c.revenueGrowthPercent.toFixed(1)}%
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                          <div className="text-[10px] text-slate-400">3Y CAGR</div>
                          <div
                            className={`font-bold ${
                              c.cagr3y >= 12 ? 'text-emerald-400' : 'text-slate-200'
                            }`}
                          >
                            {c.cagr3y > 0 ? '+' : ''}
                            {c.cagr3y.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">{c.rationale}</p>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                        <span className="text-[10px] font-mono text-slate-400">
                          Debt/Eq: {c.debtToEquity.toFixed(1)}% • Risk: {c.riskLevel}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddWatchlist(c.ticker)}
                            disabled={addingTicker === c.ticker || isAdded}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1 cursor-pointer disabled:opacity-60"
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" /> Saved
                              </>
                            ) : addingTicker === c.ticker ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="w-3.5 h-3.5" /> Watchlist
                              </>
                            )}
                          </button>
                          {onAnalyzeStock && (
                            <button
                              type="button"
                              onClick={() => onAnalyzeStock(c.ticker)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <span>Analyze</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

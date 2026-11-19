import React, { useState } from 'react';
import { MOCK_EXTENDED_STOCKS } from '@/lib/mockData';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  BarChart2,
  SlidersHorizontal
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

export const StockAnalysisSection: React.FC = () => {
  const [selectedTicker, setSelectedTicker] = useState<'TCS' | 'RELIANCE' | 'NVDA' | 'AAPL' | 'MSFT'>('TCS');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '6M' | '1Y' | '5Y'>('1M');

  const stock = MOCK_EXTENDED_STOCKS[selectedTicker] || MOCK_EXTENDED_STOCKS['TCS'];
  const chartData = stock.timeframeChartData[timeframe] || stock.timeframeChartData['1M'];
  const currentPerf = stock.performance[timeframe] || 0;
  const isPositivePerf = currentPerf >= 0;

  return (
    <div className="space-y-6">
      {/* Ticker Switcher Header */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">{stock.name}</h2>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-semibold text-emerald-500 border border-slate-700">
                {stock.ticker}
              </span>
              <Badge variant="blue">Verified Feed</Badge>
            </div>
            <p className="text-xs text-slate-400 max-w-xl line-clamp-1">{stock.description}</p>
          </div>
        </div>

        {/* Ticker Switch Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 hidden sm:inline mr-1">Select:</span>
          {(['TCS', 'RELIANCE', 'NVDA', 'AAPL', 'MSFT'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTicker(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                selectedTicker === t
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Price & Performance Multi-Timeframe Bar */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-100 font-mono">
                {formatCurrency(stock.price)}
              </span>
              <span
                className={`text-sm font-bold font-mono px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                  stock.change >= 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatCurrency(stock.change)} ({formatPercent(stock.changePercent)})
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">Real-time simulation feed | INR</p>
          </div>

          {/* Timeframe Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            {(['1D', '1W', '1M', '6M', '1Y', '5Y'] as const).map((tf) => {
              const val = stock.performance[tf];
              const isPos = val >= 0;
              return (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    timeframe === tf
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{tf}</span>
                  <span className={`text-[10px] ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatPercent(val)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Performance Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              Price Performance & Benchmark Overlay ({timeframe})
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                ${stock.ticker} ({formatPercent(currentPerf)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                S&P 500 Benchmark (+21.4% 1Y)
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositivePerf ? '#10b981' : '#f43f5e'} stopOpacity={0.35}/>
                    <stop offset="95%" stopColor={isPositivePerf ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any, name: any) => [
                    name === 'price' ? formatCurrency(Number(val)) : `₹${val}`,
                    name === 'price' ? stock.ticker : 'S&P 500 Benchmark'
                  ]}
                />
                <Area type="monotone" dataKey="price" stroke={isPositivePerf ? '#10b981' : '#f43f5e'} strokeWidth={2.5} fillOpacity={1} fill="url(#colorStock)" />
                <Area type="monotone" dataKey="benchmarkPrice" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Financial Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-800 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">Market Cap</div>
            <div className="font-bold text-slate-100 mt-1">{stock.marketCap}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">P/E Ratio</div>
            <div className="font-bold text-slate-100 mt-1">{stock.peRatio}x</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">P/B Ratio</div>
            <div className="font-bold text-slate-100 mt-1">{stock.pbRatio}x</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">Div Yield</div>
            <div className="font-bold text-slate-100 mt-1">{stock.dividendYield}%</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">52W High</div>
            <div className="font-bold text-slate-100 mt-1">{formatCurrency(stock.week52High)}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">52W Low</div>
            <div className="font-bold text-slate-100 mt-1">{formatCurrency(stock.week52Low)}</div>
          </div>
        </div>
      </div>

      {/* Strengths & Risks + AI Assessment & Factors to Monitor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths & Risks Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              Strengths & Risk Factors
            </h3>
            <Badge variant="blue">Investment Thesis</Badge>
          </div>

          <div className="space-y-4">
            {/* Strengths */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Key Competitive Strengths
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {stock.strengths.map((st: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Risks to Monitor
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {stock.risks.map((rk: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 bg-rose-500/5 p-2.5 rounded-xl border border-rose-500/10">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{rk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* AI Assessment & Factors to Monitor Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              AI Assessment & Factors to Monitor
            </h3>
            <Badge variant="green">AI Signal</Badge>
          </div>

          {/* AI Score Radar Bar */}
          <div className="grid grid-cols-4 gap-2 font-mono text-center">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Growth</div>
              <div className="text-sm font-bold text-emerald-400">{stock.aiAnalysis.growthScore}/100</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Value</div>
              <div className="text-sm font-bold text-amber-400">{stock.aiAnalysis.valueScore}/100</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Momentum</div>
              <div className="text-sm font-bold text-emerald-400">{stock.aiAnalysis.momentumScore}/100</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Quality</div>
              <div className="text-sm font-bold text-blue-400">{stock.aiAnalysis.qualityScore}/100</div>
            </div>
          </div>

          {/* Executive AI Summary Box */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed font-sans">
            <strong className="block font-mono text-emerald-400 font-bold mb-1">AI Analytical Assessment:</strong>
            {stock.aiAnalysis.summary}
          </div>

          {/* Factors to Monitor */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-blue-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Forward Catalyst & Operational Factors
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              {stock.factorsToMonitor.map((fm: string, i: number) => (
                <li key={i} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span>{fm}</span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Track</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

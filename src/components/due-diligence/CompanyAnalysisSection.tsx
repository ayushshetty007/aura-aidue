import React from 'react';
import { DueDiligenceProject } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  PieChart as PieIcon, 
  CheckCircle2, 
  BarChart2, 
  Layers, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

interface CompanyAnalysisSectionProps {
  project: DueDiligenceProject;
  onNavigateToMarketIntel?: () => void;
}

export const CompanyAnalysisSection: React.FC<CompanyAnalysisSectionProps> = ({
  project,
  onNavigateToMarketIntel
}) => {
  const financialTrajectory = [
    { year: 'FY23', revenue: 76000000, ebitda: 14200000 },
    { year: 'FY24', price: 104000000, revenue: 104000000, ebitda: 22100000 },
    { year: 'FY25', revenue: 142000000, ebitda: 35200000 },
    { year: 'FY26 Est', revenue: 193000000, ebitda: 48500000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner & Market Intel Link */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100 font-mono">{project.name}</h2>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-semibold text-emerald-500">
                {project.ticker}
              </span>
              <Badge variant="green">{project.stage}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{project.executiveSummary}</p>
          </div>
        </div>

        {/* View Market Intelligence Button */}
        {onNavigateToMarketIntel && (
          <button
            onClick={onNavigateToMarketIntel}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <span>View Market Intelligence</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">Revenue</div>
          <div className="font-bold text-slate-100 text-sm mt-1">{formatCurrency(project.financialHighlights.revenue)}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">Rev Growth</div>
          <div className="font-bold text-emerald-400 text-sm mt-1">+{formatPercent(project.financialHighlights.revenueGrowth)}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">EBITDA</div>
          <div className="font-bold text-slate-100 text-sm mt-1">{formatCurrency(35200000)}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">Net Profit</div>
          <div className="font-bold text-slate-100 text-sm mt-1">{formatCurrency(18400000)}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">EPS</div>
          <div className="font-bold text-slate-100 text-sm mt-1">₹1.84</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">Net Debt</div>
          <div className="font-bold text-slate-100 text-sm mt-1">{formatCurrency(63300000)}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">Cash & Equiv.</div>
          <div className="font-bold text-slate-100 text-sm mt-1">{formatCurrency(32100000)}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">Op Margin</div>
          <div className="font-bold text-emerald-400 text-sm mt-1">{project.financialHighlights.ebitdaMargin}%</div>
        </div>
      </div>

      {/* Financial Trajectory Chart & Segment Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & EBITDA Area Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-100 font-mono">Revenue & EBITDA Growth Trajectory</h3>
              <p className="text-xs text-slate-400">Audited historical financials & FY26 management guidance</p>
            </div>
            <Badge variant="green">+36.4% 3-Yr CAGR</Badge>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialTrajectory}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEbitda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${(v / 1e6).toFixed(0)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any, name: any) => [
                    formatCurrency(Number(val)),
                    name === 'revenue' ? 'Revenue' : 'EBITDA'
                  ]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="ebitda" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEbitda)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Business Segments */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Key Business Segments
            </h3>
            <span className="text-xs text-slate-400 font-mono">FY25 Mix</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-bold">
                <span>Kubernetes Auto-scaler</span>
                <span className="text-emerald-400">64% (₹90.8M)</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">Core enterprise workload optimization module at 78% gross margin.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-bold">
                <span>Multi-Cloud Security</span>
                <span className="text-blue-400">28% (₹39.7M)</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">Zero-trust telemetry module growing 52% YoY.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-bold">
                <span>Professional Services</span>
                <span className="text-slate-400">8% (₹11.5M)</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">Implementation and migration services.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Overview & Competitive Position */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Business Model & Revenue Architecture
            </h3>
            <Badge variant="blue" className="font-mono">SaaS + Usage</Badge>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            CloudScale operates on a hybrid enterprise subscription model combining annual recurring base license fees with usage-based volume pricing scaled to compute CPU/GPU cluster hours. Net Retention Rate (NRR) stands at 124%, demonstrating strong net expansion within Fortune 500 accounts.
          </p>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
            <strong>Gross Margin Moat:</strong> 78.4% blended software gross margin with automated zero-touch customer onboarding.
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Competitive Position & Industry Context
            </h3>
            <Badge variant="green" className="font-mono">Leader (Gartner)</Badge>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Positioned in the Leaders Quadrant of Gartner&apos;s 2026 Cloud Infrastructure Management report. Core proprietary algorithm yields a 40%+ compute cost reduction relative to legacy point solutions, driving low customer churn (&lt;4% annual ARR).
          </p>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-mono">
            <strong>Industry Context:</strong> Cloud workload optimization TAM is expanding at a 28% CAGR driven by enterprise AI model fine-tuning compute requirements.
          </div>
        </div>
      </div>
    </div>
  );
};

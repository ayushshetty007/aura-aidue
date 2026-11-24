import React from 'react';
import { DueDiligenceProject, ProjectDueDiligenceAnalysis } from '@/types';
import { formatCurrency, formatPercent, inferCurrencyFromTicker } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  ArrowUpRight,
  PieChart as PieIcon,
  Layers,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface CompanyAnalysisSectionProps {
  project: DueDiligenceProject;
  analysis?: ProjectDueDiligenceAnalysis | null;
  isAnalyzing?: boolean;
  onNavigateToMarketIntel?: () => void;
}

export const CompanyAnalysisSection: React.FC<CompanyAnalysisSectionProps> = ({
  project,
  analysis,
  isAnalyzing,
  onNavigateToMarketIntel,
}) => {
  const ca = analysis?.companyAnalysis;
  const currency = ca?.currency || project.currency || inferCurrencyFromTicker(project.ticker);
  const metrics = ca?.metrics || {
    revenue: project.financialHighlights.revenue,
    revenueGrowth: project.financialHighlights.revenueGrowth,
    ebitda: Math.round(
      project.financialHighlights.revenue * (project.financialHighlights.ebitdaMargin / 100)
    ),
    netProfit: Math.round(
      project.financialHighlights.revenue * (project.financialHighlights.ebitdaMargin / 100) * 0.58
    ),
    eps: 1.84,
    netDebt: Math.round(
      project.financialHighlights.revenue *
        (project.financialHighlights.ebitdaMargin / 100) *
        project.financialHighlights.netDebtToEbitda
    ),
    cashAndEquivalents: Math.round(project.financialHighlights.revenue * 0.2),
    operatingMargin: project.financialHighlights.ebitdaMargin,
  };

  const trajectory = ca?.trajectory?.length
    ? ca.trajectory
    : [
        { year: 'FY23', revenue: Math.round(metrics.revenue * 0.65), ebitda: Math.round(metrics.ebitda * 0.55) },
        { year: 'FY24', revenue: Math.round(metrics.revenue * 0.82), ebitda: Math.round(metrics.ebitda * 0.78) },
        { year: 'FY25', revenue: metrics.revenue, ebitda: metrics.ebitda },
      ];

  const segments = ca?.segments?.length
    ? ca.segments
    : [
        {
          name: `${project.sector} Core`,
          sharePercent: 68,
          revenueLabel: formatCurrency(metrics.revenue * 0.68, 1, currency),
          description: 'Primary enterprise platform and recurring subscriptions.',
        },
        {
          name: 'Growth & Expansion',
          sharePercent: 24,
          revenueLabel: formatCurrency(metrics.revenue * 0.24, 1, currency),
          description: 'New market and product line expansion.',
        },
        {
          name: 'Services',
          sharePercent: 8,
          revenueLabel: formatCurrency(metrics.revenue * 0.08, 1, currency),
          description: 'Implementation & advisory services.',
        },
      ];

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100 font-mono">
                {ca?.companyName || project.name}
              </h2>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-semibold text-emerald-500">
                {ca?.ticker || project.ticker}
              </span>
              <Badge variant="green">{project.stage}</Badge>
              {isAnalyzing && (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting VDR...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {ca?.executiveSummary || project.executiveSummary}
            </p>
          </div>
        </div>

        {onNavigateToMarketIntel && (
          <button
            onClick={onNavigateToMarketIntel}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
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
          <div className="font-bold text-slate-100 text-sm mt-1">
            {formatCurrency(metrics.revenue, 1, currency)}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">Rev Growth</div>
          <div className="font-bold text-emerald-400 text-sm mt-1">
            {formatPercent(metrics.revenueGrowth)}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">EBITDA</div>
          <div className="font-bold text-slate-100 text-sm mt-1">
            {formatCurrency(metrics.ebitda, 1, currency)}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">Net Profit</div>
          <div
            className={`font-bold text-sm mt-1 ${
              metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(metrics.netProfit, 1, currency)}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">EPS</div>
          <div className="font-bold text-slate-100 text-sm mt-1">
            {currency === 'USD' ? '$' : '₹'}
            {metrics.eps}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">Net Debt</div>
          <div className="font-bold text-slate-100 text-sm mt-1">
            {formatCurrency(metrics.netDebt, 1, currency)}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">Cash & Equiv.</div>
          <div className="font-bold text-slate-100 text-sm mt-1">
            {formatCurrency(metrics.cashAndEquivalents, 1, currency)}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400">Op Margin</div>
          <div className="font-bold text-emerald-400 text-sm mt-1">
            {metrics.operatingMargin}%
          </div>
        </div>
      </div>

      {/* Financial Trajectory Chart & Segment Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-100 font-mono">
                Revenue & EBITDA Trajectory
              </h3>
              <p className="text-xs text-slate-400">
                {analysis && !analysis.isDemoFallback
                  ? `Extracted from ${analysis.documentNames.join(', ')}`
                  : 'Financial trajectory & management baseline'}
              </p>
            </div>
            <Badge variant="green">{ca?.cagrLabel || `+${metrics.revenueGrowth}% YoY`}</Badge>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectory}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEbitda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(Number(v), 0, currency)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any, name: any) => [
                    formatCurrency(Number(val), 1, currency),
                    name === 'revenue' ? 'Revenue' : 'EBITDA',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="ebitda"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEbitda)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Key Business Segments
            </h3>
            <span className="text-xs text-slate-400 font-mono">Revenue Mix</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {segments.map((seg, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-slate-200 font-bold">
                  <span className="truncate pr-2">{seg.name}</span>
                  <span className="text-emerald-400 shrink-0">
                    {seg.sharePercent}% ({seg.revenueLabel})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">{seg.description}</p>
              </div>
            ))}
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
            <Badge variant="blue" className="font-mono">
              {project.sector}
            </Badge>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {ca?.businessModelSummary || project.executiveSummary}
          </p>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
            <strong>Margin & Moat:</strong>{' '}
            {ca?.grossMarginMoat || `Operating EBITDA margin at ${metrics.operatingMargin}%.`}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Competitive Position & Industry Context
            </h3>
            <Badge variant="green" className="font-mono">
              {project.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {ca?.competitivePositionSummary || project.executiveSummary}
          </p>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-mono">
            <strong>Industry Context:</strong>{' '}
            {ca?.industryContext || `Operating across ${project.sector} growth catalysts.`}
          </div>
        </div>
      </div>
    </div>
  );
};

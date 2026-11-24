import React, { useEffect, useState } from 'react';
import { MOCK_INVESTMENT_ASSESSMENT } from '@/lib/mockData';
import {
  BuySellAdvisory,
  DueDiligenceProject,
  ProjectDueDiligenceAnalysis,
} from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  TrendingUp,
} from 'lucide-react';

interface InvestmentAssessmentSectionProps {
  project: DueDiligenceProject;
  analysis?: ProjectDueDiligenceAnalysis | null;
  onNavigateToMarketIntel?: () => void;
}

export const InvestmentAssessmentSection: React.FC<InvestmentAssessmentSectionProps> = ({
  project,
  analysis,
  onNavigateToMarketIntel,
}) => {
  const assessment = analysis?.investmentAssessment || MOCK_INVESTMENT_ASSESSMENT;
  const [advisory, setAdvisory] = useState<BuySellAdvisory | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: project.ticker, projectId: project.id }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.success && d.advisory) setAdvisory(d.advisory);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [project.id, project.ticker]);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100 font-mono">
                Investment Assessment & IC Synthesis ({project.ticker})
              </h2>
              <Badge variant="green">Score: {assessment.overallScore}/100</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Bridge synthesis linking VDR due diligence findings to live Market Intelligence & Buy/Hold/Sell advisory
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

      {/* Live Buy / Hold / Sell Advisory Bridge */}
      {advisory && (
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="font-mono text-sm font-bold text-slate-100">
                Live Market & VDR Advisory: {advisory.signalLabel} ({advisory.action})
              </span>
              <Badge
                variant={
                  advisory.action === 'Buy'
                    ? 'green'
                    : advisory.action === 'Sell'
                    ? 'red'
                    : 'amber'
                }
              >
                {advisory.confidenceScore}% Confidence
              </Badge>
            </div>
            <div className="text-xs font-mono text-slate-300">
              Current: <strong>{formatCurrency(advisory.currentPrice, 2, advisory.currency)}</strong> | Target:{' '}
              <strong className="text-emerald-400">
                {formatCurrency(advisory.targetPriceLow, 2, advisory.currency)} –{' '}
                {formatCurrency(advisory.targetPriceHigh, 2, advisory.currency)}
              </strong>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{advisory.rationaleSummary}</p>
        </div>
      )}

      {/* Quality & Scorecard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 font-mono text-center">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Business Quality</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {assessment.businessQualityScore}/100
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Financial Strength</div>
          <div className="text-xl font-extrabold text-blue-400 mt-1">
            {assessment.financialStrengthScore}/100
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Growth Indicators</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {assessment.growthIndicatorScore}/100
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Risk Level</div>
          <div className="text-xl font-extrabold text-amber-400 mt-1">{assessment.riskLevel}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-slate-400 uppercase">Opportunity Level</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {assessment.opportunityLevel}
          </div>
        </div>
      </div>

      {/* Positive Indicators & Areas Requiring Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Positive Investment Indicators
            </h3>
            <Badge variant="green" className="font-mono">
              Supporting Thesis
            </Badge>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {assessment.positiveIndicators.map((pi, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 font-sans"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{pi}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Areas Requiring Further Review
            </h3>
            <Badge variant="amber" className="font-mono">
              IC Verification
            </Badge>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {assessment.areasRequiringReview.map((ar, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 font-sans"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{ar}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overall Thesis Summary */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 font-sans">
        <div className="flex items-center gap-2 font-mono font-bold text-slate-100 text-sm">
          <FileText className="w-4 h-4 text-emerald-400" />
          AI Investment Committee Executive Synthesis
        </div>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
          {assessment.overallThesis}
        </p>
      </div>
    </div>
  );
};

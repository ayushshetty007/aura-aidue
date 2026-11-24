import React, { useState } from 'react';
import { MOCK_DETAILED_OPPORTUNITIES } from '@/lib/mockData';
import { ProjectDueDiligenceAnalysis } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, TrendingUp, FileText, Filter, Loader2 } from 'lucide-react';

interface OpportunityAnalysisSectionProps {
  analysis?: ProjectDueDiligenceAnalysis | null;
  isAnalyzing?: boolean;
}

export const OpportunityAnalysisSection: React.FC<OpportunityAnalysisSectionProps> = ({
  analysis,
  isAnalyzing,
}) => {
  const opportunities = analysis?.opportunities?.length
    ? analysis.opportunities
    : MOCK_DETAILED_OPPORTUNITIES;
  const [selectedCat, setSelectedCat] = useState<string>('All');

  const categories = [
    'All',
    'Revenue Growth',
    'Market Expansion',
    'Product Growth',
    'Operational Improvement',
    'Industry Growth',
    'Strategic Opportunities',
  ];

  const filteredOpps = opportunities.filter(
    (o) => selectedCat === 'All' || o.category === selectedCat
  );

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 font-mono">
                  Growth & Value Creation Dashboard
                </h2>
                {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400">
                {analysis && !analysis.isDemoFallback
                  ? `Extracted from ${analysis.documentNames.join(', ')}`
                  : 'Identified revenue catalysts, expansion vectors & operational margin drivers'}
              </p>
            </div>
          </div>
          <Badge variant="green">{filteredOpps.length} Value Catalysts Ingested</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-slate-400 flex items-center gap-1 mr-2">
            <Filter className="w-3 h-3" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedCat === cat
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOpps.map((opp) => (
          <div
            key={opp.id}
            className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 font-bold text-[10px]">
                    {opp.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-1 font-mono">{opp.title}</h3>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-[10px] text-emerald-400 font-bold uppercase">
                  Estimated Business Impact
                </div>
                <div className="text-slate-200 font-bold mt-0.5 font-sans">{opp.potentialImpact}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Growth Driver</div>
                  <div className="text-slate-200 mt-0.5 font-sans">{opp.growthDriver}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Constraints / Risks</div>
                  <div className="text-amber-300 mt-0.5 font-sans">{opp.risksConstraints}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    VDR Evidence
                  </span>
                  <span className="text-slate-400 text-[10px]">{opp.sourceDocument}</span>
                </div>
                <p className="text-slate-300 italic font-sans">{opp.evidenceSnippet}</p>
                <div className="text-[10px] text-slate-500">{opp.supportingEvidence}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { MOCK_DETAILED_OPPORTUNITIES } from '@/lib/mockData';
import { DetailedOpportunity } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { 
  Sparkles, 
  TrendingUp, 
  FileText, 
  Target, 
  Filter, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export const OpportunityAnalysisSection: React.FC = () => {
  const [opportunities] = useState<DetailedOpportunity[]>(MOCK_DETAILED_OPPORTUNITIES);
  const [selectedCat, setSelectedCat] = useState<string>('All');

  const categories = [
    'All',
    'Revenue Growth',
    'Market Expansion',
    'Product Growth',
    'Operational Improvement',
    'Industry Growth',
    'Strategic Opportunities'
  ];

  const filteredOpps = opportunities.filter(
    (o) => selectedCat === 'All' || o.category === selectedCat
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">Growth & Value Creation Dashboard</h2>
              <p className="text-xs text-slate-400">Identified revenue catalysts, expansion vectors & operational margin drivers</p>
            </div>
          </div>
          <Badge variant="green">{filteredOpps.length} Value Catalysts Ingested</Badge>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-slate-400 flex items-center gap-1 mr-2">
            <Filter className="w-3 h-3" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
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

      {/* Opportunity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOpps.map((opp) => (
          <div key={opp.id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 font-bold text-[10px]">
                      {opp.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mt-1 font-mono">{opp.title}</h3>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              {/* Potential Business Impact */}
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-[10px] text-emerald-400 font-bold uppercase">Estimated Business Impact</div>
                <div className="text-slate-200 font-bold mt-0.5 font-sans">{opp.potentialImpact}</div>
              </div>

              {/* Growth Driver & Constraints */}
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

              {/* Supporting Evidence Citation Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    VDR Evidence (DEMO)
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

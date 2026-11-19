import React, { useState } from 'react';
import { MOCK_DETAILED_RISKS } from '@/lib/mockData';
import { DetailedRisk } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  Eye, 
  CheckCircle2, 
  Filter, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export const RiskAnalysisSection: React.FC = () => {
  const [risks] = useState<DetailedRisk[]>(MOCK_DETAILED_RISKS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(MOCK_DETAILED_RISKS[0].id);

  const categories = [
    'All',
    'Financial Risk',
    'Operational Risk',
    'Business Risk',
    'Market Risk',
    'Regulatory Risk'
  ];

  const filteredRisks = risks.filter(
    (r) => selectedCategory === 'All' || r.category === selectedCategory
  );

  const getSeverityBadge = (severity: 'High' | 'Medium' | 'Low') => {
    switch (severity) {
      case 'High':
        return <Badge variant="red">High Severity</Badge>;
      case 'Medium':
        return <Badge variant="amber">Medium Severity</Badge>;
      case 'Low':
        return <Badge variant="blue">Low Severity</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">Categorized Risk Audit Dashboard</h2>
              <p className="text-xs text-slate-400">Multi-category risk extraction, source VDR citations & impact analysis</p>
            </div>
          </div>
          <Badge variant="red">{filteredRisks.length} Risk Factors Identified</Badge>
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
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Risks List */}
      <div className="space-y-4">
        {filteredRisks.map((risk) => {
          const isExpanded = expandedId === risk.id;
          return (
            <div
              key={risk.id}
              className={`glass-card rounded-2xl border transition-all ${
                risk.severity === 'High'
                  ? 'border-rose-500/30 bg-rose-500/5'
                  : risk.severity === 'Medium'
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : risk.id)}
                className="p-5 cursor-pointer flex items-center justify-between gap-4 select-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl border ${
                      risk.severity === 'High'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : risk.severity === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100 font-mono">{risk.title}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {risk.category}
                      </span>
                      {getSeverityBadge(risk.severity)}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{risk.description}</p>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-slate-200">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs font-mono">
                  {/* Potential Impact */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-bold text-[10px] uppercase">Potential Financial & Operational Impact</div>
                    <div className="text-slate-200 font-sans">{risk.potentialImpact}</div>
                  </div>

                  {/* Evidence Citation Box */}
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        VDR Evidence Citation (DEMO)
                      </span>
                      <span className="text-slate-400">{risk.evidenceSource}</span>
                    </div>
                    <p className="text-slate-300 italic font-sans bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                      {risk.evidenceSnippet}
                    </p>
                  </div>

                  {/* Factors to Monitor */}
                  <div className="space-y-1.5">
                    <div className="text-slate-400 font-bold text-[10px] uppercase flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      Forward Factors to Monitor Prior to IC Approval
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {risk.factorsToMonitor.map((fm, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                          • {fm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

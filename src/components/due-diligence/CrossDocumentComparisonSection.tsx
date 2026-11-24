import React from 'react';
import { MOCK_CROSS_DOC_METRICS } from '@/lib/mockData';
import { ProjectDueDiligenceAnalysis } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Split, CheckCircle2, AlertTriangle, Clock, HelpCircle, Loader2 } from 'lucide-react';

interface CrossDocumentComparisonSectionProps {
  analysis?: ProjectDueDiligenceAnalysis | null;
  isAnalyzing?: boolean;
}

export const CrossDocumentComparisonSection: React.FC<CrossDocumentComparisonSectionProps> = ({
  analysis,
  isAnalyzing,
}) => {
  const rows = analysis?.crossDocComparison?.length
    ? analysis.crossDocComparison
    : MOCK_CROSS_DOC_METRICS;

  const getStatusBadge = (
    status: 'Consistent' | 'Changed' | 'Potential Inconsistency' | 'Missing'
  ) => {
    switch (status) {
      case 'Consistent':
        return (
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Consistent
          </span>
        );
      case 'Changed':
        return (
          <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            Changed
          </span>
        );
      case 'Potential Inconsistency':
        return (
          <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3" />
            Potential Inconsistency
          </span>
        );
      case 'Missing':
      default:
        return (
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold flex items-center gap-1 w-fit">
            <HelpCircle className="w-3 h-3" />
            Missing
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Split className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                Cross-Document Verification & Variance Matrix
              </h2>
              {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
            </div>
            <p className="text-xs text-slate-400">
              {analysis && analysis.documentNames.length > 0
                ? `Comparing disclosures across: ${analysis.documentNames.join(' vs ')}`
                : 'Automated AI comparison across 10-Ks, audited financials, and CIM filings'}
            </p>
          </div>
        </div>
        <Badge variant="green">{rows.length} Audited Trait Inspections</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono text-left text-slate-300 border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <th className="p-3.5 font-bold uppercase text-[10px]">Financial / Disclosure Metric</th>
              <th className="p-3.5 font-bold uppercase text-[10px]">Document A (Primary)</th>
              <th className="p-3.5 font-bold uppercase text-[10px]">Document B (Secondary)</th>
              <th className="p-3.5 font-bold uppercase text-[10px]">Variance / Difference</th>
              <th className="p-3.5 font-bold uppercase text-[10px]">Verification Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-slate-100">{row.metric}</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">{row.notes}</div>
                </td>
                <td className="p-3.5 text-slate-300 bg-slate-950/40">{row.docA}</td>
                <td className="p-3.5 text-slate-300 bg-slate-950/40">{row.docB}</td>
                <td className="p-3.5 font-bold text-amber-300">{row.difference}</td>
                <td className="p-3.5">{getStatusBadge(row.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { DueDiligenceProject, ProjectDueDiligenceAnalysis } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, inferCurrencyFromTicker } from '@/lib/utils';
import { FileText, Download, Share2, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface ReportGeneratorSectionProps {
  project: DueDiligenceProject;
  analysis?: ProjectDueDiligenceAnalysis | null;
}

export const ReportGeneratorSection: React.FC<ReportGeneratorSectionProps> = ({
  project,
  analysis,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const ca = analysis?.companyAnalysis;
  const currency = ca?.currency || project.currency || inferCurrencyFromTicker(project.ticker);
  const risks = analysis?.risks?.length
    ? analysis.risks.map((r) => ({ category: r.title, severity: r.severity, description: r.description }))
    : project.risks;
  const opps = analysis?.opportunities?.length
    ? analysis.opportunities.map((o) => ({
        category: o.title,
        impact: o.potentialImpact,
        description: o.supportingEvidence,
      }))
    : project.opportunities;
  const crossDoc = analysis?.crossDocComparison || [];
  const assessment = analysis?.investmentAssessment;

  const buildMarkdown = () => {
    const rev = ca?.metrics.revenue ?? project.financialHighlights.revenue;
    const revGrowth = ca?.metrics.revenueGrowth ?? project.financialHighlights.revenueGrowth;
    const margin = ca?.metrics.operatingMargin ?? project.financialHighlights.ebitdaMargin;

    return `# CONFIDENTIAL // INVESTMENT COMMITTEE MEMO
## ${project.name} (${project.ticker})
- **Target IRR:** ${project.targetIrr}% | **Deal Size:** ${formatCurrency(project.dealSize, 1, currency)} | **Multiple:** ${project.ebitdaMultiple}x EBITDA
- **Lead Analyst:** ${project.analyst} | **AI Overall Score:** ${assessment?.overallScore ?? project.score}/100

## 1. Executive Summary & Recommendation
${assessment?.overallThesis || ca?.executiveSummary || project.executiveSummary}

## 2. Company Overview & Financial Performance
${project.name} operates in ${project.sector} with revenue of ${formatCurrency(rev, 1, currency)} (${revGrowth >= 0 ? '+' : ''}${revGrowth}% YoY) and operating EBITDA margin of ${margin}%.

## 3. Key Risk Factors
${risks.map((r) => `- **${r.category} (${r.severity}):** ${r.description}`).join('\n')}

## 4. Key Opportunities & Value Creation Drivers
${opps.map((o) => `- **${o.category}:** ${o.description}`).join('\n')}

## 5. Evidence & VDR Sources
${(analysis?.documentNames || []).length > 0 ? analysis!.documentNames.map((d) => `- ${d}`).join('\n') : '- Project VDR Summary Baseline'}
`;
  };

  const handleGenerateAndSave = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: project.ticker,
          type: 'IC Memo',
          projectId: project.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('IC Memo generated & saved to the Reports tab.');
      }
    } catch {
      setStatusMessage('Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadMarkdown = () => {
    const md = buildMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.ticker}_IC_Memo.md`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage(`Downloaded ${project.ticker}_IC_Memo.md`);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(buildMarkdown());
      setStatusMessage('IC Memo copied to clipboard.');
    } catch {
      setStatusMessage('Clipboard permission blocked.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                IC Due Diligence Memo & Report Preview
              </h2>
              <Badge variant="green">
                {analysis && !analysis.isDemoFallback ? 'VDR-Grounded' : 'Ready'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Institutional investment memorandum synthesized from VDR PDFs & live financials
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={handleGenerateAndSave}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-400" />
            )}
            <span>Save to Reports</span>
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export .MD</span>
          </button>
          <button
            onClick={handlePrintPdf}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
          <button
            onClick={handleCopyShare}
            className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Copy Memo</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Document Memo View */}
      <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 max-w-4xl mx-auto space-y-8 font-sans text-slate-200 leading-relaxed text-xs shadow-2xl">
        <div className="pb-6 border-b border-slate-800 space-y-4 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>CONFIDENTIAL // INVESTMENT COMMITTEE MEMO</span>
            <span>Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              {project.name} ({project.ticker})
            </h1>
            <p className="text-xs text-emerald-400 font-bold">
              Target IRR: {project.targetIrr}% | Target Size:{' '}
              {formatCurrency(project.dealSize, 1, currency)} | Multiple: {project.ebitdaMultiple}x
              EBITDA | AI Score: {assessment?.overallScore ?? project.score}/100
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
            <span>Lead Analyst: {project.analyst}</span>
            <span>
              VDR Scope:{' '}
              {analysis?.documentNames.length
                ? `${analysis.documentNames.length} Indexed PDF(s)`
                : `${project.documentsCount} Documents`}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-emerald-400">
            1. Executive Summary & Recommendation
          </h2>
          <p className="text-slate-300">
            {assessment?.overallThesis || ca?.executiveSummary || project.executiveSummary}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-emerald-400">
            2. Company Overview & Financial Performance
          </h2>
          <p className="text-slate-300">
            {project.name} operates in {project.sector} with annual revenue of{' '}
            {formatCurrency(ca?.metrics.revenue ?? project.financialHighlights.revenue, 1, currency)}{' '}
            ({ca?.metrics.revenueGrowth ?? project.financialHighlights.revenueGrowth}% YoY) and
            operating EBITDA margin of{' '}
            {ca?.metrics.operatingMargin ?? project.financialHighlights.ebitdaMargin}%.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-rose-400">
            3. Key Risk Factors & Mitigation
          </h2>
          <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
            {risks.map((rk, idx) => (
              <li key={idx}>
                <strong>
                  {rk.category} ({rk.severity}):
                </strong>{' '}
                {rk.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-emerald-400">
            4. Key Opportunities & Value Creation Drivers
          </h2>
          <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
            {opps.map((opp, idx) => (
              <li key={idx}>
                <strong>
                  {opp.category} ({opp.impact}):
                </strong>{' '}
                {opp.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-blue-400">
            5. Cross-Document Inspection & Verification Findings
          </h2>
          {crossDoc.length > 0 ? (
            <ul className="space-y-1 pl-4 list-disc text-slate-300">
              {crossDoc.map((c) => (
                <li key={c.id}>
                  <strong>{c.metric}</strong> ({c.status}): {c.docA} vs {c.docB} — {c.difference}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-300">
              Upload 2 or more PDFs in the VDR tab to verify cross-document consistency automatically.
            </p>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-800 font-mono text-[11px]">
          <div className="text-slate-400 font-bold uppercase">Evidence & Sources Index</div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-slate-300">
            {(analysis?.documentNames || []).length > 0 ? (
              analysis!.documentNames.map((name) => <div key={name}>• {name}</div>)
            ) : (
              <div>• {project.name} Baseline Profile</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

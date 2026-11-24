import React, { useState, useEffect } from 'react';
import { MOCK_REPORTS } from '@/lib/mockData';
import { ReportItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import {
  Download,
  Sparkles,
  Share2,
  CheckCircle2,
  Loader2,
  Printer,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export const ReportsView: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>(MOCK_REPORTS);
  const [selectedReportId, setSelectedReportId] = useState<string>(MOCK_REPORTS[0].id);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [templateType, setTemplateType] = useState<ReportItem['type']>('IC Memo');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reports) && data.reports.length > 0) {
          setReports(data.reports);
          setSelectedReportId(data.reports[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInput.trim() || isGenerating) return;
    setIsGenerating(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: targetInput.trim(),
          type: templateType,
        }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReports(data.reports || [data.report, ...reports]);
        setSelectedReportId(data.report.id);
        setTargetInput('');
        setIsGenerateModalOpen(false);
        setFeedback(`Generated ${data.report.title}`);
      }
    } catch {
      setFeedback('Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const buildReportMarkdown = (rep: ReportItem) =>
    rep.markdownContent ||
    `# ${rep.title}\n- **Type:** ${rep.type}\n- **Author:** ${rep.author}\n- **Date:** ${rep.date}\n- **Verdict:** ${rep.verdict}\n\n## Executive Summary\n${rep.summary}\n\n## Key Diligence Takeaways\n${rep.keyTakeaways.map((k) => `- ${k}`).join('\n')}\n`;

  const handleExportMarkdown = () => {
    const md = buildReportMarkdown(selectedReport);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(selectedReport.ticker || 'AURA').replace(/[^a-zA-Z0-9_-]/g, '_')}_Report.md`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback(`Downloaded ${selectedReport.title} as Markdown.`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(buildReportMarkdown(selectedReport));
      setFeedback('Report copied to clipboard.');
    } catch {
      setFeedback('Clipboard access blocked.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              Investment Reports & IC Memos
            </h1>
            <Badge variant="green">{reports.length} Saved Documents</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            AI-synthesized Investment Committee memos, financial tear sheets, and exportable briefs.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-slate-950 stroke-slate-950" />
          Generate New Report
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3 print:hidden">
          <div className="text-xs font-semibold text-slate-400 font-mono uppercase px-1">
            Available Investment Memos ({reports.length})
          </div>

          {reports.map((rep) => {
            const isSelected = rep.id === selectedReportId;
            return (
              <div
                key={rep.id}
                onClick={() => setSelectedReportId(rep.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      rep.type === 'IC Memo'
                        ? 'purple'
                        : rep.type === 'Sector Deep Dive'
                        ? 'blue'
                        : 'amber'
                    }
                  >
                    {rep.type}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">{rep.date}</span>
                </div>

                <h3 className="text-xs font-bold text-slate-100 font-sans line-clamp-2 leading-snug">
                  {rep.title}
                </h3>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-800/50 pt-2">
                  <span>Author: {rep.author}</span>
                  <span className="text-emerald-400 font-semibold">{rep.verdict}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="purple">{selectedReport.type}</Badge>
                <span className="text-xs text-slate-400 font-mono">{selectedReport.readTime}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-1 font-sans">
                {selectedReport.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Export .MD
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / PDF
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                Copy
              </button>
            </div>
          </div>

          <div className="space-y-5 text-xs text-slate-200">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  Investment Committee Verdict
                </span>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {selectedReport.verdict}
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-mono">
                <div>
                  Status: <strong className="text-slate-200">{selectedReport.status}</strong>
                </div>
                <div>Date: {selectedReport.date}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                Executive Summary
              </h4>
              <p className="text-slate-300 leading-relaxed font-sans text-xs p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
                {selectedReport.summary}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                Key Diligence Takeaways
              </h4>
              <div className="space-y-2">
                {selectedReport.keyTakeaways.map((takeaway, ti) => (
                  <div
                    key={ti}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-200 font-sans leading-relaxed">{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate New Investment Memo / Report"
        subtitle="Synthesizes live Yahoo Finance fundamentals, Buy/Hold/Sell verdict & Gemini analysis"
      >
        <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Target Company / Ticker *
            </label>
            <input
              type="text"
              required
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="e.g. TATAMOTORS.NS, TCS, NVDA, AAPL"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Report Template Type</label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value as ReportItem['type'])}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="IC Memo">IC Investment Committee Memo</option>
              <option value="Earnings Tear Sheet">Earnings Tear Sheet & Guidance Audit</option>
              <option value="LBO Model Summary">LBO Model Feasibility Report</option>
              <option value="ESG Due Diligence">ESG & Regulatory Due Diligence</option>
              <option value="Sector Deep Dive">Sector Deep Dive</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isGenerating ? 'Synthesizing with AI...' : 'Generate IC Memo'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

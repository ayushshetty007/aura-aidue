import React, { useState } from 'react';
import { MOCK_REPORTS } from '@/lib/mockData';
import { ReportItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { 
  FileSpreadsheet, 
  Download, 
  FileText, 
  Sparkles, 
  Share2, 
  Printer, 
  Plus, 
  CheckCircle2, 
  Clock, 
  User, 
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export const ReportsView: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>(MOCK_REPORTS);
  const [selectedReportId, setSelectedReportId] = useState<string>(MOCK_REPORTS[0].id);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      const newReport: ReportItem = {
        id: `rep-${Date.now()}`,
        title: 'Q4 Hyperscale Cloud Infrastructure Tear Sheet',
        type: 'Earnings Tear Sheet',
        ticker: 'MSFT / AMZN',
        author: 'Rohan Mehta',
        date: 'Oct 08, 2026',
        readTime: '10 min read',
        status: 'Final',
        verdict: 'Recommend Investment',
        summary: 'Automated synthesis of Q4 hyperscaler capital expenditure filings showing 42% YoY cloud AI server cluster investment surge.',
        keyTakeaways: [
          'Azure AI workload ARR passed ₹10B milestone run-rate',
          'AWS Bedrock customer accounts up +85% QoQ',
          'Custom silicon adoption reducing third-party GPU licensing costs by 18%'
        ]
      };
      setReports([newReport, ...reports]);
      setSelectedReportId(newReport.id);
      setIsGenerating(false);
      setIsGenerateModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              Investment Reports & IC Memos
            </h1>
            <Badge variant="green">{reports.length} Generated Documents</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Automated Investment Committee memos, financial tear sheets, and regulatory risk briefs.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 shrink-0"
        >
          <Sparkles className="w-4 h-4 fill-slate-950 stroke-slate-950" />
          Generate New Report
        </button>
      </div>

      {/* Main 2-Column Grid: Report Selection List & Preview Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Report Cards */}
        <div className="lg:col-span-1 space-y-3">
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
                  <Badge variant={rep.type === 'IC Memo' ? 'purple' : rep.type === 'Sector Deep Dive' ? 'blue' : 'amber'}>
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

        {/* Right Column: Interactive Report Preview Panel */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
          {/* Document Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="purple">{selectedReport.type}</Badge>
                <span className="text-xs text-slate-400 font-mono">{selectedReport.readTime}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-1 font-sans">{selectedReport.title}</h2>
            </div>

            {/* Export & Download Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => alert(`Downloading ${selectedReport.title} as PDF...`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Export PDF
              </button>
              <button 
                onClick={() => alert('Report metadata copied to clipboard!')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                Share
              </button>
            </div>
          </div>

          {/* Report Body Content */}
          <div className="space-y-5 text-xs text-slate-200">
            {/* Verdict Box */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Investment Committee Verdict</span>
                <div className="text-sm font-bold text-emerald-400 font-mono">{selectedReport.verdict}</div>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-mono">
                <div>Status: <strong className="text-slate-200">{selectedReport.status}</strong></div>
                <div>Date: {selectedReport.date}</div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Executive Summary</h4>
              <p className="text-slate-300 leading-relaxed font-sans text-xs p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
                {selectedReport.summary}
              </p>
            </div>

            {/* Key Takeaways List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Key Diligence Takeaways</h4>
              <div className="space-y-2">
                {selectedReport.keyTakeaways.map((takeaway, ti) => (
                  <div key={ti} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-200 font-sans leading-relaxed">{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Report Workflow Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate New Investment Memo / Report"
        subtitle="AI Copilot will synthesize VDR filings, valuation multiples, and risk scoring into standard IC format"
      >
        <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Company / Ticker</label>
            <input
              type="text"
              required
              placeholder="e.g. MSFT, CloudScale Systems"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Report Template Type</label>
            <select className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500">
              <option>IC Investment Committee Memo</option>
              <option>Earnings Tear Sheet & Guidance Audit</option>
              <option>LBO Model Feasibility Report</option>
              <option>ESG & Regulatory Due Diligence</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-md shadow-emerald-500/20 flex items-center gap-2"
            >
              {isGenerating ? 'Synthesizing with AI...' : 'Generate IC Memo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

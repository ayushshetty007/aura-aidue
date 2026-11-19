import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Plus, Upload, Building2, IndianRupee, Target, FileText } from 'lucide-react';
import { DueDiligenceProject } from '@/types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newProject: Partial<DueDiligenceProject>) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    sector: 'Enterprise Software / Infrastructure',
    dealSize: '500000000',
    targetIrr: '25.0',
    ebitdaMultiple: '16.5',
    executiveSummary: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name: formData.name || 'Project Nexus - New Target',
      ticker: formData.ticker.toUpperCase() || 'NEXS',
      sector: formData.sector,
      stage: 'Initial Review',
      status: 'Under Review',
      targetIrr: parseFloat(formData.targetIrr) || 24.0,
      dealSize: parseFloat(formData.dealSize) || 500000000,
      ebitdaMultiple: parseFloat(formData.ebitdaMultiple) || 16.0,
      score: 82,
      updatedAt: 'Just now',
      analyst: 'Rohan Mehta',
      executiveSummary: formData.executiveSummary || 'Newly created target acquisition under AI diligence phase.',
      documentsCount: 1,
      risks: [
        { category: 'Customer Churn', description: 'Early-stage retention metrics require verification', severity: 'Medium' }
      ],
      opportunities: [
        { category: 'Expansion', description: 'Significant white space in North American enterprise market', impact: 'High' }
      ],
      financialHighlights: {
        revenue: 85000000,
        revenueGrowth: 32.0,
        ebitdaMargin: 22.0,
        netDebtToEbitda: 1.5,
        freeCashFlow: 18000000
      }
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Due Diligence Project"
      subtitle="Initiate AI document ingestion, CIM parsing, and financial model baseline"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Project & Deal Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Project Valkyrie - CloudScale Systems"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Stock Ticker / Code</label>
            <input
              type="text"
              placeholder="e.g. CSCL"
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Industry Sector</label>
            <select
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option>Enterprise Software / Infrastructure</option>
              <option>Cybersecurity & Zero Trust</option>
              <option>Semiconductors & AI Hardware</option>
              <option>Biotech & Medical Devices</option>
              <option>Renewables & Energy</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Deal Size (₹)</label>
            <input
              type="number"
              value={formData.dealSize}
              onChange={(e) => setFormData({ ...formData, dealSize: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target IRR (%)</label>
            <input
              type="number"
              step="0.1"
              value={formData.targetIrr}
              onChange={(e) => setFormData({ ...formData, targetIrr: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Entry EBITDA Multiple</label>
            <input
              type="number"
              step="0.1"
              value={formData.ebitdaMultiple}
              onChange={(e) => setFormData({ ...formData, ebitdaMultiple: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Initial Thesis / Executive Summary</label>
          <textarea
            rows={3}
            placeholder="Briefly state investment hypothesis, market opportunity, and key catalysts..."
            value={formData.executiveSummary}
            onChange={(e) => setFormData({ ...formData, executiveSummary: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
          >
            Create & Ingest Target
          </button>
        </div>
      </form>
    </Modal>
  );
};

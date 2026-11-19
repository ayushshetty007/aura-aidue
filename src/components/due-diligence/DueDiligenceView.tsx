import React, { useState } from 'react';
import { MOCK_DUE_DILIGENCE_PROJECTS } from '@/lib/mockData';
import { DueDiligenceProject } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { CreateProjectModal } from './CreateProjectModal';
import { DocumentLibrarySection } from './DocumentLibrarySection';
import { CompanyAnalysisSection } from './CompanyAnalysisSection';
import { RiskAnalysisSection } from './RiskAnalysisSection';
import { OpportunityAnalysisSection } from './OpportunityAnalysisSection';
import { CrossDocumentComparisonSection } from './CrossDocumentComparisonSection';
import { InvestmentAssessmentSection } from './InvestmentAssessmentSection';
import { ReportGeneratorSection } from './ReportGeneratorSection';
import { AIQASection } from './AIQASection';
import { 
  Plus, 
  Search, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Split, 
  Layers, 
  ShieldCheck, 
  FolderLock, 
  BarChart2, 
  ArrowUpRight, 
  FileCheck2 
} from 'lucide-react';

interface DueDiligenceViewProps {
  initialDealId?: string;
  onNavigateToMarketIntel?: () => void;
}

export const DueDiligenceView: React.FC<DueDiligenceViewProps> = ({
  initialDealId,
  onNavigateToMarketIntel
}) => {
  const [projects, setProjects] = useState<DueDiligenceProject[]>(MOCK_DUE_DILIGENCE_PROJECTS);
  const [selectedDealId, setSelectedDealId] = useState<string>(
    initialDealId || MOCK_DUE_DILIGENCE_PROJECTS[0].id
  );
  const [activeTab, setActiveTab] = useState<
    'overview' | 'documents' | 'analysis' | 'ai-qa' | 'risks' | 'opportunities' | 'comparison' | 'assessment' | 'report'
  >('overview');
  
  const [filterStage, setFilterStage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === selectedDealId) || projects[0];

  const handleCreateProject = (newProject: Partial<DueDiligenceProject>) => {
    const fullProject: DueDiligenceProject = {
      id: `dd-${Date.now()}`,
      name: newProject.name || 'New Acquisition Target',
      ticker: newProject.ticker || 'TARGET',
      sector: newProject.sector || 'Enterprise Software',
      stage: newProject.stage || 'Initial Review',
      status: newProject.status || 'Under Review',
      targetIrr: newProject.targetIrr || 24.0,
      dealSize: newProject.dealSize || 500000000,
      ebitdaMultiple: newProject.ebitdaMultiple || 16.0,
      score: newProject.score || 82,
      updatedAt: 'Just now',
      analyst: newProject.analyst || 'Rohan Mehta',
      executiveSummary: newProject.executiveSummary || 'Ingested new target profile.',
      documentsCount: 1,
      risks: newProject.risks || [],
      opportunities: newProject.opportunities || [],
      financialHighlights: newProject.financialHighlights || {
        revenue: 100000000,
        revenueGrowth: 25.0,
        ebitdaMargin: 20.0,
        netDebtToEbitda: 2.0,
        freeCashFlow: 20000000,
      },
    };
    setProjects([fullProject, ...projects]);
    setSelectedDealId(fullProject.id);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = filterStage === 'All' || p.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              AI Due Diligence Workspace
            </h1>
            <Badge variant="green">{projects.length} Active Deals</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Autonomous VDR ingestion, financial analysis, evidence citations, risk scorecards, and IC memorandum generator.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Due Diligence Project</span>
        </button>
      </div>

      {/* Active Deal Context & Project Switcher Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm">
              ${activeProject.ticker}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 font-mono">{activeProject.name}</h2>
                <Badge variant="green">{activeProject.status}</Badge>
                <Badge variant="blue" className="font-mono">{activeProject.stage}</Badge>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target IRR: <strong className="text-emerald-400">{activeProject.targetIrr}%</strong> | Deal Size: <strong className="text-slate-200">{formatCurrency(activeProject.dealSize)}</strong> | Multiple: <strong className="text-amber-400">{activeProject.ebitdaMultiple}x</strong> | Score: <strong className="text-emerald-400">{activeProject.score}/100</strong>
              </p>
            </div>
          </div>

          {/* Quick Select Dropdown / Deal Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">Active Target:</span>
            <select
              value={selectedDealId}
              onChange={(e) => setSelectedDealId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.ticker})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Project Navigation Tabs */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-slate-800 overflow-x-auto text-xs font-mono">
          {[
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'documents', label: 'Documents (VDR)', icon: FolderLock },
            { id: 'analysis', label: 'Company Analysis', icon: BarChart2 },
            { id: 'ai-qa', label: 'AI Q&A', icon: Sparkles },
            { id: 'risks', label: 'Risks', icon: AlertTriangle },
            { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
            { id: 'comparison', label: 'Cross-Doc Comparison', icon: Split },
            { id: 'assessment', label: 'Investment Assessment', icon: ShieldCheck },
            { id: 'report', label: 'Report Preview', icon: FileCheck2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'documents' | 'analysis' | 'ai-qa' | 'risks' | 'opportunities' | 'comparison' | 'assessment' | 'report')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Views */}

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Projects Dashboard Grid */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Active Due Diligence Projects & Pipeline
              </h3>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search deal or ticker..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Stages</option>
                  <option value="Sourcing">Sourcing</option>
                  <option value="Initial Review">Initial Review</option>
                  <option value="Deep Dive">Deep Dive</option>
                  <option value="IC Ready">IC Ready</option>
                </select>
              </div>
            </div>

            {/* Project Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((proj) => {
                const isSelected = proj.id === selectedDealId;
                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedDealId(proj.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-emerald-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                          ${proj.ticker}
                        </span>
                        <h4 className="text-sm font-bold text-slate-100 font-mono truncate max-w-[200px]">{proj.name}</h4>
                      </div>
                      <Badge variant={proj.status === 'High Conviction' ? 'green' : proj.status === 'Flagged Risk' ? 'red' : 'blue'}>
                        {proj.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 font-sans">{proj.executiveSummary}</p>

                    <div className="grid grid-cols-4 gap-2 text-[10px] font-mono pt-2 border-t border-slate-800/80">
                      <div>
                        <div className="text-slate-500">Target IRR</div>
                        <div className="font-bold text-emerald-400">{proj.targetIrr}%</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Deal Size</div>
                        <div className="font-bold text-slate-200">${(proj.dealSize / 1e6).toFixed(0)}M</div>
                      </div>
                      <div>
                        <div className="text-slate-500">VDR Files</div>
                        <div className="font-bold text-slate-200">{proj.documentsCount} docs</div>
                      </div>
                      <div>
                        <div className="text-slate-500">AI Score</div>
                        <div className="font-bold text-emerald-400">{proj.score}/100</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Documents (VDR) Tab */}
      {activeTab === 'documents' && <DocumentLibrarySection projectId={activeProject.id} />}

      {/* 3. Company Analysis Tab */}
      {activeTab === 'analysis' && (
        <CompanyAnalysisSection
          project={activeProject}
          onNavigateToMarketIntel={onNavigateToMarketIntel}
        />
      )}

      {/* 4. AI Q&A Tab */}
      {activeTab === 'ai-qa' && (
        <AIQASection dealName={activeProject.name} projectId={activeProject.id} />
      )}

      {/* 5. Risks Tab */}
      {activeTab === 'risks' && <RiskAnalysisSection />}

      {/* 6. Opportunities Tab */}
      {activeTab === 'opportunities' && <OpportunityAnalysisSection />}

      {/* 7. Cross-Document Comparison Tab */}
      {activeTab === 'comparison' && <CrossDocumentComparisonSection />}

      {/* 8. Investment Assessment Tab */}
      {activeTab === 'assessment' && (
        <InvestmentAssessmentSection
          project={activeProject}
          onNavigateToMarketIntel={onNavigateToMarketIntel}
        />
      )}

      {/* 9. Report Preview Tab */}
      {activeTab === 'report' && <ReportGeneratorSection project={activeProject} />}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};

'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavigationTab } from '@/types';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { DueDiligenceView } from '@/components/due-diligence/DueDiligenceView';
import { MarketIntelView } from '@/components/market-intel/MarketIntelView';
import { PortfolioView } from '@/components/portfolio/PortfolioView';
import { WatchlistView } from '@/components/watchlist/WatchlistView';
import { ReportsView } from '@/components/reports/ReportsView';
import { SettingsView } from '@/components/settings/SettingsView';
import { Modal } from '@/components/ui/Modal';
import { 
  Search, 
  Sparkles, 
  Send, 
  X, 
  Building2, 
  TrendingUp, 
  IndianRupee, 
  Info, 
  ArrowUpRight, 
  BarChart3, 
  CheckCircle2 
} from 'lucide-react';
import { MOCK_DUE_DILIGENCE_PROJECTS, MOCK_WATCHLIST } from '@/lib/mockData';
import { searchCompanies, CompanyProfile } from '@/lib/companyData';

export const Shell: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive activeTab directly from URL search params (defaults to 'dashboard')
  const activeTab = (searchParams?.get('tab') as NavigationTab) || 'dashboard';
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const setActiveTab = useCallback((tab: NavigationTab) => {
    try {
      const url = tab === 'dashboard' ? '/' : `/?tab=${tab}`;
      router.push(url);
    } catch {
      // Fallback for SSR/hydration transition
    }
  }, [router]);

  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotChat, setCopilotChat] = useState([
    {
      sender: 'copilot',
      text: 'Hi Rohan, how can I help you today? You can ask me to summarize deal metrics, review uploaded PDFs, or check portfolio exposure.',
    }
  ]);

  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;

    const q = copilotQuery;
    setCopilotChat((prev) => [...prev, { sender: 'user', text: q }]);
    setCopilotQuery('');

    const lowerQ = q.toLowerCase();
    let reply = `Analyzed portfolio & market feed for "${q}":\n- **Signal**: Positive momentum detected across automotive & tech leaders.\n- **Risk Factor**: Customer concentration flagged in Project Valkyrie.\n- **Action**: Check Watchlist for Tata Motors and Maruti Suzuki.`;

    if (lowerQ.includes('tata')) {
      reply = `**Tata Motors Financial & Profit Analysis**:\n• **Consolidated Net Profit**: ₹31,807 Crore (FY24 all-time record PAT) / ₹28,149 Crore (FY25).\n• **Annual Revenue**: ₹4,37,928 Crore (FY24) / ₹4,39,695 Crore (FY25).\n• **Net Margin**: ~6.4%.\n• **How it made this profit**: Historic operational turnaround at Jaguar Land Rover (JLR) driven by Defender and Range Rover volume, strong Indian commercial vehicle margins, and 70%+ electric vehicle (EV) market dominance. Automotive net debt reduced to zero in FY25.`;
    } else if (lowerQ.includes('suzuki') || lowerQ.includes('maruti')) {
      reply = `**Maruti Suzuki India Financial & Profit Analysis**:\n• **Consolidated Net Profit**: ₹13,955 Crore (FY25 all-time record PAT, +5.6% YoY) / ₹13,209 Crore (FY24, +64% YoY).\n• **Annual Revenue**: ₹1,56,650 Crore (FY25) / ₹1,44,787 Crore (FY24).\n• **Net Margin**: ~8.9%.\n• **How it made this profit**: Strategic transition into premium SUVs (Grand Vitara, Brezza, Fronx), high-margin Nexa retail distribution expansion, and massive treasury returns on ₹50,000+ Crore in liquid cash reserves.`;
    } else if (lowerQ.includes('profit') || lowerQ.includes('earn') || lowerQ.includes('financial')) {
      reply = `**Net Profit Summary for Tracked Indian Leaders**:\n\n1. **Tata Motors**: ₹31,807 Cr (FY24) / ₹28,149 Cr (FY25) Net Profit on ₹4.38 Lakh Cr revenue.\n2. **Maruti Suzuki**: ₹13,955 Cr (FY25) / ₹13,209 Cr (FY24) Record Net Profit on ₹1.57 Lakh Cr revenue.\n3. **Tata Consultancy Services (TCS)**: ₹46,099 Cr Net Profit on ₹2,40,893 Cr revenue.\n4. **Reliance Industries**: ₹69,621 Cr Net Profit on ₹10,00,122 Cr revenue.\n\nTip: You can also use the Search bar in the top navigation to view interactive profit breakdown tables!`;
    }

    setTimeout(() => {
      setCopilotChat((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: reply,
        }
      ]);
    }, 400);
  };

  const handleOpenDealFromDashboard = (dealId: string) => {
    setSelectedDealId(dealId);
    setActiveTab('due-diligence');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navbar */}
      <Navbar
        onSearchOpen={() => setIsSearchOpen(true)}
        onAiCopilotOpen={() => setIsAiCopilotOpen(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8 min-w-0 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
              onOpenDeal={handleOpenDealFromDashboard}
            />
          )}

          {activeTab === 'due-diligence' && (
            <DueDiligenceView
              initialDealId={selectedDealId}
              onNavigateToMarketIntel={() => setActiveTab('market-intel')}
            />
          )}

          {activeTab === 'market-intel' && <MarketIntelView />}

          {activeTab === 'portfolio' && <PortfolioView />}

          {activeTab === 'watchlist' && <WatchlistView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Search Command Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
        }}
        title="Company & Profit Intelligence Search"
        subtitle="Search any company to view annual profit figures, revenue, and profit drivers"
        maxWidth="4xl"
      >
        <div className="space-y-5 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tata, Suzuki, Reliance, TCS, or any company..."
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Quick Searches:</span>
            {[
              { label: 'Tata Motors', q: 'Tata Motors' },
              { label: 'Maruti Suzuki', q: 'Suzuki' },
              { label: 'TCS', q: 'TCS' },
              { label: 'Reliance', q: 'Reliance' },
              { label: 'All Companies', q: '' }
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setSearchQuery(chip.q)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  (chip.q === '' && searchQuery === '') || (chip.q !== '' && searchQuery.toLowerCase().includes(chip.q.toLowerCase()))
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {searchCompanies(searchQuery).map((company) => (
              <div 
                key={company.id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-100">{company.name}</h4>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold text-emerald-500 border border-slate-700">
                          {company.ticker}
                        </span>
                        <span className="text-[11px] text-slate-400">({company.exchange})</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {company.sector} {company.parentGroup ? `• ${company.parentGroup}` : ''} • HQ: {company.headquarters}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide">Market Cap</div>
                      <div className="text-xs font-bold text-slate-200">{company.marketCap}</div>
                    </div>
                  </div>
                </div>

                {/* Profit Highlight Banner */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      Annual Net Profit Record:
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                      Net Margin: {company.profitMargin}
                    </span>
                  </div>

                  <div className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                    {company.latestProfitFigure}
                  </div>

                  <div className="text-xs text-slate-300">
                    <strong>Total Annual Revenue:</strong> {company.revenue}
                  </div>

                  <div className="text-[11px] text-emerald-600 font-semibold pt-0.5">
                    ✓ {company.profitGrowth}
                  </div>
                </div>

                {/* About & Profit Explanation */}
                <div className="space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span>How this company made its profit:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    {company.profitExplanation}
                  </p>
                </div>

                {/* Key Financial History Table */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400">Financial Performance Breakdown:</div>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <th className="py-2 px-3">Year</th>
                          <th className="py-2 px-3 text-right">Revenue</th>
                          <th className="py-2 px-3 text-right font-bold text-emerald-500">Net Profit (PAT)</th>
                          <th className="py-2 px-3">Profit Performance Highlights</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-200">
                        {company.keyFinancials.map((kf, i) => (
                          <tr key={i} className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-bold text-slate-100">{kf.year}</td>
                            <td className="py-2.5 px-3 text-right font-medium">{kf.revenue}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-500">{kf.netProfit}</td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-400">{kf.patGrowth}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Key Profit Drivers */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-400">Primary Profit Drivers:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {company.profitDrivers.map((driver, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-[11px] leading-snug">{driver}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {searchCompanies(searchQuery).length === 0 && (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <p className="text-sm">No companies found matching &quot;{searchQuery}&quot;.</p>
                <p className="text-xs text-slate-500">Try searching for &quot;Tata&quot;, &quot;Suzuki&quot;, &quot;TCS&quot;, or &quot;Reliance&quot;.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Global AI Copilot Slide-Over Drawer */}
      {isAiCopilotOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">AI Research Assistant</h3>
                  <p className="text-[11px] text-slate-400">Ask questions about deals, companies, and documents</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiCopilotOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1 text-xs">
              {copilotChat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium ml-6'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 mr-4 whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleCopilotSubmit} className="flex items-center gap-2 pt-3 border-t border-slate-800">
              <input
                type="text"
                placeholder="Ask a question about your deals..."
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

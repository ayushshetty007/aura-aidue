'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CompanyFYResult, NavigationTab } from '@/types';
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
  TrendingDown,
  Info,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const Shell: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = (searchParams?.get('tab') as NavigationTab) || 'dashboard';

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | undefined>();
  const [selectedMarketTicker, setSelectedMarketTicker] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompanyFYResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [dealsCount, setDealsCount] = useState<number>(5);
  const [watchlistCount, setWatchlistCount] = useState<number>(12);

  const setActiveTab = useCallback(
    (tab: NavigationTab) => {
      try {
        const url = tab === 'dashboard' ? '/' : `/?tab=${tab}`;
        router.push(url);
      } catch {
        // Fallback for SSR/hydration transition
      }
    },
    [router]
  );

  // Global Cmd+K / Ctrl+K shortcut for company & FY profit/loss search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load sidebar badge counts
  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.projects)) setDealsCount(d.projects.length);
      })
      .catch(() => {});

    fetch('/api/watchlist')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.items)) setWatchlistCount(d.items.length);
      })
      .catch(() => {});
  }, [activeTab]);

  // Debounced live company + Present FY Profit/Loss search
  useEffect(() => {
    if (!isSearchOpen) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/search/companies?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled && data.success && Array.isArray(data.results)) {
            setSearchResults(data.results);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, isSearchOpen]);

  const [copilotQuery, setCopilotQuery] = useState('');
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [copilotChat, setCopilotChat] = useState([
    {
      sender: 'copilot',
      text: 'Hi Rohan, how can I help you today? Ask me about any deal, uploaded PDFs, company FY profit/loss, or Buy/Hold/Sell signals.',
    },
  ]);

  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim() || isCopilotLoading) return;

    const q = copilotQuery.trim();
    setCopilotChat((prev) => [...prev, { sender: 'user', text: q }]);
    setCopilotQuery('');
    setIsCopilotLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, projectId: selectedDealId }),
      });
      const data = await res.json();
      setCopilotChat((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: data.answer || data.error || 'Unable to process request.',
        },
      ]);
    } catch {
      setCopilotChat((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: 'Network error reaching AI Assistant endpoint. Please try again.',
        },
      ]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const handleOpenDealFromDashboard = (dealId: string) => {
    setSelectedDealId(dealId);
    setActiveTab('due-diligence');
  };

  const handleOpenStockInMarketIntel = (ticker: string) => {
    setSelectedMarketTicker(ticker);
    setIsSearchOpen(false);
    setSearchQuery('');
    setActiveTab('market-intel');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar
        onSearchOpen={() => setIsSearchOpen(true)}
        onAiCopilotOpen={() => setIsAiCopilotOpen(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          dealsCount={dealsCount}
          watchlistCount={watchlistCount}
        />

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
              onNavigateToMarketIntel={(ticker) => {
                if (ticker) setSelectedMarketTicker(ticker);
                setActiveTab('market-intel');
              }}
              onProjectsChange={(count) => setDealsCount(count)}
            />
          )}

          {activeTab === 'market-intel' && (
            <MarketIntelView initialTicker={selectedMarketTicker} />
          )}

          {activeTab === 'portfolio' && <PortfolioView />}

          {activeTab === 'watchlist' && (
            <WatchlistView onCountChange={(c) => setWatchlistCount(c)} />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Search Command Modal (Present FY Profit/Loss + Live Quote) */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
        }}
        title="Company & Present FY Profit / Loss Search"
        subtitle="Search any Indian (NSE/BSE) or Global listed company for live share price, FY Profit/Loss & Buy/Hold/Sell verdict"
        maxWidth="4xl"
      >
        <div className="space-y-5 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tata Motors, Maruti, TCS, Reliance, Apple, NVIDIA, Zomato..."
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500 absolute right-10 top-3.5" />
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Quick Searches:</span>
            {[
              { label: 'Infosys', q: 'Infosys' },
              { label: 'ITC', q: 'ITC' },
              { label: 'Paytm', q: 'Paytm' },
              { label: 'Suzlon', q: 'Suzlon' },
              { label: 'Tata Motors', q: 'Tata Motors' },
              { label: 'Reliance', q: 'Reliance' },
              { label: 'NVIDIA', q: 'NVDA' },
              { label: 'All Top Leaders', q: '' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setSearchQuery(chip.q)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  (chip.q === '' && searchQuery === '') ||
                  (chip.q !== '' && searchQuery.toLowerCase() === chip.q.toLowerCase())
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {searchResults.map((company) => {
              const isProfit = company.isProfit !== false;
              return (
                <div
                  key={company.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-slate-100">{company.name}</h4>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold text-emerald-500 border border-slate-700">
                            {company.symbol}
                          </span>
                          <span className="text-[11px] text-slate-400">({company.exchange})</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              company.advisoryVerdict === 'Buy'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : company.advisoryVerdict === 'Sell'
                                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            AI Verdict: {company.advisoryVerdict} ({company.advisoryConfidence}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {company.sector} • Market Cap: {company.marketCap}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      {company.currentPrice !== null && (
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                            {company.isLiveMarketData ? 'Live Share Price' : 'Reference Price'}
                          </div>
                          <div className="text-sm font-bold text-slate-100 font-mono">
                            {formatCurrency(company.currentPrice, 2, company.currency)}
                            {company.changePercent !== null && (
                              <span
                                className={`ml-1.5 text-xs ${
                                  company.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                ({company.changePercent >= 0 ? '+' : ''}
                                {company.changePercent.toFixed(2)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenStockInMarketIntel(company.symbol)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Analyze <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Present FY Profit or Loss Highlight Banner */}
                  <div
                    className={`p-4 rounded-xl border space-y-1.5 ${
                      isProfit
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-rose-500/10 border-rose-500/30'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold flex items-center gap-1.5 ${
                          isProfit ? 'text-emerald-500' : 'text-rose-400'
                        }`}
                      >
                        {isProfit ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        Present FY Financial Result ({company.latestFYLabel}):
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-900/60 text-slate-200 border border-slate-700">
                        Net Margin: {company.netMargin}
                      </span>
                    </div>

                    <div className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
                      {company.latestFYProfitOrLoss}
                    </div>

                    <div className="text-xs text-slate-300">
                      <strong>Annual Revenue:</strong> {company.latestFYRevenue}
                    </div>

                    <div
                      className={`text-[11px] font-semibold pt-0.5 ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {company.yoyGrowth}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-blue-400" />
                      <span>Financial Summary & Profit Drivers:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      {company.profitExplanation}
                    </p>
                  </div>

                  {company.keyFinancials.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400">
                        Multi-Year Performance Breakdown:
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                              <th className="py-2 px-3">Year</th>
                              <th className="py-2 px-3 text-right">Revenue</th>
                              <th className="py-2 px-3 text-right font-bold text-emerald-500">
                                Net Profit / Loss
                              </th>
                              <th className="py-2 px-3">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-200">
                            {company.keyFinancials.map((kf, i) => (
                              <tr key={i} className="hover:bg-slate-800/30">
                                <td className="py-2.5 px-3 font-bold text-slate-100">{kf.year}</td>
                                <td className="py-2.5 px-3 text-right font-medium">{kf.revenue}</td>
                                <td
                                  className={`py-2.5 px-3 text-right font-bold ${
                                    kf.netProfit.startsWith('-') ? 'text-rose-400' : 'text-emerald-500'
                                  }`}
                                >
                                  {kf.netProfit}
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-400">
                                  {kf.patGrowth}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-semibold text-slate-400">
                      Key Metrics & Drivers:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {company.profitDrivers.map((driver, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-[11px] leading-snug">{driver}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {!isSearching && searchResults.length === 0 && (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <p className="text-sm">No companies found matching &quot;{searchQuery}&quot;.</p>
                <p className="text-xs text-slate-500">
                  Try searching any NSE/BSE ticker (e.g. &quot;INFY.NS&quot;, &quot;HDFCBANK.NS&quot;, &quot;ZOMATO.NS&quot;) or US ticker (&quot;MSFT&quot;, &quot;TSLA&quot;, &quot;NVDA&quot;).
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Global AI Copilot Slide-Over Drawer */}
      {isAiCopilotOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">AI Research Assistant</h3>
                  <p className="text-[11px] text-slate-400">
                    Live Gemini + VDR & Market Intelligence
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiCopilotOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
              {isCopilotLoading && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 flex items-center gap-2 mr-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing VDR, portfolio & live market feeds...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={handleCopilotSubmit}
              className="flex items-center gap-2 pt-3 border-t border-slate-800"
            >
              <input
                type="text"
                disabled={isCopilotLoading}
                placeholder="Ask about Tata Motors profit, NVDA, or uploaded PDFs..."
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isCopilotLoading || !copilotQuery.trim()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
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

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Bell, 
  ChevronDown, 
  Command, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Menu, 
  X,
  Layers,
  Sun,
  Moon
} from 'lucide-react';
import { MOCK_MARKET_INDICES, MOCK_USER_PROFILE } from '@/lib/mockData';
import { formatPercent } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface NavbarProps {
  onSearchOpen?: () => void;
  onAiCopilotOpen?: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchOpen,
  onAiCopilotOpen,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Ticker Ribbon Bar */}
      <div className="hidden lg:flex items-center gap-6 px-6 py-1.5 bg-slate-900/60 border-b border-slate-800/40 text-xs font-mono text-slate-400 overflow-x-auto no-scrollbar">
        <span className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Markets:
        </span>
        {MOCK_MARKET_INDICES.map((idx) => {
          const isUp = idx.change >= 0;
          return (
            <div key={idx.symbol} className="flex items-center gap-2 shrink-0 border-r border-slate-800/80 pr-4">
              <span className="text-slate-300 font-semibold">{idx.symbol}</span>
              <span className="text-slate-200">{idx.value.toLocaleString()}</span>
              <span className={`flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatPercent(idx.changePercent)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Header Row */}
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base text-slate-100">AURA</span>
              </div>
              <p className="text-[11px] text-slate-400">Deal & Market Intelligence</p>
            </div>
          </div>
        </div>

        {/* Center: Search Trigger */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <button
            onClick={onSearchOpen}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300 transition-all text-sm group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              <span>Search companies (Tata, Suzuki...) for profit & financials...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              <Command className="w-3 h-3" /> K
            </kbd>
          </button>
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Ask AI Copilot Button */}
          <button
            onClick={onAiCopilotOpen}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-slate-600 hover:text-slate-900" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300" />
            )}
          </button>

          {/* Notifications Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass-panel bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-200">AI Alerts & Updates</span>
                  <span className="text-[10px] text-emerald-400 font-mono">3 New</span>
                </div>
                <div className="space-y-3">
                  <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50">
                    <p className="font-semibold text-slate-200">10-Q Alert: NVDA</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Custom ASIC expenditure +34% YoY detected.</p>
                  </div>
                  <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50">
                    <p className="font-semibold text-slate-200">Due Diligence Completed</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Project Apex (CyberTech) IC Memo generated.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <img
              src={MOCK_USER_PROFILE.avatar}
              alt={MOCK_USER_PROFILE.name}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            />
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-200">{MOCK_USER_PROFILE.name}</div>
              <div className="text-[10px] text-slate-400">{MOCK_USER_PROFILE.firm}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

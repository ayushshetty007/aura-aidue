import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  Globe2,
  PieChart,
  Bookmark,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';
import { NavigationTab } from '@/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  dealsCount?: number;
  watchlistCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  dealsCount = 5,
  watchlistCount = 12,
}) => {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'due-diligence', label: 'Due Diligence', icon: FileCheck2, badge: `${dealsCount} Deals` },
    { id: 'market-intel', label: 'Market Intelligence', icon: Globe2 },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark, badge: String(watchlistCount) },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (e: React.MouseEvent, id: NavigationTab) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-16 z-50 h-[calc(100vh-4rem)] w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out select-none',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => handleSelect(e, item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group cursor-pointer',
                  isActive
                    ? 'bg-slate-900 text-emerald-400 border border-emerald-500/20 font-semibold shadow-sm shadow-emerald-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-mono px-2 py-0.5 rounded-full border',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Apex Capital</span>
              <span className="text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {dealsCount} active deals in review
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

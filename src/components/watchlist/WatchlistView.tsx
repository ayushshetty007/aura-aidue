import React, { useState } from 'react';
import { MOCK_WATCHLIST } from '@/lib/mockData';
import { WatchlistItem } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { 
  Bookmark, 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Target, 
  Zap,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export const WatchlistView: React.FC = () => {
  const [items, setItems] = useState<WatchlistItem[]>(MOCK_WATCHLIST);
  const [filterSignal, setFilterSignal] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTickerInput, setNewTickerInput] = useState('');

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerInput.trim()) return;

    const newStock: WatchlistItem = {
      id: `w-${Date.now()}`,
      ticker: newTickerInput.toUpperCase(),
      name: `${newTickerInput.toUpperCase()} Corp`,
      sector: 'Technology & Hardware',
      price: 185.20,
      change24h: 2.4,
      change1w: 5.1,
      change1m: 14.2,
      change1y: 45.8,
      volume: '15.4M',
      marketCap: '₹45.2B',
      peRatio: 32.4,
      targetPrice: 220.00,
      aiSignal: 'Strong Buy',
      aiConfidence: 88,
      notes: 'Added via watchlist radar scanner.'
    };

    setItems([newStock, ...items]);
    setNewTickerInput('');
    setIsAddModalOpen(false);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSignal = filterSignal === 'All' || item.aiSignal === filterSignal;
    return matchesSearch && matchesSignal;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              AI Watchlist & Radar
            </h1>
            <Badge variant="green">{items.length} Tracked Equities</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-timeframe performance, AI rating, target upside, and catalyst alerts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Add Ticker to Watchlist
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search watched ticker or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-mono mr-1">AI Signal:</span>
          {['All', 'Strong Buy', 'Accumulate', 'Hold', 'Trim'].map((sig) => (
            <button
              key={sig}
              onClick={() => setFilterSignal(sig)}
              className={`text-[11px] font-mono px-3 py-1 rounded-lg border transition-colors ${
                filterSignal === sig
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {sig}
            </button>
          ))}
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Ticker / Company</th>
                <th className="py-3 px-4 text-right">Price (₹)</th>
                <th className="py-3 px-4 text-right">24h %</th>
                <th className="py-3 px-4 text-right">1W %</th>
                <th className="py-3 px-4 text-right">1M %</th>
                <th className="py-3 px-4 text-right">1Y %</th>
                <th className="py-3 px-4 text-right">Target Price</th>
                <th className="py-3 px-4 text-center">AI Signal</th>
                <th className="py-3 px-4">Copilot Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredItems.map((item) => {
                const is24hUp = item.change24h >= 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-4 px-4 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-500 border border-slate-700 font-bold">
                          {item.ticker}
                        </span>
                        <div>
                          <div className="font-sans font-semibold text-slate-200">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{item.sector}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-slate-100">
                      {formatCurrency(item.price)}
                    </td>

                    <td className={`py-4 px-4 text-right font-bold ${is24hUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatPercent(item.change24h)}
                    </td>

                    <td className="py-4 px-4 text-right text-emerald-400 font-bold">
                      +{item.change1w}%
                    </td>

                    <td className="py-4 px-4 text-right text-emerald-400 font-bold">
                      +{item.change1m}%
                    </td>

                    <td className="py-4 px-4 text-right text-emerald-400 font-bold">
                      +{item.change1y}%
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-slate-200">
                      {formatCurrency(item.targetPrice)}
                      <span className="block text-[10px] text-emerald-400 font-normal">
                        (+{(((item.targetPrice - item.price) / item.price) * 100).toFixed(1)}% Upside)
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <Badge variant={item.aiSignal.includes('Buy') ? 'green' : item.aiSignal === 'Accumulate' ? 'blue' : 'amber'}>
                        {item.aiSignal} ({item.aiConfidence}%)
                      </Badge>
                    </td>

                    <td className="py-4 px-4 text-slate-300 font-sans text-[11px] max-w-xs leading-normal">
                      {item.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Ticker Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Ticker to AI Watchlist Radar"
        subtitle="Ingest real-time pricing and enable multi-factor copilot signal alerts"
      >
        <form onSubmit={handleAddStock} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Stock Ticker Symbol *</label>
            <input
              type="text"
              required
              placeholder="e.g. SNOW, TSLA, AVGO"
              value={newTickerInput}
              onChange={(e) => setNewTickerInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono uppercase focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
            >
              Add to Watchlist
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

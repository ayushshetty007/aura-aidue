import React, { useState } from 'react';
import { MOCK_USER_PROFILE } from '@/lib/mockData';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/context/ThemeContext';
import { 
  Settings, 
  Cpu, 
  Bell, 
  Database, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Sparkles,
  Lock,
  Globe,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [model, setModel] = useState('Apex FinLLM v4.2 (Ultra Precision)');
  const [temperature, setTemperature] = useState('0.1');
  const [riskTolerance, setRiskTolerance] = useState('Moderate');
  const [vdrSync, setVdrSync] = useState(true);
  const [bloombergSync, setBloombergSync] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              System Settings & AI Preferences
            </h1>
            <Badge variant="green">Enterprise Active</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure financial copilot inference models, VDR data sync, risk parameters, and notifications.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {savedSuccess ? 'Saved Preferences!' : 'Save Settings'}
        </button>
      </div>

      {/* Theme & Appearance Settings Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            Appearance & Interface Theme
          </h3>
          <Badge variant={theme === 'light' ? 'amber' : 'blue'}>
            {theme === 'light' ? 'Light Theme Active' : 'Dark Theme Active'}
          </Badge>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Choose your preferred workspace visual theme for financial analysis and diligence review:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Light Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                theme === 'light'
                  ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-400'}`}>
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100 font-mono">Light Theme</div>
                    <div className="text-[11px] text-slate-400">High contrast & clean sunlight view</div>
                  </div>
                </div>
                {theme === 'light' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
              </div>
              <div className="w-full h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center px-3 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <div className="w-16 h-2 rounded bg-slate-300"></div>
                <div className="w-10 h-2 rounded bg-slate-400 ml-auto"></div>
              </div>
            </button>

            {/* Dark Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                theme === 'dark'
                  ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100 font-mono">Dark Theme</div>
                    <div className="text-[11px] text-slate-400">Low-glare institutional terminal</div>
                  </div>
                </div>
                {theme === 'dark' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
              </div>
              <div className="w-full h-8 rounded-lg bg-[#080c14] border border-slate-800 flex items-center px-3 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                <div className="w-16 h-2 rounded bg-slate-800"></div>
                <div className="w-10 h-2 rounded bg-slate-700 ml-auto"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Model & AI Settings Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-500" />
            AI Research Model
          </h3>
          <Badge variant="green">Active</Badge>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Model Selection</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option>Gemini 1.5 Pro (Recommended)</option>
              <option>Claude 3.5 Sonnet</option>
              <option>GPT-4o</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Used for answering questions against uploaded deal room documents and company 10-K filings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Temperature (Precision)</label>
              <input
                type="number"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Lower values (0.1) provide more factual, grounded answers.</p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Portfolio Risk Preference</label>
              <select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option>Conservative</option>
                <option>Moderate (Balanced)</option>
                <option>Growth & Venture</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            Data Feeds & Integrations
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Virtual Data Room (Intralinks / Datasite) Sync</div>
              <div className="text-[11px] text-slate-400">Auto-pull newly uploaded deal documents & CIM filings</div>
            </div>
            <input
              type="checkbox"
              checked={vdrSync}
              onChange={(e) => setVdrSync(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Bloomberg Terminal / FactSet API Connector</div>
              <div className="text-[11px] text-slate-400">Stream live market quotes, bond yields, and consensus estimates</div>
            </div>
            <input
              type="checkbox"
              checked={bloombergSync}
              onChange={(e) => setBloombergSync(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* User & Organization Details */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            Organization & Subscription
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Organization</div>
            <div className="font-bold text-slate-100 mt-0.5">{MOCK_USER_PROFILE.firm}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Tier</div>
            <div className="font-bold text-emerald-400 mt-0.5">{MOCK_USER_PROFILE.tier}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

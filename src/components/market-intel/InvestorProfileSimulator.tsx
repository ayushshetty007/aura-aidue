import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { 
  UserCheck, 
  Calculator, 
  TrendingUp, 
  ShieldAlert, 
  Target, 
  Clock, 
  IndianRupee, 
  Sparkles,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis 
} from 'recharts';

export const InvestorProfileSimulator: React.FC = () => {
  // Investor Profile State
  const [goal, setGoal] = useState<'Growth' | 'Preservation' | 'Income' | 'Balanced'>('Growth');
  const [horizon, setHorizon] = useState<'Short' | 'Medium' | 'Long'>('Long');
  const [riskTolerance, setRiskTolerance] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  const [portfolioAmount, setPortfolioAmount] = useState<number>(250000);

  // Scenario Simulator State
  const [initialInvest, setInitialInvest] = useState<number>(100000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(2000);
  const [years, setYears] = useState<number>(10);
  const [annualReturn, setAnnualReturn] = useState<number>(8.5);

  // Calculate Illustrative Allocation based on Profile
  const illustrativeAllocation = useMemo(() => {
    let equities = 60;
    let fixedIncome = 25;
    let commodities = 10;
    let cash = 5;

    if (riskTolerance === 'Aggressive') {
      equities = 75;
      fixedIncome = 10;
      commodities = 10;
      cash = 5;
    } else if (riskTolerance === 'Conservative') {
      equities = 30;
      fixedIncome = 50;
      commodities = 10;
      cash = 10;
    }

    if (goal === 'Preservation') {
      equities = Math.max(20, equities - 20);
      fixedIncome += 15;
      cash += 5;
    } else if (goal === 'Income') {
      fixedIncome += 15;
      equities -= 15;
    }

    return [
      { name: 'Equities & Tech', value: equities, color: '#10b981' },
      { name: 'Fixed Income & Bonds', value: fixedIncome, color: '#3b82f6' },
      { name: 'Gold & Real Assets', value: commodities, color: '#f59e0b' },
      { name: 'Cash & Short Yield', value: cash, color: '#64748b' },
    ];
  }, [goal, riskTolerance]);

  // Calculate Scenario Compound Growth Simulation Data
  const simulationData = useMemo(() => {
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = years * 12;

    const chart = [];
    let currentBalance = initialInvest;
    let totalInvested = initialInvest;

    for (let yr = 0; yr <= years; yr++) {
      if (yr === 0) {
        chart.push({
          year: `Yr 0`,
          contributions: Math.round(totalInvested),
          growth: 0,
          total: Math.round(currentBalance)
        });
      } else {
        for (let m = 0; m < 12; m++) {
          currentBalance = (currentBalance + monthlyContribution) * (1 + monthlyRate);
          totalInvested += monthlyContribution;
        }
        chart.push({
          year: `Yr ${yr}`,
          contributions: Math.round(totalInvested),
          growth: Math.round(Math.max(0, currentBalance - totalInvested)),
          total: Math.round(currentBalance)
        });
      }
    }
    return chart;
  }, [initialInvest, monthlyContribution, years, annualReturn]);

  const finalResult = simulationData[simulationData.length - 1];

  return (
    <div className="space-y-8">
      {/* 1. Investor Profile UI */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">Institutional Investor Profile</h2>
              <p className="text-xs text-slate-400">Configure mandate parameters to generate an illustrative allocation model</p>
            </div>
          </div>
          <Badge variant="amber" className="self-start md:self-auto font-mono text-[11px]">
            Illustrative allocation — not financial advice.
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Goal Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Primary Investment Goal
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'Growth', label: 'Capital Growth' },
                  { id: 'Balanced', label: 'Balanced' },
                  { id: 'Income', label: 'Income & Yield' },
                  { id: 'Preservation', label: 'Preservation' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id as 'Growth' | 'Preservation' | 'Income' | 'Balanced')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      goal === item.id
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Horizon */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Investment Horizon
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'Short', label: 'Short (1-3 Yrs)' },
                  { id: 'Medium', label: 'Medium (3-7 Yrs)' },
                  { id: 'Long', label: 'Long (7+ Yrs)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHorizon(item.id as 'Short' | 'Medium' | 'Long')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      horizon === item.id
                        ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Tolerance */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Risk Tolerance Level
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'Conservative', label: 'Conservative' },
                  { id: 'Moderate', label: 'Moderate' },
                  { id: 'Aggressive', label: 'Aggressive' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRiskTolerance(item.id as 'Conservative' | 'Moderate' | 'Aggressive')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      riskTolerance === item.id
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Portfolio Amount Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                Optional Target Capital Amount (₹)
              </label>
              <input
                type="number"
                value={portfolioAmount}
                onChange={(e) => setPortfolioAmount(Number(e.target.value))}
                className="w-full max-w-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Visualization Column */}
          <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5 text-emerald-400" />
                Illustrative Asset Mix
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Dynamic Model</span>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={illustrativeAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {illustrativeAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(val: any) => [`${val}%`, 'Allocation']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              {illustrativeAllocation.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </span>
                  <span className="font-bold">{item.value}% ({formatCurrency((portfolioAmount * item.value) / 100, 0)})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scenario Simulator UI */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">Investment Scenario Simulator</h2>
              <p className="text-xs text-slate-400">Model long-term compounding growth under customized contribution hypotheses</p>
            </div>
          </div>
          <Badge variant="amber" className="self-start md:self-auto font-mono text-[11px]">
            Illustrative scenario only — not a prediction or guaranteed return.
          </Badge>
        </div>

        {/* Inputs & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <label className="text-[11px] font-semibold text-slate-400 font-mono">Initial Capital (₹)</label>
            <input
              type="number"
              value={initialInvest}
              onChange={(e) => setInitialInvest(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <label className="text-[11px] font-semibold text-slate-400 font-mono">Monthly Deposit (₹)</label>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <label className="text-[11px] font-semibold text-slate-400 font-mono">Time Horizon (Years)</label>
            <input
              type="number"
              min={1}
              max={40}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <label className="text-[11px] font-semibold text-slate-400 font-mono">Est. Annual Return (%)</label>
            <input
              type="number"
              step="0.5"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Results Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Capital Contributed"
            value={formatCurrency(finalResult?.contributions || 0, 0)}
            subtitle={`Initial deposit + ${years * 12} monthly payments`}
            icon={IndianRupee}
          />
          <StatCard
            title="Illustrative Ending Value"
            value={formatCurrency(finalResult?.total || 0, 0)}
            change={((finalResult?.growth || 0) / (finalResult?.contributions || 1)) * 100}
            changePeriod="growth yield"
            subtitle="Projected compounding balance"
            icon={TrendingUp}
          />
          <StatCard
            title="Est. Investment Growth"
            value={formatCurrency(finalResult?.growth || 0, 0)}
            subtitle="Cumulative investment returns"
            icon={Sparkles}
          />
        </div>

        {/* Compound Growth Area Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              Compounding Trajectory Over {years} Years
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                Contributions
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Compound Growth
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any, name: any) => [
                    formatCurrency(Number(val), 0),
                    name === 'contributions' ? 'Contributions' : 'Compound Growth'
                  ]}
                />
                <Area type="monotone" dataKey="contributions" stackId="1" stroke="#64748b" fill="url(#colorContrib)" />
                <Area type="monotone" dataKey="growth" stackId="1" stroke="#10b981" fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

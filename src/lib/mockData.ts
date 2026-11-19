import { 
  MarketIndex, 
  AIInsight, 
  DueDiligenceProject, 
  Holding, 
  WatchlistItem, 
  ReportItem, 
  StockDetail, 
  ETFItem,
  SectorPerformance,
  WhatMovedToday,
  ExtendedStockDetail,
  GoldAnalysis,
  OpportunityCardItem,
  StockComparisonData,
  OpportunityRadarSignal,
  VDRDocument,
  DetailedRisk,
  DetailedOpportunity,
  CrossDocComparisonMetric,
  InvestmentAssessmentData
} from '@/types';

export const MOCK_PORTFOLIO_SUMMARY = {
  totalValue: 14852400,
  dailyChange: 218450,
  dailyChangePercent: 1.49,
  totalReturn: 3420800,
  totalReturnPercent: 29.92,
  buyingPower: 2450000,
  sharpeRatio: 2.18,
  sortinoRatio: 3.42,
  maxDrawdown: -6.4,
  beta: 1.08,
  var95: 184500, // Value at Risk 95% 1-day
  riskScore: 38, // 0-100 (Moderate Low)
};

export const MOCK_PORTFOLIO_HISTORY = [
  { date: 'Oct 01', portfolio: 14100000, benchmark: 14100000 },
  { date: 'Oct 02', portfolio: 14180000, benchmark: 14120000 },
  { date: 'Oct 03', portfolio: 14250000, benchmark: 14150000 },
  { date: 'Oct 04', portfolio: 14220000, benchmark: 14110000 },
  { date: 'Oct 05', portfolio: 14390000, benchmark: 14200000 },
  { date: 'Oct 06', portfolio: 14450000, benchmark: 14240000 },
  { date: 'Oct 07', portfolio: 14634000, benchmark: 14310000 },
  { date: 'Oct 08', portfolio: 14852400, benchmark: 14380000 },
];

export const MOCK_ASSET_ALLOCATION = [
  { name: 'US Tech Equities', value: 6850000, color: '#10b981', percent: 46.1 },
  { name: 'Global Semiconductor', value: 3200000, color: '#3b82f6', percent: 21.5 },
  { name: 'Healthcare & Biotech', value: 1850000, color: '#8b5cf6', percent: 12.5 },
  { name: 'Gold & Commodities', value: 1200000, color: '#f59e0b', percent: 8.1 },
  { name: 'Cash & Short Yield', value: 1752400, color: '#64748b', percent: 11.8 },
];

export const MOCK_MARKET_INDICES: MarketIndex[] = [
  {
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 (NSE India)',
    value: 24480.20,
    change: +138.50,
    changePercent: +0.57,
    category: 'index',
    chartData: [
      { time: '09:15', value: 24350 },
      { time: '11:30', value: 24410 },
      { time: '13:30', value: 24440 },
      { time: '14:30', value: 24465 },
      { time: '15:30', value: 24480.2 },
    ]
  },
  {
    symbol: 'SENSEX',
    name: 'BSE SENSEX 30',
    value: 80365.10,
    change: +452.80,
    changePercent: +0.56,
    category: 'index',
    chartData: [
      { time: '09:15', value: 79950 },
      { time: '11:30', value: 80120 },
      { time: '13:30', value: 80240 },
      { time: '14:30', value: 80310 },
      { time: '15:30', value: 80365.1 },
    ]
  },
  {
    symbol: 'S&P 500',
    name: 'S&P 500 Index',
    value: 5782.40,
    change: +42.15,
    changePercent: +0.73,
    category: 'index',
    chartData: [
      { time: '09:30', value: 5740 },
      { time: '11:00', value: 5755 },
      { time: '13:00', value: 5762 },
      { time: '15:00', value: 5778 },
      { time: '16:00', value: 5782.4 },
    ]
  },
  {
    symbol: 'NASDAQ',
    name: 'Nasdaq Composite',
    value: 18290.10,
    change: +214.30,
    changePercent: +1.18,
    category: 'index',
    chartData: [
      { time: '09:30', value: 18075 },
      { time: '11:00', value: 18120 },
      { time: '13:00', value: 18200 },
      { time: '15:00', value: 18270 },
      { time: '16:00', value: 18290.1 },
    ]
  },
  {
    symbol: 'GOLD',
    name: 'Gold Spot / USD',
    value: 2658.90,
    change: +18.40,
    changePercent: +0.70,
    category: 'commodity',
    chartData: [
      { time: '09:30', value: 2640 },
      { time: '11:00', value: 2648 },
      { time: '13:00', value: 2652 },
      { time: '15:00', value: 2656 },
      { time: '16:00', value: 2658.9 },
    ]
  },
  {
    symbol: 'US10Y',
    name: 'US 10-Year Treasury Yield',
    value: 4.02,
    change: -0.05,
    changePercent: -1.23,
    category: 'yield',
    chartData: [
      { time: '09:30', value: 4.07 },
      { time: '11:00', value: 4.05 },
      { time: '13:00', value: 4.04 },
      { time: '15:00', value: 4.03 },
      { time: '16:00', value: 4.02 },
    ]
  },
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin Spot',
    value: 64250.00,
    change: +1450.00,
    changePercent: +2.31,
    category: 'crypto',
    chartData: [
      { time: '09:30', value: 62800 },
      { time: '11:00', value: 63100 },
      { time: '13:00', value: 63800 },
      { time: '15:00', value: 64100 },
      { time: '16:00', value: 64250 },
    ]
  }
];

export const MOCK_AI_INSIGHTS: AIInsight[] = [
  {
    id: 'ins-tata',
    type: 'opportunity',
    title: 'Tata Electronics Semiconductor Fab Subsidy Clearance',
    description: 'India Semiconductor Mission (ISM) approved 50% capital support for Dholera facility. Tata Electronics advances commercial wafer packaging pilot ahead of schedule.',
    ticker: 'TATASEMI',
    company: 'Tata Electronics & Semi',
    impactScore: 92,
    sentiment: 'bullish',
    timestamp: '25 min ago',
    actionRequired: 'Review Project Surya deal room documents in Due Diligence tab'
  },
  {
    id: 'ins-1',
    type: 'opportunity',
    title: 'Hyperscale AI Infrastructure Expansion Signal',
    description: '10-Q disclosures across Microsoft and Meta indicate a +34% YoY surge in custom ASIC procurement. Supply chain data favors TSMC & ASML margin expansion.',
    ticker: 'TSM',
    company: 'Taiwan Semiconductor Manufacturing',
    impactScore: 94,
    sentiment: 'bullish',
    timestamp: '14 min ago',
    actionRequired: 'Review allocation target in Semiconductor strategy (+2.5% recommended)'
  },
  {
    id: 'ins-2',
    type: 'risk',
    title: 'Customer Concentration Exposure in SaaS Target',
    description: 'AI document parse of CloudScale Systems CIM revealed Top 3 enterprise clients account for 48.2% of ARR, creating heightened churn sensitivity ahead of renewal cycles.',
    ticker: 'CSCL',
    company: 'CloudScale Systems Inc.',
    impactScore: 82,
    sentiment: 'bearish',
    timestamp: '1 hour ago',
    actionRequired: 'Update LBO downside scenario model with 15% revenue haircut'
  },
  {
    id: 'ins-3',
    type: 'earnings',
    title: 'Eli Lilly GLP-1 Supply Constraint Resolution',
    description: 'FDA database update confirms manufacturing line clearance for high-dose auto-injectors. Projected 18% upside to Q4 guidance consensus.',
    ticker: 'LLY',
    company: 'Eli Lilly & Co.',
    impactScore: 88,
    sentiment: 'bullish',
    timestamp: '3 hours ago',
    actionRequired: 'Add call spread or maintain overweight position'
  },
  {
    id: 'ins-4',
    type: 'macro',
    title: 'Fed Rate Cut Expectations & Gold Breakout Correlation',
    description: '2Y real yield drop below 1.45% historically coincides with 4.8% gold price expansion over 30 days. Commodity sleeve position hedged.',
    ticker: 'GOLD',
    impactScore: 76,
    sentiment: 'bullish',
    timestamp: '5 hours ago'
  }
];

export const MOCK_DUE_DILIGENCE_PROJECTS: DueDiligenceProject[] = [
  {
    id: 'dd-105',
    name: 'Project Surya - Tata Semiconductor',
    ticker: 'TATASEMI',
    sector: 'Semiconductors & AI Hardware',
    stage: 'Deep Dive',
    status: 'High Conviction',
    targetIrr: 31.5,
    dealSize: 8500000000,
    ebitdaMultiple: 15.8,
    score: 93,
    updatedAt: '20 min ago',
    analyst: 'Devika Sharma',
    executiveSummary: 'Private co-investment into Tata Electronics commercial silicon OSAT packaging and Dholera fab line expansion with guaranteed anchor off-take from automotive EV & telecom partners.',
    documentsCount: 9,
    risks: [
      { category: 'Capex Execution', description: 'Cleanroom fab commissioning timelines tied to specialized ASML/Applied Materials tool shipments.', severity: 'Medium' },
      { category: 'Talent Acquisition', description: 'Competitive recruitment market for specialized wafer packaging engineers.', severity: 'Low' },
      { category: 'Utility Redundancy', description: 'Guaranteed 24/7 dedicated green grid power connection via state power purchase agreement.', severity: 'Low' }
    ],
    opportunities: [
      { category: 'India Semiconductor Mission (ISM)', description: 'Eligible for 50% central and state capital expenditure fiscal incentives.', impact: 'High' },
      { category: 'Global Supply Reshoring', description: 'Multinational automotive OEMs securing non-Taiwan supply lines for mission-critical microcontrollers.', impact: 'High' },
      { category: 'Tata Ecosystem Synergies', description: 'Captive internal volume commitments from Tata Motors EV line and Tejas Networks 5G radio heads.', impact: 'High' }
    ],
    financialHighlights: {
      revenue: 6800000000,
      revenueGrowth: 52.4,
      ebitdaMargin: 38.5,
      netDebtToEbitda: 1.4,
      freeCashFlow: 1450000000
    }
  },
  {
    id: 'dd-101',
    name: 'Project Valkyrie - CloudScale Systems',
    ticker: 'CSCL',
    sector: 'Enterprise Software / Infrastructure',
    stage: 'Deep Dive',
    status: 'High Conviction',
    targetIrr: 28.5,
    dealSize: 450000000,
    ebitdaMultiple: 18.2,
    score: 89,
    updatedAt: '2 hours ago',
    analyst: 'Sarah Jenkins, CFA',
    executiveSummary: 'CloudScale Systems is a leading provider of multi-cloud Kubernetes optimization software. Strong net retention (124%) driven by enterprise AI workloads with high gross margins (78%).',
    documentsCount: 14,
    risks: [
      { category: 'Customer Concentration', description: 'Top 3 clients generate 48% of total ARR', severity: 'High' },
      { category: 'Key Person Risk', description: 'Founder CTO retains core patent rights in separate entity', severity: 'Medium' },
      { category: 'Valuation Premium', description: 'Entry multiple at 18.2x EBITDA is 1.5x above peer group average', severity: 'Medium' }
    ],
    opportunities: [
      { category: 'Cross-Sell Potential', description: 'Immediate integration opportunity into Portfolio Co #4 sales channel', impact: 'High' },
      { category: 'Pricing Optimization', description: 'Legacy tier pricing is 30% below market comp benchmarks', impact: 'High' },
      { category: 'International Expansion', description: 'EU enterprise demand remains completely untapped', impact: 'Medium' }
    ],
    financialHighlights: {
      revenue: 142000000,
      revenueGrowth: 36.4,
      ebitdaMargin: 24.8,
      netDebtToEbitda: 1.8,
      freeCashFlow: 31200000
    }
  },
  {
    id: 'dd-102',
    name: 'Project Apex - CyberTech Security',
    ticker: 'APXC',
    sector: 'Cybersecurity & Zero Trust',
    stage: 'IC Ready',
    status: 'High Conviction',
    targetIrr: 32.0,
    dealSize: 820000000,
    ebitdaMultiple: 21.5,
    score: 93,
    updatedAt: 'Yesterday',
    analyst: 'Rohan Mehta',
    executiveSummary: 'Next-Gen Endpoint Detection platform with proprietary AI telemetry. Growing 52% YoY with zero leverage on balance sheet.',
    documentsCount: 22,
    risks: [
      { category: 'Regulatory Compliance', description: 'Pending EU AI Act compliance verification', severity: 'Medium' },
      { category: 'Sales Cycle', description: 'Enterprise deal cycle extended from 60 to 90 days in Q3', severity: 'Low' }
    ],
    opportunities: [
      { category: 'Federal Contracts', description: 'Secured FedRAMP High certification last month', impact: 'High' },
      { category: 'M&A Add-on Target', description: 'Identified 2 bolt-on security startups for inorganic roll-up', impact: 'High' }
    ],
    financialHighlights: {
      revenue: 215000000,
      revenueGrowth: 52.1,
      ebitdaMargin: 29.2,
      netDebtToEbitda: 0.2,
      freeCashFlow: 58000000
    }
  },
  {
    id: 'dd-103',
    name: 'Project BioPulse - BioHealth Dynamics',
    ticker: 'BHMD',
    sector: 'Biotech & Medical Devices',
    stage: 'Initial Review',
    status: 'Flagged Risk',
    targetIrr: 19.2,
    dealSize: 180000000,
    ebitdaMultiple: 14.0,
    score: 64,
    updatedAt: '3 days ago',
    analyst: 'Elena Rostova',
    executiveSummary: 'Cardiovascular device innovator with Phase III clinical trial underway. Patent portfolio challenged by incumbent patent troll litigation.',
    documentsCount: 9,
    risks: [
      { category: 'Litigation Exposure', description: 'IP infringement suit filed by MedTech Corp seeking injunction', severity: 'High' },
      { category: 'Clinical Trial Delay', description: 'Patient recruitment pacing 4 months behind schedule', severity: 'High' }
    ],
    opportunities: [
      { category: 'First-in-Class Approval', description: 'Fast-track FDA designation received', impact: 'High' }
    ],
    financialHighlights: {
      revenue: 48000000,
      revenueGrowth: 18.0,
      ebitdaMargin: 12.5,
      netDebtToEbitda: 3.4,
      freeCashFlow: -4500000
    }
  },
  {
    id: 'dd-104',
    name: 'Project Helios - Clean Grid Energy',
    ticker: 'HGLD',
    sector: 'Renewables & Infrastructure',
    stage: 'Sourcing',
    status: 'Under Review',
    targetIrr: 22.1,
    dealSize: 600000000,
    ebitdaMultiple: 12.8,
    score: 77,
    updatedAt: '5 days ago',
    analyst: 'David Kim',
    executiveSummary: 'Battery storage asset owner with 1.4GW operational capacity across CAISO and ERCOT grids with long-term PPA contracts.',
    documentsCount: 6,
    risks: [
      { category: 'Grid Interconnection', description: 'Transmission bottlenecks in ERCOT West circuit', severity: 'Medium' }
    ],
    opportunities: [
      { category: 'Tax Credit Monetization', description: 'Eligible for 40% IRA tax credits on upcoming project expansion', impact: 'High' }
    ],
    financialHighlights: {
      revenue: 190000000,
      revenueGrowth: 22.4,
      ebitdaMargin: 54.0,
      netDebtToEbitda: 4.2,
      freeCashFlow: 42000000
    }
  }
];

export const MOCK_HOLDINGS: Holding[] = [
  {
    id: 'h-tcs',
    ticker: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'IT & Cloud Services',
    shares: 850,
    avgCost: 3650.00,
    currentPrice: 4120.50,
    value: 3502425,
    unrealizedGain: 400425,
    unrealizedGainPercent: 12.89,
    weight: 23.5,
    aiHealthRating: 'A+',
    aiSentiment: 'Strong Bullish'
  },
  {
    id: 'h-rel',
    ticker: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    sector: 'Telecom & Energy',
    shares: 1100,
    avgCost: 2680.00,
    currentPrice: 2980.40,
    value: 3278440,
    unrealizedGain: 330440,
    unrealizedGainPercent: 11.21,
    weight: 22.1,
    aiHealthRating: 'A',
    aiSentiment: 'Bullish'
  },
  {
    id: 'h-hdfc',
    ticker: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    sector: 'Banking & Financials',
    shares: 1850,
    avgCost: 1520.00,
    currentPrice: 1685.20,
    value: 3117620,
    unrealizedGain: 305620,
    unrealizedGainPercent: 10.87,
    weight: 21.0,
    aiHealthRating: 'A',
    aiSentiment: 'Bullish'
  },
  {
    id: 'h-tatamotors',
    ticker: 'TATAMOTORS',
    name: 'Tata Motors Limited',
    sector: 'Automotive & EV',
    shares: 2200,
    avgCost: 780.00,
    currentPrice: 978.60,
    value: 2152920,
    unrealizedGain: 436920,
    unrealizedGainPercent: 25.46,
    weight: 14.5,
    aiHealthRating: 'A+',
    aiSentiment: 'Strong Bullish'
  },
  {
    id: 'h-maruti',
    ticker: 'MARUTI',
    name: 'Maruti Suzuki India Ltd',
    sector: 'Automotive & Mobility',
    shares: 250,
    avgCost: 10400.00,
    currentPrice: 12480.00,
    value: 3120000,
    unrealizedGain: 520000,
    unrealizedGainPercent: 20.00,
    weight: 20.8,
    aiHealthRating: 'A+',
    aiSentiment: 'Bullish'
  },
  {
    id: 'h-1',
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Semiconductors',
    shares: 24500,
    avgCost: 88.50,
    currentPrice: 132.80,
    value: 3253600,
    unrealizedGain: 1085350,
    unrealizedGainPercent: 50.05,
    weight: 21.9,
    aiHealthRating: 'A+',
    aiSentiment: 'Strong Bullish'
  },
  {
    id: 'h-2',
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Enterprise Software',
    shares: 7200,
    avgCost: 380.10,
    currentPrice: 428.50,
    value: 3085200,
    unrealizedGain: 348480,
    unrealizedGainPercent: 12.73,
    weight: 20.8,
    aiHealthRating: 'A+',
    aiSentiment: 'Bullish'
  },
  {
    id: 'h-3',
    ticker: 'TSM',
    name: 'Taiwan Semiconductor Mfg.',
    sector: 'Semiconductors',
    shares: 16800,
    avgCost: 142.00,
    currentPrice: 186.40,
    value: 3131520,
    unrealizedGain: 745920,
    unrealizedGainPercent: 31.27,
    weight: 21.1,
    aiHealthRating: 'A',
    aiSentiment: 'Strong Bullish'
  },
  {
    id: 'h-4',
    ticker: 'LLY',
    name: 'Eli Lilly and Company',
    sector: 'Pharmaceuticals',
    shares: 2100,
    avgCost: 710.00,
    currentPrice: 890.20,
    value: 1869420,
    unrealizedGain: 378420,
    unrealizedGainPercent: 25.38,
    weight: 12.6,
    aiHealthRating: 'A',
    aiSentiment: 'Bullish'
  },
  {
    id: 'h-5',
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'E-Commerce & Cloud',
    shares: 9400,
    avgCost: 164.20,
    currentPrice: 188.70,
    value: 1773780,
    unrealizedGain: 230300,
    unrealizedGainPercent: 14.92,
    weight: 11.9,
    aiHealthRating: 'A',
    aiSentiment: 'Bullish'
  },
  {
    id: 'h-6',
    ticker: 'GLD',
    name: 'SPDR Gold Shares',
    sector: 'Commodities',
    shares: 7200,
    avgCost: 215.00,
    currentPrice: 245.70,
    value: 1738880,
    unrealizedGain: 221040,
    unrealizedGainPercent: 14.28,
    weight: 11.7,
    aiHealthRating: 'B',
    aiSentiment: 'Neutral'
  }
];

export const MOCK_WATCHLIST: WatchlistItem[] = [
  {
    id: 'w-tcs',
    ticker: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'Information Technology',
    price: 4120.50,
    change24h: 1.45,
    change1w: 3.2,
    change1m: 8.6,
    change1y: 24.8,
    volume: '2.8M',
    marketCap: '₹15.1 Trillion',
    peRatio: 30.2,
    targetPrice: 4600.00,
    aiSignal: 'Strong Buy',
    aiConfidence: 94,
    notes: 'Large enterprise AI deals & cloud transformation wins driving margin expansion.'
  },
  {
    id: 'w-rel',
    ticker: 'RELIANCE',
    name: 'Reliance Industries',
    sector: 'Telecom & Energy',
    price: 2980.40,
    change24h: 2.10,
    change1w: 4.8,
    change1m: 11.4,
    change1y: 32.1,
    volume: '6.4M',
    marketCap: '₹20.2 Trillion',
    peRatio: 27.5,
    targetPrice: 3350.00,
    aiSignal: 'Accumulate',
    aiConfidence: 89,
    notes: 'Jio 5G monetisation and retail revenue compounding at 20%+ YoY.'
  },
  {
    id: 'w-hdfc',
    ticker: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    sector: 'Banking & Financials',
    price: 1685.20,
    change24h: 1.25,
    change1w: 2.8,
    change1m: 5.4,
    change1y: 18.2,
    volume: '14.2M',
    marketCap: '₹12.8 Trillion',
    peRatio: 19.4,
    targetPrice: 1950.00,
    aiSignal: 'Strong Buy',
    aiConfidence: 92,
    notes: 'Post-merger loan deposit ratio normalizing with steady net interest margins.'
  },
  {
    id: 'w-tm',
    ticker: 'TATAMOTORS',
    name: 'Tata Motors Limited',
    sector: 'Automotive & EV',
    price: 978.60,
    change24h: 1.80,
    change1w: 2.9,
    change1m: 6.8,
    change1y: 52.4,
    volume: '8.2M',
    marketCap: '₹3.62 Trillion',
    peRatio: 16.8,
    targetPrice: 1150.00,
    aiSignal: 'Accumulate',
    aiConfidence: 86,
    notes: 'Dominant 70%+ Indian EV market share and robust free cash flow at JLR.'
  },
  {
    id: 'w-maruti',
    ticker: 'MARUTI',
    name: 'Maruti Suzuki India Limited',
    sector: 'Automotive & Mobility',
    price: 12480.00,
    change24h: 2.35,
    change1w: 4.1,
    change1m: 8.9,
    change1y: 28.6,
    volume: '1.2M',
    marketCap: '₹3.92 Trillion',
    peRatio: 28.1,
    targetPrice: 14200.00,
    aiSignal: 'Strong Buy',
    aiConfidence: 91,
    notes: 'Record annual PAT of ₹13,955 Cr; high-margin SUV leadership (Grand Vitara, Brezza) & ₹50K+ Cr cash reserves.'
  },
  {
    id: 'w-zom',
    ticker: 'ZOMATO',
    name: 'Zomato Limited',
    sector: 'Consumer Internet / Quick Comm',
    price: 268.40,
    change24h: 3.85,
    change1w: 7.2,
    change1m: 21.4,
    change1y: 118.5,
    volume: '24.1M',
    marketCap: '₹2.36 Trillion',
    peRatio: 74.2,
    targetPrice: 310.00,
    aiSignal: 'Strong Buy',
    aiConfidence: 88,
    notes: 'Blinkit dark store network turnaround ahead of guidance.'
  },
  {
    id: 'w-1',
    ticker: 'PLTR',
    name: 'Palantir Technologies',
    sector: 'AI & Analytics',
    price: 43.80,
    change24h: 3.25,
    change1w: 8.4,
    change1m: 24.1,
    change1y: 142.5,
    volume: '54.2M',
    marketCap: '₹98.2B',
    peRatio: 112.4,
    targetPrice: 52.00,
    aiSignal: 'Strong Buy',
    aiConfidence: 91,
    notes: 'AIP bootcamps converting enterprise pipeline at 3x historic velocity.'
  },
  {
    id: 'w-2',
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    sector: 'Semiconductors',
    price: 168.40,
    change24h: -1.15,
    change1w: 2.1,
    change1m: 9.8,
    change1y: 48.2,
    volume: '38.6M',
    marketCap: '₹272.5B',
    peRatio: 48.6,
    targetPrice: 205.00,
    aiSignal: 'Accumulate',
    aiConfidence: 84,
    notes: 'MI300X adoption accelerating in tier-2 hyperscalers; valuation gap vs NVDA.'
  },
  {
    id: 'w-3',
    ticker: 'CRWD',
    name: 'CrowdStrike Holdings',
    sector: 'Cybersecurity',
    price: 304.20,
    change24h: 2.45,
    change1w: 4.8,
    change1m: 18.2,
    change1y: 62.8,
    volume: '12.4M',
    marketCap: '₹74.1B',
    peRatio: 78.3,
    targetPrice: 340.00,
    aiSignal: 'Hold',
    aiConfidence: 72,
    notes: 'Post-outage customer retention stabilized. Discount fully absorbed.'
  },
  {
    id: 'w-4',
    ticker: 'ARM',
    name: 'Arm Holdings plc',
    sector: 'IP / Semiconductor',
    price: 142.10,
    change24h: 4.12,
    change1w: 11.2,
    change1m: 15.6,
    change1y: 110.4,
    volume: '18.9M',
    marketCap: '₹146.8B',
    peRatio: 96.0,
    targetPrice: 165.00,
    aiSignal: 'Strong Buy',
    aiConfidence: 89,
    notes: 'v9 architecture royalty rates 2x v8. Windows on Arm gaining market share.'
  },
  {
    id: 'w-5',
    ticker: 'PANW',
    name: 'Palo Alto Networks',
    sector: 'Cybersecurity',
    price: 358.90,
    change24h: -0.82,
    change1w: 1.4,
    change1m: 6.2,
    change1y: 38.4,
    volume: '7.8M',
    marketCap: '₹116.3B',
    peRatio: 54.1,
    targetPrice: 385.00,
    aiSignal: 'Accumulate',
    aiConfidence: 81,
    notes: 'Platformization strategy yielding higher ARR per client account.'
  },
  {
    id: 'w-6',
    ticker: 'SPOT',
    name: 'Spotify Technology',
    sector: 'Digital Media',
    price: 374.50,
    change24h: 1.84,
    change1w: 5.6,
    change1m: 12.9,
    change1y: 128.6,
    volume: '4.2M',
    marketCap: '₹75.4B',
    peRatio: 62.5,
    targetPrice: 420.00,
    aiSignal: 'Hold',
    aiConfidence: 68,
    notes: 'Margin expansion operating leverage playing out. Free cash flow generation peak.'
  }
];

export const MOCK_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    title: 'Investment Committee Memo: Project Apex (CyberTech)',
    type: 'IC Memo',
    ticker: 'APXC',
    company: 'CyberTech Security Inc.',
    author: 'Rohan Mehta',
    date: 'Oct 07, 2026',
    readTime: '12 min read',
    status: 'Final',
    verdict: 'Recommend Investment',
    summary: 'Comprehensive analysis recommending ₹85M Series C equity investment at ₹820M valuation. AI telemetry moat provides durable 40%+ revenue growth CAGR through 2029.',
    keyTakeaways: [
      'Strong rule-of-40 performance score: 81.3%',
      'Net Retention Rate at 138% across Fortune 500 customers',
      'LBO model projects 3.2x MOIC and 32.0% gross IRR over 4-year hold',
      'Primary downside risk: EU AI Act regulatory approval delay'
    ]
  },
  {
    id: 'rep-2',
    title: 'Q3 Semiconductor Sector Sentiment & Supply Chain Audit',
    type: 'Sector Deep Dive',
    ticker: 'TSM / ASML',
    author: 'Quantitative AI Engine',
    date: 'Oct 05, 2026',
    readTime: '18 min read',
    status: 'Final',
    verdict: 'Recommend Investment',
    summary: 'Deep-dive scan of 4,000+ SEC filings, earnings transcripts, and bill-of-materials manifests showing high utilization rates across 3nm sub-nodes.',
    keyTakeaways: [
      'High-bandwidth memory (HBM3e) capacity sold out through Q3 2027',
      'ASML EUV lithography order backlog up +24% QoQ',
      'Taiwan geopolitical risk priced with 14% valuation discount relative to US comps'
    ]
  },
  {
    id: 'rep-3',
    title: 'Risk Tear Sheet: Project BioPulse (BioHealth Dynamics)',
    type: 'ESG Due Diligence',
    ticker: 'BHMD',
    company: 'BioHealth Dynamics',
    author: 'Elena Rostova',
    date: 'Oct 03, 2026',
    readTime: '8 min read',
    status: 'Needs Approval',
    verdict: 'Pass - High Risk',
    summary: 'Automated patent landscape scan flagged pending IP infringement litigation from MedTech Corp. Potential injunction could freeze revenue for 18 months.',
    keyTakeaways: [
      'Legal threat probability estimated at 64% by AI Legal Parser',
      'Cash runway limited to 11 months under current burn rate',
      'Recommend deferring term sheet until patent validity hearing'
    ]
  },
  {
    id: 'rep-4',
    title: 'LBO Model Feasibility: CloudScale Systems',
    type: 'LBO Model Summary',
    ticker: 'CSCL',
    company: 'CloudScale Systems',
    author: 'Sarah Jenkins, CFA',
    date: 'Sep 29, 2026',
    readTime: '15 min read',
    status: 'Draft',
    verdict: 'Hold for Better Entry',
    summary: 'Leveraged buyout simulation under 4.5x Senior Debt / 2.0x Mezzanine structure. Target IRR of 28.5% contingent on expanding EBITDA margin from 24.8% to 32.0%.',
    keyTakeaways: [
      'Base case return: 2.6x MOIC / 24.2% IRR',
      'Upside case with pricing optimization: 3.4x MOIC / 31.8% IRR',
      'Sensitivity analysis requires entry multiple reduction from 18.2x to 16.5x'
    ]
  }
];

export const MOCK_STOCK_DETAIL: StockDetail = {
  ticker: 'NVDA',
  name: 'NVIDIA Corporation',
  price: 132.80,
  change: 4.10,
  changePercent: 3.18,
  marketCap: '₹3.26 Trillion',
  peRatio: 44.2,
  pbRatio: 28.6,
  dividendYield: 0.03,
  week52High: 140.76,
  week52Low: 75.60,
  description: 'NVIDIA Corporation designs graphics processing units (GPUs) for the gaming and professional markets, as well as system on a chip units (SoCs) for the mobile computing and automotive market.',
  chartData: [
    { time: 'May', price: 92.0, volume: 45, ma20: 88.0 },
    { time: 'Jun', price: 108.5, volume: 52, ma20: 94.2 },
    { time: 'Jul', price: 124.0, volume: 68, ma20: 104.5 },
    { time: 'Aug', price: 118.2, volume: 41, ma20: 112.0 },
    { time: 'Sep', price: 126.4, volume: 49, ma20: 119.8 },
    { time: 'Oct', price: 132.8, volume: 61, ma20: 125.4 },
  ],
  aiAnalysis: {
    growthScore: 98,
    valueScore: 54,
    momentumScore: 92,
    qualityScore: 96,
    summary: 'Exceptional AI infrastructure demand driver. Gross margins remaining elevated at 75%+ due to CUDA software ecosystem lock-in and Blackwell architectural leadership.'
  }
};

export const MOCK_ETFS: ETFItem[] = [
  {
    symbol: 'SMH',
    name: 'VanEck Semiconductor ETF',
    category: 'Semiconductors',
    price: 254.20,
    change1y: 64.2,
    aum: '₹24.8B',
    expenseRatio: 0.35,
    aiThesis: 'Direct exposure to hardware bottleneck layer of the AI tech stack.'
  },
  {
    symbol: 'IGV',
    name: 'iShares Expanded Tech-Software ETF',
    category: 'Enterprise Software',
    price: 92.40,
    change1y: 28.4,
    aum: '₹6.2B',
    expenseRatio: 0.41,
    aiThesis: 'Catch-up play as SaaS platforms monetize embedded AI copilots.'
  },
  {
    symbol: 'BUG',
    name: 'Global X Cybersecurity ETF',
    category: 'Cybersecurity',
    price: 32.10,
    change1y: 22.8,
    aum: '₹1.4B',
    expenseRatio: 0.50,
    aiThesis: 'Resilient essential IT spending driver amidst expanding threat surfaces.'
  }
];

export const MOCK_USER_PROFILE = {
  name: 'Rohan Mehta',
  role: 'Managing Director & Partner',
  firm: 'Apex Capital Partners',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  tier: 'Enterprise Suite',
  apiUsage: { queriesThisMonth: 1420, maxQueries: 5000 }
};

export const MOCK_SECTOR_PERFORMANCE: SectorPerformance[] = [
  { name: 'Semiconductors', change1d: 2.42, change1m: 9.1, sentiment: 'Bullish', topDriver: 'Blackwell & HBM3e Wafer Orders' },
  { name: 'Technology', change1d: 1.85, change1m: 6.4, sentiment: 'Bullish', topDriver: 'Hyperscale AI Capex Expansion' },
  { name: 'Consumer Disc.', change1d: 0.91, change1m: 4.2, sentiment: 'Bullish', topDriver: 'Resilient Digital Retail & Cloud' },
  { name: 'Healthcare', change1d: 0.65, change1m: 2.8, sentiment: 'Bullish', topDriver: 'GLP-1 Supply Chain Clearance' },
  { name: 'Financials', change1d: 0.32, change1m: 1.5, sentiment: 'Neutral', topDriver: 'Yield Curve Normalization' },
  { name: 'Energy', change1d: -1.24, change1m: -3.1, sentiment: 'Bearish', topDriver: 'Global Inventory Build' },
];

export const MOCK_WHAT_MOVED_TODAY: WhatMovedToday[] = [
  {
    id: 'wm-1',
    category: 'Tech Rally',
    title: 'Hyperscale AI Capex Guidance Revision',
    explanation: '10-Q SEC disclosures confirmed cloud giants increased CY27 infrastructure capex by +34%. NVDA, TSM, and ASML gained 2.4-3.8%.',
    impactedAssets: ['NVDA', 'TSM', 'ASML', 'MSFT'],
    sentiment: 'positive'
  },
  {
    id: 'wm-2',
    category: 'Macro Shift',
    title: 'Fed Rate Cut Real-Yield Compression',
    explanation: 'US 10Y Treasury yield dropped 5 bps to 4.02%, easing monetary tightness and fueling capital inflows into growth equities & gold.',
    impactedAssets: ['US10Y', 'GLD', 'QQQ'],
    sentiment: 'positive'
  },
  {
    id: 'wm-3',
    category: 'Commodity Spike',
    title: 'Gold Spot Climbs to ₹2,658/oz',
    explanation: 'Sustained central bank reserve accumulation and falling real rates propelled gold spot to fresh historical resistance highs.',
    impactedAssets: ['GOLD', 'GLD', 'NEM'],
    sentiment: 'positive'
  },
  {
    id: 'wm-4',
    category: 'Earnings Move',
    title: 'Cybersecurity Enterprise Net Retention Beat',
    explanation: 'Quarterly channel checks indicate zero-trust platform consolidation is accelerating enterprise deal closures despite extended procurement cycles.',
    impactedAssets: ['CRWD', 'PANW', 'FTNT'],
    sentiment: 'neutral'
  }
];

export const MOCK_EXTENDED_STOCKS: Record<string, ExtendedStockDetail> = {
  NVDA: {
    ...MOCK_STOCK_DETAIL,
    performance: {
      '1D': 3.18,
      '1W': 5.40,
      '1M': 12.80,
      '6M': 42.10,
      '1Y': 134.50,
      '5Y': 1280.00
    },
    benchmarkComparison1Y: 21.4, // S&P 500 returned 21.4% vs NVDA 134.5%
    strengths: [
      'CUDA ecosystem lock-in creates formidable software moat',
      'Blackwell B200 architecture pre-sold through Q3 2027',
      'Gross margins sustained at 75%+ due to pricing power'
    ],
    risks: [
      'Export restriction policy tightening to tier-2 Asian markets',
      'Customer concentration in top 4 hyperscalers (42% ARR)',
      'Potential supply bottlenecks in CoWoS packaging capacity'
    ],
    factorsToMonitor: [
      'TSMC 3nm & 4nm wafer allocation volumes',
      'Custom ASIC competition from internal cloud projects (Trainium, Maia)',
      'Quarterly gross margin trajectory post-Blackwell ramp'
    ],
    timeframeChartData: {
      '1D': [
        { time: '09:30', price: 128.8, benchmarkPrice: 574.0 },
        { time: '11:00', price: 130.2, benchmarkPrice: 575.5 },
        { time: '13:00', price: 131.5, benchmarkPrice: 576.2 },
        { time: '15:00', price: 132.1, benchmarkPrice: 577.8 },
        { time: '16:00', price: 132.8, benchmarkPrice: 578.2 }
      ],
      '1W': [
        { time: 'Mon', price: 126.0, benchmarkPrice: 570.0 },
        { time: 'Tue', price: 127.4, benchmarkPrice: 572.1 },
        { time: 'Wed', price: 129.1, benchmarkPrice: 574.5 },
        { time: 'Thu', price: 131.0, benchmarkPrice: 576.8 },
        { time: 'Fri', price: 132.8, benchmarkPrice: 578.2 }
      ],
      '1M': [
        { time: 'W1', price: 118.0, benchmarkPrice: 558.0 },
        { time: 'W2', price: 122.5, benchmarkPrice: 564.2 },
        { time: 'W3', price: 126.8, benchmarkPrice: 571.0 },
        { time: 'W4', price: 132.8, benchmarkPrice: 578.2 }
      ],
      '6M': [
        { time: 'May', price: 92.0, benchmarkPrice: 510.0 },
        { time: 'Jun', price: 108.5, benchmarkPrice: 532.0 },
        { time: 'Jul', price: 124.0, benchmarkPrice: 548.0 },
        { time: 'Aug', price: 118.2, benchmarkPrice: 552.0 },
        { time: 'Sep', price: 126.4, benchmarkPrice: 566.0 },
        { time: 'Oct', price: 132.8, benchmarkPrice: 578.2 }
      ],
      '1Y': [
        { time: 'Q4 25', price: 56.5, benchmarkPrice: 476.0 },
        { time: 'Q1 26', price: 78.2, benchmarkPrice: 502.0 },
        { time: 'Q2 26', price: 102.4, benchmarkPrice: 538.0 },
        { time: 'Q3 26', price: 121.0, benchmarkPrice: 562.0 },
        { time: 'Q4 26', price: 132.8, benchmarkPrice: 578.2 }
      ],
      '5Y': [
        { time: '2022', price: 14.5, benchmarkPrice: 380.0 },
        { time: '2023', price: 28.0, benchmarkPrice: 412.0 },
        { time: '2024', price: 62.0, benchmarkPrice: 480.0 },
        { time: '2025', price: 105.0, benchmarkPrice: 540.0 },
        { time: '2026', price: 132.8, benchmarkPrice: 578.2 }
      ]
    }
  },
  AAPL: {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 226.40,
    change: 1.85,
    changePercent: 0.82,
    marketCap: '₹3.45 Trillion',
    peRatio: 33.8,
    pbRatio: 48.2,
    dividendYield: 0.44,
    week52High: 237.23,
    week52Low: 164.08,
    description: 'Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
    chartData: [
      { time: 'May', price: 182.0, volume: 55, ma20: 178.0 },
      { time: 'Jun', price: 208.0, volume: 64, ma20: 192.0 },
      { time: 'Jul', price: 224.0, volume: 72, ma20: 210.0 },
      { time: 'Aug', price: 218.0, volume: 48, ma20: 215.0 },
      { time: 'Sep', price: 222.0, volume: 52, ma20: 219.0 },
      { time: 'Oct', price: 226.4, volume: 58, ma20: 223.0 },
    ],
    aiAnalysis: {
      growthScore: 78,
      valueScore: 62,
      momentumScore: 84,
      qualityScore: 98,
      summary: 'Apple Intelligence rollout driving supercycle iPhone upgrade cadence. High Services margin expansion provides resilient free cash flow support.'
    },
    performance: {
      '1D': 0.82,
      '1W': 2.10,
      '1M': 4.80,
      '6M': 24.20,
      '1Y': 32.50,
      '5Y': 148.00
    },
    benchmarkComparison1Y: 21.4,
    strengths: [
      'Monolithic iOS consumer ecosystem with over 2.2B active devices',
      'Services segment generating ₹95B+ ARR at 74% gross margin',
      'Unmatched corporate share buyback program (₹100B annual pacing)'
    ],
    risks: [
      'Regulatory pressure on App Store take-rate in US and European Union',
      'China smartphone market share headwinds vs domestic incumbents',
      'Slower consumer monetization curve for on-device AI features'
    ],
    factorsToMonitor: [
      'iPhone 16 Pro supercycle lead times & carrier channel checks',
      'Apple Intelligence localized feature expansion in international markets',
      'DOJ antitrust litigation progress'
    ],
    timeframeChartData: {
      '1D': [
        { time: '09:30', price: 224.5, benchmarkPrice: 574.0 },
        { time: '11:00', price: 225.2, benchmarkPrice: 575.5 },
        { time: '13:00', price: 225.8, benchmarkPrice: 576.2 },
        { time: '15:00', price: 226.1, benchmarkPrice: 577.8 },
        { time: '16:00', price: 226.4, benchmarkPrice: 578.2 }
      ],
      '1W': [
        { time: 'Mon', price: 221.8, benchmarkPrice: 570.0 },
        { time: 'Tue', price: 222.9, benchmarkPrice: 572.1 },
        { time: 'Wed', price: 224.1, benchmarkPrice: 574.5 },
        { time: 'Thu', price: 225.5, benchmarkPrice: 576.8 },
        { time: 'Fri', price: 226.4, benchmarkPrice: 578.2 }
      ],
      '1M': [
        { time: 'W1', price: 216.0, benchmarkPrice: 558.0 },
        { time: 'W2', price: 219.2, benchmarkPrice: 564.2 },
        { time: 'W3', price: 223.0, benchmarkPrice: 571.0 },
        { time: 'W4', price: 226.4, benchmarkPrice: 578.2 }
      ],
      '6M': [
        { time: 'May', price: 182.0, benchmarkPrice: 510.0 },
        { time: 'Jun', price: 208.0, benchmarkPrice: 532.0 },
        { time: 'Jul', price: 224.0, benchmarkPrice: 548.0 },
        { time: 'Aug', price: 218.0, benchmarkPrice: 552.0 },
        { time: 'Sep', price: 222.0, benchmarkPrice: 566.0 },
        { time: 'Oct', price: 226.4, benchmarkPrice: 578.2 }
      ],
      '1Y': [
        { time: 'Q4 25', price: 171.0, benchmarkPrice: 476.0 },
        { time: 'Q1 26', price: 184.0, benchmarkPrice: 502.0 },
        { time: 'Q2 26', price: 202.0, benchmarkPrice: 538.0 },
        { time: 'Q3 26', price: 218.0, benchmarkPrice: 562.0 },
        { time: 'Q4 26', price: 226.4, benchmarkPrice: 578.2 }
      ],
      '5Y': [
        { time: '2022', price: 130.0, benchmarkPrice: 380.0 },
        { time: '2023', price: 150.0, benchmarkPrice: 412.0 },
        { time: '2024', price: 180.0, benchmarkPrice: 480.0 },
        { time: '2025', price: 205.0, benchmarkPrice: 540.0 },
        { time: '2026', price: 226.4, benchmarkPrice: 578.2 }
      ]
    }
  },
  MSFT: {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    price: 428.50,
    change: 4.80,
    changePercent: 1.13,
    marketCap: '₹3.18 Trillion',
    peRatio: 36.4,
    pbRatio: 12.8,
    dividendYield: 0.75,
    week52High: 468.35,
    week52Low: 348.10,
    description: 'Microsoft develops software, services, devices and solutions including Azure cloud, Office 365, and Copilot AI integrations.',
    chartData: [
      { time: 'May', price: 395.0, volume: 38, ma20: 388.0 },
      { time: 'Jun', price: 442.0, volume: 46, ma20: 412.0 },
      { time: 'Jul', price: 454.0, volume: 51, ma20: 436.0 },
      { time: 'Aug', price: 418.0, volume: 39, ma20: 428.0 },
      { time: 'Sep', price: 422.0, volume: 42, ma20: 420.0 },
      { time: 'Oct', price: 428.5, volume: 44, ma20: 424.0 },
    ],
    aiAnalysis: {
      growthScore: 92,
      valueScore: 60,
      momentumScore: 82,
      qualityScore: 99,
      summary: 'Azure AI cloud growth (+31% YoY) accelerating as enterprise Copilot seats scale across Office 365 customer base.'
    },
    performance: {
      '1D': 1.13,
      '1W': 2.40,
      '1M': 5.80,
      '6M': 8.50,
      '1Y': 28.40,
      '5Y': 185.00
    },
    benchmarkComparison1Y: 21.4,
    strengths: [
      'Unmatched enterprise sales distribution channels and IT buyer trust',
      'Exclusive commercial partnership and infrastructure hosting with OpenAI',
      'High-margin SaaS recurring revenue streams with low churn'
    ],
    risks: [
      'Heavy capex spending (₹19B/quarter) placing pressure on free cash flow',
      'FTC / EU regulatory scrutiny regarding cloud bunding and AI investments',
      'Execution risk in scaling AI datacenters under power grid constraints'
    ],
    factorsToMonitor: [
      'Azure AI contribution percentage to total cloud revenue growth',
      'Office 365 Copilot seat conversion rate among enterprise E5 subscribers',
      'Power purchase agreements for nuclear & renewable datacenter power'
    ],
    timeframeChartData: {
      '1D': [
        { time: '09:30', price: 423.7, benchmarkPrice: 574.0 },
        { time: '11:00', price: 425.1, benchmarkPrice: 575.5 },
        { time: '13:00', price: 426.8, benchmarkPrice: 576.2 },
        { time: '15:00', price: 427.9, benchmarkPrice: 577.8 },
        { time: '16:00', price: 428.5, benchmarkPrice: 578.2 }
      ],
      '1W': [
        { time: 'Mon', price: 418.5, benchmarkPrice: 570.0 },
        { time: 'Tue', price: 421.0, benchmarkPrice: 572.1 },
        { time: 'Wed', price: 423.4, benchmarkPrice: 574.5 },
        { time: 'Thu', price: 426.2, benchmarkPrice: 576.8 },
        { time: 'Fri', price: 428.5, benchmarkPrice: 578.2 }
      ],
      '1M': [
        { time: 'W1', price: 405.0, benchmarkPrice: 558.0 },
        { time: 'W2', price: 412.0, benchmarkPrice: 564.2 },
        { time: 'W3', price: 420.0, benchmarkPrice: 571.0 },
        { time: 'W4', price: 428.5, benchmarkPrice: 578.2 }
      ],
      '6M': [
        { time: 'May', price: 395.0, benchmarkPrice: 510.0 },
        { time: 'Jun', price: 442.0, benchmarkPrice: 532.0 },
        { time: 'Jul', price: 454.0, benchmarkPrice: 548.0 },
        { time: 'Aug', price: 418.0, benchmarkPrice: 552.0 },
        { time: 'Sep', price: 422.0, benchmarkPrice: 566.0 },
        { time: 'Oct', price: 428.5, benchmarkPrice: 578.2 }
      ],
      '1Y': [
        { time: 'Q4 25', price: 333.0, benchmarkPrice: 476.0 },
        { time: 'Q1 26', price: 375.0, benchmarkPrice: 502.0 },
        { time: 'Q2 26', price: 415.0, benchmarkPrice: 538.0 },
        { time: 'Q3 26', price: 420.0, benchmarkPrice: 562.0 },
        { time: 'Q4 26', price: 428.5, benchmarkPrice: 578.2 }
      ],
      '5Y': [
        { time: '2022', price: 210.0, benchmarkPrice: 380.0 },
        { time: '2023', price: 250.0, benchmarkPrice: 412.0 },
        { time: '2024', price: 340.0, benchmarkPrice: 480.0 },
        { time: '2025', price: 390.0, benchmarkPrice: 540.0 },
        { time: '2026', price: 428.5, benchmarkPrice: 578.2 }
      ]
    }
  },
  TCS: {
    ticker: 'TCS',
    name: 'Tata Consultancy Services',
    price: 4120.50,
    change: 58.90,
    changePercent: 1.45,
    marketCap: '₹15.1 Trillion',
    peRatio: 30.2,
    pbRatio: 14.1,
    dividendYield: 1.82,
    week52High: 4585.00,
    week52Low: 3313.00,
    description: "Tata Consultancy Services (TCS) is India's largest IT services and consulting powerhouse, leading enterprise AI and digital infrastructure transformation globally.",
    chartData: [
      { time: 'May', price: 3820, volume: 28, ma20: 3790 },
      { time: 'Jun', price: 3890, volume: 32, ma20: 3840 },
      { time: 'Jul', price: 4250, volume: 44, ma20: 4010 },
      { time: 'Aug', price: 4480, volume: 38, ma20: 4260 },
      { time: 'Sep', price: 4290, volume: 31, ma20: 4320 },
      { time: 'Oct', price: 4120.5, volume: 36, ma20: 4190 },
    ],
    aiAnalysis: {
      growthScore: 84,
      valueScore: 78,
      momentumScore: 81,
      qualityScore: 99,
      summary: 'Resilient digital transformation and generative AI deal flow with industry-benchmark 24.5%+ EBIT margins and superior return on equity (ROE > 45%).'
    },
    performance: {
      '1D': 1.45,
      '1W': 3.20,
      '1M': 8.60,
      '6M': 14.80,
      '1Y': 24.80,
      '5Y': 118.00
    },
    benchmarkComparison1Y: 18.2,
    strengths: [
      'Unmatched global Fortune 500 client relationships & multi-billion dollar TCV pipeline',
      'Industry-leading operating margin retention across wage adjustment cycles',
      'Robust capital return policy with dividend yield and periodic share buybacks'
    ],
    risks: [
      'Discretionary tech spending delays in North American BFSI segment',
      'Currency fluctuation volatility in EUR and GBP billing revenue',
      'Higher onshore delivery costs amid visa regulation changes'
    ],
    factorsToMonitor: [
      'Quarterly Total Contract Value (TCV) deal signing run-rate',
      'Attrition rate stabilization among senior architects',
      'GenAI platform (Cognix) enterprise adoption pace'
    ],
    timeframeChartData: {
      '1D': [
        { time: '09:15', price: 4080.0, benchmarkPrice: 24350 },
        { time: '11:30', price: 4105.0, benchmarkPrice: 24410 },
        { time: '13:30', price: 4112.0, benchmarkPrice: 24440 },
        { time: '14:30', price: 4118.0, benchmarkPrice: 24465 },
        { time: '15:30', price: 4120.5, benchmarkPrice: 24480 }
      ],
      '1W': [
        { time: 'Mon', price: 3990.0, benchmarkPrice: 24150 },
        { time: 'Tue', price: 4025.0, benchmarkPrice: 24220 },
        { time: 'Wed', price: 4060.0, benchmarkPrice: 24310 },
        { time: 'Thu', price: 4095.0, benchmarkPrice: 24410 },
        { time: 'Fri', price: 4120.5, benchmarkPrice: 24480 }
      ],
      '1M': [
        { time: 'W1', price: 3820.0, benchmarkPrice: 23800 },
        { time: 'W2', price: 3910.0, benchmarkPrice: 24050 },
        { time: 'W3', price: 4040.0, benchmarkPrice: 24280 },
        { time: 'W4', price: 4120.5, benchmarkPrice: 24480 }
      ],
      '6M': [
        { time: 'May', price: 3820.0, benchmarkPrice: 22800 },
        { time: 'Jun', price: 3890.0, benchmarkPrice: 23400 },
        { time: 'Jul', price: 4250.0, benchmarkPrice: 24100 },
        { time: 'Aug', price: 4480.0, benchmarkPrice: 24500 },
        { time: 'Sep', price: 4290.0, benchmarkPrice: 24350 },
        { time: 'Oct', price: 4120.5, benchmarkPrice: 24480 }
      ],
      '1Y': [
        { time: 'Q4 25', price: 3410.0, benchmarkPrice: 21200 },
        { time: 'Q1 26', price: 3650.0, benchmarkPrice: 22100 },
        { time: 'Q2 26', price: 3880.0, benchmarkPrice: 23200 },
        { time: 'Q3 26', price: 4100.0, benchmarkPrice: 24100 },
        { time: 'Q4 26', price: 4120.5, benchmarkPrice: 24480 }
      ],
      '5Y': [
        { time: '2022', price: 3120.0, benchmarkPrice: 17500 },
        { time: '2023', price: 3260.0, benchmarkPrice: 18800 },
        { time: '2024', price: 3780.0, benchmarkPrice: 21600 },
        { time: '2025', price: 3950.0, benchmarkPrice: 23200 },
        { time: '2026', price: 4120.5, benchmarkPrice: 24480 }
      ]
    }
  },
  RELIANCE: {
    ticker: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    price: 2980.40,
    change: 61.20,
    changePercent: 2.10,
    marketCap: '₹20.2 Trillion',
    peRatio: 27.5,
    pbRatio: 2.4,
    dividendYield: 0.35,
    week52High: 3217.90,
    week52Low: 2221.05,
    description: "Reliance Industries is India's largest private sector conglomerate spanning energy, petrochemicals, telecommunications (Jio Infocomm), organized retail, and new green energy.",
    chartData: [
      { time: 'May', price: 2840, volume: 55, ma20: 2810 },
      { time: 'Jun', price: 2920, volume: 62, ma20: 2870 },
      { time: 'Jul', price: 3140, volume: 74, ma20: 3020 },
      { time: 'Aug', price: 3050, volume: 48, ma20: 3090 },
      { time: 'Sep', price: 2960, volume: 53, ma20: 3010 },
      { time: 'Oct', price: 2980.4, volume: 64, ma20: 2975 },
    ],
    aiAnalysis: {
      growthScore: 89,
      valueScore: 82,
      momentumScore: 85,
      qualityScore: 97,
      summary: 'Diversified cash generator with Jio 5G tariff hikes driving ARPU accretion and Retail dark-store network expansion delivering strong free cash flows.'
    },
    performance: {
      '1D': 2.10,
      '1W': 4.80,
      '1M': 11.40,
      '6M': 18.20,
      '1Y': 32.10,
      '5Y': 142.00
    },
    benchmarkComparison1Y: 18.2,
    strengths: [
      'Jio telecom ecosystem commanding over 475M subscribers across India',
      'Pan-India retail footprint with 18,500+ stores capturing consumer spend',
      'Integration across refining to high-value petrochem and green hydrogen'
    ],
    risks: [
      'Global refining margin (GRM) volatility linked to crude oil differentials',
      'High capex trajectory for solar gigafactories and 5G network densification',
      'Consumer discretionary demand headwinds in tier-2 fashion retail'
    ],
    factorsToMonitor: [
      'Jio & Reliance Retail value unlocking and IPO roadmaps',
      'Gross Refining Margin (GRM) spreads over Dubai benchmark',
      'Green energy gigafactory operationalization milestones in Jamnagar'
    ],
    timeframeChartData: {
      '1D': [
        { time: '09:15', price: 2930.0, benchmarkPrice: 24350 },
        { time: '11:30', price: 2955.0, benchmarkPrice: 24410 },
        { time: '13:30', price: 2970.0, benchmarkPrice: 24440 },
        { time: '14:30', price: 2975.0, benchmarkPrice: 24465 },
        { time: '15:30', price: 2980.4, benchmarkPrice: 24480 }
      ],
      '1W': [
        { time: 'Mon', price: 2860.0, benchmarkPrice: 24150 },
        { time: 'Tue', price: 2890.0, benchmarkPrice: 24220 },
        { time: 'Wed', price: 2920.0, benchmarkPrice: 24310 },
        { time: 'Thu', price: 2955.0, benchmarkPrice: 24410 },
        { time: 'Fri', price: 2980.4, benchmarkPrice: 24480 }
      ],
      '1M': [
        { time: 'W1', price: 2710.0, benchmarkPrice: 23800 },
        { time: 'W2', price: 2790.0, benchmarkPrice: 24050 },
        { time: 'W3', price: 2890.0, benchmarkPrice: 24280 },
        { time: 'W4', price: 2980.4, benchmarkPrice: 24480 }
      ],
      '6M': [
        { time: 'May', price: 2840.0, benchmarkPrice: 22800 },
        { time: 'Jun', price: 2920.0, benchmarkPrice: 23400 },
        { time: 'Jul', price: 3140.0, benchmarkPrice: 24100 },
        { time: 'Aug', price: 3050.0, benchmarkPrice: 24500 },
        { time: 'Sep', price: 2960.0, benchmarkPrice: 24350 },
        { time: 'Oct', price: 2980.4, benchmarkPrice: 24480 }
      ],
      '1Y': [
        { time: 'Q4 25', price: 2320.0, benchmarkPrice: 21200 },
        { time: 'Q1 26', price: 2510.0, benchmarkPrice: 22100 },
        { time: 'Q2 26', price: 2740.0, benchmarkPrice: 23200 },
        { time: 'Q3 26', price: 2890.0, benchmarkPrice: 24100 },
        { time: 'Q4 26', price: 2980.4, benchmarkPrice: 24480 }
      ],
      '5Y': [
        { time: '2022', price: 2150.0, benchmarkPrice: 17500 },
        { time: '2023', price: 2320.0, benchmarkPrice: 18800 },
        { time: '2024', price: 2600.0, benchmarkPrice: 21600 },
        { time: '2025', price: 2820.0, benchmarkPrice: 23200 },
        { time: '2026', price: 2980.4, benchmarkPrice: 24480 }
      ]
    }
  }
};

export const MOCK_GOLD_ANALYSIS: GoldAnalysis = {
  price: 2658.90,
  change1d: 18.40,
  changePercent1d: 0.70,
  performance: {
    '1D': 0.70,
    '1W': 1.80,
    '1M': 4.20,
    '6M': 14.80,
    '1Y': 28.50,
    '5Y': 72.00
  },
  drivers: [
    {
      title: 'US Real Yield Compression',
      description: 'US 10-Year Treasury inflation-protected yields fell to 1.72%, reducing opportunity costs for holding non-interest bearing gold bullion.',
      impact: 'Strong Positive'
    },
    {
      title: 'Central Bank Net Accumulation',
      description: 'Global central banks purchased 1,037 metric tonnes over the last 12 months, led by China, Poland, and Singapore reserve diversification.',
      impact: 'Strong Positive'
    },
    {
      title: 'Geopolitical Structural Hedging',
      description: 'Institutional demand for non-fiat, counterparty-free reserve assets remains elevated amidst sovereign debt expansion.',
      impact: 'Moderate Positive'
    }
  ],
  risks: [
    {
      title: 'Hawkish Federal Reserve Reversal',
      description: 'Resurgent CPI inflation forcing the Fed to pause or reverse interest rate cuts.',
      severity: 'High'
    },
    {
      title: 'US Dollar Index (DXY) Rally',
      description: 'Sharp DXY surge above 106 reduces international buyer purchasing power.',
      severity: 'Medium'
    }
  ],
  aiAssessment: 'Macro drivers strongly support precious metal allocations. AI quantitative model assigns an 84/100 bullish momentum score, noting ₹2,580/oz as key institutional support.',
  historicalChartData: [
    { time: '2022', price: 1820, realYield: 2.1 },
    { time: '2023', price: 1980, realYield: 2.4 },
    { time: '2024', price: 2150, realYield: 2.0 },
    { time: '2025', price: 2380, realYield: 1.9 },
    { time: 'Mid 2026', price: 2520, realYield: 1.8 },
    { time: 'Oct 2026', price: 2658.9, realYield: 1.72 }
  ]
};

export const MOCK_OPPORTUNITY_CARDS: OpportunityCardItem[] = [
  {
    id: 'opp-1',
    assetName: 'Taiwan Semiconductor Manufacturing',
    symbol: 'TSM',
    opportunityType: 'Thematic Hardware Monopoly',
    historicalPerformance1Y: 64.2,
    supportingFactors: [
      'Controls over 90% of advanced sub-5nm chip foundry market',
      'Gross margins maintaining 53%+ despite global fab expansion',
      'CoWoS advanced packaging capacity fully booked through 2027'
    ],
    keyRisks: [
      'Taiwan strait geopolitical concentration risk',
      'Capex inflation associated with US/EU fab construction'
    ],
    confidenceScore: 92,
    assessmentTag: 'High Conviction AI Thesis'
  },
  {
    id: 'opp-2',
    assetName: 'Palantir Technologies',
    symbol: 'PLTR',
    opportunityType: 'Enterprise AI Operating System',
    historicalPerformance1Y: 142.5,
    supportingFactors: [
      'AIP Bootcamps shortening enterprise sales cycles from 9 months to 2 weeks',
      'US Commercial revenue growing 55%+ YoY with zero debt balance sheet',
      'S&P 500 inclusion driving forced index fund inflows'
    ],
    keyRisks: [
      'Elevated P/E multiple (112x) leaves narrow error margin on quarterly earnings',
      'Government contract lumpiness and renewal timing variability'
    ],
    confidenceScore: 86,
    assessmentTag: 'High Conviction AI Thesis'
  },
  {
    id: 'opp-3',
    assetName: 'Eli Lilly & Co.',
    symbol: 'LLY',
    opportunityType: 'Structural Pharma Growth',
    historicalPerformance1Y: 54.8,
    supportingFactors: [
      'Mounjaro & Zepbound GLP-1 franchise projected to exceed $50B total ARR by 2028',
      'Manufacturing line clearance expanding auto-injector supply volumes',
      'Phase III trials expanding into cardiovascular & sleep apnea indications'
    ],
    keyRisks: [
      'Government drug price negotiation oversight under IRA legislation',
      'Compounding pharmacy generic copycat competition during supply shortages'
    ],
    confidenceScore: 89,
    assessmentTag: 'Moderate Upside Thesis'
  },
  {
    id: 'opp-4',
    assetName: 'SPDR Gold Shares ETF',
    symbol: 'GLD',
    opportunityType: 'Macro Real-Yield Hedge',
    historicalPerformance1Y: 28.5,
    supportingFactors: [
      'Negative correlation (-0.84) to falling 10-Year real interest rates',
      'Sustained net inflows from global central bank reserve diversification',
      'Provides portfolio volatility dampening during equity drawdowns'
    ],
    keyRisks: [
      'Opportunity cost increase if Fed halts interest rate reduction cycle',
      'Strong US Dollar rally compressing non-US buyer liquidity'
    ],
    confidenceScore: 82,
    assessmentTag: 'Moderate Upside Thesis'
  }
];

export const MOCK_STOCK_COMPARISON: StockComparisonData[] = [
  {
    ticker: 'TCS',
    name: 'Tata Consultancy Services',
    price: 4120.50,
    change1d: 1.45,
    change1y: 24.8,
    change5y: 118.0,
    marketCap: '₹15.1T',
    peRatio: 30.2,
    revenueGrowth: 14.8,
    riskFactors: 'BFSI tech budget discretionary pacing & currency cross-rates',
    aiRating: 'A+ (Strong Bullish)'
  },
  {
    ticker: 'RELIANCE',
    name: 'Reliance Industries',
    price: 2980.40,
    change1d: 2.10,
    change1y: 32.1,
    change5y: 142.0,
    marketCap: '₹20.2T',
    peRatio: 27.5,
    revenueGrowth: 18.5,
    riskFactors: 'Global refining margin spreads & green capex gestation',
    aiRating: 'A+ (Bullish)'
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corp',
    price: 132.80,
    change1d: 3.18,
    change1y: 134.5,
    change5y: 1280.0,
    marketCap: '₹3.26T',
    peRatio: 44.2,
    revenueGrowth: 122.4,
    riskFactors: 'Export restrictions & customer concentration in cloud giants',
    aiRating: 'A+ (Strong Bullish)'
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 226.40,
    change1d: 0.82,
    change1y: 32.5,
    change5y: 148.0,
    marketCap: '₹3.45T',
    peRatio: 33.8,
    revenueGrowth: 6.2,
    riskFactors: 'App Store regulatory lawsuits & China market competition',
    aiRating: 'A (Bullish)'
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp',
    price: 428.50,
    change1d: 1.13,
    change1y: 28.4,
    change5y: 185.0,
    marketCap: '₹3.18T',
    peRatio: 36.4,
    revenueGrowth: 15.2,
    riskFactors: 'Datacenter capex intensity & FTC AI investment inquiry',
    aiRating: 'A+ (Bullish)'
  }
];

export const MOCK_RADAR_SIGNALS: OpportunityRadarSignal[] = [
  {
    id: 'rad-1',
    type: 'opportunity',
    title: 'Custom ASIC Infrastructure Acceleration',
    asset: 'TSM / ASML',
    detail: 'Cloud provider 10-Q SEC filings indicate +34% expansion in custom AI silicon wafer reservations.',
    timeframe: '1-3 Months',
    conviction: 'High'
  },
  {
    id: 'rad-2',
    type: 'signal',
    title: 'Real Yields Break Below 1.75%',
    asset: 'GOLD / GLD',
    detail: 'Falling real yields historical pattern correlates with +4.8% gold price expansion over 30 days.',
    timeframe: 'Immediate',
    conviction: 'High'
  },
  {
    id: 'rad-3',
    type: 'risk',
    title: 'Customer Concentration in SaaS CIM',
    asset: 'CSCL',
    detail: 'Top 3 clients account for 48.2% ARR in CloudScale Systems VDR documentation.',
    timeframe: '2-4 Weeks',
    conviction: 'Watch'
  },
  {
    id: 'rad-4',
    type: 'event',
    title: 'FOMC Rate Decision & CPI Print',
    asset: 'MACRO',
    detail: 'Federal Reserve rate cut announcement and inflation data release scheduled for next week.',
    timeframe: 'Next Week',
    conviction: 'Watch'
  }
];

export const MOCK_VDR_DOCUMENTS: VDRDocument[] = [
  {
    id: 'vdr-1',
    fileName: 'CloudScale_Systems_FY25_10K_Annual_Report.pdf',
    documentType: 'Annual Report',
    uploadDate: 'Oct 06, 2026',
    processingStatus: 'Processed',
    pageCount: 142,
    analysisStatus: 'Complete',
    fileSize: '14.2 MB'
  },
  {
    id: 'vdr-2',
    fileName: 'CloudScale_Q3_2026_Audited_Financial_Statements.pdf',
    documentType: 'Financial Statements',
    uploadDate: 'Oct 07, 2026',
    processingStatus: 'Processed',
    pageCount: 38,
    analysisStatus: 'Complete',
    fileSize: '4.8 MB'
  },
  {
    id: 'vdr-3',
    fileName: 'Project_Valkyrie_Confidential_Information_Memo.pdf',
    documentType: 'Investor Presentation',
    uploadDate: 'Oct 05, 2026',
    processingStatus: 'Processed',
    pageCount: 64,
    analysisStatus: 'Flagged Discrepancy',
    fileSize: '18.5 MB'
  },
  {
    id: 'vdr-4',
    fileName: 'Q3_2026_Earnings_Release_&_Transcript.pdf',
    documentType: 'Earnings Report',
    uploadDate: 'Oct 07, 2026',
    processingStatus: 'Processed',
    pageCount: 22,
    analysisStatus: 'Complete',
    fileSize: '2.1 MB'
  },
  {
    id: 'vdr-5',
    fileName: 'Gartner_Magic_Quadrant_Cloud_Infra_2026.pdf',
    documentType: 'Market/Industry Report',
    uploadDate: 'Oct 04, 2026',
    processingStatus: 'Processed',
    pageCount: 56,
    analysisStatus: 'Complete',
    fileSize: '8.4 MB'
  },
  {
    id: 'vdr-6',
    fileName: 'IP_Litigation_Schedule_&_Patent_Assignment.pdf',
    documentType: 'Other',
    uploadDate: 'Oct 08, 2026',
    processingStatus: 'Ingested',
    pageCount: 18,
    analysisStatus: 'In Review',
    fileSize: '3.6 MB'
  }
];

export const MOCK_DETAILED_RISKS: DetailedRisk[] = [
  {
    id: 'risk-101',
    title: 'Top Customer ARR Concentration',
    category: 'Financial Risk',
    severity: 'High',
    description: 'The top 3 enterprise customers generate 48.2% of total Annual Recurring Revenue (ARR). Loss of any single key client creates severe EBITDA margin impairment.',
    evidenceSource: 'CloudScale_Systems_FY25_10K_Annual_Report.pdf — Page 42',
    evidenceSnippet: '"Customer Alpha, Beta, and Gamma collectively represented $68.4M (48.2%) of total ARR as of Q3 FY26."',
    potentialImpact: 'Estimated -22% EBITDA reduction in downside churn scenario.',
    factorsToMonitor: ['Contract renewal dates (Q1 2027)', 'Enterprise SLA compliance uptime log', 'Executive sponsor retention']
  },
  {
    id: 'risk-102',
    title: 'Key Person IP Rights Separation',
    category: 'Operational Risk',
    severity: 'Medium',
    description: 'Founding CTO retains partial ownership of underlying Kubernetes optimization algorithms in a separate holding entity licensed under revokable terms.',
    evidenceSource: 'Project_Valkyrie_Confidential_Information_Memo.pdf — Page 58',
    evidenceSnippet: '"Core auto-scaler patents are licensed exclusively from Founders IP LLC subject to annual technical compliance audits."',
    potentialImpact: 'Potential IP renegotiation cost or assignment fee requirement during acquisition close.',
    factorsToMonitor: ['Definitive IP assignment agreement execution prior to IC final memo']
  },
  {
    id: 'risk-103',
    title: 'Entry Multiple Valuation Stretch',
    category: 'Business Risk',
    severity: 'Medium',
    description: 'Target entry multiple of 18.2x EBITDA sits 1.5x above public peer median (16.7x), requiring strict 30%+ CAGR execution to meet target 28.5% IRR.',
    evidenceSource: 'Q3_2026_Earnings_Release_&_Transcript.pdf — Page 12',
    evidenceSnippet: '"Current transaction value implies 18.2x trailing LTM EBITDA of $35.2M."',
    potentialImpact: 'Multiple compression risk upon exit if market multiples contract.',
    factorsToMonitor: ['LBO debt paydown velocity', 'Margin expansion progress']
  },
  {
    id: 'risk-104',
    title: 'Hyperscaler Native Competition',
    category: 'Market Risk',
    severity: 'Medium',
    description: 'AWS (EKS Auto) and Azure (AKS Copilot) are embedding competing native container optimization features directly into cloud control planes.',
    evidenceSource: 'Gartner_Magic_Quadrant_Cloud_Infra_2026.pdf — Page 18',
    evidenceSnippet: '"Hyperscale cloud providers are increasingly bundling basic workload optimization at zero incremental cost."',
    potentialImpact: 'Gross margin compression on base tier software packages.',
    factorsToMonitor: ['Net Retention Rate (NRR) trajectory', 'Feature differentiation velocity']
  },
  {
    id: 'risk-105',
    title: 'EU Data Sovereignty & AI Act Compliance',
    category: 'Regulatory Risk',
    severity: 'Low',
    description: 'Pending EU AI Act telemetry disclosures require architectural modifications for European enterprise deployments.',
    evidenceSource: 'IP_Litigation_Schedule_&_Patent_Assignment.pdf — Page 14',
    evidenceSnippet: '"EU enterprise cluster deployments must complete AI audit verification prior to Q2 2027."',
    potentialImpact: 'Estimated $1.2M incremental engineering compliance spend.',
    factorsToMonitor: ['EU SOC-2 Type II audit completion', 'Local data residency roadmap']
  }
];

export const MOCK_DETAILED_OPPORTUNITIES: DetailedOpportunity[] = [
  {
    id: 'opp-101',
    title: 'Portfolio Cross-Sell Synergies',
    category: 'Revenue Growth',
    supportingEvidence: 'Project_Valkyrie_Confidential_Information_Memo.pdf — Page 24',
    evidenceSnippet: '"Immediate deployment opportunity across Fund IV portfolio companies #3 and #7 representing $14.5M ARR expansion."',
    potentialImpact: '+12% ARR acceleration within 12 months post-acquisition.',
    growthDriver: 'Joint enterprise go-to-market integration.',
    risksConstraints: 'Requires dedicated channel sales team integration.',
    sourceDocument: 'Confidential Information Memo (CIM)'
  },
  {
    id: 'opp-102',
    title: 'Untapped EU & APAC Expansion',
    category: 'Market Expansion',
    supportingEvidence: 'CloudScale_Systems_FY25_10K_Annual_Report.pdf — Page 19',
    evidenceSnippet: '"International sales accounted for only 8.4% of total revenue in FY25 despite 42% of inbound web lead volume coming from EMEA."',
    potentialImpact: '$35M+ TAM expansion over 3-year horizon.',
    growthDriver: 'Establishment of London & Frankfurt enterprise hubs.',
    risksConstraints: 'Hiring lead times for localized sales teams.',
    sourceDocument: 'FY25 Annual Report 10-K'
  },
  {
    id: 'opp-103',
    title: 'Enterprise AI Workload Autopilot Module',
    category: 'Product Growth',
    supportingEvidence: 'Q3_2026_Earnings_Release_&_Transcript.pdf — Page 8',
    evidenceSnippet: '"Beta trial of AI Autopilot module demonstrated 44% GPU compute cost savings for LLM training clusters, commanding a 25% price premium."',
    potentialImpact: '+350 bps gross margin expansion.',
    growthDriver: 'High-margin add-on SKU adoption across existing client base.',
    risksConstraints: 'GPU availability constraints among cloud partners.',
    sourceDocument: 'Q3 Earnings Release'
  },
  {
    id: 'opp-104',
    title: 'Legacy Pricing Restructuring',
    category: 'Operational Improvement',
    supportingEvidence: 'CloudScale_Q3_2026_Audited_Financial_Statements.pdf — Page 14',
    evidenceSnippet: '"Legacy cohort customers (2022-2023) remain on flat-rate pricing 30% below current list rates."',
    potentialImpact: 'Immediate $8.2M ARR uplift upon contract renewals.',
    growthDriver: 'Contract standardization & value-based pricing tiering.',
    risksConstraints: 'Risk of minor churn in bottom-tier accounts.',
    sourceDocument: 'Audited Financial Statements'
  }
];

export const MOCK_CROSS_DOC_METRICS: CrossDocComparisonMetric[] = [
  {
    id: 'cdm-1',
    metric: 'FY25 Full-Year Revenue',
    docA: 'FY25 Annual Report (10-K): $142.0M',
    docB: 'Q3 Earnings Release: $142.0M',
    difference: '$0 (0.0%)',
    status: 'Consistent',
    notes: 'Revenue figures match perfectly across official audited SEC disclosures.'
  },
  {
    id: 'cdm-2',
    metric: 'Net Debt Balance',
    docA: 'Q3 Audited Statements: $63.3M',
    docB: 'Confidential Info Memo (CIM): $56.0M',
    difference: '$7.3M variance (11.5%)',
    status: 'Potential Inconsistency',
    notes: 'CIM excludes $7.3M equipment lease obligation included in official Q3 balance sheet.'
  },
  {
    id: 'cdm-3',
    metric: 'FY26 EBITDA Guidance',
    docA: 'CIM Projections: $48.5M (34% Margin)',
    docB: 'Q3 Earnings Call Transcript: $44.0M (31% Margin)',
    difference: '$4.5M shortfall in Earnings call',
    status: 'Changed',
    notes: 'Management lowered official public guidance due to sales cycle extension.'
  },
  {
    id: 'cdm-4',
    metric: 'Top Customer ARR Share',
    docA: 'FY25 10-K: 48.2% ARR (Top 3 clients)',
    docB: 'CIM Executive Summary: 38.0% ARR',
    difference: '10.2% concentration variance',
    status: 'Potential Inconsistency',
    notes: 'CIM calculated concentration based on historical 2024 cohort, understating current risk.'
  },
  {
    id: 'cdm-5',
    metric: 'Enterprise Sales Headcount',
    docA: '10-K Organizational Disclosure: 142 AE/SEs',
    docB: 'Q3 Earnings Presentation: 140 AE/SEs',
    difference: '2 headcount difference',
    status: 'Consistent',
    notes: 'Normal quarter-over-quarter turnover.'
  },
  {
    id: 'cdm-6',
    metric: 'Patent Assignment Schedule',
    docA: 'IP Litigation Disclosure: Pending Audit',
    docB: 'CIM: Assigned unconditionally',
    difference: 'Status discrepancy',
    status: 'Potential Inconsistency',
    notes: 'CIM claims unconditional assignment, but IP schedule lists pending audit condition.'
  }
];

export const MOCK_INVESTMENT_ASSESSMENT: InvestmentAssessmentData = {
  businessQualityScore: 88,
  financialStrengthScore: 84,
  growthIndicatorScore: 92,
  riskLevel: 'Moderate',
  opportunityLevel: 'High Conviction',
  overallScore: 89,
  positiveIndicators: [
    'Leading market share in enterprise Kubernetes container optimization (78% gross margin)',
    'High Net Expansion Rate (124%) driven by AI workload compute scaling',
    'Low balance sheet leverage (1.8x Net Debt / EBITDA) with strong FCF conversion (22%)',
    'Demonstrated 36.4% YoY revenue growth CAGR over last 3 fiscal years'
  ],
  areasRequiringReview: [
    'Top 3 client ARR concentration (48.2%) requires contract renewal guarantees prior to close',
    'IP licensing audit condition between Founders LLC and target operating entity',
    'Entry valuation multiple (18.2x EBITDA) sitting 1.5x above public peer benchmarks'
  ],
  potentialOpportunities: [
    '$14.5M immediate portfolio cross-sell synergy across existing Fund IV co-investments',
    'Legacy cohort price restructuring yielding projected $8.2M ARR uplift',
    'International EU expansion (EMEA inbound lead conversion)'
  ],
  risksToMonitor: [
    'Native feature bundling by AWS/Azure control planes',
    'Management EBITDA guidance revision from $48.5M to $44.0M',
    'Key person retention post-earnout period'
  ],
  overallThesis: 'Project Valkyrie presents a high-conviction software platform buyout opportunity with robust operational moats. Recommendation is to proceed with term sheet contingent on resolving customer concentration renewal clauses and securing unconditional patent assignment.'
};



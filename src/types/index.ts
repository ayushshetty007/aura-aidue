export type NavigationTab = 
  | 'dashboard'
  | 'due-diligence'
  | 'market-intel'
  | 'portfolio'
  | 'watchlist'
  | 'reports'
  | 'settings';

export type CurrencyCode = 'INR' | 'USD';

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  chartData: { time: string; value: number }[];
  category: 'index' | 'commodity' | 'crypto' | 'yield';
  currency?: CurrencyCode;
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'macro' | 'earnings' | 'catalyst';
  title: string;
  description: string;
  ticker?: string;
  company?: string;
  impactScore: number; // 1-100
  sentiment: 'bullish' | 'bearish' | 'neutral';
  timestamp: string;
  actionRequired?: string;
}

export interface DueDiligenceProject {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  currency?: CurrencyCode;
  stage: 'Sourcing' | 'Initial Review' | 'Deep Dive' | 'IC Ready' | 'Archived';
  status: 'High Conviction' | 'Under Review' | 'Flagged Risk' | 'Passed';
  targetIrr: number;
  dealSize: number;
  ebitdaMultiple: number;
  score: number; // 0 - 100 overall AI score
  updatedAt: string;
  analyst: string;
  executiveSummary: string;
  documentsCount: number;
  risks: { category: string; description: string; severity: 'High' | 'Medium' | 'Low' }[];
  opportunities: { category: string; description: string; impact: 'High' | 'Medium' | 'Low' }[];
  financialHighlights: {
    revenue: number;
    revenueGrowth: number;
    ebitdaMargin: number;
    netDebtToEbitda: number;
    freeCashFlow: number;
  };
}

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  currency?: CurrencyCode;
  shares: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  weight: number;
  aiHealthRating: 'A+' | 'A' | 'B' | 'C' | 'D';
  aiSentiment: 'Bullish' | 'Strong Bullish' | 'Neutral' | 'Bearish';
  recommendation?: 'Buy' | 'Hold' | 'Sell';
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  currency?: CurrencyCode;
  price: number;
  change24h: number;
  change1w: number;
  change1m: number;
  change1y: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  targetPrice: number;
  aiSignal: 'Strong Buy' | 'Accumulate' | 'Hold' | 'Trim' | 'Sell';
  aiConfidence: number; // 0-100
  notes: string;
}

export interface ReportItem {
  id: string;
  title: string;
  type: 'IC Memo' | 'Earnings Tear Sheet' | 'LBO Model Summary' | 'ESG Due Diligence' | 'Sector Deep Dive';
  ticker?: string;
  company?: string;
  author: string;
  date: string;
  readTime: string;
  status: 'Final' | 'Draft' | 'Needs Approval';
  keyTakeaways: string[];
  summary: string;
  verdict: 'Recommend Investment' | 'Pass - High Risk' | 'Hold for Better Entry' | 'Overvalued';
  markdownContent?: string;
  projectId?: string;
}

export interface StockDetail {
  ticker: string;
  name: string;
  currency?: CurrencyCode;
  exchange?: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio: number;
  pbRatio: number;
  dividendYield: number;
  week52High: number;
  week52Low: number;
  description: string;
  chartData: { time: string; price: number; volume: number; ma20: number }[];
  aiAnalysis: {
    growthScore: number;
    valueScore: number;
    momentumScore: number;
    qualityScore: number;
    summary: string;
  };
}

export interface ETFItem {
  symbol: string;
  name: string;
  category: string;
  price: number;
  change1y: number;
  aum: string;
  expenseRatio: number;
  aiThesis: string;
}

export interface SectorPerformance {
  name: string;
  change1d: number;
  change1m: number;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  topDriver: string;
}

export interface WhatMovedToday {
  id: string;
  category: 'Tech Rally' | 'Macro Shift' | 'Commodity Spike' | 'Earnings Move';
  title: string;
  explanation: string;
  impactedAssets: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ExtendedStockDetail extends StockDetail {
  benchmarkName?: string;
  benchmarkSymbol?: string;
  performance: {
    '1D': number;
    '1W': number;
    '1M': number;
    '6M': number;
    '1Y': number;
    '5Y': number;
  };
  benchmarkComparison1Y: number;
  strengths: string[];
  risks: string[];
  factorsToMonitor: string[];
  timeframeChartData: Record<'1D' | '1W' | '1M' | '6M' | '1Y' | '5Y', { time: string; price: number; benchmarkPrice: number }[]>;
}

export interface GoldAnalysis {
  price: number;
  currency?: CurrencyCode;
  unitLabel?: string;
  change1d: number;
  changePercent1d: number;
  performance: {
    '1D': number;
    '1W': number;
    '1M': number;
    '6M': number;
    '1Y': number;
    '5Y': number;
  };
  drivers: { title: string; description: string; impact: 'Strong Positive' | 'Moderate Positive' | 'Neutral' }[];
  risks: { title: string; description: string; severity: 'High' | 'Medium' | 'Low' }[];
  aiAssessment: string;
  historicalChartData: { time: string; price: number; realYield: number }[];
}

export interface OpportunityCardItem {
  id: string;
  assetName: string;
  symbol: string;
  opportunityType: string;
  historicalPerformance1Y: number;
  supportingFactors: string[];
  keyRisks: string[];
  confidenceScore: number;
  assessmentTag: 'High Conviction AI Thesis' | 'Moderate Upside Thesis' | 'Speculative Turnaround';
}

export interface StockComparisonData {
  ticker: string;
  name: string;
  currency?: CurrencyCode;
  price: number;
  change1d: number;
  change1y: number;
  change5y: number;
  marketCap: string;
  peRatio: number;
  revenueGrowth: number;
  riskFactors: string;
  aiRating: string;
}

export interface OpportunityRadarSignal {
  id: string;
  type: 'opportunity' | 'signal' | 'risk' | 'event';
  title: string;
  asset: string;
  detail: string;
  timeframe: string;
  conviction: 'High' | 'Medium' | 'Watch';
}

export interface VDRDocument {
  id: string;
  fileName: string;
  documentType: 'Annual Report' | 'Financial Statements' | 'Investor Presentation' | 'Earnings Report' | 'Market/Industry Report' | 'Other';
  uploadDate: string;
  processingStatus: 'Processed' | 'Indexing' | 'Ingested';
  pageCount: number;
  analysisStatus: 'Complete' | 'Flagged Discrepancy' | 'In Review';
  fileSize: string;
  chunkCount?: number;
}

export interface DetailedRisk {
  id: string;
  title: string;
  category: 'Financial Risk' | 'Operational Risk' | 'Business Risk' | 'Market Risk' | 'Regulatory Risk';
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  evidenceSource: string;
  evidenceSnippet: string;
  potentialImpact: string;
  factorsToMonitor: string[];
}

export interface DetailedOpportunity {
  id: string;
  title: string;
  category: 'Revenue Growth' | 'Market Expansion' | 'Product Growth' | 'Operational Improvement' | 'Industry Growth' | 'Strategic Opportunities';
  supportingEvidence: string;
  evidenceSnippet: string;
  potentialImpact: string;
  growthDriver: string;
  risksConstraints: string;
  sourceDocument: string;
}

export interface CrossDocComparisonMetric {
  id: string;
  metric: string;
  docA: string;
  docB: string;
  difference: string;
  status: 'Consistent' | 'Changed' | 'Potential Inconsistency' | 'Missing';
  notes: string;
}

export interface InvestmentAssessmentData {
  businessQualityScore: number;
  financialStrengthScore: number;
  growthIndicatorScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  opportunityLevel: 'High Conviction' | 'Moderate' | 'Selective';
  overallScore: number;
  positiveIndicators: string[];
  areasRequiringReview: string[];
  potentialOpportunities: string[];
  risksToMonitor: string[];
  overallThesis: string;
}

export interface CompanyAnalysisData {
  companyName: string;
  ticker: string;
  currency: CurrencyCode;
  executiveSummary: string;
  businessModelSummary: string;
  competitivePositionSummary: string;
  grossMarginMoat: string;
  industryContext: string;
  cagrLabel: string;
  metrics: {
    revenue: number;
    revenueGrowth: number;
    ebitda: number;
    netProfit: number;
    eps: number;
    netDebt: number;
    cashAndEquivalents: number;
    operatingMargin: number;
  };
  trajectory: { year: string; revenue: number; ebitda: number }[];
  segments: { name: string; sharePercent: number; revenueLabel: string; description: string }[];
}

export interface ProjectDueDiligenceAnalysis {
  projectId: string;
  analyzedAt: string;
  documentNames: string[];
  isDemoFallback: boolean;
  fallbackReason?: string;
  companyAnalysis: CompanyAnalysisData;
  risks: DetailedRisk[];
  opportunities: DetailedOpportunity[];
  crossDocComparison: CrossDocComparisonMetric[];
  investmentAssessment: InvestmentAssessmentData;
}

export interface BuySellAdvisory {
  ticker: string;
  companyName: string;
  currency: CurrencyCode;
  action: 'Buy' | 'Hold' | 'Sell';
  signalLabel: 'Strong Buy' | 'Accumulate' | 'Hold' | 'Trim' | 'Sell';
  confidenceScore: number;
  currentPrice: number;
  targetPriceLow: number;
  targetPriceHigh: number;
  upsidePercent: number;
  rationaleSummary: string;
  bullCase: string[];
  bearCase: string[];
  riskFlags: string[];
  fundamentalsUsed: {
    latestFYLabel?: string;
    latestFYRevenue?: string;
    latestFYProfitOrLoss?: string;
    isProfit?: boolean;
    peRatio?: number;
    pbRatio?: number;
    vdrGrounded: boolean;
  };
  isDemoFallback: boolean;
  generatedAt: string;
}

export interface CompanyFYResult {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  currency: CurrencyCode;
  currentPrice: number | null;
  changePercent: number | null;
  marketCap: string;
  latestFYLabel: string;
  latestFYRevenue: string;
  latestFYProfitOrLoss: string;
  isProfit: boolean | null;
  yoyGrowth: string;
  netMargin: string;
  summary: string;
  profitExplanation: string;
  keyFinancials: {
    year: string;
    revenue: string;
    netProfit: string;
    patGrowth: string;
  }[];
  profitDrivers: string[];
  advisoryVerdict: 'Buy' | 'Hold' | 'Sell';
  advisoryConfidence: number;
  isLiveMarketData: boolean;
}

export interface UserSettings {
  model: string;
  temperature: number;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  vdrSync: boolean;
  liveMarketSync: boolean;
  updatedAt: string;
}

import { GoogleGenAI } from '@google/genai';
import {
  CompanyFundamentalSnapshot,
  MarketCapTier,
  MarketUniverse,
  TerminalAllocationPick,
  TerminalProjectionPoint,
  TerminalRecommendRequest,
  TerminalRecommendResponse,
} from '@/types';
import { getGeminiApiKey } from '../config/env';
import { withServerCache } from '../cache/server-cache';
import { getSettings } from '../storage/app-storage';
import {
  cleanDisplayTicker,
  fetchChartSeries,
  fetchLiveQuote,
  formatCompactMarketCap,
  getYahooClient,
} from './market-service';

interface CuratedSeed {
  yahooSymbol: string;
  name: string;
  sector: string;
  fallbackTier: MarketCapTier;
  fallbackPrice: number;
  fallbackCapRaw: number;
  fallbackPe: number;
  fallbackPb: number;
  fallbackRoe: number;
  fallbackMargin: number;
  fallbackRevGrowth: number;
  fallbackDebtToEquity: number;
  fallbackDivYield: number;
  fallbackCagr1y: number;
  fallbackCagr3y: number;
  fallbackCagr5y: number;
}

const INDIA_UNIVERSE_SEEDS: CuratedSeed[] = [
  // Large Cap (>= ₹20,000 Cr)
  { yahooSymbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT Services', fallbackTier: 'Large Cap', fallbackPrice: 2513, fallbackCapRaw: 9.09e12, fallbackPe: 17.6, fallbackPb: 9.5, fallbackRoe: 46.2, fallbackMargin: 19.4, fallbackRevGrowth: 8.5, fallbackDebtToEquity: 8.2, fallbackDivYield: 2.1, fallbackCagr1y: 12.4, fallbackCagr3y: 14.2, fallbackCagr5y: 15.8 },
  { yahooSymbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', sector: 'Energy, Telecom & Retail', fallbackTier: 'Large Cap', fallbackPrice: 1320, fallbackCapRaw: 17.8e12, fallbackPe: 24.8, fallbackPb: 2.3, fallbackRoe: 9.6, fallbackMargin: 7.4, fallbackRevGrowth: 11.2, fallbackDebtToEquity: 41.5, fallbackDivYield: 0.4, fallbackCagr1y: 14.5, fallbackCagr3y: 15.6, fallbackCagr5y: 16.4 },
  { yahooSymbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', sector: 'Private Banking', fallbackTier: 'Large Cap', fallbackPrice: 1690, fallbackCapRaw: 12.9e12, fallbackPe: 18.8, fallbackPb: 2.6, fallbackRoe: 16.2, fallbackMargin: 21.8, fallbackRevGrowth: 14.8, fallbackDebtToEquity: 0, fallbackDivYield: 1.2, fallbackCagr1y: 15.1, fallbackCagr3y: 13.8, fallbackCagr5y: 14.5 },
  { yahooSymbol: 'INFY.NS', name: 'Infosys Limited', sector: 'IT & Digital Cloud', fallbackTier: 'Large Cap', fallbackPrice: 1485, fallbackCapRaw: 6.15e12, fallbackPe: 22.4, fallbackPb: 6.8, fallbackRoe: 31.4, fallbackMargin: 16.6, fallbackRevGrowth: 7.9, fallbackDebtToEquity: 9.8, fallbackDivYield: 2.4, fallbackCagr1y: 13.6, fallbackCagr3y: 13.9, fallbackCagr5y: 15.2 },
  { yahooSymbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', sector: 'Private Banking', fallbackTier: 'Large Cap', fallbackPrice: 1280, fallbackCapRaw: 9.0e12, fallbackPe: 18.4, fallbackPb: 3.1, fallbackRoe: 18.5, fallbackMargin: 24.2, fallbackRevGrowth: 17.4, fallbackDebtToEquity: 0, fallbackDivYield: 0.8, fallbackCagr1y: 18.2, fallbackCagr3y: 19.4, fallbackCagr5y: 18.8 },
  { yahooSymbol: 'LT.NS', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure & EPC', fallbackTier: 'Large Cap', fallbackPrice: 3560, fallbackCapRaw: 4.9e12, fallbackPe: 32.5, fallbackPb: 5.4, fallbackRoe: 15.8, fallbackMargin: 6.2, fallbackRevGrowth: 16.5, fallbackDebtToEquity: 122.0, fallbackDivYield: 0.9, fallbackCagr1y: 16.4, fallbackCagr3y: 21.2, fallbackCagr5y: 19.6 },

  // Mid Cap (₹5,000 Cr – ₹20,000 Cr)
  { yahooSymbol: 'CROMPTON.NS', name: 'Crompton Greaves Consumer', sector: 'Consumer Electricals', fallbackTier: 'Mid Cap', fallbackPrice: 345, fallbackCapRaw: 1.95e11, fallbackPe: 36.2, fallbackPb: 6.4, fallbackRoe: 16.9, fallbackMargin: 6.8, fallbackRevGrowth: 11.4, fallbackDebtToEquity: 18.5, fallbackDivYield: 0.9, fallbackCagr1y: 15.2, fallbackCagr3y: 13.4, fallbackCagr5y: 14.1 },
  { yahooSymbol: 'BATAINDIA.NS', name: 'Bata India Limited', sector: 'Consumer Footwear', fallbackTier: 'Mid Cap', fallbackPrice: 1340, fallbackCapRaw: 1.72e11, fallbackPe: 48.0, fallbackPb: 10.2, fallbackRoe: 19.4, fallbackMargin: 8.6, fallbackRevGrowth: 6.8, fallbackDebtToEquity: 84.0, fallbackDivYield: 1.1, fallbackCagr1y: 9.4, fallbackCagr3y: 10.8, fallbackCagr5y: 11.5 },
  { yahooSymbol: 'CYIENT.NS', name: 'Cyient Limited', sector: 'Engineering R&D / IT', fallbackTier: 'Mid Cap', fallbackPrice: 1580, fallbackCapRaw: 1.75e11, fallbackPe: 25.6, fallbackPb: 3.9, fallbackRoe: 16.4, fallbackMargin: 9.8, fallbackRevGrowth: 10.5, fallbackDebtToEquity: 19.2, fallbackDivYield: 1.6, fallbackCagr1y: 14.8, fallbackCagr3y: 18.6, fallbackCagr5y: 19.2 },
  { yahooSymbol: 'CHAMBLFERT.NS', name: 'Chambal Fertilisers & Chemicals', sector: 'Agri Inputs & Chemicals', fallbackTier: 'Mid Cap', fallbackPrice: 495, fallbackCapRaw: 1.98e11, fallbackPe: 14.2, fallbackPb: 2.3, fallbackRoe: 17.5, fallbackMargin: 7.9, fallbackRevGrowth: 8.4, fallbackDebtToEquity: 24.0, fallbackDivYield: 1.5, fallbackCagr1y: 19.5, fallbackCagr3y: 17.2, fallbackCagr5y: 18.4 },
  { yahooSymbol: 'GRANULES.NS', name: 'Granules India Limited', sector: 'Pharmaceuticals', fallbackTier: 'Mid Cap', fallbackPrice: 540, fallbackCapRaw: 1.31e11, fallbackPe: 24.5, fallbackPb: 3.6, fallbackRoe: 15.2, fallbackMargin: 10.4, fallbackRevGrowth: 12.8, fallbackDebtToEquity: 35.4, fallbackDivYield: 0.3, fallbackCagr1y: 21.0, fallbackCagr3y: 18.5, fallbackCagr5y: 17.8 },
  { yahooSymbol: 'FINPIPE.NS', name: 'Finolex Industries Ltd', sector: 'Building Materials', fallbackTier: 'Mid Cap', fallbackPrice: 242, fallbackCapRaw: 1.5e11, fallbackPe: 26.8, fallbackPb: 2.6, fallbackRoe: 11.8, fallbackMargin: 11.2, fallbackRevGrowth: 9.6, fallbackDebtToEquity: 7.4, fallbackDivYield: 1.1, fallbackCagr1y: 16.8, fallbackCagr3y: 15.4, fallbackCagr5y: 16.1 },

  // Small Cap (< ₹5,000 Cr)
  { yahooSymbol: 'TANLA.NS', name: 'Tanla Platforms Limited', sector: 'CPaaS / Enterprise Tech', fallbackTier: 'Small Cap', fallbackPrice: 680, fallbackCapRaw: 9.1e10, fallbackPe: 18.4, fallbackPb: 4.1, fallbackRoe: 24.6, fallbackMargin: 13.8, fallbackRevGrowth: 14.2, fallbackDebtToEquity: 4.5, fallbackDivYield: 1.7, fallbackCagr1y: 14.0, fallbackCagr3y: 16.5, fallbackCagr5y: 22.0 },
  { yahooSymbol: 'DATAMATICS.NS', name: 'Datamatics Global Services', sector: 'Digital Ops & AI', fallbackTier: 'Small Cap', fallbackPrice: 590, fallbackCapRaw: 3.48e10, fallbackPe: 18.2, fallbackPb: 2.7, fallbackRoe: 16.2, fallbackMargin: 12.1, fallbackRevGrowth: 11.8, fallbackDebtToEquity: 6.2, fallbackDivYield: 0.9, fallbackCagr1y: 17.5, fallbackCagr3y: 20.4, fallbackCagr5y: 22.8 },
  { yahooSymbol: 'TEGA.NS', name: 'Tega Industries Limited', sector: 'Mining Consumables', fallbackTier: 'Small Cap', fallbackPrice: 1520, fallbackCapRaw: 1.01e11, fallbackPe: 42.5, fallbackPb: 7.2, fallbackRoe: 17.8, fallbackMargin: 13.2, fallbackRevGrowth: 15.4, fallbackDebtToEquity: 24.1, fallbackDivYield: 0.2, fallbackCagr1y: 22.0, fallbackCagr3y: 24.1, fallbackCagr5y: 21.5 },
  { yahooSymbol: 'PRINCEPIPE.NS', name: 'Prince Pipes and Fittings', sector: 'Building Products', fallbackTier: 'Small Cap', fallbackPrice: 410, fallbackCapRaw: 4.53e10, fallbackPe: 29.4, fallbackPb: 2.9, fallbackRoe: 11.4, fallbackMargin: 6.5, fallbackRevGrowth: 10.2, fallbackDebtToEquity: 11.8, fallbackDivYield: 0.3, fallbackCagr1y: 13.2, fallbackCagr3y: 15.8, fallbackCagr5y: 17.4 },
  { yahooSymbol: 'MASTEK.NS', name: 'Mastek Limited', sector: 'Enterprise Digital Tech', fallbackTier: 'Small Cap', fallbackPrice: 2450, fallbackCapRaw: 7.56e10, fallbackPe: 21.8, fallbackPb: 3.3, fallbackRoe: 16.8, fallbackMargin: 10.6, fallbackRevGrowth: 13.5, fallbackDebtToEquity: 22.0, fallbackDivYield: 0.8, fallbackCagr1y: 18.4, fallbackCagr3y: 17.6, fallbackCagr5y: 21.2 },
  { yahooSymbol: 'INTELLECT.NS', name: 'Intellect Design Arena', sector: 'FinTech Platforms', fallbackTier: 'Small Cap', fallbackPrice: 820, fallbackCapRaw: 1.12e11, fallbackPe: 28.5, fallbackPb: 4.2, fallbackRoe: 15.4, fallbackMargin: 13.4, fallbackRevGrowth: 14.6, fallbackDebtToEquity: 3.2, fallbackDivYield: 0.4, fallbackCagr1y: 19.1, fallbackCagr3y: 19.8, fallbackCagr5y: 22.4 },
];

const US_UNIVERSE_SEEDS: CuratedSeed[] = [
  // Large Cap (>= $10B)
  { yahooSymbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'AI Semiconductors', fallbackTier: 'Large Cap', fallbackPrice: 138, fallbackCapRaw: 3.38e12, fallbackPe: 44.2, fallbackPb: 38.4, fallbackRoe: 91.5, fallbackMargin: 55.2, fallbackRevGrowth: 78.0, fallbackDebtToEquity: 16.5, fallbackDivYield: 0.03, fallbackCagr1y: 42.0, fallbackCagr3y: 36.0, fallbackCagr5y: 34.0 },
  { yahooSymbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Cloud & Enterprise AI', fallbackTier: 'Large Cap', fallbackPrice: 425, fallbackCapRaw: 3.16e12, fallbackPe: 34.5, fallbackPb: 11.4, fallbackRoe: 36.2, fallbackMargin: 35.6, fallbackRevGrowth: 15.8, fallbackDebtToEquity: 33.0, fallbackDivYield: 0.78, fallbackCagr1y: 18.4, fallbackCagr3y: 17.6, fallbackCagr5y: 19.2 },
  { yahooSymbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Search, Cloud & AI', fallbackTier: 'Large Cap', fallbackPrice: 176, fallbackCapRaw: 2.15e12, fallbackPe: 22.8, fallbackPb: 6.9, fallbackRoe: 31.8, fallbackMargin: 27.6, fallbackRevGrowth: 14.5, fallbackDebtToEquity: 9.5, fallbackDivYield: 0.45, fallbackCagr1y: 21.5, fallbackCagr3y: 17.2, fallbackCagr5y: 18.6 },
  { yahooSymbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Cloud (AWS) & Commerce', fallbackTier: 'Large Cap', fallbackPrice: 205, fallbackCapRaw: 2.16e12, fallbackPe: 40.2, fallbackPb: 8.3, fallbackRoe: 22.4, fallbackMargin: 8.1, fallbackRevGrowth: 11.8, fallbackDebtToEquity: 54.0, fallbackDivYield: 0, fallbackCagr1y: 24.0, fallbackCagr3y: 16.5, fallbackCagr5y: 15.4 },
  { yahooSymbol: 'AAPL', name: 'Apple Inc.', sector: 'Consumer Ecosystem', fallbackTier: 'Large Cap', fallbackPrice: 228, fallbackCapRaw: 3.45e12, fallbackPe: 33.4, fallbackPb: 46.0, fallbackRoe: 145.0, fallbackMargin: 24.1, fallbackRevGrowth: 6.1, fallbackDebtToEquity: 145.0, fallbackDivYield: 0.44, fallbackCagr1y: 17.8, fallbackCagr3y: 15.2, fallbackCagr5y: 18.1 },

  // Mid Cap ($2B – $10B)
  { yahooSymbol: 'CAVA', name: 'CAVA Group Inc.', sector: 'Consumer Dining', fallbackTier: 'Mid Cap', fallbackPrice: 92, fallbackCapRaw: 9.8e9, fallbackPe: 68.0, fallbackPb: 14.2, fallbackRoe: 12.4, fallbackMargin: 6.2, fallbackRevGrowth: 28.4, fallbackDebtToEquity: 52.0, fallbackDivYield: 0, fallbackCagr1y: 24.5, fallbackCagr3y: 22.0, fallbackCagr5y: 20.0 },
  { yahooSymbol: 'GTLB', name: 'GitLab Inc.', sector: 'DevSecOps Software', fallbackTier: 'Mid Cap', fallbackPrice: 56, fallbackCapRaw: 8.9e9, fallbackPe: 52.0, fallbackPb: 11.8, fallbackRoe: 8.4, fallbackMargin: 5.5, fallbackRevGrowth: 29.5, fallbackDebtToEquity: 1.2, fallbackDivYield: 0, fallbackCagr1y: 16.2, fallbackCagr3y: 17.8, fallbackCagr5y: 18.4 },
  { yahooSymbol: 'PATH', name: 'UiPath Inc.', sector: 'Enterprise Automation', fallbackTier: 'Mid Cap', fallbackPrice: 14.5, fallbackCapRaw: 7.9e9, fallbackPe: 32.0, fallbackPb: 4.1, fallbackRoe: 4.8, fallbackMargin: 3.2, fallbackRevGrowth: 11.2, fallbackDebtToEquity: 3.4, fallbackDivYield: 0, fallbackCagr1y: 11.0, fallbackCagr3y: 12.4, fallbackCagr5y: 13.5 },
  { yahooSymbol: 'BILL', name: 'BILL Holdings Inc.', sector: 'SMB FinTech SaaS', fallbackTier: 'Mid Cap', fallbackPrice: 64, fallbackCapRaw: 6.7e9, fallbackPe: 38.4, fallbackPb: 1.8, fallbackRoe: 5.1, fallbackMargin: 3.8, fallbackRevGrowth: 17.6, fallbackDebtToEquity: 46.0, fallbackDivYield: 0, fallbackCagr1y: 14.5, fallbackCagr3y: 15.8, fallbackCagr5y: 17.0 },
  { yahooSymbol: 'CELH', name: 'Celsius Holdings Inc.', sector: 'Functional Beverages', fallbackTier: 'Mid Cap', fallbackPrice: 34, fallbackCapRaw: 7.8e9, fallbackPe: 34.2, fallbackPb: 9.8, fallbackRoe: 24.5, fallbackMargin: 14.8, fallbackRevGrowth: 21.0, fallbackDebtToEquity: 4.8, fallbackDivYield: 0, fallbackCagr1y: 15.2, fallbackCagr3y: 21.4, fallbackCagr5y: 24.0 },

  // Small Cap (< $2B)
  { yahooSymbol: 'ACMR', name: 'ACM Research Inc.', sector: 'Semiconductor Equipment', fallbackTier: 'Small Cap', fallbackPrice: 22, fallbackCapRaw: 1.38e9, fallbackPe: 13.4, fallbackPb: 1.5, fallbackRoe: 12.6, fallbackMargin: 13.5, fallbackRevGrowth: 32.0, fallbackDebtToEquity: 14.2, fallbackDivYield: 0, fallbackCagr1y: 19.5, fallbackCagr3y: 22.8, fallbackCagr5y: 21.4 },
  { yahooSymbol: 'PUBM', name: 'PubMatic Inc.', sector: 'AdTech Infrastructure', fallbackTier: 'Small Cap', fallbackPrice: 15.8, fallbackCapRaw: 7.8e8, fallbackPe: 36.2, fallbackPb: 2.6, fallbackRoe: 6.8, fallbackMargin: 5.2, fallbackRevGrowth: 11.4, fallbackDebtToEquity: 8.1, fallbackDivYield: 0, fallbackCagr1y: 14.2, fallbackCagr3y: 15.0, fallbackCagr5y: 16.2 },
  { yahooSymbol: 'MGNI', name: 'Magnite Inc.', sector: 'CTV Ad Platform', fallbackTier: 'Small Cap', fallbackPrice: 13.2, fallbackCapRaw: 1.84e9, fallbackPe: 24.5, fallbackPb: 2.4, fallbackRoe: 7.4, fallbackMargin: 4.8, fallbackRevGrowth: 12.6, fallbackDebtToEquity: 78.0, fallbackDivYield: 0, fallbackCagr1y: 17.8, fallbackCagr3y: 16.4, fallbackCagr5y: 17.5 },
  { yahooSymbol: 'OUST', name: 'Ouster Inc.', sector: 'LiDAR & Robotics Sensors', fallbackTier: 'Small Cap', fallbackPrice: 10.5, fallbackCapRaw: 5.4e8, fallbackPe: 0, fallbackPb: 2.8, fallbackRoe: -12.0, fallbackMargin: -18.0, fallbackRevGrowth: 34.0, fallbackDebtToEquity: 28.0, fallbackDivYield: 0, fallbackCagr1y: 21.0, fallbackCagr3y: 18.0, fallbackCagr5y: 18.5 },
  { yahooSymbol: 'CRSR', name: 'Corsair Gaming Inc.', sector: 'Gaming Hardware', fallbackTier: 'Small Cap', fallbackPrice: 8.6, fallbackCapRaw: 9.1e8, fallbackPe: 21.5, fallbackPb: 1.6, fallbackRoe: 6.2, fallbackMargin: 2.8, fallbackRevGrowth: 8.5, fallbackDebtToEquity: 35.0, fallbackDivYield: 0, fallbackCagr1y: 11.4, fallbackCagr3y: 12.8, fallbackCagr5y: 13.6 },
];

/**
 * Classifies a company into Large / Mid / Small Cap using live market capitalization.
 * India thresholds: Large >= ₹20,000 Cr, Mid ₹5,000–₹20,000 Cr, Small < ₹5,000 Cr.
 * US thresholds: Large >= $10B, Mid $2B–$10B, Small < $2B.
 */
export function classifyMarketCapTier(
  marketCapRaw: number,
  universe: MarketUniverse,
  fallbackTier: MarketCapTier
): MarketCapTier {
  if (!marketCapRaw || !Number.isFinite(marketCapRaw) || marketCapRaw <= 0) {
    return fallbackTier;
  }
  if (universe === 'IN') {
    const crores = marketCapRaw / 1e7;
    if (crores >= 20000) return 'Large Cap';
    if (crores >= 5000) return 'Mid Cap';
    return 'Small Cap';
  }
  if (marketCapRaw >= 10e9) return 'Large Cap';
  if (marketCapRaw >= 2e9) return 'Mid Cap';
  return 'Small Cap';
}

function annualizeCagr(startPrice: number, endPrice: number, years: number): number {
  if (!startPrice || !endPrice || startPrice <= 0 || endPrice <= 0 || years <= 0) return 0;
  const raw = (Math.pow(endPrice / startPrice, 1 / years) - 1) * 100;
  return Number(Math.max(-35, Math.min(60, raw)).toFixed(1));
}

function scoreAndProjectCompany(
  input: Omit<CompanyFundamentalSnapshot, 'fundamentalScore' | 'expectedAnnualReturnPercent' | 'riskLevel' | 'verdict' | 'rationale'>
): CompanyFundamentalSnapshot {
  let score = 52;

  if (input.roePercent >= 20) score += 14;
  else if (input.roePercent >= 14) score += 9;
  else if (input.roePercent >= 8) score += 4;
  else if (input.roePercent < 0) score -= 12;

  if (input.netMarginPercent >= 15) score += 10;
  else if (input.netMarginPercent >= 8) score += 6;
  else if (input.netMarginPercent < 0) score -= 10;

  if (input.revenueGrowthPercent >= 18) score += 10;
  else if (input.revenueGrowthPercent >= 10) score += 6;
  else if (input.revenueGrowthPercent < 3) score -= 4;

  if (input.peRatio > 0 && input.peRatio <= 26) score += 9;
  else if (input.peRatio > 26 && input.peRatio <= 40) score += 4;
  else if (input.peRatio > 55) score -= 6;
  else if (input.peRatio <= 0) score -= 6;

  if (input.debtToEquity <= 30) score += 6;
  else if (input.debtToEquity > 100) score -= 6;

  if (input.cagr3y >= 15) score += 5;

  const fundamentalScore = Math.max(30, Math.min(97, Math.round(score)));

  // Blend historical multi-year CAGR with fundamental quality, damped conservatively
  const histAnchor = input.cagr5y !== 0
    ? input.cagr3y * 0.55 + input.cagr5y * 0.45
    : input.cagr1y * 0.5 + input.revenueGrowthPercent * 0.5;
  const dampedHist = Math.max(7, Math.min(26, histAnchor * 0.72 + 4.2));
  const qualityAdj = (fundamentalScore - 65) * 0.14;
  const capAdj = input.capTier === 'Small Cap' ? 1.4 : input.capTier === 'Mid Cap' ? 0.8 : 0;
  const valuationPenalty = input.peRatio > 50 ? -1.5 : input.peRatio > 0 && input.peRatio < 22 ? 1.0 : 0;

  const expectedAnnualReturnPercent = Number(
    Math.max(7.5, Math.min(27.5, dampedHist + qualityAdj + capAdj + valuationPenalty)).toFixed(1)
  );

  const riskLevel: 'Low' | 'Moderate' | 'High' =
    input.capTier === 'Large Cap' && input.debtToEquity < 60 && input.netMarginPercent > 5
      ? 'Low'
      : input.capTier === 'Small Cap' || input.netMarginPercent < 0 || input.debtToEquity > 110
      ? 'High'
      : 'Moderate';

  const verdict: 'Strong Buy' | 'Accumulate' | 'Hold' =
    fundamentalScore >= 78 && expectedAnnualReturnPercent >= 14
      ? 'Strong Buy'
      : fundamentalScore >= 64
      ? 'Accumulate'
      : 'Hold';

  const rationale = `${input.capTier} ${input.sector} leader • ROE ${input.roePercent.toFixed(1)}%, Net Margin ${input.netMarginPercent.toFixed(1)}%, Rev Growth ${input.revenueGrowthPercent.toFixed(1)}% at ${input.peRatio > 0 ? `${input.peRatio.toFixed(1)}x P/E` : 'growth multiple'}.`;

  return {
    ...input,
    fundamentalScore,
    expectedAnnualReturnPercent,
    riskLevel,
    verdict,
    rationale,
  };
}

async function fetchSingleCompanySnapshot(
  seed: CuratedSeed,
  universe: MarketUniverse
): Promise<CompanyFundamentalSnapshot> {
  const currency = universe === 'IN' ? 'INR' : 'USD';
  const ticker = cleanDisplayTicker(seed.yahooSymbol);

  try {
    const fiveYearsAgo = new Date(Date.now() - 5 * 365 * 86400000);
    const yf = getYahooClient();

    const [quote, summary, monthlySeries] = await Promise.all([
      fetchLiveQuote(seed.yahooSymbol),
      yf
        .quoteSummary(seed.yahooSymbol, {
          modules: ['financialData', 'defaultKeyStatistics', 'assetProfile'],
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch(() => null) as Promise<any>,
      fetchChartSeries(seed.yahooSymbol, fiveYearsAgo, '1mo'),
    ]);

    if (!quote) {
      throw new Error('No live quote');
    }

    const fin = summary?.financialData;
    const stats = summary?.defaultKeyStatistics;
    const sector = summary?.assetProfile?.sector || seed.sector;

    const roePercent =
      typeof fin?.returnOnEquity === 'number'
        ? Number((fin.returnOnEquity * 100).toFixed(1))
        : seed.fallbackRoe;
    const netMarginPercent =
      typeof fin?.profitMargins === 'number'
        ? Number((fin.profitMargins * 100).toFixed(1))
        : seed.fallbackMargin;
    const revenueGrowthPercent =
      typeof fin?.revenueGrowth === 'number'
        ? Number((fin.revenueGrowth * 100).toFixed(1))
        : seed.fallbackRevGrowth;
    const debtToEquity =
      typeof fin?.debtToEquity === 'number'
        ? Number(fin.debtToEquity.toFixed(1))
        : seed.fallbackDebtToEquity;
    const pbRatio =
      quote.pbRatio > 0
        ? quote.pbRatio
        : typeof stats?.priceToBook === 'number'
        ? Number(stats.priceToBook.toFixed(2))
        : seed.fallbackPb;

    let cagr1y = seed.fallbackCagr1y;
    let cagr3y = seed.fallbackCagr3y;
    let cagr5y = seed.fallbackCagr5y;

    if (monthlySeries.length >= 13) {
      const last = monthlySeries[monthlySeries.length - 1].close;
      const p1y = monthlySeries[Math.max(0, monthlySeries.length - 13)].close;
      cagr1y = annualizeCagr(p1y, last, 1);
      if (monthlySeries.length >= 37) {
        const p3y = monthlySeries[Math.max(0, monthlySeries.length - 37)].close;
        cagr3y = annualizeCagr(p3y, last, 3);
      }
      if (monthlySeries.length >= 55) {
        const p5y = monthlySeries[0].close;
        cagr5y = annualizeCagr(p5y, last, monthlySeries.length / 12);
      }
    }

    const capTier = classifyMarketCapTier(quote.marketCapRaw, universe, seed.fallbackTier);

    return scoreAndProjectCompany({
      ticker,
      yahooSymbol: seed.yahooSymbol,
      name: quote.name || seed.name,
      sector,
      universe,
      currency,
      price: quote.price,
      changePercent1d: quote.changePercent,
      marketCapValue: quote.marketCapRaw || seed.fallbackCapRaw,
      marketCapFormatted: quote.marketCap !== 'N/A' ? quote.marketCap : formatCompactMarketCap(seed.fallbackCapRaw, currency),
      capTier,
      peRatio: quote.peRatio > 0 ? quote.peRatio : seed.fallbackPe,
      pbRatio,
      roePercent,
      netMarginPercent,
      revenueGrowthPercent,
      debtToEquity,
      dividendYieldPercent: quote.dividendYield || seed.fallbackDivYield,
      week52High: quote.week52High,
      week52Low: quote.week52Low,
      cagr1y,
      cagr3y,
      cagr5y,
      isLive: true,
    });
  } catch {
    return scoreAndProjectCompany({
      ticker,
      yahooSymbol: seed.yahooSymbol,
      name: seed.name,
      sector: seed.sector,
      universe,
      currency,
      price: seed.fallbackPrice,
      changePercent1d: 0.85,
      marketCapValue: seed.fallbackCapRaw,
      marketCapFormatted: formatCompactMarketCap(seed.fallbackCapRaw, currency),
      capTier: seed.fallbackTier,
      peRatio: seed.fallbackPe,
      pbRatio: seed.fallbackPb,
      roePercent: seed.fallbackRoe,
      netMarginPercent: seed.fallbackMargin,
      revenueGrowthPercent: seed.fallbackRevGrowth,
      debtToEquity: seed.fallbackDebtToEquity,
      dividendYieldPercent: seed.fallbackDivYield,
      week52High: Number((seed.fallbackPrice * 1.16).toFixed(2)),
      week52Low: Number((seed.fallbackPrice * 0.78).toFixed(2)),
      cagr1y: seed.fallbackCagr1y,
      cagr3y: seed.fallbackCagr3y,
      cagr5y: seed.fallbackCagr5y,
      isLive: false,
    });
  }
}

export async function fetchTerminalUniverse(universe: MarketUniverse): Promise<{
  companies: CompanyFundamentalSnapshot[];
  isLiveMarketData: boolean;
}> {
  const seeds = universe === 'IN' ? INDIA_UNIVERSE_SEEDS : US_UNIVERSE_SEEDS;
  return withServerCache(`terminal-universe:${universe}`, 15 * 60 * 1000, async () => {
    const results: CompanyFundamentalSnapshot[] = [];
    const batchSize = 6;
    for (let i = 0; i < seeds.length; i += batchSize) {
      const batch = seeds.slice(i, i + batchSize);
      const batchSnapshots = await Promise.all(
        batch.map((seed) => fetchSingleCompanySnapshot(seed, universe))
      );
      results.push(...batchSnapshots);
    }
    const isLiveMarketData = results.some((c) => c.isLive);
    return { companies: results, isLiveMarketData };
  });
}

function computeCapSplit(
  durationYears: number,
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive'
): { largeCapPct: number; midCapPct: number; smallCapPct: number } {
  let largeCapPct = 50;
  let midCapPct = 30;
  let smallCapPct = 20;

  if (riskTolerance === 'Conservative') {
    largeCapPct = durationYears >= 7 ? 65 : 75;
    midCapPct = durationYears >= 7 ? 25 : 20;
    smallCapPct = durationYears >= 7 ? 10 : 5;
  } else if (riskTolerance === 'Aggressive') {
    largeCapPct = durationYears >= 5 ? 35 : 45;
    midCapPct = durationYears >= 5 ? 35 : 35;
    smallCapPct = durationYears >= 5 ? 30 : 20;
  } else {
    // Moderate
    if (durationYears <= 2) {
      largeCapPct = 65;
      midCapPct = 25;
      smallCapPct = 10;
    } else if (durationYears >= 7) {
      largeCapPct = 45;
      midCapPct = 33;
      smallCapPct = 22;
    }
  }

  return { largeCapPct, midCapPct, smallCapPct };
}

export function compoundCorpus(
  lumpSum: number,
  monthlySip: number,
  annualRatePercent: number,
  years: number
): number {
  const monthlyRate = annualRatePercent / 100 / 12;
  let balance = Math.max(0, lumpSum);
  const totalMonths = Math.max(1, Math.round(years * 12));
  for (let m = 0; m < totalMonths; m++) {
    balance = (balance + Math.max(0, monthlySip)) * (1 + monthlyRate);
  }
  return Math.round(balance);
}

function rankCompaniesForHorizon(
  list: CompanyFundamentalSnapshot[],
  durationYears: number,
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive'
): CompanyFundamentalSnapshot[] {
  const returnWeight = riskTolerance === 'Aggressive' ? 1.6 : durationYears >= 5 ? 1.3 : 0.9;
  const qualityWeight = riskTolerance === 'Conservative' ? 1.2 : 0.85;

  return [...list].sort((a, b) => {
    const scoreA = a.expectedAnnualReturnPercent * returnWeight + a.fundamentalScore * qualityWeight * 0.25;
    const scoreB = b.expectedAnnualReturnPercent * returnWeight + b.fundamentalScore * qualityWeight * 0.25;
    return scoreB - scoreA;
  });
}

function buildPicksForBucket(
  ranked: CompanyFundamentalSnapshot[],
  bucketPct: number,
  lumpSum: number,
  monthlySip: number,
  durationYears: number
): TerminalAllocationPick[] {
  if (bucketPct <= 0 || ranked.length === 0) return [];
  const chosen = ranked.slice(0, bucketPct >= 25 ? 2 : 1);
  const perStockPct = Number((bucketPct / chosen.length).toFixed(1));

  return chosen.map((company) => {
    const allocLump = Math.round((lumpSum * perStockPct) / 100);
    const allocSip = Math.round((monthlySip * perStockPct) / 100);
    const totalInvestedForPick = allocLump + allocSip * durationYears * 12;
    const projectedValueBase = compoundCorpus(
      allocLump,
      allocSip,
      company.expectedAnnualReturnPercent,
      durationYears
    );
    return {
      company,
      allocationPercent: perStockPct,
      allocatedLumpSum: allocLump,
      allocatedMonthlySip: allocSip,
      totalInvestedForPick,
      projectedValueBase,
      projectedGainBase: projectedValueBase - totalInvestedForPick,
    };
  });
}

/**
 * Generates a complete Investment Advisory Terminal recommendation across
 * Large Cap, Mid Cap, and Small Cap companies with live fundamentals & compounding.
 */
export async function buildTerminalRecommendation(
  req: TerminalRecommendRequest
): Promise<TerminalRecommendResponse> {
  const universe: MarketUniverse = req.universe === 'US' ? 'US' : 'IN';
  const currency = universe === 'IN' ? 'INR' : 'USD';
  const lumpSum = Math.max(0, Number(req.lumpSum) || 0);
  const monthlySip = Math.max(0, Number(req.monthlySip) || 0);
  const durationYears = Math.max(1, Math.min(25, Math.round(Number(req.durationYears) || 5)));
  const riskTolerance = req.riskTolerance || 'Moderate';

  const { companies, isLiveMarketData } = await fetchTerminalUniverse(universe);

  const largeCap = rankCompaniesForHorizon(
    companies.filter((c) => c.capTier === 'Large Cap'),
    durationYears,
    riskTolerance
  );
  const midCap = rankCompaniesForHorizon(
    companies.filter((c) => c.capTier === 'Mid Cap'),
    durationYears,
    riskTolerance
  );
  const smallCap = rankCompaniesForHorizon(
    companies.filter((c) => c.capTier === 'Small Cap'),
    durationYears,
    riskTolerance
  );

  const recommendedSplit = computeCapSplit(durationYears, riskTolerance);

  const topPortfolioPicks = [
    ...buildPicksForBucket(largeCap, recommendedSplit.largeCapPct, lumpSum, monthlySip, durationYears),
    ...buildPicksForBucket(midCap, recommendedSplit.midCapPct, lumpSum, monthlySip, durationYears),
    ...buildPicksForBucket(smallCap, recommendedSplit.smallCapPct, lumpSum, monthlySip, durationYears),
  ];

  const totalPct = topPortfolioPicks.reduce((s, p) => s + p.allocationPercent, 0) || 100;
  const blendedCagrPercent = Number(
    (
      topPortfolioPicks.reduce(
        (sum, p) => sum + p.company.expectedAnnualReturnPercent * p.allocationPercent,
        0
      ) / totalPct
    ).toFixed(1)
  );

  const conservativeRate = Math.max(5.5, Number((blendedCagrPercent - 3.5).toFixed(1)));
  const optimisticRate = Math.min(32.0, Number((blendedCagrPercent + 3.5).toFixed(1)));

  const yearlyProjectionChart: TerminalProjectionPoint[] = [];
  for (let yr = 0; yr <= durationYears; yr++) {
    if (yr === 0) {
      yearlyProjectionChart.push({
        year: 'Yr 0',
        invested: Math.round(lumpSum),
        conservative: Math.round(lumpSum),
        expected: Math.round(lumpSum),
        optimistic: Math.round(lumpSum),
      });
    } else {
      yearlyProjectionChart.push({
        year: `Yr ${yr}`,
        invested: Math.round(lumpSum + monthlySip * yr * 12),
        conservative: compoundCorpus(lumpSum, monthlySip, conservativeRate, yr),
        expected: compoundCorpus(lumpSum, monthlySip, blendedCagrPercent, yr),
        optimistic: compoundCorpus(lumpSum, monthlySip, optimisticRate, yr),
      });
    }
  }

  const finalPt = yearlyProjectionChart[yearlyProjectionChart.length - 1];
  const totalInvested = finalPt.invested;
  const expectedCorpus = finalPt.expected;
  const expectedGain = expectedCorpus - totalInvested;
  const expectedGainPercent =
    totalInvested > 0 ? Number(((expectedGain / totalInvested) * 100).toFixed(1)) : 0;

  let aiCommentary = `For a ${durationYears}-year ${riskTolerance.toLowerCase()} mandate in ${
    universe === 'IN' ? 'Indian NSE equities' : 'US equities'
  }, the model allocates ${recommendedSplit.largeCapPct}% Large Cap for core stability, ${
    recommendedSplit.midCapPct
  }% Mid Cap for earnings compounding, and ${
    recommendedSplit.smallCapPct
  }% Small Cap for alpha expansion — targeting a blended ~${blendedCagrPercent}% annualized return across high-ROE, profitable leaders.`;

  const apiKey = getGeminiApiKey();
  if (apiKey && topPortfolioPicks.length > 0) {
    const cacheKey = `terminal-ai:${universe}:${durationYears}:${riskTolerance}:${topPortfolioPicks
      .map((p) => p.company.ticker)
      .join(',')}`;
    aiCommentary = await withServerCache(cacheKey, 20 * 60 * 1000, async () => {
      try {
        const settings = getSettings();
        const modelName = settings.model.toLowerCase().includes('pro')
          ? 'gemini-3.1-pro-preview'
          : 'gemini-3-flash-preview';
        const aiClient = new GoogleGenAI({ apiKey });
        const picksDesc = topPortfolioPicks
          .map(
            (p) =>
              `${p.company.ticker} (${p.company.capTier}, ${p.allocationPercent}%, ROE ${p.company.roePercent}%, P/E ${p.company.peRatio}x, Est. Return ${p.company.expectedAnnualReturnPercent}%)`
          )
          .join('; ');
        const prompt = `You are AURA, an institutional investment advisor. Write a crisp 3-sentence portfolio construction commentary for a ${durationYears}-year ${riskTolerance} investor deploying ${currency} ${lumpSum} lump sum + ${currency} ${monthlySip}/mo SIP across: ${picksDesc}. Mention why the Large/Mid/Small Cap split (${recommendedSplit.largeCapPct}/${recommendedSplit.midCapPct}/${recommendedSplit.smallCapPct}%) fits the ${durationYears}-year horizon and highlight key fundamental strengths and risks.`;
        const res = await aiClient.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { temperature: 0.2 },
        });
        return res.text?.trim() || aiCommentary;
      } catch {
        return aiCommentary;
      }
    });
  }

  return {
    universe,
    currency,
    lumpSum,
    monthlySip,
    durationYears,
    riskTolerance,
    recommendedSplit,
    projectedSummary: {
      totalInvested,
      conservativeCorpus: finalPt.conservative,
      expectedCorpus,
      optimisticCorpus: finalPt.optimistic,
      expectedGain,
      expectedGainPercent,
      blendedCagrPercent,
    },
    yearlyProjectionChart,
    buckets: {
      largeCap,
      midCap,
      smallCap,
    },
    topPortfolioPicks,
    aiCommentary,
    isLiveMarketData,
    generatedAt: new Date().toISOString(),
  };
}

import YahooFinancePkg from 'yahoo-finance2';
import {
  CompanyFYResult,
  CurrencyCode,
  ETFItem,
  ExtendedStockDetail,
  GoldAnalysis,
  MarketIndex,
  OpportunityCardItem,
  OpportunityRadarSignal,
  SectorPerformance,
  StockComparisonData,
  WhatMovedToday,
} from '@/types';
import { withServerCache } from '../cache/server-cache';
import { COMPANY_PROFILES, searchCompanies as searchStaticCompanies } from '../companyData';
import {
  MOCK_ETFS,
  MOCK_EXTENDED_STOCKS,
  MOCK_GOLD_ANALYSIS,
  MOCK_MARKET_INDICES,
  MOCK_OPPORTUNITY_CARDS,
  MOCK_RADAR_SIGNALS,
  MOCK_SECTOR_PERFORMANCE,
  MOCK_WHAT_MOVED_TODAY,
} from '../mockData';
import { formatCurrency, inferCurrencyFromTicker } from '../utils';

// Support both yahoo-finance2 v2 (singleton) and v3 (constructor)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let yfInstance: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getYF(): any {
  if (yfInstance) return yfInstance;
  try {
    if (typeof YahooFinancePkg === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctor = YahooFinancePkg as any;
      yfInstance = new Ctor({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });
    } else {
      yfInstance = YahooFinancePkg;
    }
  } catch {
    yfInstance = YahooFinancePkg;
  }
  return yfInstance;
}

const KNOWN_INDIAN_NSE_SYMBOLS = new Set([
  'TCS',
  'RELIANCE',
  'TATAMOTORS',
  'MARUTI',
  'INFY',
  'HDFCBANK',
  'ICICIBANK',
  'SBIN',
  'WIPRO',
  'HCLTECH',
  'ITC',
  'LT',
  'BHARTIARTL',
  'SUNPHARMA',
  'ADANIENT',
  'ADANIPORTS',
  'BAJFINANCE',
  'ASIANPAINT',
  'AXISBANK',
  'KOTAKBANK',
  'TITAN',
  'HINDUNILVR',
  'ZOMATO',
  'ETERNAL',
  'TATASTEEL',
  'NTPC',
  'ONGC',
  'COALINDIA',
  'POWERGRID',
  'M&M',
  'ULTRACEMCO',
  'NESTLEIND',
  'DRREDDY',
  'CIPLA',
  'JSWSTEEL',
  'BAJAJ-AUTO',
  'HEROMOTOCO',
  'EICHERMOT',
  'INDIGO',
  'TRENT',
  'HAL',
  'BEL',
]);

export function resolveYahooSymbol(rawTicker: string): string {
  const clean = (rawTicker || '').trim().toUpperCase();
  if (!clean) return 'TCS.NS';
  if (clean === 'NIFTY' || clean === 'NIFTY 50') return '^NSEI';
  if (clean === 'SENSEX') return '^BSESN';
  if (clean === 'SPX' || clean === 'S&P500') return '^GSPC';
  if (clean === 'IXIC' || clean === 'NASDAQ') return '^IXIC';
  if (clean === 'GOLD' || clean === 'XAU' || clean === 'XAU/USD') return 'GC=F';
  if (clean === 'US10Y') return '^TNX';
  if (clean === 'TATAMOTORS') return 'TMCV.NS';
  if (clean === 'ZOMATO') return 'ETERNAL.NS';
  if (clean.includes('.') || clean.startsWith('^') || clean.includes('=')) return clean;
  if (KNOWN_INDIAN_NSE_SYMBOLS.has(clean)) return `${clean}.NS`;
  return clean;
}

export function cleanDisplayTicker(yahooSymbol: string): string {
  return yahooSymbol.replace(/\.(NS|BO)$/i, '');
}

function currencyFromQuote(symbol: string, rawCurrency?: string): CurrencyCode {
  if (rawCurrency === 'INR') return 'INR';
  if (rawCurrency === 'USD') return 'USD';
  return inferCurrencyFromTicker(symbol);
}

function formatCompactMarketCap(cap: number | undefined, currency: CurrencyCode): string {
  if (!cap || !Number.isFinite(cap)) return 'N/A';
  if (currency === 'INR') {
    const crores = cap / 1e7;
    if (crores >= 100000) return `₹${(crores / 100000).toFixed(2)} Lakh Cr`;
    return `₹${Math.round(crores).toLocaleString('en-IN')} Cr`;
  }
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  return `$${(cap / 1e6).toFixed(1)}M`;
}

function formatVolume(vol: number | undefined): string {
  if (!vol || !Number.isFinite(vol)) return 'N/A';
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`;
  return String(vol);
}

export interface LiveQuoteResult {
  symbol: string;
  displayTicker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: CurrencyCode;
  marketCap: string;
  marketCapRaw: number;
  peRatio: number;
  pbRatio: number;
  dividendYield: number;
  week52High: number;
  week52Low: number;
  volume: string;
  exchange: string;
  isLive: boolean;
}

export async function fetchLiveQuote(rawTicker: string): Promise<LiveQuoteResult | null> {
  const symbol = resolveYahooSymbol(rawTicker);
  return withServerCache<LiveQuoteResult | null>(`quote:${symbol}`, 60 * 1000, async () => {
    try {
      const yf = getYF();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q: any = await yf.quote(symbol);
      if (!q || typeof q.regularMarketPrice !== 'number') return null;

      const currency = currencyFromQuote(symbol, q.currency);
      return {
        symbol,
        displayTicker: cleanDisplayTicker(symbol),
        name: q.longName || q.shortName || cleanDisplayTicker(symbol),
        price: Number(q.regularMarketPrice.toFixed(2)),
        change: Number((q.regularMarketChange || 0).toFixed(2)),
        changePercent: Number((q.regularMarketChangePercent || 0).toFixed(2)),
        currency,
        marketCap: formatCompactMarketCap(q.marketCap, currency),
        marketCapRaw: q.marketCap || 0,
        peRatio: Number((q.trailingPE || q.forwardPE || 0).toFixed(1)),
        pbRatio: Number((q.priceToBook || 0).toFixed(2)),
        dividendYield: Number(((q.dividendYield || 0) * (q.dividendYield && q.dividendYield < 0.25 ? 100 : 1)).toFixed(2)),
        week52High: Number((q.fiftyTwoWeekHigh || q.regularMarketPrice).toFixed(2)),
        week52Low: Number((q.fiftyTwoWeekLow || q.regularMarketPrice).toFixed(2)),
        volume: formatVolume(q.regularMarketVolume),
        exchange: q.fullExchangeName || q.exchange || (symbol.endsWith('.NS') ? 'NSE' : 'NASDAQ/NYSE'),
        isLive: true,
      };
    } catch (err) {
      console.warn(`[MarketService] Quote failed for ${symbol}:`, err instanceof Error ? err.message : err);
      return null;
    }
  });
}

async function fetchChartSeries(
  symbol: string,
  period1: Date,
  interval: '15m' | '1h' | '1d' | '1wk' | '1mo'
): Promise<{ time: string; close: number; volume: number }[]> {
  return withServerCache(`chart:${symbol}:${interval}:${period1.toISOString().slice(0, 10)}`, 5 * 60 * 1000, async () => {
    try {
      const yf = getYF();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await yf.chart(symbol, {
        period1,
        period2: new Date(),
        interval,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const quotes: any[] = res?.quotes || [];
      return quotes
        .filter((pt) => typeof pt.close === 'number' && pt.close > 0)
        .map((pt) => {
          const d = new Date(pt.date);
          const time =
            interval === '15m' || interval === '1h'
              ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: interval === '1mo' ? '2-digit' : undefined });
          return {
            time,
            close: Number(pt.close.toFixed(2)),
            volume: pt.volume || 0,
          };
        });
    } catch {
      return [];
    }
  });
}

function calcReturn(series: { close: number }[]): number {
  if (series.length < 2) return 0;
  const first = series[0].close;
  const last = series[series.length - 1].close;
  if (!first) return 0;
  return Number((((last - first) / first) * 100).toFixed(2));
}

export async function fetchExtendedStockDetail(rawTicker: string): Promise<ExtendedStockDetail & { isLive: boolean }> {
  const symbol = resolveYahooSymbol(rawTicker);
  const display = cleanDisplayTicker(symbol);

  return withServerCache(`ext-stock:${symbol}`, 5 * 60 * 1000, async () => {
    const quote = await fetchLiveQuote(symbol);
    const mockFallback =
      MOCK_EXTENDED_STOCKS[display] ||
      MOCK_EXTENDED_STOCKS[rawTicker.toUpperCase()] ||
      MOCK_EXTENDED_STOCKS['TCS'];

    if (!quote) {
      return {
        ...mockFallback,
        ticker: display,
        currency: inferCurrencyFromTicker(symbol),
        benchmarkName: inferCurrencyFromTicker(symbol) === 'INR' ? 'NIFTY 50' : 'S&P 500',
        isLive: false,
      };
    }

    const currency = quote.currency;
    const benchmarkSymbol = currency === 'INR' ? '^NSEI' : '^GSPC';
    const benchmarkName = currency === 'INR' ? 'NIFTY 50' : 'S&P 500';

    const now = new Date();
    const d1 = new Date(now.getTime() - 2 * 86400000);
    const d1w = new Date(now.getTime() - 8 * 86400000);
    const d1m = new Date(now.getTime() - 32 * 86400000);
    const d6m = new Date(now.getTime() - 183 * 86400000);
    const d1y = new Date(now.getTime() - 365 * 86400000);
    const d5y = new Date(now.getTime() - 5 * 365 * 86400000);

    const [s1d, s1w, s1m, s6m, s1y, s5y, b1m, b1y, summaryRes] = await Promise.all([
      fetchChartSeries(symbol, d1, '15m'),
      fetchChartSeries(symbol, d1w, '1h'),
      fetchChartSeries(symbol, d1m, '1d'),
      fetchChartSeries(symbol, d6m, '1d'),
      fetchChartSeries(symbol, d1y, '1wk'),
      fetchChartSeries(symbol, d5y, '1mo'),
      fetchChartSeries(benchmarkSymbol, d1m, '1d'),
      fetchChartSeries(benchmarkSymbol, d1y, '1wk'),
      (async () => {
        try {
          const yf = getYF();
          return await yf.quoteSummary(symbol, {
            modules: ['assetProfile', 'financialData', 'defaultKeyStatistics'],
          });
        } catch {
          return null;
        }
      })(),
    ]);

    const pairSeries = (
      main: { time: string; close: number }[],
      bench: { time: string; close: number }[]
    ) => {
      if (main.length === 0) return [];
      const baseMain = main[0].close || 1;
      const baseBench = bench[0]?.close || baseMain;
      return main.map((pt, idx) => {
        const bPt = bench[Math.min(idx, Math.max(0, bench.length - 1))];
        const normalizedBench = bPt ? Number(((bPt.close / baseBench) * baseMain).toFixed(2)) : pt.close;
        return {
          time: pt.time,
          price: pt.close,
          benchmarkPrice: normalizedBench,
        };
      });
    };

    const perf1d = quote.changePercent;
    const perf1w = calcReturn(s1w) || perf1d;
    const perf1m = calcReturn(s1m) || perf1w;
    const perf6m = calcReturn(s6m) || perf1m;
    const perf1y = calcReturn(s1y) || perf6m;
    const perf5y = calcReturn(s5y) || perf1y;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sumAny = summaryRes as any;
    const profileDesc =
      sumAny?.assetProfile?.longBusinessSummary ||
      `${quote.name} (${quote.displayTicker}) trading on ${quote.exchange}.`;
    const revGrowthPct = sumAny?.financialData?.revenueGrowth
      ? Number((sumAny.financialData.revenueGrowth * 100).toFixed(1))
      : null;
    const profitMarginsPct = sumAny?.financialData?.profitMargins
      ? Number((sumAny.financialData.profitMargins * 100).toFixed(1))
      : null;
    const roePct = sumAny?.financialData?.returnOnEquity
      ? Number((sumAny.financialData.returnOnEquity * 100).toFixed(1))
      : null;

    const growthScore = Math.max(
      35,
      Math.min(96, Math.round(60 + (revGrowthPct ?? perf1y * 0.4)))
    );
    const valueScore =
      quote.peRatio > 0
        ? Math.max(25, Math.min(95, Math.round(100 - quote.peRatio * 1.1)))
        : 60;
    const momentumScore = Math.max(25, Math.min(96, Math.round(55 + perf1m * 1.8)));
    const qualityScore = Math.max(
      40,
      Math.min(96, Math.round(65 + (roePct ? roePct * 0.5 : 12)))
    );

    const strengths = [
      profitMarginsPct !== null
        ? `Healthy net profit margin of ${profitMarginsPct}% supported by operating scale.`
        : `Trading with market cap of ${quote.marketCap} on ${quote.exchange}.`,
      revGrowthPct !== null
        ? `YoY revenue expansion running at ${revGrowthPct > 0 ? '+' : ''}${revGrowthPct}%.`
        : `1-Year stock performance at ${perf1y > 0 ? '+' : ''}${perf1y}%.`,
      roePct !== null
        ? `Return on equity (ROE) of ${roePct}% demonstrating capital efficiency.`
        : `52-week range between ${formatCurrency(quote.week52Low, 2, currency)} and ${formatCurrency(quote.week52High, 2, currency)}.`,
    ];

    const risks = [
      quote.peRatio > 40
        ? `Rich trailing valuation at ${quote.peRatio}x P/E requires sustained earnings beats.`
        : `Sensitive to sector valuation compression and interest rate shifts.`,
      `Monitor quarterly revenue margins and institutional guidance updates.`,
    ];

    const fallbackCharts = mockFallback.timeframeChartData;

    return {
      ticker: quote.displayTicker,
      name: quote.name,
      currency,
      exchange: quote.exchange,
      benchmarkName,
      benchmarkSymbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      marketCap: quote.marketCap,
      peRatio: quote.peRatio,
      pbRatio: quote.pbRatio,
      dividendYield: quote.dividendYield,
      week52High: quote.week52High,
      week52Low: quote.week52Low,
      description: profileDesc,
      chartData: s1m.map((p) => ({
        time: p.time,
        price: p.close,
        volume: p.volume,
        ma20: p.close,
      })),
      aiAnalysis: {
        growthScore,
        valueScore,
        momentumScore,
        qualityScore,
        summary: `${quote.name} (${quote.displayTicker}) currently trades at ${formatCurrency(quote.price, 2, currency)} (${perf1d >= 0 ? '+' : ''}${perf1d}% today, ${perf1y >= 0 ? '+' : ''}${perf1y}% 1Y) at ${quote.peRatio}x P/E against the ${benchmarkName} benchmark.`,
      },
      performance: {
        '1D': perf1d,
        '1W': perf1w,
        '1M': perf1m,
        '6M': perf6m,
        '1Y': perf1y,
        '5Y': perf5y,
      },
      benchmarkComparison1Y: calcReturn(b1y) || 18.5,
      strengths,
      risks,
      factorsToMonitor: [
        'Quarterly Earnings & Margin Guidance',
        `${benchmarkName} Relative Momentum`,
        'Institutional Volume & FII/DII Flows',
      ],
      timeframeChartData: {
        '1D': s1d.length > 1 ? pairSeries(s1d, b1m) : fallbackCharts['1D'],
        '1W': s1w.length > 1 ? pairSeries(s1w, b1m) : fallbackCharts['1W'],
        '1M': s1m.length > 1 ? pairSeries(s1m, b1m) : fallbackCharts['1M'],
        '6M': s6m.length > 1 ? pairSeries(s6m, b1y) : fallbackCharts['6M'],
        '1Y': s1y.length > 1 ? pairSeries(s1y, b1y) : fallbackCharts['1Y'],
        '5Y': s5y.length > 1 ? pairSeries(s5y, b1y) : fallbackCharts['5Y'],
      },
      isLive: true,
    };
  });
}

export async function fetchMarketOverview(): Promise<{
  indices: MarketIndex[];
  sectors: SectorPerformance[];
  whatMovedToday: WhatMovedToday[];
  etfs: ETFItem[];
  vix: { value: number; changePercent: number };
  fearGreed: { score: number; label: string };
  isLive: boolean;
}> {
  return withServerCache('market-overview', 90 * 1000, async () => {
    const indexDefs: {
      yahoo: string;
      symbol: string;
      name: string;
      category: MarketIndex['category'];
      currency: CurrencyCode;
    }[] = [
      { yahoo: '^NSEI', symbol: 'NIFTY 50', name: 'NSE India Benchmark', category: 'index', currency: 'INR' },
      { yahoo: '^BSESN', symbol: 'SENSEX', name: 'BSE 30 Sensitive Index', category: 'index', currency: 'INR' },
      { yahoo: '^GSPC', symbol: 'SPX', name: 'S&P 500 Index', category: 'index', currency: 'USD' },
      { yahoo: '^IXIC', symbol: 'IXIC', name: 'NASDAQ Composite', category: 'index', currency: 'USD' },
      { yahoo: 'GC=F', symbol: 'GOLD', name: 'Gold Spot (XAU/USD)', category: 'commodity', currency: 'USD' },
      { yahoo: '^TNX', symbol: 'US10Y', name: 'US 10Y Treasury Yield', category: 'yield', currency: 'USD' },
    ];

    const quotes = await Promise.all(
      indexDefs.map(async (def) => {
        const q = await fetchLiveQuote(def.yahoo);
        return { def, q };
      })
    );

    const vixQuote = await fetchLiveQuote('^VIX');
    const liveCount = quotes.filter((x) => x.q !== null).length;

    const indices: MarketIndex[] =
      liveCount > 0
        ? quotes.map(({ def, q }, idx) => {
            const fallback = MOCK_MARKET_INDICES[idx % MOCK_MARKET_INDICES.length];
            if (!q) return { ...fallback, symbol: def.symbol, name: def.name, currency: def.currency };
            return {
              symbol: def.symbol,
              name: def.name,
              value: q.price,
              change: q.change,
              changePercent: q.changePercent,
              chartData: fallback.chartData,
              category: def.category,
              currency: def.currency,
            };
          })
        : MOCK_MARKET_INDICES.map((m) => ({
            ...m,
            currency: m.symbol === 'NIFTY 50' || m.symbol === 'SENSEX' ? 'INR' : 'USD',
          }));

    const vixVal = vixQuote?.price ?? 14.8;
    const vixChg = vixQuote?.changePercent ?? -2.1;
    const fgScore = Math.max(15, Math.min(90, Math.round(92 - vixVal * 1.4)));
    const fgLabel = fgScore >= 65 ? 'Greed' : fgScore >= 45 ? 'Neutral' : 'Fear';

    // Derive dynamic "What Moved Today" headlines from live quotes if available
    const moverTickers = ['TCS.NS', 'RELIANCE.NS', 'TATAMOTORS.NS', 'NVDA'];
    const moverQuotes = await Promise.all(moverTickers.map((t) => fetchLiveQuote(t)));
    const liveMovers: WhatMovedToday[] = [];
    moverQuotes.forEach((mq, i) => {
      if (!mq) return;
      liveMovers.push({
        id: `live-move-${i}`,
        category: mq.displayTicker === 'NVDA' ? 'Tech Rally' : 'Earnings Move',
        title: `${mq.name} (${mq.displayTicker}) ${mq.changePercent >= 0 ? 'advances' : 'dips'} ${mq.changePercent >= 0 ? '+' : ''}${mq.changePercent}%`,
        explanation: `Live session price at ${formatCurrency(mq.price, 2, mq.currency)} with ${mq.volume} volume and ${mq.peRatio}x trailing P/E.`,
        impactedAssets: [mq.displayTicker],
        sentiment: mq.changePercent > 0 ? 'positive' : mq.changePercent < 0 ? 'negative' : 'neutral',
      });
    });

    return {
      indices,
      sectors: MOCK_SECTOR_PERFORMANCE,
      whatMovedToday: liveMovers.length >= 2 ? liveMovers : MOCK_WHAT_MOVED_TODAY,
      etfs: MOCK_ETFS,
      vix: { value: vixVal, changePercent: vixChg },
      fearGreed: { score: fgScore, label: fgLabel },
      isLive: liveCount > 0,
    };
  });
}

export async function fetchGoldAnalysis(): Promise<GoldAnalysis & { isLive: boolean }> {
  return withServerCache('gold-analysis', 5 * 60 * 1000, async () => {
    const q = await fetchLiveQuote('GC=F');
    const hist = await fetchChartSeries('GC=F', new Date(Date.now() - 180 * 86400000), '1wk');
    if (!q) {
      return {
        ...MOCK_GOLD_ANALYSIS,
        currency: 'USD',
        unitLabel: '$/oz',
        isLive: false,
      };
    }

    const hist1y = await fetchChartSeries('GC=F', new Date(Date.now() - 365 * 86400000), '1wk');
    const hist5y = await fetchChartSeries('GC=F', new Date(Date.now() - 5 * 365 * 86400000), '1mo');

    return {
      ...MOCK_GOLD_ANALYSIS,
      price: q.price,
      currency: 'USD',
      unitLabel: '$/oz',
      change1d: q.change,
      changePercent1d: q.changePercent,
      performance: {
        '1D': q.changePercent,
        '1W': MOCK_GOLD_ANALYSIS.performance['1W'],
        '1M': calcReturn(hist.slice(-5)) || MOCK_GOLD_ANALYSIS.performance['1M'],
        '6M': calcReturn(hist) || MOCK_GOLD_ANALYSIS.performance['6M'],
        '1Y': calcReturn(hist1y) || MOCK_GOLD_ANALYSIS.performance['1Y'],
        '5Y': calcReturn(hist5y) || MOCK_GOLD_ANALYSIS.performance['5Y'],
      },
      historicalChartData:
        hist.length > 2
          ? hist.map((pt) => ({ time: pt.time, price: pt.close, realYield: 1.85 }))
          : MOCK_GOLD_ANALYSIS.historicalChartData,
      isLive: true,
    };
  });
}

export async function fetchStockComparison(rawTickers: string[]): Promise<StockComparisonData[]> {
  const tickers = rawTickers.length > 0 ? rawTickers.slice(0, 4) : ['TCS', 'RELIANCE', 'NVDA'];
  const details = await Promise.all(tickers.map((t) => fetchExtendedStockDetail(t)));

  return details.map((d) => ({
    ticker: d.ticker,
    name: d.name,
    currency: d.currency || inferCurrencyFromTicker(d.ticker),
    price: d.price,
    change1d: d.changePercent,
    change1y: d.performance['1Y'],
    change5y: d.performance['5Y'],
    marketCap: d.marketCap,
    peRatio: d.peRatio,
    revenueGrowth: Math.max(4, Math.round((d.aiAnalysis.growthScore - 40) * 0.8)),
    riskFactors: d.risks[0] || 'Macro & sector multiple sensitivity',
    aiRating:
      d.aiAnalysis.qualityScore >= 80 && d.aiAnalysis.momentumScore >= 65
        ? 'Strong Buy (High Conviction)'
        : d.aiAnalysis.valueScore >= 65
        ? 'Accumulate'
        : 'Hold (Quality Compounder)',
  }));
}

export async function fetchOpportunityRadar(): Promise<{
  signals: OpportunityRadarSignal[];
  cards: OpportunityCardItem[];
  isLive: boolean;
}> {
  return withServerCache('opportunity-radar', 5 * 60 * 1000, async () => {
    const tracked = ['TCS.NS', 'TATAMOTORS.NS', 'NVDA', 'MARUTI.NS'];
    const details = await Promise.all(tracked.map((t) => fetchExtendedStockDetail(t)));
    const anyLive = details.some((d) => d.isLive);

    if (!anyLive) {
      return {
        signals: MOCK_RADAR_SIGNALS,
        cards: MOCK_OPPORTUNITY_CARDS,
        isLive: false,
      };
    }

    const signals: OpportunityRadarSignal[] = details.map((d, i) => ({
      id: `live-sig-${i}`,
      type: d.changePercent >= 1 ? 'opportunity' : d.changePercent <= -1 ? 'risk' : 'signal',
      title: `${d.name} (${d.ticker}) ${d.performance['1M'] >= 0 ? 'Upward Momentum' : 'Pullback Watch'}`,
      asset: d.ticker,
      detail: `Trading at ${formatCurrency(d.price, 2, d.currency)} (${d.changePercent >= 0 ? '+' : ''}${d.changePercent}% today, ${d.performance['1Y'] >= 0 ? '+' : ''}${d.performance['1Y']}% 1Y) at ${d.peRatio}x P/E.`,
      timeframe: 'Live Session',
      conviction: d.aiAnalysis.qualityScore >= 75 ? 'High' : 'Medium',
    }));

    const cards: OpportunityCardItem[] = details.map((d, i) => ({
      id: `live-opp-${i}`,
      assetName: d.name,
      symbol: d.ticker,
      opportunityType: `${d.exchange || 'Equity'} Live Opportunity`,
      historicalPerformance1Y: d.performance['1Y'],
      supportingFactors: d.strengths,
      keyRisks: d.risks,
      confidenceScore: Math.round((d.aiAnalysis.growthScore + d.aiAnalysis.qualityScore) / 2),
      assessmentTag:
        d.aiAnalysis.qualityScore >= 78 ? 'High Conviction AI Thesis' : 'Moderate Upside Thesis',
    }));

    return { signals, cards, isLive: true };
  });
}

function formatFYMoney(amount: number, currency: CurrencyCode): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (currency === 'INR') {
    const crores = abs / 1e7;
    if (crores >= 1000) return `${sign}₹${Math.round(crores).toLocaleString('en-IN')} Crore`;
    return `${sign}₹${crores.toFixed(1)} Crore`;
  }
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  return `${sign}$${(abs / 1e6).toFixed(1)}M`;
}

/**
 * Search ANY listed Indian (NSE/BSE) or Global company and return its Present FY Profit/Loss,
 * Revenue, Live Stock Price, and quick Buy/Hold/Sell verdict.
 */
export async function searchCompaniesWithFY(rawQuery: string): Promise<CompanyFYResult[]> {
  const query = (rawQuery || '').trim();

  // 1. Gather matching static reference profiles (used for offline fallback / extra commentary)
  const staticMatches = searchStaticCompanies(query).map((cp): CompanyFYResult => {
    const isLoss = /loss|-/i.test(cp.netProfit);
    return {
      id: cp.id,
      symbol: resolveYahooSymbol(cp.ticker),
      name: cp.name,
      exchange: cp.exchange,
      sector: cp.sector,
      currency: 'INR',
      currentPrice: null,
      changePercent: null,
      marketCap: cp.marketCap,
      latestFYLabel: cp.keyFinancials[0]?.year || 'FY25',
      latestFYRevenue: cp.revenue,
      latestFYProfitOrLoss: cp.latestProfitFigure,
      isProfit: !isLoss,
      yoyGrowth: cp.profitGrowth,
      netMargin: cp.profitMargin,
      summary: cp.summary,
      profitExplanation: cp.profitExplanation,
      keyFinancials: cp.keyFinancials,
      profitDrivers: cp.profitDrivers,
      advisoryVerdict: 'Buy',
      advisoryConfidence: 84,
      isLiveMarketData: false,
    };
  });

  if (!query) {
    const enriched = await Promise.all(
      staticMatches.slice(0, 4).map(async (item) => {
        const q = await fetchLiveQuote(item.symbol);
        if (!q) return item;
        return {
          ...item,
          currentPrice: q.price,
          changePercent: q.changePercent,
          marketCap: q.marketCap || item.marketCap,
          isLiveMarketData: true,
        };
      })
    );
    return enriched;
  }

  return withServerCache<CompanyFYResult[]>(`search-fy:${query.toLowerCase()}`, 10 * 60 * 1000, async () => {
    try {
      const yf = getYF();

      // Run primary search + India-focused NSE/BSE search in parallel so ANY Indian company is found
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [primaryRes, indiaRes] = await Promise.all([
        yf.search(query, { quotesCount: 10, newsCount: 0 }).catch(() => ({ quotes: [] })),
        /\.(NS|BO)$/i.test(query)
          ? Promise.resolve({ quotes: [] })
          : yf.search(`${query} NSE`, { quotesCount: 8, newsCount: 0 }).catch(() => ({ quotes: [] })),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawQuotes: any[] = [
        ...(indiaRes?.quotes || []),
        ...(primaryRes?.quotes || []),
      ].filter((q) => q.symbol && (q.quoteType === 'EQUITY' || q.isYahooFinance));

      // Deduplicate and prioritize Indian NSE (.NS) -> BSE (.BO) -> Global equities
      const dedupedMap = new Map<string, { symbol: string; score: number }>();
      for (const eq of rawQuotes) {
        const sym = String(eq.symbol).toUpperCase();
        const isNSE = sym.endsWith('.NS');
        const isBSE = sym.endsWith('.BO');
        const base = sym.replace(/\.(NS|BO)$/i, '');
        const queryLower = query.toLowerCase();
        const nameLower = String(eq.shortname || eq.longname || '').toLowerCase();

        let priority = 0;
        if (isNSE) priority += 100;
        else if (isBSE) priority += 60;
        if (base.toLowerCase() === queryLower || sym.toLowerCase() === queryLower) priority += 50;
        if (nameLower.includes(queryLower)) priority += 20;

        const existing = dedupedMap.get(sym);
        if (!existing || priority > existing.score) {
          dedupedMap.set(sym, { symbol: sym, score: priority });
        }
      }

      // Also probe direct `.NS` ticker or renamed NSE aliases (e.g. Zomato -> ETERNAL.NS)
      const aliasMap: Record<string, string> = {
        zomato: 'ETERNAL.NS',
        'tata motors': 'TMCV.NS',
        tatamotors: 'TMCV.NS',
      };
      const aliasedSymbol = aliasMap[query.toLowerCase()];
      if (aliasedSymbol && !dedupedMap.has(aliasedSymbol)) {
        dedupedMap.set(aliasedSymbol, { symbol: aliasedSymbol, score: 130 });
      }
      const upperClean = query.replace(/[^a-zA-Z0-9&-]/g, '').toUpperCase();
      if (upperClean.length >= 2 && upperClean.length <= 14 && !query.includes('.')) {
        const directNS = `${upperClean}.NS`;
        if (!dedupedMap.has(directNS)) {
          dedupedMap.set(directNS, { symbol: directNS, score: 85 });
        }
      }

      // Avoid showing both .NS and .BO for the exact same base symbol when .NS exists
      const sorted = Array.from(dedupedMap.values()).sort((a, b) => b.score - a.score);
      const candidateSymbols: string[] = [];
      const seenBaseIndian = new Set<string>();
      for (const item of sorted) {
        const isIndian = item.symbol.endsWith('.NS') || item.symbol.endsWith('.BO');
        const base = cleanDisplayTicker(item.symbol);
        if (isIndian && seenBaseIndian.has(base)) continue;
        if (isIndian) seenBaseIndian.add(base);
        candidateSymbols.push(item.symbol);
        if (candidateSymbols.length >= 4) break;
      }

      if (candidateSymbols.length === 0) {
        candidateSymbols.push(resolveYahooSymbol(query));
      }

      const liveResults = await Promise.all(
        candidateSymbols.map(async (sym): Promise<CompanyFYResult | null> => {
          try {
            const [q, sum, tsRows] = await Promise.all([
              fetchLiveQuote(sym),
              yf
                .quoteSummary(sym, {
                  modules: [
                    'financialData',
                    'assetProfile',
                    'summaryDetail',
                    'defaultKeyStatistics',
                  ],
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch(() => null) as Promise<any>,
              yf
                .fundamentalsTimeSeries(sym, {
                  period1: '2021-01-01',
                  type: 'annual',
                  module: 'financials',
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch(() => []) as Promise<any[]>,
            ]);

            if (!q && !sum && (!tsRows || tsRows.length === 0)) return null;

            const stockCurrency: CurrencyCode = q?.currency || inferCurrencyFromTicker(sym);
            const rawFinCurr = sum?.financialData?.financialCurrency;
            const finCurrency: CurrencyCode =
              rawFinCurr === 'USD' ? 'USD' : rawFinCurr === 'INR' ? 'INR' : stockCurrency;

            // Sort annual statements newest-first
            const validAnnual = (Array.isArray(tsRows) ? tsRows : [])
              .filter(
                (r) =>
                  r &&
                  (typeof r.totalRevenue === 'number' || typeof r.netIncome === 'number')
              )
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const latest = validAnnual[0];
            const prev = validAnnual[1];
            const finData = sum?.financialData;

            const latestRev =
              typeof latest?.totalRevenue === 'number'
                ? latest.totalRevenue
                : typeof finData?.totalRevenue === 'number'
                ? finData.totalRevenue
                : 0;
            const latestNetIncome =
              typeof latest?.netIncome === 'number'
                ? latest.netIncome
                : typeof finData?.netProfits === 'number'
                ? finData.netProfits
                : latestRev && typeof finData?.profitMargins === 'number'
                ? latestRev * finData.profitMargins
                : 0;

            const prevNetIncome = typeof prev?.netIncome === 'number' ? prev.netIncome : null;
            const isProfit = latestNetIncome >= 0;

            const fyEndDate = latest?.date ? new Date(latest.date) : new Date();
            const fyLabel = `FY${String(fyEndDate.getFullYear()).slice(-2)} (Latest)`;

            let yoyStr = 'Reported in latest annual statement';
            if (prevNetIncome && prevNetIncome !== 0 && latestNetIncome !== 0) {
              const pct = ((latestNetIncome - prevNetIncome) / Math.abs(prevNetIncome)) * 100;
              yoyStr = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% YoY Net ${
                isProfit ? 'Profit' : 'Loss'
              } change`;
            } else if (typeof finData?.revenueGrowth === 'number') {
              const rg = finData.revenueGrowth * 100;
              yoyStr = `${rg >= 0 ? '+' : ''}${rg.toFixed(1)}% YoY Revenue growth`;
            }

            const marginPct =
              latestRev > 0
                ? `${((latestNetIncome / latestRev) * 100).toFixed(1)}%`
                : typeof finData?.profitMargins === 'number'
                ? `${(finData.profitMargins * 100).toFixed(1)}%`
                : 'N/A';

            const keyFinancials = validAnnual.slice(0, 4).map((st) => {
              const yr = st.date
                ? `FY${String(new Date(st.date).getFullYear()).slice(-2)}`
                : 'FY';
              const r =
                typeof st.totalRevenue === 'number'
                  ? formatFYMoney(st.totalRevenue, finCurrency)
                  : 'N/A';
              const ni =
                typeof st.netIncome === 'number'
                  ? formatFYMoney(st.netIncome, finCurrency)
                  : 'N/A';
              const m =
                st.totalRevenue && st.netIncome
                  ? `${st.netIncome >= 0 ? 'Profit' : 'Loss'} • Margin ${(
                      (st.netIncome / st.totalRevenue) *
                      100
                    ).toFixed(1)}%`
                  : 'Annual filing';
              return { year: yr, revenue: r, netProfit: ni, patGrowth: m };
            });

            const staticCounterpart = COMPANY_PROFILES.find(
              (cp) =>
                cp.ticker.toUpperCase() === cleanDisplayTicker(sym) ||
                cp.name.toLowerCase().includes((q?.name || '').toLowerCase().split(' ')[0])
            );

            const verdict: 'Buy' | 'Hold' | 'Sell' =
              !isProfit ? 'Sell' : q && q.peRatio > 0 && q.peRatio < 35 ? 'Buy' : 'Hold';
            const confidence = !isProfit ? 72 : verdict === 'Buy' ? 84 : 71;

            return {
              id: `live-${sym}`,
              symbol: sym,
              name: q?.name || staticCounterpart?.name || cleanDisplayTicker(sym),
              exchange: q?.exchange || (stockCurrency === 'INR' ? 'NSE / BSE' : 'US Equity'),
              sector: sum?.assetProfile?.sector || staticCounterpart?.sector || 'Public Equity',
              currency: stockCurrency,
              currentPrice: q?.price ?? null,
              changePercent: q?.changePercent ?? null,
              marketCap: q?.marketCap || staticCounterpart?.marketCap || 'N/A',
              latestFYLabel: fyLabel,
              latestFYRevenue: latestRev
                ? formatFYMoney(latestRev, finCurrency)
                : staticCounterpart?.revenue || 'N/A',
              latestFYProfitOrLoss: latestNetIncome
                ? `${isProfit ? 'Net Profit' : 'Net Loss'}: ${formatFYMoney(
                    latestNetIncome,
                    finCurrency
                  )} (${fyLabel})`
                : staticCounterpart?.latestProfitFigure || 'Filing metrics unavailable',
              isProfit: latestNetIncome !== 0 ? isProfit : staticCounterpart ? true : null,
              yoyGrowth: yoyStr,
              netMargin: marginPct,
              summary:
                sum?.assetProfile?.longBusinessSummary?.slice(0, 260) ||
                staticCounterpart?.summary ||
                `Listed company (${sym}) tracked via live Yahoo Finance market & statement feed.`,
              profitExplanation:
                staticCounterpart?.profitExplanation ||
                `In ${fyLabel}, ${q?.name || sym} reported ${
                  latestRev ? formatFYMoney(latestRev, finCurrency) : 'N/A'
                } in annual revenue and a ${isProfit ? 'Net Profit' : 'Net Loss'} of ${
                  latestNetIncome ? formatFYMoney(latestNetIncome, finCurrency) : 'N/A'
                } (${marginPct} net margin).`,
              keyFinancials:
                keyFinancials.length > 0
                  ? keyFinancials
                  : staticCounterpart?.keyFinancials || [],
              profitDrivers: staticCounterpart?.profitDrivers || [
                `Live Share Price: ${q ? formatCurrency(q.price, 2, stockCurrency) : 'N/A'}`,
                `Trailing P/E Ratio: ${q?.peRatio ? `${q.peRatio}x` : 'N/A'}`,
                `Operating Margin: ${
                  typeof finData?.operatingMargins === 'number'
                    ? `${(finData.operatingMargins * 100).toFixed(1)}%`
                    : marginPct
                }`,
                `Market Capitalization: ${q?.marketCap || 'N/A'}`,
              ],
              advisoryVerdict: verdict,
              advisoryConfidence: confidence,
              isLiveMarketData: true,
            };
          } catch {
            return null;
          }
        })
      );

      const validLive = liveResults.filter((x): x is CompanyFYResult => x !== null);
      if (validLive.length > 0) {
        const seen = new Set(validLive.map((v) => cleanDisplayTicker(v.symbol)));
        const extras = staticMatches.filter((s) => !seen.has(cleanDisplayTicker(s.symbol)));
        return [...validLive, ...extras];
      }
      return staticMatches;
    } catch {
      return staticMatches;
    }
  });
}

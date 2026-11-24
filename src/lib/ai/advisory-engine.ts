import { GoogleGenAI } from '@google/genai';
import {
  BuySellAdvisory,
  CompanyFYResult,
  ExtendedStockDetail,
  ProjectDueDiligenceAnalysis,
} from '@/types';
import { getGeminiApiKey } from '../config/env';
import { withServerCache } from '../cache/server-cache';
import { getSettings } from '../storage/app-storage';
import { inferCurrencyFromTicker } from '../utils';

interface AdvisoryInput {
  ticker: string;
  stock: ExtendedStockDetail;
  fyData?: CompanyFYResult | null;
  vdrAnalysis?: ProjectDueDiligenceAnalysis | null;
}

function buildQuantitativeAdvisory(input: AdvisoryInput, isDemoFallback: boolean): BuySellAdvisory {
  const { stock, fyData, vdrAnalysis } = input;
  const settings = getSettings();
  const currency = stock.currency || inferCurrencyFromTicker(stock.ticker);

  let score = 55;
  const bullCase: string[] = [];
  const bearCase: string[] = [];
  const riskFlags: string[] = [];

  // 1. Valuation factor
  if (stock.peRatio > 0 && stock.peRatio < 25) {
    score += 12;
    bullCase.push(`Reasonable valuation multiple at ${stock.peRatio.toFixed(1)}x P/E.`);
  } else if (stock.peRatio > 45) {
    score -= 10;
    bearCase.push(`Elevated valuation at ${stock.peRatio.toFixed(1)}x P/E leaves limited margin of safety.`);
    riskFlags.push('High P/E multiple sensitivity');
  }

  // 2. Momentum & 52W range
  const perf1y = stock.performance['1Y'] || 0;
  const perf1m = stock.performance['1M'] || 0;
  if (perf1y > 15 && perf1m > 0) {
    score += 12;
    bullCase.push(`Strong trend momentum: +${perf1y.toFixed(1)}% (1Y) and +${perf1m.toFixed(1)}% (1M).`);
  } else if (perf1y < -10) {
    score -= 10;
    bearCase.push(`Negative 1Y price trajectory (${perf1y.toFixed(1)}%).`);
    riskFlags.push('Negative price momentum');
  }

  if (stock.week52High > stock.week52Low && stock.price > 0) {
    const rangePos = (stock.price - stock.week52Low) / (stock.week52High - stock.week52Low);
    if (rangePos < 0.35) {
      score += 6;
      bullCase.push('Trading in the lower third of 52-week range, offering favorable entry risk-reward.');
    } else if (rangePos > 0.92) {
      score -= 4;
      bearCase.push('Trading near 52-week highs; wait for pullback or earnings confirmation.');
    }
  }

  // 3. Present FY Profit / Loss integration
  if (fyData) {
    if (fyData.isProfit === true) {
      score += 10;
      bullCase.push(
        `Profitable in ${fyData.latestFYLabel}: ${fyData.latestFYProfitOrLoss} (${fyData.netMargin} net margin).`
      );
    } else if (fyData.isProfit === false) {
      score -= 14;
      bearCase.push(`Reported net loss in ${fyData.latestFYLabel}: ${fyData.latestFYProfitOrLoss}.`);
      riskFlags.push('Net loss in latest financial year');
    }
  }

  // 4. VDR uploaded PDF integration
  if (vdrAnalysis) {
    const vdrScore = vdrAnalysis.investmentAssessment.overallScore;
    if (vdrScore >= 80) {
      score += 10;
      bullCase.push(`VDR due diligence score of ${vdrScore}/100 supports high business quality.`);
    } else if (vdrScore < 65) {
      score -= 12;
      bearCase.push(`VDR diligence flagged elevated risks (score ${vdrScore}/100).`);
    }
    for (const r of vdrAnalysis.risks.slice(0, 2)) {
      riskFlags.push(`${r.title} (${r.severity})`);
    }
  }

  // 5. Adjust slightly for investor risk tolerance
  if (settings.riskTolerance === 'Conservative' && stock.peRatio > 35) {
    score -= 6;
  } else if (settings.riskTolerance === 'Aggressive' && perf1y > 20) {
    score += 4;
  }

  const clampedScore = Math.max(15, Math.min(96, Math.round(score)));
  let action: 'Buy' | 'Hold' | 'Sell' = 'Hold';
  let signalLabel: BuySellAdvisory['signalLabel'] = 'Hold';

  if (clampedScore >= 75) {
    action = 'Buy';
    signalLabel = 'Strong Buy';
  } else if (clampedScore >= 63) {
    action = 'Buy';
    signalLabel = 'Accumulate';
  } else if (clampedScore >= 46) {
    action = 'Hold';
    signalLabel = 'Hold';
  } else if (clampedScore >= 35) {
    action = 'Sell';
    signalLabel = 'Trim';
  } else {
    action = 'Sell';
    signalLabel = 'Sell';
  }

  if (bullCase.length === 0) {
    bullCase.push(stock.strengths[0] || 'Established sector presence and liquidity.');
  }
  if (bearCase.length === 0) {
    bearCase.push(stock.risks[0] || 'Monitor quarterly earnings execution and macro rates.');
  }
  if (riskFlags.length === 0) {
    riskFlags.push('General equity market volatility');
  }

  const upsideMult = action === 'Buy' ? 1.16 : action === 'Hold' ? 1.05 : 0.92;
  const targetPriceLow = Number((stock.price * (upsideMult - 0.05)).toFixed(2));
  const targetPriceHigh = Number((stock.price * (upsideMult + 0.06)).toFixed(2));
  const midTarget = (targetPriceLow + targetPriceHigh) / 2;
  const upsidePercent = stock.price > 0 ? Number((((midTarget - stock.price) / stock.price) * 100).toFixed(1)) : 0;

  return {
    ticker: stock.ticker,
    companyName: stock.name,
    currency,
    action,
    signalLabel,
    confidenceScore: clampedScore,
    currentPrice: stock.price,
    targetPriceLow,
    targetPriceHigh,
    upsidePercent,
    rationaleSummary: `${signalLabel} (${action}) rating with ${clampedScore}% confidence based on live ${stock.ticker} pricing (${currency}), ${stock.peRatio}x P/E valuation, ${perf1y.toFixed(1)}% 1Y trend${fyData ? `, and ${fyData.latestFYLabel} net result (${fyData.latestFYProfitOrLoss})` : ''}${vdrAnalysis ? ' plus uploaded VDR filings' : ''}.`,
    bullCase,
    bearCase,
    riskFlags,
    fundamentalsUsed: {
      latestFYLabel: fyData?.latestFYLabel,
      latestFYRevenue: fyData?.latestFYRevenue,
      latestFYProfitOrLoss: fyData?.latestFYProfitOrLoss,
      isProfit: fyData?.isProfit ?? undefined,
      peRatio: stock.peRatio,
      pbRatio: stock.pbRatio,
      vdrGrounded: Boolean(vdrAnalysis),
    },
    isDemoFallback,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateBuySellAdvisory(input: AdvisoryInput): Promise<BuySellAdvisory> {
  const cacheKey = `advisory:${input.ticker.toUpperCase()}:${input.vdrAnalysis?.analyzedAt || 'no-vdr'}`;

  return withServerCache<BuySellAdvisory>(cacheKey, 15 * 60 * 1000, async () => {
    const apiKey = getGeminiApiKey();
    const baseline = buildQuantitativeAdvisory(input, !apiKey);

    if (!apiKey) {
      return baseline;
    }

    try {
      const aiClient = new GoogleGenAI({ apiKey });
      const { stock, fyData, vdrAnalysis } = input;
      const settings = getSettings();

      const prompt = `You are AURA, an institutional equity & private-market investment advisor.
Given the live market data, present FY financial performance, and optional VDR PDF due diligence below, produce a Buy / Hold / Sell advisory JSON.

LIVE MARKET DATA:
- Ticker: ${stock.ticker} (${stock.name})
- Currency: ${stock.currency || 'INR'}
- Current Price: ${stock.price} (1D: ${stock.changePercent}%, 1M: ${stock.performance['1M']}%, 1Y: ${stock.performance['1Y']}%)
- Valuation: P/E ${stock.peRatio}x, P/B ${stock.pbRatio}x, Market Cap ${stock.marketCap}, 52W High ${stock.week52High}, 52W Low ${stock.week52Low}

PRESENT FY FUNDAMENTALS:
${fyData ? `- Latest FY (${fyData.latestFYLabel}): Revenue ${fyData.latestFYRevenue}, Net Profit/Loss ${fyData.latestFYProfitOrLoss}, Margin ${fyData.netMargin}, YoY ${fyData.yoyGrowth}` : '- Not available from feed'}

UPLOADED VDR DOCUMENT INTELLIGENCE:
${vdrAnalysis ? `- Overall Score: ${vdrAnalysis.investmentAssessment.overallScore}/100, Risk Level: ${vdrAnalysis.investmentAssessment.riskLevel}\n- Thesis: ${vdrAnalysis.investmentAssessment.overallThesis}\n- Top Risks: ${vdrAnalysis.risks.slice(0, 3).map((r) => r.title).join('; ')}` : '- No VDR PDFs uploaded for this ticker'}

INVESTOR RISK PROFILE: ${settings.riskTolerance}

Return ONLY valid JSON:
{
  "action": "Buy" | "Hold" | "Sell",
  "signalLabel": "Strong Buy" | "Accumulate" | "Hold" | "Trim" | "Sell",
  "confidenceScore": number (1-100),
  "targetPriceLow": number,
  "targetPriceHigh": number,
  "rationaleSummary": "2-3 concise sentences explaining the Buy/Hold/Sell verdict using the numbers above",
  "bullCase": ["point 1", "point 2"],
  "bearCase": ["point 1", "point 2"],
  "riskFlags": ["flag 1", "flag 2"]
}`;

      let raw = '';
      for (const candidate of ['gemini-3-flash-preview', 'gemini-3.8-flash', 'gemini-2.5-flash']) {
        try {
          const res = await aiClient.models.generateContent({
            model: candidate,
            contents: prompt,
            config: {
              temperature: 0.15,
              responseMimeType: 'application/json',
            },
          });
          if (res.text) {
            raw = res.text.trim();
            break;
          }
        } catch {
          // try next model
        }
      }
      const parsed = JSON.parse(
        raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
      ) as Partial<BuySellAdvisory>;

      if (!parsed.action || !parsed.rationaleSummary) {
        return baseline;
      }

      const targetLow = Number(parsed.targetPriceLow) || baseline.targetPriceLow;
      const targetHigh = Number(parsed.targetPriceHigh) || baseline.targetPriceHigh;
      const mid = (targetLow + targetHigh) / 2;
      const upsidePercent =
        stock.price > 0 ? Number((((mid - stock.price) / stock.price) * 100).toFixed(1)) : 0;

      return {
        ...baseline,
        action: parsed.action,
        signalLabel: parsed.signalLabel || baseline.signalLabel,
        confidenceScore: Number(parsed.confidenceScore) || baseline.confidenceScore,
        targetPriceLow: targetLow,
        targetPriceHigh: targetHigh,
        upsidePercent,
        rationaleSummary: parsed.rationaleSummary,
        bullCase: Array.isArray(parsed.bullCase) && parsed.bullCase.length > 0 ? parsed.bullCase : baseline.bullCase,
        bearCase: Array.isArray(parsed.bearCase) && parsed.bearCase.length > 0 ? parsed.bearCase : baseline.bearCase,
        riskFlags: Array.isArray(parsed.riskFlags) && parsed.riskFlags.length > 0 ? parsed.riskFlags : baseline.riskFlags,
        isDemoFallback: false,
        generatedAt: new Date().toISOString(),
      };
    } catch {
      return baseline;
    }
  });
}

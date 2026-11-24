import { NextRequest, NextResponse, connection } from 'next/server';
import {
  getPortfolioHoldings,
  savePortfolioHoldings,
} from '@/lib/storage/app-storage';
import { fetchLiveQuote } from '@/lib/market/market-service';
import { Holding } from '@/types';
import { inferCurrencyFromTicker } from '@/lib/utils';
import { MOCK_PORTFOLIO_HISTORY, MOCK_PORTFOLIO_SUMMARY } from '@/lib/mockData';

export async function GET() {
  await connection();
  try {
    const stored = getPortfolioHoldings();

    // Enrich with live yahoo-finance2 prices (cached 60s)
    const enriched = await Promise.all(
      stored.map(async (h) => {
        const quote = await fetchLiveQuote(h.ticker);
        const currentPrice = quote?.price ?? h.currentPrice;
        const value = Number((h.shares * currentPrice).toFixed(2));
        const costBasis = h.shares * h.avgCost;
        const unrealizedGain = Number((value - costBasis).toFixed(2));
        const unrealizedGainPercent =
          costBasis > 0 ? Number(((unrealizedGain / costBasis) * 100).toFixed(2)) : 0;

        return {
          ...h,
          currency: quote?.currency || h.currency || inferCurrencyFromTicker(h.ticker),
          currentPrice,
          value,
          unrealizedGain,
          unrealizedGainPercent,
          recommendation:
            unrealizedGainPercent > 15
              ? ('Hold' as const)
              : unrealizedGainPercent > 0
              ? ('Buy' as const)
              : ('Hold' as const),
        };
      })
    );

    const totalHoldingsValue = enriched.reduce((sum, h) => sum + h.value, 0);
    const totalCost = enriched.reduce((sum, h) => sum + h.shares * h.avgCost, 0);
    const totalReturn = totalHoldingsValue - totalCost;
    const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    const withWeights = enriched.map((h) => ({
      ...h,
      weight: totalHoldingsValue > 0 ? Number(((h.value / totalHoldingsValue) * 100).toFixed(1)) : 0,
    }));

    const buyingPower = MOCK_PORTFOLIO_SUMMARY.buyingPower;
    const totalNav = totalHoldingsValue + buyingPower;

    // Group sector breakdown for donut chart
    const sectorMap = new Map<string, number>();
    for (const h of withWeights) {
      sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + h.value);
    }
    const palette = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
    const allocation = Array.from(sectorMap.entries()).map(([name, val], i) => ({
      name,
      value: Math.round(val),
      percent: totalNav > 0 ? Number(((val / totalNav) * 100).toFixed(1)) : 0,
      color: palette[i % palette.length],
    }));
    allocation.push({
      name: 'Cash & Liquid Yield',
      value: buyingPower,
      percent: totalNav > 0 ? Number(((buyingPower / totalNav) * 100).toFixed(1)) : 0,
      color: '#64748b',
    });

    return NextResponse.json({
      success: true,
      holdings: withWeights,
      summary: {
        ...MOCK_PORTFOLIO_SUMMARY,
        totalValue: Math.round(totalNav),
        totalReturn: Math.round(totalReturn),
        totalReturnPercent: Number(totalReturnPercent.toFixed(2)),
      },
      allocation,
      history: MOCK_PORTFOLIO_HISTORY,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load portfolio';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ticker = ((body.ticker as string) || '').trim().toUpperCase();
    const shares = Number(body.shares) || 0;
    const avgCost = Number(body.avgCost) || 0;

    if (!ticker || shares <= 0 || avgCost <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid ticker, shares (>0), and avgCost (>0) are required.' },
        { status: 400 }
      );
    }

    const quote = await fetchLiveQuote(ticker);
    const currentPrice = quote?.price ?? avgCost;
    const value = Number((shares * currentPrice).toFixed(2));
    const unrealizedGain = Number((value - shares * avgCost).toFixed(2));
    const unrealizedGainPercent = Number(
      (((currentPrice - avgCost) / avgCost) * 100).toFixed(2)
    );

    const newHolding: Holding = {
      id: `h-${Date.now()}`,
      ticker: quote?.displayTicker || ticker,
      name: quote?.name || (body.name as string) || `${ticker} Ltd`,
      sector: (body.sector as string) || 'Public Equity',
      currency: quote?.currency || inferCurrencyFromTicker(ticker),
      shares,
      avgCost,
      currentPrice,
      value,
      unrealizedGain,
      unrealizedGainPercent,
      weight: 0,
      aiHealthRating: unrealizedGainPercent >= 0 ? 'A' : 'B',
      aiSentiment: unrealizedGainPercent >= 5 ? 'Bullish' : 'Neutral',
      recommendation: unrealizedGainPercent >= 0 ? 'Buy' : 'Hold',
    };

    const current = getPortfolioHoldings();
    const next = [newHolding, ...current];
    savePortfolioHoldings(next);

    return NextResponse.json({ success: true, holding: newHolding, holdings: next });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to add holding';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Holding id is required' }, { status: 400 });
    }
    const current = getPortfolioHoldings();
    const next = current.filter((h) => h.id !== id);
    savePortfolioHoldings(next);
    return NextResponse.json({ success: true, holdings: next });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to remove holding';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

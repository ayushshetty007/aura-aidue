import { NextRequest, NextResponse } from 'next/server';
import {
  fetchExtendedStockDetail,
  searchCompaniesWithFY,
} from '@/lib/market/market-service';
import { generateBuySellAdvisory } from '@/lib/ai/advisory-engine';
import { getCachedProjectAnalysis, getProjects } from '@/lib/storage/app-storage';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await context.params;
    const cleanTicker = decodeURIComponent(ticker || 'TCS');
    const [stock, fyMatches] = await Promise.all([
      fetchExtendedStockDetail(cleanTicker),
      searchCompaniesWithFY(cleanTicker),
    ]);

    const matchingProj = getProjects().find(
      (p) =>
        p.ticker.toUpperCase() === stock.ticker.toUpperCase() ||
        p.ticker.toUpperCase() === cleanTicker.toUpperCase()
    );
    const vdrAnalysis = matchingProj ? getCachedProjectAnalysis(matchingProj.id) : null;

    const advisory = await generateBuySellAdvisory({
      ticker: stock.ticker,
      stock,
      fyData: fyMatches[0] || null,
      vdrAnalysis,
    });

    return NextResponse.json({
      success: true,
      stock,
      advisory,
      fySummary: fyMatches[0] || null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load stock details';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

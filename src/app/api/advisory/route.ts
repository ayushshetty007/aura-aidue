import { NextRequest, NextResponse } from 'next/server';
import {
  fetchExtendedStockDetail,
  searchCompaniesWithFY,
} from '@/lib/market/market-service';
import { generateBuySellAdvisory } from '@/lib/ai/advisory-engine';
import { analyzeProjectDocuments } from '@/lib/ai/due-diligence-analyzer';
import { getProjectById } from '@/lib/storage/app-storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ticker = (body.ticker as string) || 'TCS';
    const projectId = body.projectId as string | undefined;

    const project = projectId ? getProjectById(projectId) : undefined;
    const effectiveTicker = project?.ticker || ticker;

    const [stock, fyMatches, vdrAnalysis] = await Promise.all([
      fetchExtendedStockDetail(effectiveTicker),
      searchCompaniesWithFY(effectiveTicker),
      projectId ? analyzeProjectDocuments(projectId) : Promise.resolve(null),
    ]);

    const advisory = await generateBuySellAdvisory({
      ticker: stock.ticker,
      stock,
      fyData: fyMatches[0] || null,
      vdrAnalysis,
    });

    return NextResponse.json({
      success: true,
      advisory,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to generate advisory';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

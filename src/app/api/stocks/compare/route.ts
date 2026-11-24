import { NextRequest, NextResponse } from 'next/server';
import { fetchStockComparison } from '@/lib/market/market-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get('tickers') || 'TCS,RELIANCE,NVDA';
    const tickers = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const comparison = await fetchStockComparison(tickers);
    return NextResponse.json({ success: true, comparison });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to compare stocks';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

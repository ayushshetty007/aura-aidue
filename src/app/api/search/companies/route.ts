import { NextRequest, NextResponse } from 'next/server';
import { searchCompaniesWithFY } from '@/lib/market/market-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const results = await searchCompaniesWithFY(query);
    return NextResponse.json({
      success: true,
      query,
      results,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Company search failed';
    return NextResponse.json({ success: false, error: msg, results: [] }, { status: 500 });
  }
}

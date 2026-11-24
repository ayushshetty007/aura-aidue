import { NextResponse, connection } from 'next/server';
import { fetchGoldAnalysis } from '@/lib/market/market-service';

export async function GET() {
  await connection();
  try {
    const gold = await fetchGoldAnalysis();
    return NextResponse.json({ success: true, gold });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load gold analysis';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

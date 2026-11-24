import { NextResponse, connection } from 'next/server';
import { fetchMarketOverview } from '@/lib/market/market-service';

export async function GET() {
  await connection();
  try {
    const data = await fetchMarketOverview();
    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load market overview';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

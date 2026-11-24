import { NextResponse, connection } from 'next/server';
import { fetchOpportunityRadar } from '@/lib/market/market-service';

export async function GET() {
  await connection();
  try {
    const radar = await fetchOpportunityRadar();
    return NextResponse.json({ success: true, ...radar });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load opportunity radar';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

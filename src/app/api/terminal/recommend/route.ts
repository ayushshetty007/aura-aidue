import { NextRequest, NextResponse, connection } from 'next/server';
import { buildTerminalRecommendation } from '@/lib/market/terminal-screener';
import { MarketUniverse, TerminalRecommendRequest } from '@/types';

export async function GET(req: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(req.url);
    const universe = (searchParams.get('universe') === 'US' ? 'US' : 'IN') as MarketUniverse;
    const lumpSum = Number(searchParams.get('lumpSum') ?? (universe === 'IN' ? 500000 : 25000));
    const monthlySip = Number(searchParams.get('monthlySip') ?? (universe === 'IN' ? 15000 : 500));
    const durationYears = Number(searchParams.get('durationYears') ?? 5);
    const risk = searchParams.get('riskTolerance');
    const riskTolerance =
      risk === 'Conservative' || risk === 'Aggressive' ? risk : 'Moderate';

    const data = await buildTerminalRecommendation({
      universe,
      lumpSum,
      monthlySip,
      durationYears,
      riskTolerance,
    });

    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to build terminal recommendations';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<TerminalRecommendRequest>;
    const universe: MarketUniverse = body.universe === 'US' ? 'US' : 'IN';
    const lumpSum = Math.max(0, Number(body.lumpSum ?? (universe === 'IN' ? 500000 : 25000)));
    const monthlySip = Math.max(0, Number(body.monthlySip ?? 0));
    const durationYears = Math.max(1, Math.min(25, Number(body.durationYears ?? 5)));
    const riskTolerance =
      body.riskTolerance === 'Conservative' || body.riskTolerance === 'Aggressive'
        ? body.riskTolerance
        : 'Moderate';

    if (lumpSum === 0 && monthlySip === 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter a Lump Sum or Monthly SIP amount greater than 0.' },
        { status: 400 }
      );
    }

    const data = await buildTerminalRecommendation({
      universe,
      lumpSum,
      monthlySip,
      durationYears,
      riskTolerance,
    });

    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to generate investment advisory plan';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

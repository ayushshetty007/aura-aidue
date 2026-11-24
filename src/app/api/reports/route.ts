import { NextResponse, connection } from 'next/server';
import { getReports } from '@/lib/storage/app-storage';

export async function GET() {
  await connection();
  try {
    const reports = getReports();
    return NextResponse.json({ success: true, reports });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load reports';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

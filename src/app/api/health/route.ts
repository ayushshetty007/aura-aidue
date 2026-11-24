import { NextResponse } from 'next/server';
import { connection } from 'next/server';
import { getServerConfigStatus } from '@/lib/config/env';

export async function GET() {
  await connection();
  const status = getServerConfigStatus();
  return NextResponse.json({
    success: true,
    ...status,
  });
}

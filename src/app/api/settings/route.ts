import { NextRequest, NextResponse, connection } from 'next/server';
import { getSettings, saveSettings } from '@/lib/storage/app-storage';
import { getServerConfigStatus } from '@/lib/config/env';
import { UserSettings } from '@/types';

export async function GET() {
  await connection();
  return NextResponse.json({
    success: true,
    settings: getSettings(),
    configStatus: getServerConfigStatus(),
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<UserSettings>;
    const current = getSettings();
    const updated = saveSettings({
      ...current,
      ...body,
      temperature:
        body.temperature !== undefined ? Number(body.temperature) : current.temperature,
    });
    return NextResponse.json({
      success: true,
      settings: updated,
      configStatus: getServerConfigStatus(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to save settings';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

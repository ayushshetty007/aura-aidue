import { NextRequest, NextResponse } from 'next/server';
import { analyzeProjectDocuments } from '@/lib/ai/due-diligence-analyzer';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || 'dd-101';
    const force = searchParams.get('force') === 'true';

    const analysis = await analyzeProjectDocuments(projectId, { force });
    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to analyze project documents';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = (body.projectId as string) || 'dd-101';
    const force = body.force !== false;

    const analysis = await analyzeProjectDocuments(projectId, { force });
    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to analyze project documents';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

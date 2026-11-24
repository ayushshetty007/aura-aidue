import { NextRequest, NextResponse, connection } from 'next/server';
import {
  deleteProjectById,
  getProjects,
  upsertProject,
} from '@/lib/storage/app-storage';
import { getProjectDocuments } from '@/lib/storage/document-storage';
import { DueDiligenceProject } from '@/types';
import { inferCurrencyFromTicker } from '@/lib/utils';

export async function GET() {
  await connection();
  try {
    const projects = getProjects().map((proj) => {
      const docs = getProjectDocuments(proj.id);
      return {
        ...proj,
        documentsCount: docs.length > 0 ? docs.length : proj.documentsCount,
      };
    });
    return NextResponse.json({ success: true, projects });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load projects';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<DueDiligenceProject>;
    const ticker = (body.ticker || 'TARGET').toUpperCase();
    const newProject: DueDiligenceProject = {
      id: body.id || `dd-${Date.now()}`,
      name: body.name || 'New Acquisition Target',
      ticker,
      sector: body.sector || 'Enterprise Software',
      currency: body.currency || inferCurrencyFromTicker(ticker),
      stage: body.stage || 'Initial Review',
      status: body.status || 'Under Review',
      targetIrr: Number(body.targetIrr) || 24.0,
      dealSize: Number(body.dealSize) || 500000000,
      ebitdaMultiple: Number(body.ebitdaMultiple) || 16.0,
      score: Number(body.score) || 80,
      updatedAt: 'Just now',
      analyst: body.analyst || 'Rohan Mehta',
      executiveSummary:
        body.executiveSummary || 'Newly created due diligence target profile.',
      documentsCount: body.documentsCount ?? 0,
      risks: body.risks || [],
      opportunities: body.opportunities || [],
      financialHighlights: body.financialHighlights || {
        revenue: 100000000,
        revenueGrowth: 20.0,
        ebitdaMargin: 20.0,
        netDebtToEbitda: 1.5,
        freeCashFlow: 18000000,
      },
    };

    const projects = upsertProject(newProject);
    return NextResponse.json({ success: true, project: newProject, projects });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create project';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Project id is required' }, { status: 400 });
    }
    const deleted = deleteProjectById(id);
    return NextResponse.json({ success: true, deleted, projects: getProjects() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete project';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

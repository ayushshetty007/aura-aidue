import { NextRequest, NextResponse } from 'next/server';
import { getProjectDocuments } from '@/lib/storage/document-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || 'dd-101';

    const documents = getProjectDocuments(projectId);

    return NextResponse.json({
      success: true,
      projectId,
      documents,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch documents';
    console.error('Error in GET /api/documents:', message);
    return NextResponse.json(
      { error: message, success: false },
      { status: 500 }
    );
  }
}

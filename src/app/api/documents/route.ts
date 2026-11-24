import { NextRequest, NextResponse } from 'next/server';
import {
  deleteProjectDocument,
  getProjectDocuments,
} from '@/lib/storage/document-storage';
import { globalVectorStore } from '@/lib/rag/vector-store';
import { invalidateProjectAnalysis } from '@/lib/storage/app-storage';

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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || 'dd-101';
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName query parameter is required', success: false },
        { status: 400 }
      );
    }

    const removedMeta = deleteProjectDocument(projectId, fileName);
    const removedVectors = globalVectorStore.removeDocumentRecords(projectId, fileName);
    invalidateProjectAnalysis(projectId);

    return NextResponse.json({
      success: true,
      removedMeta,
      removedVectors,
      documents: getProjectDocuments(projectId),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete document';
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}

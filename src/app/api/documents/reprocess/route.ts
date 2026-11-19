import { NextRequest, NextResponse } from 'next/server';
import { globalVectorStore } from '@/lib/rag/vector-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { projectId, documentName, clearAll } = body;

    let removedCount = 0;

    if (clearAll) {
      const initial = globalVectorStore.getRecordCount();
      globalVectorStore.clear();
      removedCount = initial;
    } else if (projectId && documentName) {
      removedCount = globalVectorStore.removeDocumentRecords(projectId, documentName);
    } else {
      // Default action: purge any corrupted/binary records across the vector store
      removedCount = globalVectorStore.removeCorruptedRecords(projectId);
    }

    const remainingCount = globalVectorStore.getRecordCount(projectId);

    return NextResponse.json({
      success: true,
      message: `Reprocessing cleanup completed. Removed ${removedCount} stale/corrupted vector records.`,
      removedCount,
      remainingCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Reprocessing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

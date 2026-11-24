import { NextRequest, NextResponse } from 'next/server';
import { parsePDFDocument } from '@/lib/documents/pdf-parser';
import { chunkPDFDocument } from '@/lib/rag/chunking';
import { defaultEmbeddingProvider } from '@/lib/rag/embeddings';
import { globalVectorStore } from '@/lib/rag/vector-store';
import {
  getProjectDocuments,
  saveUploadedDocument,
} from '@/lib/storage/document-storage';
import {
  getProjectById,
  invalidateProjectAnalysis,
  upsertProject,
} from '@/lib/storage/app-storage';
import { analyzeProjectDocuments } from '@/lib/ai/due-diligence-analyzer';
import { VDRDocument } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const projectId = (formData.get('projectId') as string) || 'dd-101';
    const documentType = (formData.get('documentType') as string) || 'Financial Statements';
    const runAnalysis = formData.get('autoAnalyze') !== 'false';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided in upload request.', success: false },
        { status: 400 }
      );
    }

    const fileName = file.name || 'uploaded_document.pdf';
    const isPDF = fileName.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    if (!isPDF) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF documents (.pdf) are permitted.', success: false },
        { status: 400 }
      );
    }

    const MAX_SIZE_BYTES = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds 20MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`, success: false },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const parsedDoc = await parsePDFDocument(buffer, fileName, documentType);
    const chunks = chunkPDFDocument(parsedDoc, 500, 100);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: `Document "${fileName}" produced no valid text chunks for vector indexing.`, success: false },
        { status: 422 }
      );
    }

    const chunkTexts = chunks.map((c) => c.text);
    const embeddings = await defaultEmbeddingProvider.embedDocuments(chunkTexts);

    globalVectorStore.addDocuments(projectId, chunks, embeddings);

    const fileSizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;

    const newVDRDoc: VDRDocument = {
      id: parsedDoc.id,
      fileName: parsedDoc.name,
      documentType: (documentType as VDRDocument['documentType']) || 'Financial Statements',
      uploadDate: 'Just now',
      processingStatus: 'Processed',
      pageCount: parsedDoc.pageCount,
      analysisStatus: 'Complete',
      fileSize: fileSizeFormatted,
      chunkCount: chunks.length,
    };

    saveUploadedDocument(projectId, newVDRDoc);
    invalidateProjectAnalysis(projectId);

    const existingProject = getProjectById(projectId);
    if (existingProject) {
      const updatedDocs = getProjectDocuments(projectId);
      upsertProject({
        ...existingProject,
        documentsCount: updatedDocs.length,
        updatedAt: 'Just now',
      });
    }

    // Trigger single-call Gemini extraction immediately so all DD tabs update
    const analysis = runAnalysis
      ? await analyzeProjectDocuments(projectId, { force: true })
      : null;

    return NextResponse.json({
      success: true,
      document: newVDRDoc,
      analysis,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to parse and index document.';
    console.error('Error during document upload and RAG indexing:', errorMessage);
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 400 }
    );
  }
}

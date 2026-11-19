import { NextRequest, NextResponse } from 'next/server';
import { parsePDFDocument } from '@/lib/documents/pdf-parser';
import { chunkPDFDocument } from '@/lib/rag/chunking';
import { defaultEmbeddingProvider } from '@/lib/rag/embeddings';
import { globalVectorStore } from '@/lib/rag/vector-store';
import { saveUploadedDocument } from '@/lib/storage/document-storage';
import { VDRDocument } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const projectId = (formData.get('projectId') as string) || 'dd-101';
    const documentType = (formData.get('documentType') as string) || 'Financial Statements';

    // 1. Validation Checks
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided in upload request.' },
        { status: 400 }
      );
    }

    const fileName = file.name || 'uploaded_document.pdf';
    const isPDF = fileName.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    if (!isPDF) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF documents (.pdf) are permitted for security and parsing integrity.' },
        { status: 400 }
      );
    }

    const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB limit
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds maximum permitted limit of 20MB (received ${(file.size / (1024 * 1024)).toFixed(1)}MB).` },
        { status: 400 }
      );
    }

    // 2. Read File ArrayBuffer
    console.log(`[Upload API] Received file: "${fileName}", size: ${file.size} bytes`);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`[Upload API] Buffer created: ${buffer.length} bytes. Calling parsePDFDocument...`);

    // 3. Server-side PDF Text Extraction & Page Preservation
    // This will throw if the PDF contains unreadable/binary-encoded data or no text
    const parsedDoc = await parsePDFDocument(buffer, fileName, documentType);
    console.log(`[Upload API] parsePDFDocument succeeded: ${parsedDoc.pages.length} pages, fullText length: ${parsedDoc.fullText.length}`);

    // 4. Text Chunking with preserved page numbers
    const chunks = chunkPDFDocument(parsedDoc, 500, 100);
    console.log(`[Upload API] Chunks created: ${chunks.length}`);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: `Document "${fileName}" produced no valid text chunks for vector indexing.` },
        { status: 422 }
      );
    }

    // 5. Embedding Generation
    console.log(`[Upload API] Generating embeddings for ${chunks.length} chunks...`);
    const chunkTexts = chunks.map((c) => c.text);
    const embeddings = await defaultEmbeddingProvider.embedDocuments(chunkTexts);
    console.log(`[Upload API] Embeddings generated successfully: ${embeddings.length}`);

    // 6. Store in Project-Scoped In-Memory Vector Store (automatically clears old chunks for this document)
    globalVectorStore.addDocuments(projectId, chunks, embeddings);
    console.log(`[Upload API] Vector store updated for project "${projectId}". Total records: ${globalVectorStore.getRecordCount(projectId)}`);

    const fileSizeFormatted = file.size > 1024 * 1024
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
    };

    // 7. Persist document metadata to disk store for this project
    saveUploadedDocument(projectId, newVDRDoc);
    console.log(`[Upload API] Document "${parsedDoc.name}" metadata persisted for project "${projectId}".`);

    return NextResponse.json({
      success: true,
      document: {
        ...newVDRDoc,
        chunkCount: chunks.length,
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to parse and index document.';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error during document upload and RAG indexing:', errorMessage, errorStack);
    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json(
      {
        error: errorMessage,
        ...(isDev && errorStack ? { debugStack: errorStack } : {})
      },
      { status: 400 }
    );
  }
}

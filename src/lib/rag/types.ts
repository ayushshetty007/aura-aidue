export interface ParsedPage {
  pageNumber: number;
  text: string;
}

export interface ParsedPDFDocument {
  id: string;
  name: string;
  type: string;
  pageCount: number;
  pages: ParsedPage[];
  fullText: string;
}

export interface TextChunk {
  documentId: string;
  documentName: string;
  pageNumber: number;
  chunkId: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface VectorRecord {
  id: string;
  projectId: string;
  chunk: TextChunk;
  embedding: number[];
}

export interface SearchResult {
  chunk: TextChunk;
  similarity: number;
}

export interface RAGSourceCitation {
  documentName: string;
  pageNumber: number;
  excerpt: string;
  relevance: number; // 0.0 - 1.0 similarity score
}

export interface RAGMetrics {
  answerCorrectness?: number;
  retrievalQuality?: number;
  citationAccuracy?: number;
  hallucinationRate?: number;
  latencyMs: number;
}

export interface RAGAnswerResponse {
  answer: string;
  sources: RAGSourceCitation[];
  isDemoFallback: boolean;
  evalMetrics?: RAGMetrics;
}

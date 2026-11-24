import { SearchResult, TextChunk, VectorRecord } from './types';
import { isBinaryOrCorruptedText } from '../documents/pdf-parser';
import { loadVectorRecords, saveVectorRecords } from '../storage/document-storage';

/**
 * Cosine Similarity Helper
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  // Dimension mismatch (e.g., legacy 64-dim fallback vs 3072-dim Gemini embedding)
  if (vecA.length !== vecB.length) return -1;

  const minLen = vecA.length;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function keywordMatchScore(queryText: string, chunkText: string): number {
  const words = queryText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);
  if (words.length === 0) return 0.1;
  const hay = chunkText.toLowerCase();
  let hits = 0;
  for (const w of words) {
    if (hay.includes(w)) hits++;
  }
  return 0.25 + (hits / words.length) * 0.65;
}

/**
 * Project-Scoped Persistent Vector Store
 * Combines fast in-memory access with automatic disk persistence across server restarts.
 */
export class InMemoryVectorStore {
  private records: VectorRecord[] = [];
  private isLoaded = false;

  constructor() {
    this.ensureLoaded();
  }

  private ensureLoaded(): void {
    if (!this.isLoaded) {
      this.isLoaded = true;
      const loaded = loadVectorRecords();
      if (loaded.length > 0) {
        this.records = loaded;
      }
    }
  }

  private persist(): void {
    saveVectorRecords(this.records);
  }

  /**
   * Add text chunks and corresponding embeddings scoped to a specific project.
   * Automatically clears previous records for the document to allow safe re-indexing.
   */
  public addDocuments(projectId: string, chunks: TextChunk[], embeddings: number[][]): void {
    this.ensureLoaded();
    if (chunks.length === 0) return;

    // Purge any corrupted records currently stored
    this.removeCorruptedRecords(projectId);

    // Remove old chunks for the same document to prevent duplicates upon re-upload
    const docName = chunks[0]?.documentName;
    if (docName) {
      this.removeDocumentRecords(projectId, docName);
    }

    chunks.forEach((chunk, index) => {
      // Safety check: skip any corrupted or non-text chunk
      if (isBinaryOrCorruptedText(chunk.text)) {
        return;
      }

      const embedding = embeddings[index] || [];
      this.records.push({
        id: `vec-${Date.now()}-${index}`,
        projectId,
        chunk,
        embedding,
      });
    });

    this.persist();
  }

  /**
   * Search vector store strictly scoped to the requested projectId.
   */
  public search(
    projectId: string,
    queryEmbedding: number[],
    topK: number = 4,
    queryText: string = ''
  ): SearchResult[] {
    this.ensureLoaded();

    // Purge corrupted records prior to search execution
    this.removeCorruptedRecords(projectId);

    // Filter records strictly belonging to the requested project
    const projectRecords = this.records.filter((rec) => rec.projectId === projectId);
    
    if (projectRecords.length === 0) {
      return [];
    }

    const results: SearchResult[] = projectRecords
      .filter((rec) => !isBinaryOrCorruptedText(rec.chunk.text))
      .map((rec) => {
        const rawSim = calculateCosineSimilarity(queryEmbedding, rec.embedding);
        const similarity =
          rawSim < 0 ? keywordMatchScore(queryText, rec.chunk.text) : rawSim;
        return {
          chunk: rec.chunk,
          similarity,
        };
      });

    // Sort by descending cosine similarity score
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, topK);
  }

  /**
   * Remove corrupted or binary-looking records from the store.
   * Returns the count of removed records.
   */
  public removeCorruptedRecords(projectId?: string): number {
    this.ensureLoaded();
    const initialCount = this.records.length;
    this.records = this.records.filter((rec) => {
      if (projectId && rec.projectId !== projectId) return true;
      return !isBinaryOrCorruptedText(rec.chunk.text);
    });
    const removed = initialCount - this.records.length;
    if (removed > 0) {
      this.persist();
    }
    return removed;
  }

  /**
   * Remove records belonging to a specific document name within a project.
   * Enables safe re-processing and re-indexing of documents.
   */
  public removeDocumentRecords(projectId: string, documentName: string): number {
    this.ensureLoaded();
    const initialCount = this.records.length;
    const targetName = documentName.toLowerCase();
    this.records = this.records.filter(
      (rec) => !(rec.projectId === projectId && rec.chunk.documentName.toLowerCase() === targetName)
    );
    const removed = initialCount - this.records.length;
    if (removed > 0) {
      this.persist();
    }
    return removed;
  }

  /**
   * Check if project has valid ingested vector records
   */
  public hasProjectRecords(projectId: string): boolean {
    this.ensureLoaded();
    this.removeCorruptedRecords(projectId);
    return this.records.some((rec) => rec.projectId === projectId);
  }

  /**
   * Clear all records (for testing or reset)
   */
  public clear(): void {
    this.records = [];
    this.persist();
  }

  /**
   * Retrieve all chunks belonging to a project (grouped in document/page order)
   */
  public getProjectChunks(projectId: string): TextChunk[] {
    this.ensureLoaded();
    return this.records
      .filter((rec) => rec.projectId === projectId && !isBinaryOrCorruptedText(rec.chunk.text))
      .map((rec) => rec.chunk);
  }

  /**
   * Get total count of indexed vector records
   */
  public getRecordCount(projectId?: string): number {
    this.ensureLoaded();
    if (projectId) {
      return this.records.filter((rec) => rec.projectId === projectId).length;
    }
    return this.records.length;
  }
}

// Global shared vector store instance across API routes
export const globalVectorStore = new InMemoryVectorStore();

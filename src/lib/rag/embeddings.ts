import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '../config/env';

export interface EmbeddingProvider {
  embedText(text: string): Promise<number[]>;
  embedDocuments(texts: string[]): Promise<number[][]>;
}

/**
 * Deterministic Fallback Embedding Generator for Demo Mode
 * Generates a normalized 64-dimensional feature vector based on term frequency and character n-grams.
 */
export function generateFallbackEmbedding(text: string, dimensions = 64): number[] {
  const vec = new Array(dimensions).fill(0);
  const normalized = (text || '').toLowerCase();

  for (let i = 0; i < normalized.length - 2; i++) {
    const charCode = normalized.charCodeAt(i) + normalized.charCodeAt(i + 1) * 31;
    const index = Math.abs(charCode) % dimensions;
    vec[index] += 1;
  }

  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map((val) => val / magnitude);
}

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  private getClient(): GoogleGenAI | null {
    const apiKey = getGeminiApiKey();
    if (!apiKey) return null;
    try {
      return new GoogleGenAI({ apiKey });
    } catch {
      return null;
    }
  }

  public hasValidKey(): boolean {
    return Boolean(getGeminiApiKey());
  }

  async embedText(text: string): Promise<number[]> {
    const aiClient = this.getClient();
    if (aiClient) {
      for (const model of ['gemini-embedding-001', 'text-embedding-004']) {
        try {
          const response = await aiClient.models.embedContent({
            model,
            contents: text,
          });
          const resAny = response as unknown as {
            embedding?: { values?: number[] };
            embeddings?: { values?: number[] }[];
          };
          const values = resAny.embedding?.values || resAny.embeddings?.[0]?.values;
          if (values && Array.isArray(values)) {
            return values;
          }
        } catch {
          // Try fallback embedding model
        }
      }
    }
    return generateFallbackEmbedding(text);
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (!this.hasValidKey()) {
      return texts.map((t) => generateFallbackEmbedding(t));
    }

    // Process in bounded batches of 5 to keep upload fast and avoid free-tier throttling
    const embeddings: number[][] = [];
    const batchSize = 5;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((t) => this.embedText(t)));
      embeddings.push(...batchResults);
    }
    return embeddings;
  }
}

export const defaultEmbeddingProvider = new GeminiEmbeddingProvider();

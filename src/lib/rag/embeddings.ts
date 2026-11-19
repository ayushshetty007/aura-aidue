import { GoogleGenAI } from '@google/genai';

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

  // Normalize vector to unit length
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map((val) => val / magnitude);
}

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  private apiKey: string | undefined;
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    this.apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (this.apiKey && this.apiKey.trim().length > 0) {
      try {
        this.aiClient = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.warn('Failed to initialize GoogleGenAI client:', err);
      }
    }
  }

  public hasValidKey(): boolean {
    return !!(this.apiKey && this.apiKey.trim().length > 0 && this.aiClient);
  }

  async embedText(text: string): Promise<number[]> {
    if (this.hasValidKey() && this.aiClient) {
      try {
        const response = await this.aiClient.models.embedContent({
          model: 'text-embedding-004',
          contents: text,
        });
        const resAny = response as unknown as { embedding?: { values?: number[] }; embeddings?: { values?: number[] }[] };
        const values = resAny.embedding?.values || resAny.embeddings?.[0]?.values;
        if (values && Array.isArray(values)) {
          return values;
        }
      } catch {
        // Retry fallback embedding model if text-embedding-004 returns 404
        try {
          const responseFb = await this.aiClient.models.embedContent({
            model: 'embedding-001',
            contents: text,
          });
          const resAnyFb = responseFb as unknown as { embedding?: { values?: number[] }; embeddings?: { values?: number[] }[] };
          const valuesFb = resAnyFb.embedding?.values || resAnyFb.embeddings?.[0]?.values;
          if (valuesFb && Array.isArray(valuesFb)) {
            return valuesFb;
          }
        } catch {
          // Fall back gracefully to local feature vector
        }
      }
    }
    return generateFallbackEmbedding(text);
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      const emb = await this.embedText(text);
      embeddings.push(emb);
    }
    return embeddings;
  }
}

export const defaultEmbeddingProvider = new GeminiEmbeddingProvider();

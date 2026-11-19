import { ParsedPDFDocument, TextChunk } from './types';

/**
 * Text Chunking Utility
 * Splits document pages into overlapping text windows while preserving page & document metadata.
 */
export function chunkPDFDocument(
  doc: ParsedPDFDocument,
  chunkSize: number = 500,
  overlap: number = 100
): TextChunk[] {
  const chunks: TextChunk[] = [];
  let chunkCounter = 0;

  for (const page of doc.pages) {
    const text = page.text;
    if (!text || text.length === 0) continue;

    if (text.length <= chunkSize) {
      chunkCounter++;
      chunks.push({
        documentId: doc.id,
        documentName: doc.name,
        pageNumber: page.pageNumber,
        chunkId: `${doc.id}-p${page.pageNumber}-c${chunkCounter}`,
        text: text.trim(),
      });
    } else {
      let start = 0;
      while (start < text.length) {
        let end = start + chunkSize;
        // Try not to cut words in half
        if (end < text.length) {
          const lastSpace = text.lastIndexOf(' ', end);
          if (lastSpace > start + Math.floor(chunkSize / 2)) {
            end = lastSpace;
          }
        }

        const chunkText = text.substring(start, end).trim();
        if (chunkText.length > 20) {
          chunkCounter++;
          chunks.push({
            documentId: doc.id,
            documentName: doc.name,
            pageNumber: page.pageNumber,
            chunkId: `${doc.id}-p${page.pageNumber}-c${chunkCounter}`,
            text: chunkText,
          });
        }

        start += chunkSize - overlap;
        if (start >= text.length) break;
      }
    }
  }

  return chunks;
}

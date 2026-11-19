import { ParsedPDFDocument, ParsedPage } from '../rag/types';

/**
 * Check if extracted text contains raw PDF binary headers/stream syntax or unreadable noise
 */
export function isBinaryOrCorruptedText(text: string): boolean {
  if (!text || text.trim().length === 0) return true;

  // PDF syntax markers indicating raw unparsed binary stream data
  const pdfBinaryMarkers = [
    /%PDF-\d\.\d/,
    /\/FlateDecode/i,
    /\/MediaBox/i,
    /\/Font\s*<</i,
    /\bendobj\b/i,
    /\bstartxref\b/i,
    /%%EOF/i,
    /\/Type\s*\/Page/i,
    /\/Contents\s+\d+/i,
  ];

  for (const marker of pdfBinaryMarkers) {
    if (marker.test(text)) {
      return true;
    }
  }

  // Count unprintable control characters
  const controlChars = (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length;
  const controlRatio = controlChars / text.length;

  if (controlRatio > 0.05 && text.length > 50) {
    return true;
  }

  return false;
}

/**
 * Clean and normalize extracted PDF text
 */
export function cleanExtractedText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove control chars
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Pure JavaScript W3C DOMMatrix polyfill for Next.js Server / Turbopack environments.
 * Prevents bundling of native .node canvas addons while providing full matrix manipulation
 * required by pdfjs-dist.
 */
class DOMMatrixPolyfill {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
  m11 = 1;
  m12 = 0;
  m13 = 0;
  m14 = 0;
  m21 = 0;
  m22 = 1;
  m23 = 0;
  m24 = 0;
  m31 = 0;
  m32 = 0;
  m33 = 1;
  m34 = 0;
  m41 = 0;
  m42 = 0;
  m43 = 0;
  m44 = 1;
  is2D = true;
  isIdentity = true;

  constructor(init?: string | number[]) {
    if (Array.isArray(init)) {
      if (init.length === 6) {
        this.a = this.m11 = init[0];
        this.b = this.m12 = init[1];
        this.c = this.m21 = init[2];
        this.d = this.m22 = init[3];
        this.e = this.m41 = init[4];
        this.f = this.m42 = init[5];
      } else if (init.length === 16) {
        this.m11 = init[0]; this.m12 = init[1]; this.m13 = init[2]; this.m14 = init[3];
        this.m21 = init[4]; this.m22 = init[5]; this.m23 = init[6]; this.m24 = init[7];
        this.m31 = init[8]; this.m32 = init[9]; this.m33 = init[10]; this.m34 = init[11];
        this.m41 = init[12]; this.m42 = init[13]; this.m43 = init[14]; this.m44 = init[15];
        this.a = this.m11; this.b = this.m12; this.c = this.m21; this.d = this.m22;
        this.e = this.m41; this.f = this.m42;
        this.is2D = false;
      }
    }
  }

  scaleSelf(scaleX = 1, scaleY = scaleX) {
    this.a *= scaleX;
    this.c *= scaleX;
    this.b *= scaleY;
    this.d *= scaleY;
    this.m11 = this.a;
    this.m21 = this.c;
    this.m12 = this.b;
    this.m22 = this.d;
    return this;
  }

  translateSelf(tx = 0, ty = 0) {
    this.e += this.a * tx + this.c * ty;
    this.f += this.b * tx + this.d * ty;
    this.m41 = this.e;
    this.m42 = this.f;
    return this;
  }

  multiplySelf(other: DOMMatrixPolyfill) {
    const a = this.a * other.a + this.c * other.b;
    const b = this.b * other.a + this.d * other.b;
    const c = this.a * other.c + this.c * other.d;
    const d = this.b * other.c + this.d * other.d;
    const e = this.a * other.e + this.c * other.f + this.e;
    const f = this.b * other.e + this.d * other.f + this.f;
    this.a = this.m11 = a;
    this.b = this.m12 = b;
    this.c = this.m21 = c;
    this.d = this.m22 = d;
    this.e = this.m41 = e;
    this.f = this.m42 = f;
    return this;
  }

  transformPoint(point?: { x?: number; y?: number; z?: number; w?: number }) {
    const x = point?.x || 0;
    const y = point?.y || 0;
    return {
      x: x * this.a + y * this.c + this.e,
      y: x * this.b + y * this.d + this.f,
      z: point?.z || 0,
      w: point?.w || 1,
    };
  }

  toFloat32Array() { return new Float32Array(16); }
  toFloat64Array() { return new Float64Array(16); }
}

function ensureDOMMatrixPolyfill() {
  const g = typeof global !== 'undefined' ? global : typeof globalThis !== 'undefined' ? globalThis : {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (g as any).DOMMatrix = DOMMatrixPolyfill;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DOMMatrix = DOMMatrixPolyfill;

  const pointClass = class DOMPoint {
    x = 0; y = 0; z = 0; w = 1;
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x; this.y = y; this.z = z; this.w = w;
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (g as any).DOMPoint = pointClass;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DOMPoint = pointClass;

  const rectClass = class DOMRect {
    x = 0; y = 0; width = 0; height = 0;
    top = 0; right = 0; bottom = 0; left = 0;
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = this.left = x;
      this.y = this.top = y;
      this.width = width;
      this.height = height;
      this.right = x + width;
      this.bottom = y + height;
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (g as any).DOMRect = rectClass;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DOMRect = rectClass;
}

// Immediately ensure polyfills are registered at module load
ensureDOMMatrixPolyfill();

/**
 * Server-side PDF Document Parser Utility
 * Extracts text while preserving page boundaries and metadata.
 */
export async function parsePDFDocument(
  fileBuffer: Buffer,
  fileName: string,
  documentType: string = 'Financial Statements'
): Promise<ParsedPDFDocument> {
  const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const pages: ParsedPage[] = [];
  let pageCount = 1;

  // 1. Safe Diagnostic Logging (Header & Buffer Size)
  const isPdfHeader = fileBuffer.length >= 5 && fileBuffer.subarray(0, 5).toString('utf-8') === '%PDF-';
  console.log(
    `[PDF Parser Diagnostics] File: "${fileName}", Size: ${fileBuffer.length} bytes, Header %PDF-: ${isPdfHeader}`
  );

  if (!isPdfHeader) {
    throw new Error(
      `Failed to extract text from "${fileName}". File is malformed or not a valid PDF document (missing %PDF- header signature).`
    );
  }

  try {
    // Ensure DOMMatrix polyfill is available before initializing pdf-parse
    ensureDOMMatrixPolyfill();

    // Dynamically require pdf-parse v2 class export for server-side execution
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require('pdf-parse');

    // Configure parser options to prevent canvas polyfill loading issues in Next.js
    const parser = new PDFParse({
      data: fileBuffer,
      disableFontFace: true,
      useSystemFonts: false,
      isOffscreenCanvasSupported: false,
      stopAtErrors: false,
      verbosity: 0,
    });

    const result = await parser.getText();

    pageCount = result.total || 1;
    const totalCharsExtracted = (result.text || '').length;

    console.log(
      `[PDF Parser Diagnostics] File: "${fileName}", Pages Detected: ${pageCount}, Total Extracted Characters: ${totalCharsExtracted}`
    );

    if (Array.isArray(result.pages) && result.pages.length > 0) {
      result.pages.forEach((p: { num: number; text: string }) => {
        const cleanedText = cleanExtractedText(p.text);
        if (cleanedText && !isBinaryOrCorruptedText(cleanedText)) {
          pages.push({
            pageNumber: p.num || pages.length + 1,
            text: cleanedText,
          });
        }
      });
    }

    // Fallback if pages array was not formatted: split result text by form feed
    if (pages.length === 0 && result.text) {
      const fullCleaned = cleanExtractedText(result.text);
      if (fullCleaned && !isBinaryOrCorruptedText(fullCleaned)) {
        const rawPages = fullCleaned.split('\f');
        if (rawPages.length > 1) {
          rawPages.forEach((pt, idx) => {
            const cleaned = cleanExtractedText(pt);
            if (cleaned && !isBinaryOrCorruptedText(cleaned)) {
              pages.push({
                pageNumber: idx + 1,
                text: cleaned,
              });
            }
          });
        } else {
          pages.push({
            pageNumber: 1,
            text: fullCleaned,
          });
        }
      }
    }
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    const origStack = error instanceof Error ? error.stack : String(error);
    console.error(`[PDF Parser Error] Failed for "${fileName}":`, errMessage);
    console.error(`[PDF Parser Stack]:`, origStack);
    const isDev = process.env.NODE_ENV !== 'production';
    throw new Error(
      isDev
        ? `PDF extraction error: ${errMessage} | Original stack: ${origStack}`
        : `Failed to extract text from "${fileName}". Ensure the file is a valid PDF document containing selectable text.`
    );
  }

  // Final validation check: reject documents with zero readable pages
  if (pages.length === 0) {
    throw new Error(
      `Failed to extract text from "${fileName}". Document contains no selectable text (image-only or scanned PDF). OCR processing is required.`
    );
  }

  const fullText = pages.map((p) => `--- Page ${p.pageNumber} ---\n${p.text}`).join('\n\n');

  return {
    id: docId,
    name: fileName,
    type: documentType,
    pageCount: Math.max(pageCount, pages.length),
    pages,
    fullText,
  };
}

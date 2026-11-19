import fs from 'fs';
import path from 'path';
import { VDRDocument } from '@/types';
import { VectorRecord } from '../rag/types';
import { MOCK_VDR_DOCUMENTS } from '../mockData';

const DATA_DIR = path.join(process.cwd(), '.data');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
const VECTORS_FILE = path.join(DATA_DIR, 'vectors.json');

/**
 * Ensure the local storage directory exists
 */
function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[Document Storage] Could not create .data directory:', err);
  }
}

/**
 * Read the full documents store
 */
function readDocumentsStore(): Record<string, VDRDocument[]> {
  ensureDataDir();
  try {
    if (fs.existsSync(DOCUMENTS_FILE)) {
      const raw = fs.readFileSync(DOCUMENTS_FILE, 'utf-8');
      return JSON.parse(raw) as Record<string, VDRDocument[]>;
    }
  } catch (err) {
    console.warn('[Document Storage] Could not read documents.json:', err);
  }
  return {};
}

/**
 * Write to the full documents store
 */
function writeDocumentsStore(store: Record<string, VDRDocument[]>): void {
  ensureDataDir();
  try {
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Document Storage] Could not write documents.json:', err);
  }
}

/**
 * Persist an uploaded document's metadata for a given project
 */
export function saveUploadedDocument(projectId: string, doc: VDRDocument): void {
  const store = readDocumentsStore();
  const existing = store[projectId] || [];

  // Remove existing entry for the same file name to prevent duplicates
  const filtered = existing.filter(
    (d) => d.fileName.toLowerCase() !== doc.fileName.toLowerCase()
  );

  store[projectId] = [doc, ...filtered];
  writeDocumentsStore(store);
}

/**
 * Retrieve all documents for a project (persisted custom documents + base mock documents)
 */
export function getProjectDocuments(projectId: string): VDRDocument[] {
  const store = readDocumentsStore();
  const customDocs = store[projectId] || [];

  // Filter out any mock document that has the same name as a custom uploaded doc
  const customNames = new Set(customDocs.map((d) => d.fileName.toLowerCase()));
  const filteredMock = MOCK_VDR_DOCUMENTS.filter(
    (d) => !customNames.has((d.fileName || '').toLowerCase())
  );

  return [...customDocs, ...filteredMock];
}

/**
 * Retrieve only uploaded custom documents for a project
 */
export function getCustomUploadedDocuments(projectId: string): VDRDocument[] {
  const store = readDocumentsStore();
  return store[projectId] || [];
}

/**
 * Persist vector store records to disk
 */
export function saveVectorRecords(records: VectorRecord[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(VECTORS_FILE, JSON.stringify(records), 'utf-8');
  } catch (err) {
    console.warn('[Document Storage] Could not save vectors.json:', err);
  }
}

/**
 * Load vector store records from disk
 */
export function loadVectorRecords(): VectorRecord[] {
  ensureDataDir();
  try {
    if (fs.existsSync(VECTORS_FILE)) {
      const raw = fs.readFileSync(VECTORS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as VectorRecord[];
      }
    }
  } catch (err) {
    console.warn('[Document Storage] Could not read vectors.json:', err);
  }
  return [];
}

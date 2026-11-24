import fs from 'fs';
import path from 'path';
import {
  DueDiligenceProject,
  Holding,
  ProjectDueDiligenceAnalysis,
  ReportItem,
  UserSettings,
  VDRDocument,
  WatchlistItem,
} from '@/types';
import { VectorRecord } from '../rag/types';
import {
  MOCK_DUE_DILIGENCE_PROJECTS,
  MOCK_HOLDINGS,
  MOCK_REPORTS,
  MOCK_VDR_DOCUMENTS,
  MOCK_WATCHLIST,
} from '../mockData';
import { inferCurrencyFromTicker } from '../utils';

const DATA_DIR = path.join(process.cwd(), '.data');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
const VECTORS_FILE = path.join(DATA_DIR, 'vectors.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[Document Storage] Could not create .data directory:', err);
  }
}

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

function writeDocumentsStore(store: Record<string, VDRDocument[]>): void {
  ensureDataDir();
  try {
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Document Storage] Could not write documents.json:', err);
  }
}

export function saveUploadedDocument(projectId: string, doc: VDRDocument): void {
  const store = readDocumentsStore();
  const existing = store[projectId] || [];
  const filtered = existing.filter(
    (d) => d.fileName.toLowerCase() !== doc.fileName.toLowerCase()
  );
  store[projectId] = [doc, ...filtered];
  writeDocumentsStore(store);
}

export function deleteProjectDocument(projectId: string, fileName: string): boolean {
  const store = readDocumentsStore();
  const existing = store[projectId] || [];
  const next = existing.filter(
    (d) => d.fileName.toLowerCase() !== fileName.toLowerCase()
  );
  if (next.length === existing.length) return false;
  store[projectId] = next;
  writeDocumentsStore(store);
  return true;
}

/**
 * Retrieve documents for a project.
 * If the project has custom uploaded PDFs, return those first; only show starter demo
 * VDR docs on seeded demo projects that have no custom uploads yet.
 */
export function getProjectDocuments(projectId: string): VDRDocument[] {
  const store = readDocumentsStore();
  const customDocs = store[projectId] || [];
  if (customDocs.length > 0) {
    return customDocs;
  }
  const seededIds = new Set(['dd-101', 'dd-102', 'dd-103', 'dd-104', 'dd-105']);
  if (seededIds.has(projectId)) {
    return MOCK_VDR_DOCUMENTS;
  }
  return [];
}

export function getCustomUploadedDocuments(projectId: string): VDRDocument[] {
  const store = readDocumentsStore();
  return store[projectId] || [];
}

export function saveVectorRecords(records: VectorRecord[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(VECTORS_FILE, JSON.stringify(records), 'utf-8');
  } catch (err) {
    console.warn('[Document Storage] Could not save vectors.json:', err);
  }
}

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

export function readJsonStore<T>(fileName: string, fallback: T): T {
  ensureDataDir();
  const target = path.join(DATA_DIR, fileName);
  try {
    if (fs.existsSync(target)) {
      return JSON.parse(fs.readFileSync(target, 'utf-8')) as T;
    }
  } catch (err) {
    console.warn(`[App Storage] Failed reading ${fileName}:`, err);
  }
  writeJsonStore(fileName, fallback);
  return fallback;
}

export function writeJsonStore<T>(fileName: string, value: T): void {
  ensureDataDir();
  const target = path.join(DATA_DIR, fileName);
  try {
    fs.writeFileSync(target, JSON.stringify(value, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[App Storage] Failed writing ${fileName}:`, err);
  }
}

export const INITIAL_SETTINGS: UserSettings = {
  model: 'Gemini 3 Flash (Recommended)',
  temperature: 0.1,
  riskTolerance: 'Moderate',
  vdrSync: true,
  liveMarketSync: true,
  updatedAt: new Date().toISOString(),
};

export function getSeededProjects(): DueDiligenceProject[] {
  return MOCK_DUE_DILIGENCE_PROJECTS.map((p) => ({
    ...p,
    currency: inferCurrencyFromTicker(p.ticker),
  }));
}

export function getSeededHoldings(): Holding[] {
  return MOCK_HOLDINGS.map((h) => ({
    ...h,
    currency: inferCurrencyFromTicker(h.ticker),
  }));
}

export function getSeededWatchlist(): WatchlistItem[] {
  return MOCK_WATCHLIST.map((w) => ({
    ...w,
    currency: inferCurrencyFromTicker(w.ticker),
  }));
}

export function getSeededReports(): ReportItem[] {
  return MOCK_REPORTS;
}

export type { ProjectDueDiligenceAnalysis };

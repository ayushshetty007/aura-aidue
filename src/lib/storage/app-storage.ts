import {
  DueDiligenceProject,
  Holding,
  ProjectDueDiligenceAnalysis,
  ReportItem,
  UserSettings,
  WatchlistItem,
} from '@/types';
import {
  INITIAL_SETTINGS,
  getSeededHoldings,
  getSeededProjects,
  getSeededReports,
  getSeededWatchlist,
  readJsonStore,
  writeJsonStore,
} from './document-storage';

export interface StoredChatMessage {
  sender: 'user' | 'copilot';
  text: string;
  time: string;
  isDemoFallback?: boolean;
  evidence?: {
    documentName: string;
    pageNumber: number;
    excerpt: string;
    relevance?: number;
  }[];
  metrics?: {
    latencyMs?: number;
    retrievedCount?: number;
  };
}

// --- Projects ---
export function getProjects(): DueDiligenceProject[] {
  return readJsonStore<DueDiligenceProject[]>('projects.json', getSeededProjects());
}

export function saveProjects(projects: DueDiligenceProject[]): void {
  writeJsonStore('projects.json', projects);
}

export function getProjectById(projectId: string): DueDiligenceProject | undefined {
  return getProjects().find((p) => p.id === projectId);
}

export function upsertProject(project: DueDiligenceProject): DueDiligenceProject[] {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.unshift(project);
  }
  saveProjects(projects);
  return projects;
}

export function deleteProjectById(projectId: string): boolean {
  const projects = getProjects();
  const next = projects.filter((p) => p.id !== projectId);
  if (next.length === projects.length) return false;
  saveProjects(next);
  return true;
}

// --- Cached Single-Call Due Diligence Analyses ---
export function getCachedProjectAnalysis(
  projectId: string
): ProjectDueDiligenceAnalysis | null {
  const map = readJsonStore<Record<string, ProjectDueDiligenceAnalysis>>('analyses.json', {});
  return map[projectId] || null;
}

export function saveProjectAnalysis(
  projectId: string,
  analysis: ProjectDueDiligenceAnalysis
): void {
  const map = readJsonStore<Record<string, ProjectDueDiligenceAnalysis>>('analyses.json', {});
  map[projectId] = analysis;
  writeJsonStore('analyses.json', map);
}

export function invalidateProjectAnalysis(projectId: string): void {
  const map = readJsonStore<Record<string, ProjectDueDiligenceAnalysis>>('analyses.json', {});
  if (map[projectId]) {
    delete map[projectId];
    writeJsonStore('analyses.json', map);
  }
}

// --- Per-Project Q&A Chat History ---
export function getProjectChatHistory(projectId: string): StoredChatMessage[] {
  const chats = readJsonStore<Record<string, StoredChatMessage[]>>('chats.json', {});
  return chats[projectId] || [];
}

export function appendProjectChatMessages(
  projectId: string,
  newMessages: StoredChatMessage[]
): StoredChatMessage[] {
  const chats = readJsonStore<Record<string, StoredChatMessage[]>>('chats.json', {});
  const updated = [...(chats[projectId] || []), ...newMessages].slice(-40);
  chats[projectId] = updated;
  writeJsonStore('chats.json', chats);
  return updated;
}

export function clearProjectChatHistory(projectId: string): void {
  const chats = readJsonStore<Record<string, StoredChatMessage[]>>('chats.json', {});
  delete chats[projectId];
  writeJsonStore('chats.json', chats);
}

// --- Portfolio Holdings ---
export function getPortfolioHoldings(): Holding[] {
  return readJsonStore<Holding[]>('portfolio.json', getSeededHoldings());
}

export function savePortfolioHoldings(holdings: Holding[]): void {
  writeJsonStore('portfolio.json', holdings);
}

// --- Watchlist ---
export function getWatchlistItems(): WatchlistItem[] {
  return readJsonStore<WatchlistItem[]>('watchlist.json', getSeededWatchlist());
}

export function saveWatchlistItems(items: WatchlistItem[]): void {
  writeJsonStore('watchlist.json', items);
}

// --- Reports ---
export function getReports(): ReportItem[] {
  return readJsonStore<ReportItem[]>('reports.json', getSeededReports());
}

export function saveReports(reports: ReportItem[]): void {
  writeJsonStore('reports.json', reports);
}

export function addReport(report: ReportItem): ReportItem[] {
  const current = getReports();
  const next = [report, ...current.filter((r) => r.id !== report.id)];
  saveReports(next);
  return next;
}

// --- User Settings ---
export function getSettings(): UserSettings {
  return readJsonStore<UserSettings>('settings.json', INITIAL_SETTINGS);
}

export function saveSettings(settings: UserSettings): UserSettings {
  const updated: UserSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  writeJsonStore('settings.json', updated);
  return updated;
}

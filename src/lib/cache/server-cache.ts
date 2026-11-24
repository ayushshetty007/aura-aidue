import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.data', 'cache');

interface CacheEnvelope<T> {
  expiresAt: number;
  createdAt: number;
  value: T;
}

const memoryCache = new Map<string, CacheEnvelope<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

function ensureCacheDir(): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch {
    // Fallback to in-memory cache if disk write is unavailable
  }
}

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function getCachedValue<T>(key: string, allowStale = false): T | null {
  const now = Date.now();
  const mem = memoryCache.get(key) as CacheEnvelope<T> | undefined;
  if (mem) {
    if (allowStale || mem.expiresAt > now) {
      return mem.value;
    }
    if (!allowStale) {
      memoryCache.delete(key);
    }
  }

  try {
    const filePath = path.join(CACHE_DIR, `${sanitizeKey(key)}.json`);
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CacheEnvelope<T>;
      if (allowStale || parsed.expiresAt > now) {
        memoryCache.set(key, parsed);
        return parsed.value;
      }
    }
  } catch {
    // Ignore corrupted cache file
  }
  return null;
}

export function setCachedValue<T>(key: string, value: T, ttlMs: number): void {
  const envelope: CacheEnvelope<T> = {
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
    value,
  };
  memoryCache.set(key, envelope);

  ensureCacheDir();
  try {
    const filePath = path.join(CACHE_DIR, `${sanitizeKey(key)}.json`);
    fs.writeFileSync(filePath, JSON.stringify(envelope), 'utf-8');
  } catch {
    // Keep memory cache even if disk write fails
  }
}

/**
 * Coalesce concurrent identical fetches and return stale cache if upstream fails.
 */
export async function withServerCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const fresh = getCachedValue<T>(key, false);
  if (fresh !== null) {
    return fresh;
  }

  const existing = inFlightRequests.get(key) as Promise<T> | undefined;
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    try {
      const result = await fetcher();
      setCachedValue(key, result, ttlMs);
      return result;
    } catch (err) {
      const stale = getCachedValue<T>(key, true);
      if (stale !== null) {
        return stale;
      }
      throw err;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

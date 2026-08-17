const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEnvelope<T> {
  expiresAt: number;
  data: T;
}

function readEnvelope<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as CacheEnvelope<T>;
    if (Date.now() > envelope.expiresAt) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return envelope.data;
  } catch {
    return null;
  }
}

function writeEnvelope<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const envelope: CacheEnvelope<T> = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data,
    };
    window.sessionStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    /* quota exceeded */
  }
}

export function readPortalCatalogCache<T>(key: string): T | null {
  return readEnvelope<T>(key);
}

export function writePortalCatalogCache<T>(key: string, data: T): void {
  writeEnvelope(key, data);
}

export function catalogPageCacheKey(input: {
  search: string;
  categoryId: string | null;
  cursor?: string | null;
}): string {
  return `portal-catalog:${input.categoryId ?? "all"}:${input.search}:${input.cursor ?? "0"}`;
}

export const PORTAL_CATEGORIES_CACHE_KEY = "portal-catalog:categories";

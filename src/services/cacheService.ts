// src/services/cacheService.ts
// In-memory cache with TTL to prevent duplicate requests and save API credits

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  key: string;
}

class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, Promise<unknown>>();

  private defaultTTL = 15 * 60 * 1000; // 15 minutes

  /**
   * Get cached data by key
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /**
   * Store data with optional TTL (ms)
   */
  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      key,
    });
  }

  /**
   * Deduplicate: if a request for the same key is already in flight, return the
   * same Promise instead of firing another request.
   */
  dedup<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.pendingRequests.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fn().finally(() => {
      this.pendingRequests.delete(key);
    });
    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Clear a specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Generate a stable key from parameters
   */
  static buildKey(namespace: string, params: Record<string, unknown>): string {
    return `${namespace}:${JSON.stringify(params)}`;
  }
}

export const cacheService = new CacheService();

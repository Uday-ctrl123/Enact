/**
 * Client-side caching utilities
 * Implements in-memory and localStorage caching with TTL
 */

import { CACHE_CONFIG } from "./constants";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory cache with TTL support
 */
export class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.STALE_TIME): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Persistent cache using localStorage
 */
export class PersistentCache {
  private prefix: string = "cache_";

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.STALE_TIME): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.error("Failed to set cache:", error);
    }
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);

      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();
      const age = now - entry.timestamp;

      if (age > entry.ttl) {
        this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error("Failed to get cache:", error);
      return null;
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error("Failed to delete cache:", error);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const entry: CacheEntry<unknown> = JSON.parse(item);
              const age = now - entry.timestamp;
              if (age > entry.ttl) {
                localStorage.removeItem(key);
              }
            } catch {
              // Invalid entry, remove it
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error("Failed to clear expired cache:", error);
    }
  }
}

// Export singleton instances
export const memoryCache = new MemoryCache();
export const persistentCache = new PersistentCache();

// Clear expired entries periodically
setInterval(() => {
  memoryCache.clearExpired();
  persistentCache.clearExpired();
}, CACHE_CONFIG.GC_TIME);

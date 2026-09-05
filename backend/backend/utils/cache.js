// utils/cache.js
// Simple in-memory LRU-style cache with TTL support using a Map.
// In production with multiple instances, this would be backed by Redis.
// For a single-instance deployment, this is efficient and has zero dependencies.
//
// Interview discussion: "We started with in-memory cache for single-instance.
// The CacheService interface makes it trivial to swap to Redis by changing
// the get/set/del implementations without touching any business logic."

const logger = require('./logger');

class CacheService {
  constructor({ defaultTtlMs = 5 * 60 * 1000 } = {}) {
    this.store = new Map(); // key -> { value, expiresAt }
    this.defaultTtlMs = defaultTtlMs;
    // Periodic cleanup to prevent memory leak
    setInterval(() => this._cleanup(), 60 * 1000).unref();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    logger.debug({ message: 'Cache HIT', key });
    return entry.value;
  }

  set(key, value, ttlMs) {
    const expiresAt = Date.now() + (ttlMs || this.defaultTtlMs);
    this.store.set(key, { value, expiresAt });
    logger.debug({ message: 'Cache SET', key, ttlMs: ttlMs || this.defaultTtlMs });
  }

  del(key) {
    this.store.delete(key);
    logger.debug({ message: 'Cache DEL', key });
  }

  /** Invalidate all keys matching a prefix pattern */
  invalidatePrefix(prefix) {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    logger.info({ message: 'Cache prefix invalidated', prefix, keysRemoved: count });
  }

  _cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  stats() {
    return { size: this.store.size };
  }
}

// Singleton instance shared across the application
const cache = new CacheService({ defaultTtlMs: 5 * 60 * 1000 });

module.exports = { CacheService, cache };

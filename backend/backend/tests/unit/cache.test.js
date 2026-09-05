// tests/unit/cache.test.js
// Unit tests for the CacheService utility.

const { CacheService } = require('../../utils/cache');

describe('CacheService', () => {
  let cache;

  beforeEach(() => {
    cache = new CacheService({ defaultTtlMs: 1000 });
  });

  test('returns null for a cache miss', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  test('sets and gets a value', () => {
    cache.set('key1', { data: 'value' });
    expect(cache.get('key1')).toEqual({ data: 'value' });
  });

  test('returns null for an expired entry', async () => {
    cache.set('expiring', 'val', 50); // 50ms TTL
    await new Promise((r) => setTimeout(r, 100));
    expect(cache.get('expiring')).toBeNull();
  });

  test('deletes a specific key', () => {
    cache.set('toDelete', 'val');
    cache.del('toDelete');
    expect(cache.get('toDelete')).toBeNull();
  });

  test('invalidates all keys with a prefix', () => {
    cache.set('user:123:analytics', 'data1');
    cache.set('user:123:lifeReport', 'data2');
    cache.set('user:456:analytics', 'data3');
    cache.invalidatePrefix('user:123:');
    expect(cache.get('user:123:analytics')).toBeNull();
    expect(cache.get('user:123:lifeReport')).toBeNull();
    expect(cache.get('user:456:analytics')).toEqual('data3'); // unaffected
  });

  test('returns correct stats', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.stats().size).toBe(2);
  });
});

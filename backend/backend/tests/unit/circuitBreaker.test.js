// tests/unit/circuitBreaker.test.js
// Unit tests for the CircuitBreaker utility.
// These have zero external dependencies — perfect isolation.

const { CircuitBreaker } = require('../../utils/circuitBreaker');

describe('CircuitBreaker', () => {
  let cb;

  beforeEach(() => {
    cb = new CircuitBreaker({ failureThreshold: 3, successThreshold: 2, timeout: 100, maxRetries: 1 });
  });

  test('starts in CLOSED state', () => {
    expect(cb.getState()).toBe('CLOSED');
  });

  test('passes through successful calls in CLOSED state', async () => {
    const result = await cb.call(async () => 'success');
    expect(result).toBe('success');
    expect(cb.getState()).toBe('CLOSED');
  });

  test('opens circuit after failureThreshold failures', async () => {
    const failFn = async () => { throw new Error('fail'); };
    const fallback = async () => 'fallback';

    await cb.call(failFn, fallback); // failure 1
    await cb.call(failFn, fallback); // failure 2
    await cb.call(failFn, fallback); // failure 3 → should trip
    expect(cb.getState()).toBe('OPEN');
  });

  test('returns fallback when circuit is OPEN', async () => {
    const failFn = async () => { throw new Error('fail'); };
    await cb.call(failFn, async () => null);
    await cb.call(failFn, async () => null);
    await cb.call(failFn, async () => null); // opens circuit

    const result = await cb.call(failFn, async () => 'fallback_value');
    expect(result).toBe('fallback_value');
  });

  test('moves to HALF_OPEN after timeout', async () => {
    jest.useFakeTimers();
    const failFn = async () => { throw new Error('fail'); };
    const fallback = async () => 'fb';

    await cb.call(failFn, fallback);
    await cb.call(failFn, fallback);
    await cb.call(failFn, fallback); // opens

    // Advance time past the timeout
    jest.advanceTimersByTime(200);
    cb.nextAttempt = Date.now() - 1; // manually set past timeout

    expect(cb.getState()).toBe('OPEN');
    // After timeout, the next call should transition to HALF_OPEN
    cb._toHalfOpen();
    expect(cb.getState()).toBe('HALF_OPEN');
    jest.useRealTimers();
  });

  test('closes circuit after successThreshold successes in HALF_OPEN', async () => {
    cb._toHalfOpen();
    await cb.call(async () => 'ok');
    await cb.call(async () => 'ok'); // 2 successes → should close
    expect(cb.getState()).toBe('CLOSED');
  });
});

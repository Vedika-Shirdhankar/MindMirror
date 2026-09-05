// utils/circuitBreaker.js
// A lightweight Circuit Breaker with exponential backoff for external AI API calls.
//
// States:
//   CLOSED   — normal operation; requests pass through
//   OPEN     — too many failures; requests are blocked and a fallback is returned
//   HALF_OPEN — one test request allowed after the reset timeout
//
// Interview discussion points:
//   - Prevents cascading failures when Gemini is overloaded
//   - Exponential backoff reduces thundering herd problem
//   - Fallback ensures users always get a response

const logger = require('./logger');

const STATES = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

class CircuitBreaker {
  /**
   * @param {object} opts
   * @param {number} opts.failureThreshold  – failures before opening the circuit (default: 5)
   * @param {number} opts.successThreshold  – successes in HALF_OPEN before closing (default: 2)
   * @param {number} opts.timeout           – ms to wait in OPEN before trying again (default: 30s)
   * @param {number} opts.maxRetries        – max retries per call in CLOSED state (default: 3)
   */
  constructor({ failureThreshold = 5, successThreshold = 2, timeout = 30000, maxRetries = 3 } = {}) {
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.timeout = timeout;
    this.maxRetries = maxRetries;

    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }

  async call(fn, fallback) {
    if (this.state === STATES.OPEN) {
      if (Date.now() < this.nextAttempt) {
        logger.warn({ message: 'Circuit is OPEN — returning fallback', state: this.state });
        return fallback ? fallback() : Promise.reject(new Error('Circuit breaker is OPEN'));
      }
      this._toHalfOpen();
    }

    try {
      const result = await this._callWithRetry(fn);
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure(err);
      if (fallback) return fallback();
      throw err;
    }
  }

  async _callWithRetry(fn) {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt >= this.maxRetries) throw err;
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // exponential backoff, max 10s
        logger.warn({ message: `Retrying after failure`, attempt, delayMs: delay, error: err.message });
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  _onSuccess() {
    this.failureCount = 0;
    if (this.state === STATES.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this._toClosed();
      }
    }
  }

  _onFailure(err) {
    this.failureCount++;
    logger.error({ message: 'Circuit breaker recorded failure', failureCount: this.failureCount, error: err.message });
    if (this.failureCount >= this.failureThreshold) {
      this._toOpen();
    }
  }

  _toClosed() {
    logger.info({ message: 'Circuit breaker → CLOSED' });
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
  }

  _toOpen() {
    logger.warn({ message: 'Circuit breaker → OPEN', retryAfterMs: this.timeout });
    this.state = STATES.OPEN;
    this.nextAttempt = Date.now() + this.timeout;
  }

  _toHalfOpen() {
    logger.info({ message: 'Circuit breaker → HALF_OPEN' });
    this.state = STATES.HALF_OPEN;
    this.successCount = 0;
  }

  getState() {
    return this.state;
  }
}

// Singleton circuit breakers per external service
const geminiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 60000, // 1 minute cooldown
  maxRetries: 3,
});

module.exports = { CircuitBreaker, geminiCircuitBreaker };

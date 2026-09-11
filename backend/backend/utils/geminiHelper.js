// utils/geminiHelper.js
// Centralized helper for executing Gemini API calls with automatic key pool rotation & 429 rate limit fallback.

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Returns an array of all available and non-empty Gemini API keys from environment variables.
 */
function getApiKeys() {
  return [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_FALLBACK_1,
    process.env.GEMINI_API_KEY_FALLBACK_2,
    process.env.GEMINI_API_KEY_FALLBACK_3,
  ].filter(Boolean);
}

/**
 * Executes a Gemini operation function `(genAI, key) => Promise<result>` across available API keys.
 * If a key hits 429 (Rate limit) or quota failure, it seamlessly attempts the next key in the pool.
 *
 * @param {Function} apiCallback - Function accepting (genAI instance, apiKey)
 * @returns {Promise<any>}
 */
async function executeWithFallback(apiCallback) {
  const keys = getApiKeys();
  if (!keys.length) {
    throw new Error('No Gemini API key configured on server.');
  }

  let lastError = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const genAI = new GoogleGenerativeAI(key);
      return await apiCallback(genAI, key);
    } catch (err) {
      lastError = err;
      const isRateLimitOrQuota = err.status === 429 || /quota|too many requests|rate limit|resource_exhausted/i.test(err.message || '');
      const isAuthError = err.status === 401 || /unauthenticated|invalid api key/i.test(err.message || '');

      if ((isRateLimitOrQuota || isAuthError) && i < keys.length - 1) {
        console.warn(`[GeminiHelper] Key #${i + 1} failed (${err.status || err.message}). Switching to fallback key #${i + 2}...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

module.exports = {
  getApiKeys,
  executeWithFallback,
};

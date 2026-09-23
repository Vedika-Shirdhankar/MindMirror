// services/mlService.js
// Client service for the MindMirror DistilBERT ML inference microservice.
//
// Architecture: Node Backend → Python FastAPI (DistilBERT)
// Provides text classification signals with graceful fallback.

const logger = require('../utils/logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Sends journal text to the local Python DistilBERT service for sequence classification.
 * Returns { label, confidence, scores, available } or a safe fallback if the service is unreachable.
 *
 * @param {string} text - User journal text
 * @returns {Promise<{ label: string|null, confidence: number|null, scores: Record<string, number>|null, available: boolean, error?: string }>}
 */
async function classifyJournal(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return { label: null, confidence: null, scores: null, available: false, error: 'Empty text' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      logger.warn({
        message: 'ML inference service returned non-200 status',
        status: response.status,
        error: errorText,
      });
      return {
        label: null,
        confidence: null,
        scores: null,
        available: false,
        error: `ML service status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      label: data.label,
      confidence: typeof data.confidence === 'number' ? data.confidence : null,
      scores: data.scores || null,
      available: true,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    // Graceful fallback — never crash the backend or block journal creation if ML service is down
    logger.warn({
      message: 'ML inference service is currently unreachable',
      error: err.name === 'AbortError' ? 'Request timed out' : err.message,
      url: ML_SERVICE_URL,
    });

    return {
      label: null,
      confidence: null,
      scores: null,
      available: false,
      error: err.message,
    };
  }
}

/**
 * Health check for the Python ML service.
 * @returns {Promise<{ status: string, modelLoaded: boolean, available: boolean }>}
 */
async function checkMlHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { status: 'error', modelLoaded: false, available: false };
    }
    const data = await response.json();
    return {
      status: data.status || 'ok',
      modelLoaded: Boolean(data.modelLoaded),
      available: true,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return { status: 'unavailable', modelLoaded: false, available: false, error: err.message };
  }
}

module.exports = {
  classifyJournal,
  checkMlHealth,
  ML_SERVICE_URL,
};

// services/mlService.js
// MindMirror DistilBERT classification via Hugging Face Inference API.
//
// Architecture (production): Node Backend → HF Inference API → Vedika16S/mindmirror-distilbert
// Architecture (local dev):  Node Backend → Python FastAPI (localhost:8000)   [if ML_SERVICE_URL is set]
//
// No separate Python service needed on Render — HF hosts the model inference.

const logger = require('../utils/logger');

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL_REPO = process.env.HF_MODEL_REPO || 'Vedika16S/mindmirror-distilbert';
const HF_INFERENCE_URL = `https://api-inference.huggingface.co/models/${HF_MODEL_REPO}`;

// Fallback: local Python ML service for dev (used only if HF_TOKEN is not set)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Normalise the HF Inference API response into our standard shape.
 * HF returns: [ [{ label, score }, ...] ]  (array of arrays for text-classification)
 */
function parseHFResponse(data) {
  // HF wraps results in an outer array for batched inputs
  const results = Array.isArray(data[0]) ? data[0] : data;

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('Unexpected HF Inference API response shape');
  }

  // Sort descending by score to find top label
  const sorted = [...results].sort((a, b) => b.score - a.score);
  const top = sorted[0];

  const scores = {};
  for (const item of results) {
    scores[item.label] = round4(item.score);
  }

  return {
    label: top.label,
    confidence: round4(top.score),
    scores,
    available: true,
  };
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

/**
 * Classify journal text using the fine-tuned MindMirror DistilBERT model.
 * Uses HF Inference API in production; falls back to local Python service in dev.
 *
 * @param {string} text
 * @returns {Promise<{ label: string|null, confidence: number|null, scores: Record<string,number>|null, available: boolean, error?: string }>}
 */
async function classifyJournal(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return { label: null, confidence: null, scores: null, available: false, error: 'Empty text' };
  }

  // ── Production path: Hugging Face Inference API ──────────────────────────
  if (HF_TOKEN) {
    return classifyViaHF(text.trim());
  }

  // ── Dev fallback: local Python FastAPI service ───────────────────────────
  logger.warn({
    message: 'HF_TOKEN not set — falling back to local Python ML service',
    url: ML_SERVICE_URL,
  });
  return classifyViaLocalService(text.trim());
}

async function classifyViaHF(text) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(HF_INFERENCE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HF_TOKEN}`,
      },
      body: JSON.stringify({ inputs: text }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // HF returns 503 while the model is loading — treat as transient unavailability
    if (response.status === 503) {
      const body = await response.json().catch(() => ({}));
      const waitSecs = body.estimated_time ? Math.ceil(body.estimated_time) : '?';
      logger.warn({ message: `HF model is loading, estimated wait: ${waitSecs}s` });
      return { label: null, confidence: null, scores: null, available: false, error: 'Model loading' };
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      logger.warn({ message: 'HF Inference API non-200', status: response.status, error: errorText });
      return { label: null, confidence: null, scores: null, available: false, error: `HF API ${response.status}` };
    }

    const data = await response.json();
    const result = parseHFResponse(data);
    logger.info({ message: 'HF ML classification', label: result.label, confidence: result.confidence });
    return result;

  } catch (err) {
    clearTimeout(timeoutId);
    logger.warn({
      message: 'HF Inference API unreachable',
      error: err.name === 'AbortError' ? 'Request timed out' : err.message,
    });
    return { label: null, confidence: null, scores: null, available: false, error: err.message };
  }
}

async function classifyViaLocalService(text) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return { label: null, confidence: null, scores: null, available: false, error: `ML service ${response.status}: ${errorText}` };
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
    logger.warn({
      message: 'Local ML service unreachable',
      error: err.name === 'AbortError' ? 'Request timed out' : err.message,
      url: ML_SERVICE_URL,
    });
    return { label: null, confidence: null, scores: null, available: false, error: err.message };
  }
}

/**
 * Health check — works for both HF API and local service.
 */
async function checkMlHealth() {
  if (HF_TOKEN) {
    // Ping HF API with a minimal input to verify connectivity
    const result = await classifyViaHF('test');
    const loading = result.error === 'Model loading';
    return {
      status: result.available || loading ? 'ok' : 'unavailable',
      modelLoaded: result.available,
      available: result.available || loading,
      backend: 'huggingface',
    };
  }

  // Local health check
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return { status: 'error', modelLoaded: false, available: false, backend: 'local' };
    const data = await response.json();
    return { status: data.status || 'ok', modelLoaded: Boolean(data.modelLoaded), available: true, backend: 'local' };
  } catch (err) {
    clearTimeout(timeoutId);
    return { status: 'unavailable', modelLoaded: false, available: false, error: err.message, backend: 'local' };
  }
}

module.exports = {
  classifyJournal,
  checkMlHealth,
  ML_SERVICE_URL,
};

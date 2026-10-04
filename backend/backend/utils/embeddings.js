// ml/embeddings.js
//
// PRIMARY FEATURE: Journal Embeddings + Similarity Search
// Generates vector embeddings for journal text using Google's current Gemini
// embedding model, and computes cosine similarity between vectors.

const { executeWithFallback } = require('./geminiHelper');

const EMBEDDING_MODEL = 'gemini-embedding-001';
// Keep this aligned with the existing MongoDB vector index and stored entries.
const EMBEDDING_DIMENSIONS = 768;

/**
 * Generates an embedding vector for a piece of text using Gemini's embedding model.
 * Uses key rotation via executeWithFallback for resilience.
 * @param {string} text
 * @returns {Promise<number[]>} a 768-dimension embedding vector
 */
async function generateEmbedding(text) {
  if (!text || !text.trim()) {
    throw new Error('Cannot generate an embedding for empty text.');
  }

  const values = await executeWithFallback(async (genAI) => {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent({
      content: { parts: [{ text: text.trim() }] },
      outputDimensionality: EMBEDDING_DIMENSIONS,
    });
    const vals = result?.embedding?.values;
    if (!Array.isArray(vals) || vals.length === 0) {
      throw new Error('Gemini returned an empty embedding.');
    }
    return vals;
  });

  return values;
}

/**
 * Generates embeddings for multiple texts in parallel (used for backfilling
 * older entries that don't have embeddings yet).
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
async function generateEmbeddingsBatch(texts) {
  // Gemini's free tier has rate limits; run in small sequential batches
  // rather than firing everything in parallel to avoid 429s.
  const BATCH_SIZE = 5;
  const results = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(t => generateEmbedding(t)));
    results.push(...batchResults);
  }
  return results;
}

/**
 * Cosine similarity between two equal-length vectors. Returns a value in [-1, 1],
 * where 1 means identical direction (maximally similar) and 0 means unrelated.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  generateEmbedding,
  generateEmbeddingsBatch,
  cosineSimilarity,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
};
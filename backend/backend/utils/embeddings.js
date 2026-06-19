// ml/embeddings.js
//
// PRIMARY FEATURE: Journal Embeddings + Similarity Search
// Generates vector embeddings for journal text using Google Gemini's
// text-embedding-004 model, and computes cosine similarity between vectors.

const { GoogleGenerativeAI } = require('@google/generative-ai');

const EMBEDDING_MODEL = 'text-embedding-004';
const EMBEDDING_DIMENSIONS = 768; // text-embedding-004 output size

let cachedGenAI = null;
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  if (!cachedGenAI) {
    cachedGenAI = new GoogleGenerativeAI(apiKey);
  }
  return cachedGenAI;
}

/**
 * Generates an embedding vector for a piece of text using Gemini's embedding model.
 * @param {string} text
 * @returns {Promise<number[]>} a 768-dimension embedding vector
 */
async function generateEmbedding(text) {
  if (!text || !text.trim()) {
    throw new Error('Cannot generate an embedding for empty text.');
  }

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

  const result = await model.embedContent(text.trim());
  const values = result?.embedding?.values;

  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Gemini returned an empty embedding.');
  }

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
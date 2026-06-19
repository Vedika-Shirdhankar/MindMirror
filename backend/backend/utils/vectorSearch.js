// ml/vectorSearch.js
//
// PRIMARY FEATURE: Vector Database integration.
// Uses MongoDB Atlas Vector Search ($vectorSearch aggregation stage) to find
// semantically similar journal entries by embedding distance.
//
// IMPORTANT: $vectorSearch requires an Atlas Search vector index named
// 'journal_vector_index' to exist on the JournalEntry collection (see
// ml/createVectorIndex.js for the setup script). Atlas builds this index
// asynchronously, so immediately after first deploy it may not be queryable
// yet. To keep the feature usable even then, this module automatically falls
// back to an in-application cosine-similarity scan if the vector index isn't
// available or errors out — functionally identical results, just without the
// performance benefit of the ANN index at scale.

const mongoose = require('mongoose');
const { cosineSimilarity } = require('./embeddings');

const VECTOR_INDEX_NAME = 'journal_vector_index';

/**
 * Finds the top-K most semantically similar journal entries to a given embedding,
 * scoped to a single user, excluding a given entry id (typically the entry the
 * embedding came from).
 *
 * @param {object} JournalEntry - the Mongoose model
 * @param {object} params
 * @param {number[]} params.embedding - query embedding vector
 * @param {string} params.userId - restrict results to this user's entries
 * @param {string} [params.excludeEntryId] - entry id to exclude from results (usually the source entry)
 * @param {number} [params.limit] - number of results to return (default 3)
 * @returns {Promise<Array<{ entry: object, score: number }>>}
 */
async function findSimilarEntries(JournalEntry, { embedding, userId, excludeEntryId, limit = 3 }) {
  try {
    return await vectorSearchAtlas(JournalEntry, { embedding, userId, excludeEntryId, limit });
  } catch (err) {
    console.warn('⚠️  Atlas $vectorSearch unavailable, falling back to in-app cosine similarity:', err.message);
    return await cosineSimilarityFallback(JournalEntry, { embedding, userId, excludeEntryId, limit });
  }
}

/**
 * Real MongoDB Atlas Vector Search implementation using the $vectorSearch
 * aggregation stage. Requires the 'journal_vector_index' Atlas Search index.
 */
async function vectorSearchAtlas(JournalEntry, { embedding, userId, excludeEntryId, limit }) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const pipeline = [
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: 'embedding',
        queryVector: embedding,
        numCandidates: 100,
        limit: limit + 1, // +1 in case the source entry itself comes back, filtered below
      },
    },
    {
      $match: { user: userObjectId },
    },
    {
      $project: {
        text: 1,
        date: 1,
        themes: 1,
        mood_score: 1,
        mood: 1,
        summary: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ];

  const results = await JournalEntry.aggregate(pipeline);

  const filtered = results.filter(r => String(r._id) !== String(excludeEntryId)).slice(0, limit);

  return filtered.map(r => ({ entry: r, score: r.score }));
}

/**
 * Fallback path: pulls the user's other entries that have a stored embedding
 * and ranks them by cosine similarity in application code. Used when Atlas
 * Vector Search isn't available (e.g. index still building, non-Atlas Mongo
 * in local dev, or a transient error).
 */
async function cosineSimilarityFallback(JournalEntry, { embedding, userId, excludeEntryId, limit }) {
  const candidates = await JournalEntry.find({
    user: userId,
    _id: { $ne: excludeEntryId },
    embedding: { $exists: true, $ne: [] },
  })
    .select('text date themes mood_score mood summary embedding')
    .lean();

  const scored = candidates
    .map(c => ({ entry: c, score: cosineSimilarity(embedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Strip the embedding array out of what we return — it's large and the
  // caller never needs the raw vector back.
  return scored.map(({ entry, score }) => {
    const { embedding: _omit, ...rest } = entry;
    return { entry: rest, score };
  });
}

module.exports = { findSimilarEntries, VECTOR_INDEX_NAME };
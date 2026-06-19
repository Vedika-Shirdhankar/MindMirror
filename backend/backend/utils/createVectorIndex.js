// ml/createVectorIndex.js
//
// One-time setup script: creates the Atlas Search vector index required for
// $vectorSearch queries against JournalEntry.embedding. Atlas Vector Search
// indexes can only be created via the Atlas UI, Atlas Admin API, or the driver's
// createSearchIndex() helper (Atlas clusters only — this will fail against a
// non-Atlas / local MongoDB deployment, by design).
//
// Run manually after deploying, whenever the schema's embedding dimensions change,
// or once after first connecting to a fresh Atlas cluster:
//
//   node ml/createVectorIndex.js
//
// Safe to re-run — it checks for an existing index with the same name first.

require('dotenv').config();
const mongoose = require('mongoose');
const { EMBEDDING_DIMENSIONS } = require('./embeddings');
const { VECTOR_INDEX_NAME } = require('./vectorSearch');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`✅ Connected to ${mongoose.connection.name}`);

  const collection = mongoose.connection.collection('journalentries');

  const existing = await collection.listSearchIndexes(VECTOR_INDEX_NAME).toArray().catch(() => []);
  if (existing.length > 0) {
    console.log(`ℹ️  Index "${VECTOR_INDEX_NAME}" already exists. Skipping creation.`);
    console.log('   Status:', existing[0].status || existing[0].queryable);
    await mongoose.disconnect();
    return;
  }

  console.log(`Creating Atlas Vector Search index "${VECTOR_INDEX_NAME}"...`);

  try {
    await collection.createSearchIndex({
      name: VECTOR_INDEX_NAME,
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            path: 'embedding',
            numDimensions: EMBEDDING_DIMENSIONS,
            similarity: 'cosine',
          },
          {
            type: 'filter',
            path: 'user',
          },
        ],
      },
    });
    console.log('✅ Vector index creation requested. Atlas will build it asynchronously —');
    console.log('   this typically takes a few minutes. Until it finishes, the app will');
    console.log('   automatically use the in-application cosine-similarity fallback.');
    console.log('   Check status in Atlas UI under your cluster → Search → Indexes,');
    console.log(`   or re-run this script — it will report the index status if found.`);
  } catch (err) {
    console.error('❌ Failed to create vector index:', err.message);
    console.error('   This command requires a MongoDB Atlas cluster (M10+ or a Search-enabled');
    console.error('   shared tier). It will not work against a local/self-hosted MongoDB.');
    console.error('   The app will still function using the cosine-similarity fallback in');
    console.error('   ml/vectorSearch.js, just without Atlas\'s ANN performance at scale.');
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
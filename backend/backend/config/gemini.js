module.exports = {
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  embeddingModel: 'text-embedding-004'
};

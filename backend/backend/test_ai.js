require('dotenv').config();
const { GoogleAIFileManager } = require('@google/generative-ai/server');

try {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API KEY exists:", !!apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);
  console.log("fileManager created:", fileManager);
} catch (err) {
  console.error("Error creating GoogleAIFileManager:", err);
}

// services/hfService.js
// Hugging Face / MindMirror ML Service Bridge.
// Integrates the fine-tuned MindMirror DistilBERT model for text pattern classification.

const { classifyJournal } = require('./mlService');

/**
 * Classify journal / user text using the fine-tuned MindMirror DistilBERT model.
 * @param {string} text - Input text.
 * @returns {Promise<{ label: string|null, confidence: number|null, scores: Record<string, number>|null, available: boolean }>}
 */
async function classifyText(text) {
  return classifyJournal(text);
}

module.exports = { classifyText };


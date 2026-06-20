// utils/actionExtractor.js
//
// Automatically extracts actions from text (journal entries, resolution notes,
// video notes, chat messages) using Gemini and saves them to ActionMemory.
// All operations are fire-and-forget — never block the calling request.

const { GoogleGenerativeAI } = require('@google/generative-ai');
const ActionMemory = require('../models/ActionMemory');

/**
 * Ask Gemini to extract concrete actions from a piece of text.
 * Returns an array of { actionTaken, outcome, helpful } objects.
 *
 * @param {string} text        - Raw text to analyse
 * @param {string} apiKey      - Gemini API key
 * @returns {Promise<Array>}
 */
async function extractActionsFromText(text, apiKey) {
  if (!text?.trim() || !apiKey) return [];

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are an action extractor for a mental health journaling app.

Read the following text and extract any concrete actions the person took or mentions taking.
Focus on:
- Coping strategies they used
- Behavioural changes they made
- Things they tried that helped or didn't help
- Habits or routines they mention

Return ONLY a valid JSON array (no markdown, no preamble). Each item must have:
{
  "actionTaken": "brief description of the action (max 8 words)",
  "outcome": "brief outcome if mentioned, otherwise empty string",
  "helpful": true or false (was this action helpful or unhelpful?)
}

If no concrete actions are found, return an empty array: []

TEXT:
"""
${text.trim().slice(0, 1500)}
"""`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const raw = result.response.text().replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (a) =>
      typeof a.actionTaken === 'string' &&
      a.actionTaken.trim().length > 0 &&
      typeof a.helpful === 'boolean'
  );
}

/**
 * Extract actions from text and persist them to ActionMemory.
 * This is fire-and-forget — call without await from controllers.
 *
 * @param {string} text        - Source text to extract from
 * @param {string} sourceType  - 'JournalEntry' | 'ResolutionNote' | 'VideoReflection' | 'CompanionConversation'
 * @param {string} sourceId    - ObjectId of the source document
 * @param {string} userId      - ObjectId of the user
 */
async function extractAndSaveActions(text, sourceType, sourceId, userId) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !text?.trim()) return;

  try {
    const actions = await extractActionsFromText(text, apiKey);
    if (!actions.length) return;

    const docs = actions.map((a) => ({
      user: userId,
      actionTaken: a.actionTaken.trim(),
      outcome: (a.outcome || '').trim(),
      helpful: a.helpful,
      sourceType,
      sourceId,
    }));

    await ActionMemory.insertMany(docs, { ordered: false });
    console.log(`[ActionMemory] Saved ${docs.length} action(s) from ${sourceType}`);
  } catch (err) {
    // Never let extraction failures bubble up — it's background intelligence
    console.warn(`[ActionMemory] Extraction failed for ${sourceType}:`, err.message);
  }
}

module.exports = { extractAndSaveActions };

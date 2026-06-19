// utils/aiAnalysis.js
//
// This is the heart of enhancements #1, #2, #3, #4, #5, #6, #10.
// One function call to Gemini returns ALL structured fields in a single pass.

const { GoogleGenerativeAI } = require('@google/generative-ai');

const VALID_THEMES = [
  'fear_of_failure', 'career_anxiety', 'self_worth', 'loneliness',
  'overwhelm', 'relationship', 'academic', 'regret',
];

const VALID_TRIGGERS = [
  'academics', 'placements', 'family', 'health', 'relationships',
  'self_esteem', 'future_uncertainty', 'finances', 'social', 'work',
];

const RISK_LEVELS = ['none', 'low', 'moderate', 'high'];
const TRENDS = ['improving', 'worsening', 'stable', 'unknown'];

/**
 * Builds the system prompt instructing Gemini to return ONLY the structured JSON shape.
 */
function buildSystemPrompt(previousEntries) {
  const history = previousEntries
    .slice(0, 8)
    .map(e => `- [${new Date(e.date).toISOString().split('T')[0]}] mood_score:${e.mood_score ?? e.mood ?? '?'} themes:${(e.themes || []).join(',')} text:"${e.text.slice(0, 100)}"`)
    .join('\n');

  return `You are a clinical-aware (but NOT diagnostic) emotional analysis engine for a mental wellness journaling app called MindMirror.

Given a NEW journal entry and the user's past entries (for context), analyze the new entry and return ONLY a single valid JSON object matching EXACTLY this shape:

{
  "themes": [],
  "triggers": [],
  "sentiment": "",
  "mood_score": 5,
  "summary": "",
  "coping_suggestions": [],
  "trend": "",
  "related_memories": [],
  "risk_level": "",
  "needs_support": false
}

FIELD RULES:
- "themes": array of strings, ONLY from this fixed list: ${VALID_THEMES.join(', ')}. Pick 1-3 that genuinely apply.
- "triggers": array of strings, ONLY from this fixed list: ${VALID_TRIGGERS.join(', ')}. Pick what's actually implied by the text.
- "sentiment": exactly one of "positive", "neutral", "negative", "mixed".
- "mood_score": integer 1-10, where 1 = completely calm/at peace and 10 = severe acute distress. This is a DISTRESS score, not a happiness score. NEVER return 0.
- "summary": ONE sentence, warm and non-judgmental, reflecting back what the person is going through. Do not diagnose. Do not use clinical labels.
- "coping_suggestions": array of 2-4 short, concrete, personalized coping strategy strings (e.g. "A 10-minute walk outside", "Write down one fact vs. one fear about this situation"). Base these on what's worked for this user before if their history shows it; otherwise suggest evidence-based general strategies. Never suggest anything involving pain, physical discomfort, or self-harm substitutes.
- "trend": exactly one of "improving", "worsening", "stable", "unknown". Compare this entry's implied distress to the trajectory of past entries provided. Use "unknown" if there isn't enough history.
- "related_memories": array of objects { "index": <0-based index into the PAST ENTRIES list below, indicating which one is similar>, "reason": "<one short phrase explaining the similarity>" }. Only include genuinely similar entries (similar theme, trigger, or emotional shape). Return [] if none are similar. Maximum 3.
- "risk_level": exactly one of "none", "low", "moderate", "high". Base this STRICTLY on language indicating hopelessness, severe distress, self-harm ideation, or crisis. Most everyday stress/anxiety entries should be "none" or "low". Reserve "high" for explicit or strongly implied self-harm/suicidal language.
- "needs_support": boolean. true if risk_level is "moderate" or "high", OR if the entry suggests the person is in genuine crisis and should be pointed toward professional/crisis support.

PAST ENTRIES (for trend comparison and similar-memory matching, 0-indexed in order given):
${history || 'No past entries yet — this is the first entry.'}

Return ONLY the JSON object. Do not wrap in markdown code blocks.`;
}

/**
 * Calls Gemini API to analyze a new journal entry text against past entries.
 * @param {string} entryText - the new journal entry text
 * @param {Array} previousEntries - array of past JournalEntry docs (plain objects), most recent first
 * @param {string} [userApiKey] - legacy user API key fallback
 * @returns {Promise<object>} structured analysis object matching the spec shape
 */
async function analyzeJournalEntry(entryText, previousEntries, userApiKey) {
  const apiKey = process.env.GEMINI_API_KEY || userApiKey;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: buildSystemPrompt(previousEntries),
  });

  const prompt = `NEW JOURNAL ENTRY:\n"${entryText}"`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const rawText = result.response.text();

  let parsed;
  try {
    parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
  } catch (err) {
    console.error('Failed to parse Gemini output:', rawText);
    throw new Error('AI returned malformed JSON. Please try again.');
  }

  return sanitizeAnalysis(parsed, previousEntries);
}

/**
 * Defensive sanitization — never trust raw LLM output blindly.
 * Clamps values to known-valid enums/ranges and resolves related_memories
 * indices into actual ObjectIds from the previousEntries array.
 */
function sanitizeAnalysis(raw, previousEntries) {
  const themes = Array.isArray(raw.themes) ? raw.themes.filter(t => VALID_THEMES.includes(t)).slice(0, 3) : [];
  const triggers = Array.isArray(raw.triggers) ? raw.triggers.filter(t => VALID_TRIGGERS.includes(t)).slice(0, 4) : [];
  const sentiment = ['positive', 'neutral', 'negative', 'mixed'].includes(raw.sentiment) ? raw.sentiment : 'neutral';
  // mood_score must be 1-10 to match the JournalEntry schema minimum of 1 on the `mood` field.
  // Clamp to [1,10] — never allow 0 (Gemini sometimes returns 0 for very calm entries).
  const mood_score = clampInt(raw.mood_score, 1, 10, 5);
  const summary = typeof raw.summary === 'string' ? raw.summary.slice(0, 300) : '';
  const coping_suggestions = Array.isArray(raw.coping_suggestions) ? raw.coping_suggestions.slice(0, 4).map(s => String(s).slice(0, 200)) : [];
  const trend = TRENDS.includes(raw.trend) ? raw.trend : 'unknown';
  const risk_level = RISK_LEVELS.includes(raw.risk_level) ? raw.risk_level : 'none';
  const needs_support = typeof raw.needs_support === 'boolean' ? raw.needs_support : (risk_level === 'moderate' || risk_level === 'high');

  const related_memories = Array.isArray(raw.related_memories)
    ? raw.related_memories
        .filter(m => typeof m.index === 'number' && previousEntries[m.index])
        .slice(0, 3)
        .map(m => ({
          entryId: previousEntries[m.index]._id,
          reason: typeof m.reason === 'string' ? m.reason.slice(0, 200) : 'Similar emotional pattern',
        }))
    : [];

  return { themes, triggers, sentiment, mood_score, summary, coping_suggestions, trend, related_memories, risk_level, needs_support };
}

function clampInt(val, min, max, fallback) {
  const n = parseInt(val, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

module.exports = { analyzeJournalEntry, VALID_THEMES, VALID_TRIGGERS, RISK_LEVELS, TRENDS };
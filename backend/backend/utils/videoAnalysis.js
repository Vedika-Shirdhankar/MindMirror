// utils/videoAnalysis.js
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const { VALID_THEMES, VALID_TRIGGERS } = require('./aiAnalysis');

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const VALID_STRESS_LEVELS = ['low', 'moderate', 'high', 'severe'];
const VALID_RISK_LEVELS = ['none', 'low', 'moderate', 'high'];

async function analyzeVideoReflection(filePath, mimeType = 'video/webm', language = 'en') {
  console.log(`[videoAnalysis] Starting analyzeVideoReflection for ${filePath} (${mimeType}) in ${language}`);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[videoAnalysis] GEMINI_API_KEY is missing');
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const fileManager = new GoogleAIFileManager(apiKey);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  // 1. Upload the file
  console.log(`[videoAnalysis] Uploading file to Gemini File API...`);
  let uploadResult;
  try {
    uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: "Video Reflection",
    });
    console.log(`[videoAnalysis] File uploaded. URI: ${uploadResult.file.uri}, Name: ${uploadResult.file.name}`);
  } catch (err) {
    console.error('[videoAnalysis] File upload failed:', err.message, err.stack);
    throw err;
  }
  
  const fileId = uploadResult.file.name;
  let fileState = uploadResult.file.state;

  // 2. Poll until ACTIVE
  console.log(`[videoAnalysis] Polling for ACTIVE state. Current state: ${fileState}`);
  while (fileState === "PROCESSING") {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const getResult = await fileManager.getFile(fileId);
      fileState = getResult.state;
      console.log(`[videoAnalysis] Polled state: ${fileState}`);
      if (fileState === "FAILED") {
        console.error('[videoAnalysis] File processing FAILED in Google AI Manager');
        throw new Error("Video processing failed in Google AI Manager.");
      }
    } catch (err) {
      console.error('[videoAnalysis] Error polling file status:', err.message);
      throw err;
    }
  }

  // 3. Generate content with enhanced multimodal prompt
  console.log(`[videoAnalysis] Generating content with enhanced multimodal prompt...`);

  const systemPrompt = `The user's preferred language is ${language}. Respond entirely in ${language} using its native script for all free-text fields (summary, coping_suggestions, positive_affirmations, actionable_next_steps, recurring_thoughts, emotional_patterns, cognitive_distortions, gratitude_points, anxiety_indicators, burnout_indicators, aiGeneratedInsights, transcript). System fields MUST remain in English.

You are a compassionate, clinical-aware emotional analysis engine for a mental wellness app called MindMirror.

You are watching a personal video reflection recorded by someone who is trying to process their emotions and grow.

Perform a COMPREHENSIVE multimodal analysis of this video. Pay careful attention to:

1. SPOKEN WORDS — transcribe everything the person says, accurately and completely
2. TONE OF VOICE — emotional quality, pitch changes, vocal strain, trembling, steadiness
3. SPEAKING PACE — rushed speech (anxiety), slow/flat (depression/fatigue), natural flow
4. PAUSES AND SILENCE — hesitations before difficult topics, emotional pauses, sighs
5. EMOTIONAL INTENSITY — how strongly emotions are expressed vs. suppressed
6. FACIAL EXPRESSIONS — visible emotions in the face (when visible)
7. BODY LANGUAGE — posture, gestures, fidgeting, self-soothing behaviors (when visible)
8. OVERALL CONTEXT — the complete emotional story this person is telling

Return ONLY a valid JSON object with EXACTLY this shape:

{
  "transcript": "",
  "summary": "",
  "dominant_emotion": "",
  "secondary_emotions": [],
  "sentiment": "",
  "mood_score": 5,
  "themes": [],
  "triggers": [],
  "recurring_thoughts": [],
  "emotional_patterns": [],
  "cognitive_distortions": [],
  "gratitude_points": [],
  "stress_level": "",
  "anxiety_indicators": [],
  "burnout_indicators": [],
  "coping_suggestions": [],
  "positive_affirmations": [],
  "actionable_next_steps": [],
  "actionsMentioned": [],
  "aiGeneratedInsights": "",
  "risk_level": "",
  "needs_support": false
}

FIELD RULES:

- "transcript": The COMPLETE, word-for-word spoken transcript. Include natural pauses as "..." and emotional moments in [brackets] like [voice breaking], [long pause], [laughs softly]. Be thorough — every word matters.

- "summary": ONE warm, empathetic sentence reflecting what this person is going through. Non-judgmental. No clinical labels.

- "dominant_emotion": The single strongest emotion you observe (e.g. "sadness", "anxiety", "hope", "frustration", "relief", "confusion", "gratitude", "anger", "loneliness", "determination").

- "secondary_emotions": Array of 1-3 other emotions present but less dominant.

- "sentiment": Exactly one of "positive", "neutral", "negative", "mixed".

- "mood_score": Integer 1-10 where 1 = completely calm/at peace and 10 = severe acute distress. This is a DISTRESS score.

- "themes": Array from ONLY this list: ${VALID_THEMES.join(', ')}. Pick 1-3 that genuinely apply.

- "triggers": Array from ONLY this list: ${VALID_TRIGGERS.join(', ')}. Pick 0-3 that are actually implied.

- "recurring_thoughts": Array of 1-3 thought patterns you notice the person returning to (e.g. "I'm not good enough", "What if things don't work out", "Nobody understands me"). Use their approximate words.

- "emotional_patterns": Array of 1-3 patterns you observe (e.g. "Minimizes own feelings", "Seeks external validation", "Catastrophizes future outcomes", "Self-blame before problem-solving").

- "cognitive_distortions": Array of 0-3 cognitive distortions if present (e.g. "All-or-nothing thinking", "Catastrophizing", "Mind reading", "Emotional reasoning", "Should statements", "Personalization"). Only include clearly evident ones.

- "gratitude_points": Array of 0-3 things the person expressed gratitude or positivity about, even briefly. Empty array if none.

- "stress_level": Exactly one of "low", "moderate", "high", "severe".

- "anxiety_indicators": Array of 0-3 specific behavioral/verbal signs of anxiety you observed (e.g. "Rapid speech pattern", "Fidgeting with hands", "Multiple what-if scenarios").

- "burnout_indicators": Array of 0-3 signs of burnout if present (e.g. "Emotional exhaustion in voice", "Detachment from activities", "Expressed feeling of being overwhelmed by routine tasks").

- "coping_suggestions": Array of 2-4 short, concrete, personalized coping strategies. Base them on what the person actually discussed. Never suggest anything harmful.

- "positive_affirmations": Array of 2-3 encouraging affirmations tailored to what this specific person needs to hear right now.

- "actionable_next_steps": Array of 1-3 small, manageable next steps the person could take based on what they discussed.

- "actionsMentioned": Array of 0-3 actions the person specifically mentioned planning or having taken.

- "aiGeneratedInsights": One thoughtful observation about their reflection that they might not have noticed themselves — something encouraging or illuminating.

- "risk_level": Exactly one of "none", "low", "moderate", "high". Base STRICTLY on hopelessness, self-harm language, or crisis indicators. Most everyday stress = "none" or "low".

- "needs_support": Boolean. True only if risk_level is "moderate" or "high".

IMPORTANT:
- Be warm and empathetic in all text you generate. This person trusted MindMirror with something vulnerable.
- Never diagnose. Never use clinical labels in user-facing text.
- Return ONLY the JSON object. No markdown code blocks.`;

  let result;
  try {
    result = await model.generateContent([
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        }
      },
      { text: systemPrompt }
    ]);
    console.log(`[videoAnalysis] Content generated successfully`);
  } catch (err) {
    console.error('[videoAnalysis] model.generateContent failed:', err.message, err.stack);
    throw err;
  }

  const rawText = result.response.text();

  // 4. Cleanup the file to save quota
  console.log(`[videoAnalysis] Cleaning up file ${fileId}`);
  try {
    await fileManager.deleteFile(fileId);
  } catch (err) {
    console.warn('[videoAnalysis] Failed to delete file from Gemini:', err.message);
  }

  // 5. Parse and sanitize
  let parsed;
  try {
    parsed = JSON.parse(rawText.replace(/\`\`\`json|\`\`\`/g, '').trim());
    console.log(`[videoAnalysis] Successfully parsed JSON output`);
  } catch (err) {
    console.error('[videoAnalysis] Failed to parse video Gemini output:', rawText);
    throw new Error('AI returned malformed JSON for video.');
  }

  return sanitizeVideoAnalysis(parsed);
}

function sanitizeVideoAnalysis(raw) {
  // — Core fields (existing) —
  const transcript = typeof raw.transcript === 'string' ? raw.transcript : '';
  const summary = typeof raw.summary === 'string' ? raw.summary.slice(0, 500) : '';
  const themes = Array.isArray(raw.themes) ? raw.themes.filter(t => VALID_THEMES.includes(t)).slice(0, 3) : [];
  const triggers = Array.isArray(raw.triggers) ? raw.triggers.filter(t => VALID_TRIGGERS.includes(t)).slice(0, 4) : [];
  const sentiment = ['positive', 'neutral', 'negative', 'mixed'].includes(raw.sentiment) ? raw.sentiment : 'neutral';
  
  let mood_score = parseInt(raw.mood_score, 10);
  if (isNaN(mood_score)) mood_score = 5;
  mood_score = Math.max(1, Math.min(10, mood_score));

  const actionsMentioned = sanitizeStringArray(raw.actionsMentioned, 3, 200);
  const aiGeneratedInsights = typeof raw.aiGeneratedInsights === 'string' ? raw.aiGeneratedInsights.slice(0, 500) : '';

  // — Enhanced multimodal fields (new) —
  const dominant_emotion = typeof raw.dominant_emotion === 'string' ? raw.dominant_emotion.slice(0, 50) : '';
  const secondary_emotions = sanitizeStringArray(raw.secondary_emotions, 3, 50);
  const emotional_patterns = sanitizeStringArray(raw.emotional_patterns, 3, 200);
  const recurring_thoughts = sanitizeStringArray(raw.recurring_thoughts, 3, 200);
  const cognitive_distortions = sanitizeStringArray(raw.cognitive_distortions, 3, 100);
  const gratitude_points = sanitizeStringArray(raw.gratitude_points, 3, 200);
  const coping_suggestions = sanitizeStringArray(raw.coping_suggestions, 4, 200);
  const positive_affirmations = sanitizeStringArray(raw.positive_affirmations, 3, 200);
  const actionable_next_steps = sanitizeStringArray(raw.actionable_next_steps, 3, 200);
  const anxiety_indicators = sanitizeStringArray(raw.anxiety_indicators, 3, 200);
  const burnout_indicators = sanitizeStringArray(raw.burnout_indicators, 3, 200);

  const stress_level = VALID_STRESS_LEVELS.includes(raw.stress_level) ? raw.stress_level : '';
  const risk_level = VALID_RISK_LEVELS.includes(raw.risk_level) ? raw.risk_level : 'none';
  const needs_support = typeof raw.needs_support === 'boolean'
    ? raw.needs_support
    : (risk_level === 'moderate' || risk_level === 'high');

  return {
    transcript, summary, themes, triggers, sentiment, mood_score,
    actionsMentioned, aiGeneratedInsights,
    dominant_emotion, secondary_emotions, emotional_patterns,
    recurring_thoughts, cognitive_distortions, gratitude_points,
    coping_suggestions, positive_affirmations, actionable_next_steps,
    anxiety_indicators, burnout_indicators,
    stress_level, risk_level, needs_support,
  };
}

/** Safely extract an array of trimmed strings, with max count and max length per item */
function sanitizeStringArray(arr, maxCount, maxLen) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(s => typeof s === 'string' && s.trim())
    .slice(0, maxCount)
    .map(s => s.trim().slice(0, maxLen));
}

module.exports = { analyzeVideoReflection };

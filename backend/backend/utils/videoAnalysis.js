// utils/videoAnalysis.js
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const { VALID_THEMES, VALID_TRIGGERS } = require('./aiAnalysis');

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

async function analyzeVideoReflection(filePath, mimeType = 'video/webm') {
  console.log(`[videoAnalysis] Starting analyzeVideoReflection for ${filePath} (${mimeType})`);
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

  // 3. Generate content
  console.log(`[videoAnalysis] Generating content...`);
  const systemPrompt = `You are a clinical-aware emotional analysis engine for a mental wellness app.
Analyze the provided video reflection.
Return ONLY a valid JSON object with EXACTLY the following shape:

{
  "transcript": "",
  "summary": "",
  "themes": [],
  "triggers": [],
  "sentiment": "",
  "mood_score": 5,
  "actionsMentioned": [],
  "aiGeneratedInsights": ""
}

FIELD RULES:
- "transcript": The full spoken transcript of the video, capturing the user's words.
- "summary": ONE sentence, warm and non-judgmental, reflecting back what the person is going through.
- "themes": array of strings ONLY from this fixed list: ${VALID_THEMES.join(', ')}. Pick 1-3.
- "triggers": array of strings ONLY from this fixed list: ${VALID_TRIGGERS.join(', ')}. Pick 0-3.
- "sentiment": exactly one of "positive", "neutral", "negative", "mixed".
- "mood_score": integer 1-10, where 1 = completely calm/at peace and 10 = severe acute distress.
- "actionsMentioned": array of strings (max 3), representing any actions the user plans to take or mentioned taking.
- "aiGeneratedInsights": One short, encouraging observation about their reflection (e.g. "You seem to feel more grounded after making a plan").

Return ONLY the JSON object. Do not wrap in markdown code blocks.`;

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
  const transcript = typeof raw.transcript === 'string' ? raw.transcript : '';
  const summary = typeof raw.summary === 'string' ? raw.summary.slice(0, 300) : '';
  const themes = Array.isArray(raw.themes) ? raw.themes.filter(t => VALID_THEMES.includes(t)).slice(0, 3) : [];
  const triggers = Array.isArray(raw.triggers) ? raw.triggers.filter(t => VALID_TRIGGERS.includes(t)).slice(0, 4) : [];
  const sentiment = ['positive', 'neutral', 'negative', 'mixed'].includes(raw.sentiment) ? raw.sentiment : 'neutral';
  
  let mood_score = parseInt(raw.mood_score, 10);
  if (isNaN(mood_score)) mood_score = 5;
  mood_score = Math.max(1, Math.min(10, mood_score));

  const actionsMentioned = Array.isArray(raw.actionsMentioned) ? raw.actionsMentioned.slice(0, 3).map(s => String(s)) : [];
  const aiGeneratedInsights = typeof raw.aiGeneratedInsights === 'string' ? raw.aiGeneratedInsights.slice(0, 300) : '';

  return { transcript, summary, themes, triggers, sentiment, mood_score, actionsMentioned, aiGeneratedInsights };
}

module.exports = { analyzeVideoReflection };

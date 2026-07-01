// utils/pastSelfRetrieval.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const VideoReflection = require('../models/VideoReflection');
const { generateEmbedding } = require('./embeddings');
const { findSimilarVideos } = require('./vectorSearch');

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

/**
 * Perform semantic search over video transcripts and ask Gemini if a 
 * highly relevant past reflection matches the user's current concern.
 */
async function retrievePastSelfRecommendation(currentConcernText, userId) {
  if (!currentConcernText || !currentConcernText.trim()) return null;

  try {
    // 1. Semantic search for relevant videos
    const queryEmbedding = await generateEmbedding(currentConcernText);
    const similarVideos = await findSimilarVideos(VideoReflection, { 
      embedding: queryEmbedding, 
      userId, 
      limit: 3 
    });

    // Filter to only completed videos with transcripts
    const candidateVideos = similarVideos
      .map(r => r.video)
      .filter(v => v.processingStatus === 'completed' && v.transcript);

    if (candidateVideos.length === 0) return null;

    // Pick the top match
    const topVideo = candidateVideos[0];

    // 2. Ask Gemini to evaluate the match and extract a snippet
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `You are a memory retrieval engine for MindMirror.
Your task is to determine if a user's past video reflection is highly relevant to their current concern.

CURRENT CONCERN:
"${currentConcernText}"

PAST REFLECTION:
Title: ${topVideo.title}
Themes: ${(topVideo.themes || []).join(', ')}
Transcript:
${topVideo.transcript}

Return ONLY a valid JSON object matching EXACTLY this shape:
{
  "isMatch": true,
  "confidence": 8,
  "reason": "Why this reflection is relevant...",
  "transcriptSnippet": "Extract a 1-2 sentence verbatim quote from the transcript that is highly relevant"
}

RULES:
- "isMatch" should be true only if the past reflection is genuinely helpful or closely related to the current concern.
- "confidence" should be an integer between 0 and 10.
- "reason" should be brief, explaining why this is relevant (e.g. "Recorded during a similar emotional period.").
- "transcriptSnippet" MUST be an exact quote from the transcript provided. Do not hallucinate.
Return ONLY JSON. Do not wrap in markdown code blocks.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const rawText = result.response.text();
    let parsed;
    try {
      parsed = JSON.parse(rawText.replace(/\`\`\`json|\`\`\`/g, '').trim());
    } catch (e) {
      console.error('Failed to parse pastSelfRetrieval Gemini output:', rawText);
      return null;
    }

    // 3. Enforce confidence threshold
    if (parsed.isMatch && parsed.confidence >= 7) {
      return {
        videoId: topVideo._id,
        title: topVideo.title,
        date: topVideo.createdAt,
        videoUrl: topVideo.videoUrl,
        transcriptSnippet: parsed.transcriptSnippet || '',
        reason: parsed.reason || 'Relevant past reflection found.',
        confidence: parsed.confidence,
        note: topVideo.note,
        summary: topVideo.summary,
        transcript: topVideo.transcript
      };
    }

    return null;
  } catch (err) {
    console.warn('[PastSelfRetrieval error]:', err.message);
    return null; // Fail gracefully
  }
}

module.exports = { retrievePastSelfRecommendation };

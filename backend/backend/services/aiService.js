import OpenAI from 'openai';
import { fetchTopAnchors } from './retrievalService.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. Define the system prompt template
const EMOTION_DETECTION_PROMPT = `
You are an empathetic emotional classifier for MindMirror.

Analyze the user's input and perform two actions:
1. Identify the primary underlying emotional state from ONLY these options: 
   ["anxious", "sad", "overthinking", "tired", "lost", "unmotivated"]
2. Extract 2-3 relevant keywords/topics causing this state.

Respond strictly in valid JSON format matching this schema:
{
  "detectedCategory": "anxious",
  "confidence": 0.92,
  "keywords": ["exams", "academics"]
}
`;

export const processJournalEntry = async (userId, userJournalText) => {
  // 2. Pass the prompt as the "system" message to the LLM
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' }, // Ensures structured JSON output
    messages: [
      { role: 'system', content: EMOTION_DETECTION_PROMPT },
      { role: 'user', content: userJournalText },
    ],
  });

  // 3. Parse the emotion returned by the AI
  const analysis = JSON.parse(response.choices[0].message.content);
  
  // 4. Pass the detected emotion directly into your Smart Retrieval algorithm
  const relevantAnchors = await fetchTopAnchors(
    userId, 
    analysis.detectedCategory, 
    userJournalText
  );

  return {
    emotion: analysis.detectedCategory,
    keywords: analysis.keywords,
    suggestedAnchors: relevantAnchors,
  };
};
// controllers/chatController.js
const Chat = require('../models/Chat');
const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const { CRISIS_RESOURCES } = require('../utils/crisisResources');
const { GoogleGenerativeAI } = require('@google/generative-ai');

function buildCompanionSystemPrompt(entries) {
  const recent = entries.slice(0, 10);
  const journeyContext = recent
    .map(e => `[${new Date(e.date).toISOString().split('T')[0]}] mood_score:${e.mood_score ?? e.mood} themes:${(e.themes || []).join(',')} trend:${e.trend || 'n/a'} | "${e.text.slice(0, 100)}"${e.resolved ? ` → Resolved: ${e.resolvedNote}` : ''}`)
    .join('\n');

  return `You are MindMirror, a compassionate AI companion focused on mental wellness and emotional growth. You are NOT a therapist or doctor — you are a supportive companion.

Your core purpose: Help users see their emotional patterns, resilience, and growth over time. When they catastrophize, gently surface memories of similar past struggles they survived.

PERSONALITY: Warm, gentle, non-judgmental, emotionally intelligent, realistic (not toxic positivity). Concise (2-4 sentences). Ask ONE thoughtful question per response.

CRITICAL RULES:
- Never diagnose or give medical advice.
- Never promise outcomes.
- If the user expresses thoughts of self-harm or hopelessness, respond with warmth and gently encourage reaching out to a crisis line (iCall India: 9152987821, available 24/7 options also exist). Do not lecture; one caring sentence is enough — the app will also surface resources separately.
- Always validate emotions BEFORE reframing.

USER'S EMOTIONAL JOURNEY:
${journeyContext || 'No past entries yet.'}

Keep responses under 150 words.`;
}

// GET /api/chat/history
async function getHistory(req, res, next) {
  try {
    let chat = await Chat.findOne({ user: req.userId });
    if (!chat) chat = await Chat.create({ user: req.userId, messages: [] });
    res.json({ messages: chat.messages });
  } catch (err) {
    next(err);
  }
}

// POST /api/chat/message
async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Message content is required.' });

    const apiKey = process.env.GEMINI_API_KEY;

    let chat = await Chat.findOne({ user: req.userId });
    if (!chat) chat = await Chat.create({ user: req.userId, messages: [] });

    chat.messages.push({ role: 'user', content: content.trim() });

    if (!apiKey) {
      const fallback = "I hear you. To enable my full memory and reflection capabilities, please configure the GEMINI_API_KEY on the server. In the meantime, I'm still here to listen.";
      chat.messages.push({ role: 'assistant', content: fallback });
      await chat.save();
      return res.json({ reply: fallback, messages: chat.messages });
    }

    const entries = await JournalEntry.find({ user: req.userId }).sort({ date: -1 }).limit(15).lean();
    const systemPrompt = buildCompanionSystemPrompt(entries);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Translate past messages to Gemini format (role must be 'user' or 'model')
    const geminiContents = chat.messages.slice(-20).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const result = await model.generateContent({
      contents: geminiContents,
    });

    const reply = result.response.text() || "I'm here. Can you tell me more?";

    chat.messages.push({ role: 'assistant', content: reply });
    await chat.save();

    // Lightweight risk check on the user's message text
    const riskFlag = /\b(suicide|kill myself|end my life|self harm|hurt myself|no reason to live)\b/i.test(content);

    res.json({ reply, messages: chat.messages, support: riskFlag ? CRISIS_RESOURCES : undefined });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHistory, sendMessage };
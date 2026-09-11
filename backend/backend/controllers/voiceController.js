const { executeWithFallback } = require('../utils/geminiHelper');
const config = require('../config');

async function transcribeAudio(req, res, next) {
  try {
    const { audio, mimeType } = req.body;
    if (!audio) return res.status(400).json({ error: 'Audio data is required' });

    const base64Audio = audio.includes(',') ? audio.split(',')[1] : audio;

    const transcript = await executeWithFallback(async (genAI) => {
      const model = genAI.getGenerativeModel({ model: config.gemini.model || 'gemini-3.6-flash' });
      const result = await model.generateContent([
        'Transcribe the following audio exactly. Output ONLY the transcription, without any markdown formatting, quotes, or conversational filler.',
        { inlineData: { mimeType: mimeType || 'audio/webm', data: base64Audio } }
      ]);
      return result.response.text();
    });

    res.json({ text: (transcript || '').trim() });
  } catch (err) {
    next(err);
  }
}

module.exports = { transcribeAudio };
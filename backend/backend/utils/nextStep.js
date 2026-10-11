// utils/nextStep.js
// Turns a journal entry into ONE concrete, time-boxed action.
// Never throws: falls back to a generic step so the UI always has something to do.

const { executeWithFallback, getApiKeys } = require('./geminiHelper');

const FALLBACK_STEP =
  'Set a 10-minute timer and start the smallest piece of your most important task.';
const FALLBACK_STEP_RUMINATION =
  'Write the one decision you can make about this today, then start a 10-minute task unrelated to it.';

async function generateNextStep({ text, summary = '', themes = [], ruminating = false }) {
  const fallback = ruminating ? FALLBACK_STEP_RUMINATION : FALLBACK_STEP;
  if (!text?.trim() || !getApiKeys().length) return fallback;

  const prompt = `You help a student turn a journal entry into action.

Give exactly ONE next step that:
- starts with a verb and is concrete and observable (not "reflect", "think about", "process", "be kind to yourself")
- can be started within 5 minutes and finished in 10 minutes or less
- moves real work, a real decision, or a real conversation forward
- if the entry shows exhaustion or overwhelm, make it tiny (2 minutes)
${ruminating ? '- the person keeps writing about this same topic with nothing new, so the step must be a DECISION or an unrelated 10-minute task, not more reflection\n' : ''}
Max 20 words. Return ONLY JSON: {"step": "..."}

ENTRY:
"""
${text.trim().slice(0, 1500)}
"""
${summary ? `SUMMARY: ${String(summary).slice(0, 300)}` : ''}
${themes?.length ? `THEMES: ${themes.join(', ')}` : ''}`;

  try {
    return await executeWithFallback(async (genAI) => {
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
      });
      const res = await model.generateContent(prompt);
      const parsed = JSON.parse(res.response.text().replace(/```json|```/g, '').trim());
      const step = typeof parsed?.step === 'string' ? parsed.step.trim() : '';
      return step.length >= 5 && step.length <= 200 ? step : fallback;
    });
  } catch (err) {
    console.warn('[nextStep] generation failed:', err.message);
    return fallback;
  }
}

module.exports = { generateNextStep, FALLBACK_STEP, FALLBACK_STEP_RUMINATION };
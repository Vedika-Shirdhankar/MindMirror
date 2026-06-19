// controllers/analyticsController.js
const JournalEntry = require('../models/JournalEntry');

// GET /api/analytics/dashboard
// Aggregates everything the frontend Analytics Dashboard needs in one call.
async function getDashboard(req, res, next) {
  try {
    const entries = await JournalEntry.find({ user: req.userId }).sort({ date: 1 }).lean();

    if (entries.length === 0) {
      return res.json({
        moodTrend: [], themeFrequency: [], triggerFrequency: [],
        copingEffectiveness: [], sentimentBreakdown: {}, totalEntries: 0,
        resolvedCount: 0, currentTrend: 'unknown', riskFlags: 0,
      });
    }

    // ── Mood trend over time ──
    const moodTrend = entries.map(e => ({
      date: e.date,
      mood_score: e.mood_score ?? e.mood ?? null,
    }));

    // ── Theme frequency ──
    const themeCounts = {};
    entries.forEach(e => (e.themes || []).forEach(t => { themeCounts[t] = (themeCounts[t] || 0) + 1; }));
    const themeFrequency = Object.entries(themeCounts)
      .map(([theme, count]) => ({ theme, count, pct: Math.round((count / entries.length) * 100) }))
      .sort((a, b) => b.count - a.count);

    // ── Trigger frequency ──
    const triggerCounts = {};
    entries.forEach(e => (e.triggers || []).forEach(t => { triggerCounts[t] = (triggerCounts[t] || 0) + 1; }));
    const triggerFrequency = Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count, pct: Math.round((count / entries.length) * 100) }))
      .sort((a, b) => b.count - a.count);

    // ── Coping strategy effectiveness ──
    // Effectiveness = average mood_score improvement in entries logged AFTER this strategy was used,
    // compared to entries where it wasn't. Simpler proxy: average mood_score of entries where strategy
    // was used (lower distress score after using it = more "effective" looking).
    const copingStats = {};
    entries.forEach(e => {
      (e.copingUsed || []).forEach(strategy => {
        if (!copingStats[strategy]) copingStats[strategy] = { count: 0, totalMood: 0 };
        copingStats[strategy].count += 1;
        copingStats[strategy].totalMood += (e.mood_score ?? e.mood ?? 5);
      });
    });
    const copingEffectiveness = Object.entries(copingStats)
      .map(([strategy, stat]) => ({
        strategy,
        timesUsed: stat.count,
        avgDistressAfter: Math.round((stat.totalMood / stat.count) * 10) / 10,
        // Lower avg distress = higher effectiveness score (inverted, out of 10)
        effectivenessScore: Math.round((10 - stat.totalMood / stat.count) * 10) / 10,
      }))
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore);

    // ── Sentiment breakdown ──
    const sentimentBreakdown = {};
    entries.forEach(e => {
      const s = e.sentiment || 'neutral';
      sentimentBreakdown[s] = (sentimentBreakdown[s] || 0) + 1;
    });

    // ── Current trend (most recent entry's trend field) ──
    const currentTrend = entries[entries.length - 1]?.trend || 'unknown';

    // ── Risk flags count (entries with moderate/high risk) ──
    const riskFlags = entries.filter(e => e.risk_level === 'moderate' || e.risk_level === 'high').length;

    res.json({
      moodTrend,
      themeFrequency,
      triggerFrequency,
      copingEffectiveness,
      sentimentBreakdown,
      totalEntries: entries.length,
      resolvedCount: entries.filter(e => e.resolved).length,
      currentTrend,
      riskFlags,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
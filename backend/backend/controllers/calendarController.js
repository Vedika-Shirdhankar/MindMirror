// controllers/calendarController.js
const JournalEntry = require('../models/JournalEntry');
const MonthlyReflection = require('../models/MonthlyReflection');
const { cache } = require('../utils/cache');
const { executeWithFallback } = require('../utils/geminiHelper');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Returns formatted 'YYYY-MM-DD' for a date in the given timezone.
 */
function getDateStringInTimezone(date, timezone) {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch (e) {
    return new Date(date).toISOString().split('T')[0];
  }
}

/**
 * Calculates number of days in a given year and month (1-indexed).
 */
function getDaysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Maps mood score (1-10) to a mood category.
 */
function getMoodCategory(score) {
  if (score == null) return 'unknown';
  if (score <= 3) return 'calm';
  if (score <= 5) return 'balanced';
  if (score <= 7) return 'elevated';
  return 'distressed';
}

/**
 * Determines a primary emotion for an entry based on emotions array, sentiment, or mood score.
 */
function getPrimaryEmotion(entry) {
  if (entry.emotions && entry.emotions.length > 0) {
    // Pick the emotion with highest intensity
    const sorted = [...entry.emotions].sort((a, b) => (b.intensity || 1) - (a.intensity || 1));
    return sorted[0].emotion;
  }
  if (entry.sentiment === 'positive') return 'joy';
  if (entry.sentiment === 'negative') {
    return (entry.mood_score || entry.mood || 5) > 7 ? 'anxiety' : 'sadness';
  }
  return 'calm';
}

/**
 * GET /api/journal/calendar
 * Query params:
 *   year: number (default: current year)
 *   month: number (1-12, default: current month)
 *   timezone: string (default: 'UTC')
 */
async function getCalendarData(req, res, next) {
  try {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;

    if (req.query.year !== undefined && req.query.year !== '') {
      year = parseInt(req.query.year, 10);
      if (isNaN(year) || year < 2000 || year > 2100) {
        return res.status(400).json({ success: false, error: 'Invalid year specified.' });
      }
    }

    if (req.query.month !== undefined && req.query.month !== '') {
      month = parseInt(req.query.month, 10);
      if (isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ success: false, error: 'Invalid month specified (1-12).' });
      }
    }

    const timezone = req.query.timezone || 'UTC';

    // Previous month computation
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    // Boundary query buffer: fetch spanning 2 months with safety margins
    const queryStart = new Date(Date.UTC(prevYear, prevMonth - 1, 1, 0, 0, 0));
    queryStart.setDate(queryStart.getDate() - 2);

    const queryEnd = new Date(Date.UTC(year, month, 1, 23, 59, 59));
    queryEnd.setDate(queryEnd.getDate() + 2);

    // Do NOT use .lean() here — JournalEntry encrypts text/summary/affirmation/etc.
    // at rest via Mongoose getters. .lean() bypasses those getters returning raw ciphertext.
    // We fetch full documents then convert with getters: true so decrypt() runs on each field.
    const rawDocs = await JournalEntry.find({
      user: req.userId,
      date: { $gte: queryStart, $lte: queryEnd },
    }).sort({ date: 1 });

    const entries = rawDocs.map((doc) => doc.toObject({ getters: true }));

    const targetMonthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    const prevMonthPrefix = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const currentMonthEntries = [];
    const prevMonthEntries = [];

    entries.forEach((e) => {
      const dateStr = getDateStringInTimezone(e.date, timezone);
      if (dateStr.startsWith(targetMonthPrefix)) {
        currentMonthEntries.push({ ...e, localDateStr: dateStr });
      } else if (dateStr.startsWith(prevMonthPrefix)) {
        prevMonthEntries.push({ ...e, localDateStr: dateStr });
      }
    });

    // Group current month entries by date
    const daysInMonth = getDaysInMonth(year, month);
    const daysMap = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${targetMonthPrefix}-${String(day).padStart(2, '0')}`;
      daysMap[dateStr] = {
        date: dateStr,
        dayNumber: day,
        hasEntries: false,
        entriesCount: 0,
        entries: [],
        averageMoodScore: null,
        dominantMoodCategory: null,
        dominantEmotion: null,
        emotions: [],
      };
    }

    currentMonthEntries.forEach((e) => {
      const dateStr = e.localDateStr;
      if (!daysMap[dateStr]) return;

      const dayObj = daysMap[dateStr];
      dayObj.hasEntries = true;
      dayObj.entriesCount += 1;

      const moodScore = e.mood_score ?? e.mood ?? null;
      const primaryEm = getPrimaryEmotion(e);

      dayObj.entries.push({
        _id: e._id,
        date: e.date,
        text: e.text,
        mood: e.mood,
        mood_score: e.mood_score,
        sentiment: e.sentiment,
        summary: e.summary,
        themes: e.themes || [],
        triggers: e.triggers || [],
        emotions: e.emotions || [],
        copingUsed: e.copingUsed || [],
        coping_suggestions: e.coping_suggestions || [],
        distortions: e.distortions || [],
        growth_suggestion: e.growth_suggestion || '',
        affirmation: e.affirmation || '',
        risk_level: e.risk_level || 'none',
        resolved: e.resolved || false,
        primaryEmotion: primaryEm,
      });

      if (e.emotions && Array.isArray(e.emotions)) {
        e.emotions.forEach((em) => {
          if (em && em.emotion && !dayObj.emotions.some((x) => x.emotion === em.emotion)) {
            dayObj.emotions.push({ emotion: em.emotion, intensity: em.intensity || 1 });
          }
        });
      }
    });

    // Calculate daily averages and dominant mood
    Object.values(daysMap).forEach((dayObj) => {
      if (dayObj.entriesCount > 0) {
        const scores = dayObj.entries
          .map((e) => e.mood_score ?? e.mood)
          .filter((s) => s != null && Number.isFinite(s));

        if (scores.length > 0) {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          dayObj.averageMoodScore = Math.round(avg * 10) / 10;
          dayObj.dominantMoodCategory = getMoodCategory(dayObj.averageMoodScore);
        }

        // Dominant emotion for the day
        const emotionTally = {};
        dayObj.entries.forEach((e) => {
          const em = e.primaryEmotion || 'calm';
          emotionTally[em] = (emotionTally[em] || 0) + 1;
        });
        const sorted = Object.entries(emotionTally).sort((a, b) => b[1] - a[1]);
        dayObj.dominantEmotion = sorted.length > 0 ? sorted[0][0] : null;
      }
    });

    // ─── Mood Insights Calculation (Derived ONLY from real data) ───
    const emotionStats = {};
    let totalEmotionsLogged = 0;

    currentMonthEntries.forEach((e) => {
      if (e.emotions && e.emotions.length > 0) {
        e.emotions.forEach(({ emotion, intensity }) => {
          if (!emotion) return;
          totalEmotionsLogged += 1;
          if (!emotionStats[emotion]) {
            emotionStats[emotion] = { count: 0, totalIntensity: 0 };
          }
          emotionStats[emotion].count += 1;
          emotionStats[emotion].totalIntensity += (intensity || 1);
        });
      } else {
        const fallbackEm = getPrimaryEmotion(e);
        if (fallbackEm) {
          totalEmotionsLogged += 1;
          if (!emotionStats[fallbackEm]) {
            emotionStats[fallbackEm] = { count: 0, totalIntensity: 0 };
          }
          emotionStats[fallbackEm].count += 1;
          emotionStats[fallbackEm].totalIntensity += 3;
        }
      }
    });

    const mostFrequentEmotions = Object.entries(emotionStats)
      .map(([emotion, data]) => ({
        emotion,
        count: data.count,
        percentage: totalEmotionsLogged > 0 ? Math.round((data.count / totalEmotionsLogged) * 100) : 0,
        averageIntensity: Math.round((data.totalIntensity / data.count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    // Weekly Distribution
    const weeks = [
      { weekNumber: 1, label: 'Days 1–7', days: [1, 7], entries: 0, scores: [] },
      { weekNumber: 2, label: 'Days 8–14', days: [8, 14], entries: 0, scores: [] },
      { weekNumber: 3, label: 'Days 15–21', days: [15, 21], entries: 0, scores: [] },
      { weekNumber: 4, label: 'Days 22–28', days: [22, 28], entries: 0, scores: [] },
      { weekNumber: 5, label: `Days 29–${daysInMonth}`, days: [29, daysInMonth], entries: 0, scores: [] },
    ];

    currentMonthEntries.forEach((e) => {
      const dayNum = parseInt(e.localDateStr.split('-')[2], 10);
      const score = e.mood_score ?? e.mood;
      const targetWeek = weeks.find((w) => dayNum >= w.days[0] && dayNum <= w.days[1]);
      if (targetWeek) {
        targetWeek.entries += 1;
        if (score != null && Number.isFinite(score)) {
          targetWeek.scores.push(score);
        }
      }
    });

    const weeklyDistribution = weeks.map((w) => ({
      weekNumber: w.weekNumber,
      label: w.label,
      entriesCount: w.entries,
      averageMoodScore:
        w.scores.length > 0
          ? Math.round((w.scores.reduce((a, b) => a + b, 0) / w.scores.length) * 10) / 10
          : null,
    }));

    // Monthly Mood Distribution (Distribution across mood brackets)
    const moodBuckets = { calm: 0, balanced: 0, elevated: 0, distressed: 0 };
    currentMonthEntries.forEach((e) => {
      const score = e.mood_score ?? e.mood ?? null;
      if (score != null) {
        const cat = getMoodCategory(score);
        moodBuckets[cat] = (moodBuckets[cat] || 0) + 1;
      }
    });

    // Journaling Consistency
    const activeDaysCount = Object.values(daysMap).filter((d) => d.hasEntries).length;
    const consistencyPercentage = Math.round((activeDaysCount / daysInMonth) * 100);

    // Calculate month streak (max consecutive active days within this month)
    let maxStreakInMonth = 0;
    let currentStreakCounter = 0;
    Object.values(daysMap).forEach((d) => {
      if (d.hasEntries) {
        currentStreakCounter += 1;
        if (currentStreakCounter > maxStreakInMonth) {
          maxStreakInMonth = currentStreakCounter;
        }
      } else {
        currentStreakCounter = 0;
      }
    });

    // Changes in emotional patterns over time (First half vs Second half)
    const firstHalfEntries = currentMonthEntries.filter((e) => parseInt(e.localDateStr.split('-')[2], 10) <= 15);
    const secondHalfEntries = currentMonthEntries.filter((e) => parseInt(e.localDateStr.split('-')[2], 10) > 15);

    const firstHalfScores = firstHalfEntries
      .map((e) => e.mood_score ?? e.mood)
      .filter((s) => s != null && Number.isFinite(s));
    const secondHalfScores = secondHalfEntries
      .map((e) => e.mood_score ?? e.mood)
      .filter((s) => s != null && Number.isFinite(s));

    const firstHalfAvg =
      firstHalfScores.length > 0
        ? Math.round((firstHalfScores.reduce((a, b) => a + b, 0) / firstHalfScores.length) * 10) / 10
        : null;
    const secondHalfAvg =
      secondHalfScores.length > 0
        ? Math.round((secondHalfScores.reduce((a, b) => a + b, 0) / secondHalfScores.length) * 10) / 10
        : null;

    let emotionalPatternShift = 'insufficient_data';
    if (firstHalfAvg !== null && secondHalfAvg !== null) {
      const diff = secondHalfAvg - firstHalfAvg;
      if (diff <= -0.5) emotionalPatternShift = 'becoming_calmer';
      else if (diff >= 0.5) emotionalPatternShift = 'increasing_intensity';
      else emotionalPatternShift = 'steady_balance';
    }

    // Comparison with previous month
    const prevMonthScores = prevMonthEntries
      .map((e) => e.mood_score ?? e.mood)
      .filter((s) => s != null && Number.isFinite(s));
    const currentMonthScores = currentMonthEntries
      .map((e) => e.mood_score ?? e.mood)
      .filter((s) => s != null && Number.isFinite(s));

    const prevMonthAvg =
      prevMonthScores.length > 0
        ? Math.round((prevMonthScores.reduce((a, b) => a + b, 0) / prevMonthScores.length) * 10) / 10
        : null;
    const currMonthAvg =
      currentMonthScores.length > 0
        ? Math.round((currentMonthScores.reduce((a, b) => a + b, 0) / currentMonthScores.length) * 10) / 10
        : null;

    const previousMonthComparison = {
      prevMonthLabel: `${prevYear}-${String(prevMonth).padStart(2, '0')}`,
      prevMonthEntriesCount: prevMonthEntries.length,
      currentMonthEntriesCount: currentMonthEntries.length,
      entryCountDiff: currentMonthEntries.length - prevMonthEntries.length,
      prevMonthAvgMood: prevMonthAvg,
      currentMonthAvgMood: currMonthAvg,
      moodDelta:
        prevMonthAvg !== null && currMonthAvg !== null
          ? Math.round((currMonthAvg - prevMonthAvg) * 10) / 10
          : null,
    };

    // Check cached or saved AI reflection
    const cacheKey = `reflection:${req.userId}:${year}:${month}`;
    let savedReflection = cache.get(cacheKey);

    if (!savedReflection) {
      savedReflection = await MonthlyReflection.findOne({
        user: req.userId,
        year,
        month,
      }).lean();

      if (savedReflection) {
        cache.set(cacheKey, savedReflection, 15 * 60 * 1000); // 15 min in-memory cache
      }
    }

    res.json({
      success: true,
      year,
      month,
      timezone,
      daysInMonth,
      days: Object.values(daysMap),
      insights: {
        totalEntries: currentMonthEntries.length,
        activeDays: activeDaysCount,
        consistencyPercentage,
        maxStreakInMonth,
        mostFrequentEmotions,
        weeklyDistribution,
        moodDistribution: moodBuckets,
        patternChanges: {
          firstHalfAvg,
          secondHalfAvg,
          shift: emotionalPatternShift,
          firstHalfEntries: firstHalfEntries.length,
          secondHalfEntries: secondHalfEntries.length,
        },
        previousMonthComparison,
      },
      monthlyReflection: savedReflection || null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/journal/calendar/reflection
 * Body params:
 *   year: number (required)
 *   month: number (required, 1-12)
 *   timezone: string (optional)
 *   forceRegenerate: boolean (optional)
 */
async function generateMonthlyReflection(req, res, next) {
  try {
    const { year, month, timezone = 'UTC', forceRegenerate = false } = req.body;

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ success: false, error: 'Valid year and month (1-12) are required.' });
    }

    const cacheKey = `reflection:${req.userId}:${year}:${month}`;

    // Return existing reflection if forceRegenerate is false
    if (!forceRegenerate) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return res.json({ success: true, reflection: cached, fromCache: true });
      }

      const existing = await MonthlyReflection.findOne({
        user: req.userId,
        year,
        month,
      }).lean();

      if (existing) {
        cache.set(cacheKey, existing, 15 * 60 * 1000);
        return res.json({ success: true, reflection: existing, fromCache: true });
      }
    }

    // Pull journal entries for this month
    const targetMonthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    const queryStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    queryStart.setDate(queryStart.getDate() - 2);

    const queryEnd = new Date(Date.UTC(year, month, 1, 23, 59, 59));
    queryEnd.setDate(queryEnd.getDate() + 2);

    // Do NOT use .lean() — JournalEntry encrypts text/summary/etc. via Mongoose getters.
    // .lean() bypasses those getters returning raw ciphertext. Convert with getters: true.
    const rawDocs = await JournalEntry.find({
      user: req.userId,
      date: { $gte: queryStart, $lte: queryEnd },
    }).sort({ date: 1 });

    const entries = rawDocs.map((doc) => doc.toObject({ getters: true }));

    const monthEntries = entries.filter((e) => {
      const dateStr = getDateStringInTimezone(e.date, timezone);
      return dateStr.startsWith(targetMonthPrefix);
    });

    if (monthEntries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No journal reflections were logged in this month to analyze.',
      });
    }

    // Prepare anonymized compact digest for Gemini
    const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
    const digest = monthEntries
      .slice(0, 35) // guard context size
      .map((e) => {
        const d = getDateStringInTimezone(e.date, timezone);
        const ems = (e.emotions || []).map((x) => `${x.emotion}(${x.intensity || 1}/5)`).join(', ');
        const themes = (e.themes || []).join(', ');
        const score = e.mood_score ?? e.mood ?? 'n/a';
        const snippet = (e.text || '').replace(/\s+/g, ' ').slice(0, 160);
        return `• [${d}] Distress: ${score}/10 | Emotions: [${ems || 'unspecified'}] | Themes: [${themes || 'general'}] | Text: "${snippet}"`;
      })
      .join('\n');

    const prompt = `You are a warm, gentle, and perceptive AI mental wellness companion analyzing a user's journaling history for ${monthName} ${year}.

JOURNAL ENTRIES THIS MONTH (${monthEntries.length} total entries):
${digest}

CRITICAL INSTRUCTIONS:
1. Base all observations strictly on the entries provided. DO NOT hallucinate moods, events, or unrecorded emotions.
2. If there are few entries (e.g. fewer than 4), explicitly note that conclusions have limited data and should be held lightly.
3. NEVER provide a psychiatric diagnosis, medical terminology, or clinical assessment.
4. Frame themes and challenges with compassion, curiosity, and psychological safety.
5. Return ONLY a valid JSON object matching this exact structure:

{
  "summary": "2-3 empathetic sentences summarizing the emotional journey and rhythm of the month.",
  "emotionalThemes": ["List 2-4 recurring emotional patterns or heart-themes experienced this month"],
  "notableChanges": ["List 1-3 changes or shifts in feelings/reactions observed as the month unfolded"],
  "recurringTopics": ["List 2-4 subjects, situations, or recurring life topics mentioned"],
  "positiveMoments": ["List 1-3 signs of resilience, calm, gratitude, self-kindness, or progress"],
  "reflectionQuestions": ["List 2-3 gentle, open-ended journaling questions to help the user reflect on this month"],
  "uncertaintyNotes": "A brief transparent note on any patterns that are subtle, uncertain, or based on limited data."
}`;

    const rawResponse = await executeWithFallback(async (genAI) => {
      const model = genAI.getGenerativeModel({
        model: config.gemini.model || 'gemini-3.6-flash',
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      return result.response.text();
    });

    let parsed;
    try {
      parsed = JSON.parse(rawResponse.replace(/```json|```/g, '').trim());
    } catch (parseErr) {
      logger.error({ message: 'Failed to parse monthly reflection JSON', raw: rawResponse });
      throw new Error('AI generated an unreadable response. Please try again.');
    }

    const reflectionDoc = await MonthlyReflection.findOneAndUpdate(
      { user: req.userId, year, month },
      {
        user: req.userId,
        year,
        month,
        summary: parsed.summary || 'A month of meaningful reflection and self-awareness.',
        emotionalThemes: Array.isArray(parsed.emotionalThemes) ? parsed.emotionalThemes : [],
        notableChanges: Array.isArray(parsed.notableChanges) ? parsed.notableChanges : [],
        recurringTopics: Array.isArray(parsed.recurringTopics) ? parsed.recurringTopics : [],
        positiveMoments: Array.isArray(parsed.positiveMoments) ? parsed.positiveMoments : [],
        reflectionQuestions: Array.isArray(parsed.reflectionQuestions) ? parsed.reflectionQuestions : [],
        uncertaintyNotes: parsed.uncertaintyNotes || '',
        entryCount: monthEntries.length,
        generatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    cache.set(cacheKey, reflectionDoc, 15 * 60 * 1000);

    res.json({
      success: true,
      reflection: reflectionDoc,
      fromCache: false,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCalendarData,
  generateMonthlyReflection,
  getDateStringInTimezone,
  getDaysInMonth,
};

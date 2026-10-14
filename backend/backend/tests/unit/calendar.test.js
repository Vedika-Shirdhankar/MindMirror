// tests/unit/calendar.test.js
const {
  getDateStringInTimezone,
  getDaysInMonth,
  getCalendarData,
  generateMonthlyReflection,
} = require('../../controllers/calendarController');
const JournalEntry = require('../../models/JournalEntry');
const MonthlyReflection = require('../../models/MonthlyReflection');
const { cache } = require('../../utils/cache');

jest.mock('../../models/JournalEntry');
jest.mock('../../models/MonthlyReflection');
jest.mock('../../utils/geminiHelper', () => ({
  executeWithFallback: jest.fn(),
  getApiKeys: jest.fn(() => ['dummy-key']),
}));

describe('Calendar Controller - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cache.store.clear();
  });

  describe('getDateStringInTimezone & getDaysInMonth', () => {
    test('formats dates correctly according to timezone', () => {
      // 2026-10-14T23:30:00Z is 2026-10-15 early morning in Asia/Kolkata (+5:30)
      const d = new Date('2026-10-14T23:30:00.000Z');
      expect(getDateStringInTimezone(d, 'UTC')).toBe('2026-10-14');
      expect(getDateStringInTimezone(d, 'Asia/Kolkata')).toBe('2026-10-15');
    });

    test('returns accurate days in month for regular and leap years', () => {
      expect(getDaysInMonth(2026, 10)).toBe(31); // October
      expect(getDaysInMonth(2026, 2)).toBe(28);  // Feb 2026 (non-leap)
      expect(getDaysInMonth(2024, 2)).toBe(29);  // Feb 2024 (leap)
      expect(getDaysInMonth(2026, 4)).toBe(30);  // April
    });
  });

  describe('getCalendarData', () => {
    test('rejects invalid year or month', async () => {
      const req = { query: { year: 'invalid', month: 10 }, userId: 'user-1' };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await getCalendarData(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/invalid year/i) }));

      const req2 = { query: { year: 2026, month: 13 }, userId: 'user-1' };
      await getCalendarData(req2, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/invalid month/i) }));
    });

    test('aggregates calendar days, multiple entries per day, and insights accurately', async () => {
      const mockEntries = [
        {
          _id: 'e1',
          user: 'user-1',
          date: new Date('2026-10-05T08:00:00.000Z'),
          text: 'Morning calm reflection',
          mood: 3,
          mood_score: 3,
          sentiment: 'positive',
          emotions: [{ emotion: 'calm', intensity: 4 }, { emotion: 'gratitude', intensity: 3 }],
          themes: ['self_worth'],
          triggers: [],
        },
        {
          _id: 'e2',
          user: 'user-1',
          date: new Date('2026-10-05T18:00:00.000Z'),
          text: 'Evening joy with friends',
          mood: 2,
          mood_score: 2,
          sentiment: 'positive',
          emotions: [{ emotion: 'joy', intensity: 5 }],
          themes: ['relationship'],
          triggers: [],
        },
        {
          _id: 'e3',
          user: 'user-1',
          date: new Date('2026-10-20T10:00:00.000Z'),
          text: 'Exam pressure feeling stressed',
          mood: 8,
          mood_score: 8,
          sentiment: 'negative',
          emotions: [{ emotion: 'anxiety', intensity: 4 }],
          themes: ['academic'],
          triggers: ['academics'],
        },
      ];

      // Controller no longer calls .lean() — it uses .sort() then doc.toObject({getters:true})
      const mockDocs = mockEntries.map((e) => ({ ...e, toObject: () => e }));
      JournalEntry.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockDocs),
      });

      MonthlyReflection.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const req = { query: { year: 2026, month: 10, timezone: 'UTC' }, userId: 'user-1' };
      let jsonResult = null;
      const res = {
        json: jest.fn((val) => { jsonResult = val; }),
        status: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      await getCalendarData(req, res, next);

      expect(jsonResult).toBeDefined();
      expect(jsonResult.success).toBe(true);
      expect(jsonResult.year).toBe(2026);
      expect(jsonResult.month).toBe(10);
      expect(jsonResult.daysInMonth).toBe(31);

      // Check Oct 5th multi-entry aggregation
      const oct5 = jsonResult.days.find((d) => d.date === '2026-10-05');
      expect(oct5).toBeDefined();
      expect(oct5.hasEntries).toBe(true);
      expect(oct5.entriesCount).toBe(2);
      expect(oct5.averageMoodScore).toBe(2.5); // (3 + 2) / 2
      expect(oct5.dominantMoodCategory).toBe('calm');
      expect(oct5.entries.length).toBe(2);

      // Check Oct 20th single entry
      const oct20 = jsonResult.days.find((d) => d.date === '2026-10-20');
      expect(oct20.hasEntries).toBe(true);
      expect(oct20.entriesCount).toBe(1);
      expect(oct20.dominantMoodCategory).toBe('distressed');

      // Check empty day
      const oct1 = jsonResult.days.find((d) => d.date === '2026-10-01');
      expect(oct1.hasEntries).toBe(false);
      expect(oct1.entriesCount).toBe(0);

      // Insights checks
      expect(jsonResult.insights.totalEntries).toBe(3);
      expect(jsonResult.insights.activeDays).toBe(2);
      expect(jsonResult.insights.mostFrequentEmotions.length).toBeGreaterThan(0);
      expect(jsonResult.insights.mostFrequentEmotions.some((e) => e.emotion === 'calm')).toBe(true);
      expect(jsonResult.insights.weeklyDistribution.length).toBe(5);
    });
  });

  describe('generateMonthlyReflection', () => {
    test('returns cached reflection if available', async () => {
      const cachedDoc = {
        year: 2026,
        month: 10,
        summary: 'A peaceful month',
        emotionalThemes: ['peace'],
      };
      cache.set('reflection:user-1:2026:10', cachedDoc);

      const req = { body: { year: 2026, month: 10 }, userId: 'user-1' };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const next = jest.fn();

      await generateMonthlyReflection(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        fromCache: true,
        reflection: cachedDoc,
      }));
    });

    test('rejects if no entries exist for the month', async () => {
      JournalEntry.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const req = { body: { year: 2026, month: 10 }, userId: 'user-1' };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const next = jest.fn();

      await generateMonthlyReflection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringMatching(/no journal reflections/i),
      }));
    });
  });
});

const { classifyJournal, checkMlHealth } = require('../../services/mlService');

describe('mlService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('returns fallback gracefully when empty text is provided', async () => {
    const result = await classifyJournal('');
    expect(result).toEqual({
      label: null,
      confidence: null,
      scores: null,
      available: false,
      error: 'Empty text',
    });
  });

  test('returns fallback gracefully when ML service is down or network errors', async () => {
    // Mock global fetch rejection
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Connection refused'));

    const result = await classifyJournal('I feel so stressed today.');
    expect(result.available).toBe(false);
    expect(result.label).toBeNull();
    expect(result.confidence).toBeNull();
    expect(result.scores).toBeNull();
    expect(result.error).toBe('Connection refused');
  });

  test('successfully parses ML service response', async () => {
    const mockPrediction = {
      label: 'stress',
      confidence: 0.885,
      scores: {
        anxiety: 0.05,
        stress: 0.885,
        normal: 0.02,
        depression: 0.02,
        'personality disorder': 0.01,
        bipolar: 0.01,
        suicidal: 0.005,
      },
    };

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPrediction,
    });

    const result = await classifyJournal('I have too many exams and deadlines.');
    expect(result.available).toBe(true);
    expect(result.label).toBe('stress');
    expect(result.confidence).toBe(0.885);
    expect(result.scores.stress).toBe(0.885);
  });
});

// lib/store.js — simple localStorage-backed data layer

const KEYS = {
  entries: 'mm_entries',
  copingStrategies: 'mm_coping',
  futureLetters: 'mm_letters',
  user: 'mm_user',
  chatHistory: 'mm_chat',
};

// ── helpers ──────────────────────────────────────────────────────────────────
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── seed data (shown on first visit) ─────────────────────────────────────────
const SEED_ENTRIES = [
  {
    id: 'e1',
    date: '2026-03-14',
    text: 'Exams are coming and I feel like my grades are going to ruin everything. I don\'t know how I\'ll manage all this pressure. I feel stuck.',
    mood: 8,
    themes: ['fear_of_failure', 'career_anxiety'],
    copingUsed: ['journaling', 'exercise'],
    resolved: true,
    resolvedNote: 'Mood dropped to 3/10 over 2 weeks. Found a study structure that worked.',
  },
  {
    id: 'e2',
    date: '2026-04-03',
    text: 'A friendship ended today and it feels permanent. Like this specific loss will define the rest of my social life. I don\'t know why I keep losing people.',
    mood: 7,
    themes: ['loneliness', 'self_worth'],
    copingUsed: ['journaling', 'talking_to_friend'],
    resolved: true,
    resolvedNote: 'Recovered in 10 days. Described as a growth moment later.',
  },
  {
    id: 'e3',
    date: '2026-05-10',
    text: 'Managing two internships and college is hard but I feel like I\'m getting better at it. Exercise helps a lot. Some days still feel overwhelming.',
    mood: 5,
    themes: ['career_anxiety', 'overwhelm'],
    copingUsed: ['exercise', 'meditation', 'structured_planning'],
    resolved: true,
    resolvedNote: 'Mood improved 25% over the month.',
  },
  {
    id: 'e4',
    date: '2026-06-01',
    text: 'Feeling much calmer today. Meditation in the morning really helped. I\'m starting to see some patterns in when I get anxious.',
    mood: 3,
    themes: ['self_worth'],
    copingUsed: ['meditation', 'journaling'],
    resolved: true,
    resolvedNote: 'Good day. Maintained routine.',
  },
];

const SEED_COPING = [
  { id: 'c1', strategy: 'journaling', count: 4, lastUsed: '2026-06-01', effectiveness: 9 },
  { id: 'c2', strategy: 'exercise', count: 6, lastUsed: '2026-06-10', effectiveness: 8 },
  { id: 'c3', strategy: 'meditation', count: 5, lastUsed: '2026-06-12', effectiveness: 8 },
  { id: 'c4', strategy: 'talking_to_friend', count: 2, lastUsed: '2026-04-05', effectiveness: 7 },
  { id: 'c5', strategy: 'structured_planning', count: 3, lastUsed: '2026-05-12', effectiveness: 8 },
  { id: 'c6', strategy: 'taking_a_break', count: 2, lastUsed: '2026-05-20', effectiveness: 6 },
];

const SEED_LETTERS = [
  {
    id: 'l1',
    date: '2026-05-15',
    title: 'To future me during hard times',
    body: 'Dear future me,\n\nIf you are reading this while panicking — remember that you have felt this exact certainty of failure before. In March you were sure grades would ruin you. They did not. In April you were sure you\'d lost your social life. You have not.\n\nYou are stronger than your anxiety tells you. You always find a way. Breathe, journal, go for a walk. It will pass.\n\nWith love,\nYou (on a good day)',
    triggerThemes: ['fear_of_failure', 'career_anxiety'],
  },
];

const SEED_USER = {
  name: 'Vedika',
  joinDate: '2026-03-01',
};

// ── public API ────────────────────────────────────────────────────────────────
export function getUser() {
  return load(KEYS.user, SEED_USER);
}

export function saveUser(user) {
  save(KEYS.user, user);
}

export function getEntries() {
  const stored = load(KEYS.entries, null);
  if (!stored) {
    save(KEYS.entries, SEED_ENTRIES);
    return SEED_ENTRIES;
  }
  return stored;
}

export function addEntry(entry) {
  const entries = getEntries();
  const newEntry = { ...entry, id: `e${Date.now()}`, date: new Date().toISOString().split('T')[0] };
  const updated = [newEntry, ...entries];
  save(KEYS.entries, updated);
  return newEntry;
}

export function deleteEntry(id) {
  const updated = getEntries().filter(e => e.id !== id);
  save(KEYS.entries, updated);
}

export function getCopingStrategies() {
  const stored = load(KEYS.copingStrategies, null);
  if (!stored) {
    save(KEYS.copingStrategies, SEED_COPING);
    return SEED_COPING;
  }
  return stored;
}

export function getFutureLetters() {
  const stored = load(KEYS.futureLetters, null);
  if (!stored) {
    save(KEYS.futureLetters, SEED_LETTERS);
    return SEED_LETTERS;
  }
  return stored;
}

export function addFutureLetter(letter) {
  const letters = getFutureLetters();
  const newLetter = { ...letter, id: `l${Date.now()}`, date: new Date().toISOString().split('T')[0] };
  const updated = [newLetter, ...letters];
  save(KEYS.futureLetters, updated);
  return newLetter;
}

export function deleteFutureLetter(id) {
  const updated = getFutureLetters().filter(l => l.id !== id);
  save(KEYS.futureLetters, updated);
}

export function getChatHistory() {
  return load(KEYS.chatHistory, []);
}

export function saveChatHistory(messages) {
  // keep last 100 messages
  save(KEYS.chatHistory, messages.slice(-100));
}

export function clearAllData() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

// ── analytics helpers ─────────────────────────────────────────────────────────
export const THEMES = {
  fear_of_failure:  { label: 'Fear of failure',  color: '#7F77DD' },
  career_anxiety:   { label: 'Career anxiety',   color: '#1D9E75' },
  self_worth:       { label: 'Self-worth',        color: '#D4537E' },
  loneliness:       { label: 'Loneliness',        color: '#EF9F27' },
  overwhelm:        { label: 'Overwhelm',         color: '#D85A30' },
  relationship:     { label: 'Relationship',      color: '#5DCAA5' },
  academic:         { label: 'Academic',           color: '#AFA9EC' },
  regret:           { label: 'Regret',             color: '#FAC775' },
};

export const COPING_LABELS = {
  journaling:          'Journaling',
  exercise:            'Exercise',
  meditation:          'Meditation',
  talking_to_friend:   'Talking to a friend',
  structured_planning: 'Structured planning',
  taking_a_break:      'Taking a break',
  studying:            'Studying',
  creative_work:       'Creative work',
};

export function computePatterns(entries) {
  const themeCounts = {};
  entries.forEach(e => {
    (e.themes || []).forEach(t => {
      themeCounts[t] = (themeCounts[t] || 0) + 1;
    });
  });
  const total = entries.length || 1;
  return Object.entries(themeCounts)
    .map(([theme, count]) => ({ theme, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

export function computeMoodTrend(entries) {
  return [...entries]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(e => ({ date: e.date, mood: e.mood }));
}

export function findRelevantMemories(text, entries) {
  const lower = text.toLowerCase();
  const keywords = {
    fail: ['fear_of_failure', 'academic'],
    ruin: ['fear_of_failure', 'regret'],
    future: ['fear_of_failure', 'career_anxiety'],
    career: ['career_anxiety'],
    internship: ['career_anxiety'],
    friend: ['loneliness', 'relationship'],
    alone: ['loneliness'],
    worth: ['self_worth'],
    anxious: ['fear_of_failure', 'career_anxiety'],
    overwhelm: ['overwhelm'],
    grades: ['academic', 'fear_of_failure'],
    placement: ['career_anxiety'],
    study: ['academic'],
    stress: ['overwhelm', 'career_anxiety'],
  };

  const matchedThemes = new Set();
  Object.entries(keywords).forEach(([kw, themes]) => {
    if (lower.includes(kw)) themes.forEach(t => matchedThemes.add(t));
  });

  if (matchedThemes.size === 0) return [];

  return entries
    .filter(e => e.resolved && e.themes?.some(t => matchedThemes.has(t)))
    .slice(0, 2);
}

// lib/api.js — MindMirror frontend API client and shared UI constants

const BASE_URL = '/api';

// ── Shared UI Constants ──────────────────────────────────────────────────────

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

export const TRIGGERS = {
  academics: 'Academics',
  placements: 'Placements',
  family: 'Family',
  health: 'Health',
  relationships: 'Relationships',
  self_esteem: 'Self-esteem',
  future_uncertainty: 'Future uncertainty',
  finances: 'Finances',
  social: 'Social',
  work: 'Work',
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

export const RISK_COLORS = {
  none: '#5DCAA5',
  low: '#AFA9EC',
  moderate: '#EF9F27',
  high: '#E24B4A',
};

// ── Auth Helpers ─────────────────────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem('mm_token');
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem('mm_token');
}

// ── Core API Request Handler ──────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// ── API Operations ────────────────────────────────────────────────────────────

// 1. Auth Operations
export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) {
    localStorage.setItem('mm_token', data.token);
  }
  return data.user;
}

export async function signup(name, email, password) {
  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (data.token) {
    localStorage.setItem('mm_token', data.token);
  }
  return data.user;
}

export async function getMe() {
  const data = await request('/auth/me');
  return data.user;
}

// 2. Journal Entry Operations
export async function getEntries() {
  const data = await request('/journal');
  return data.entries || [];
}

export async function addEntry({ text, copingUsed, mood }) {
  const data = await request('/journal', {
    method: 'POST',
    body: JSON.stringify({ text, copingUsed, mood }),
  });
  return {
    entry: data.entry,
    aiError: data.aiError,
    support: data.support,
    recommendedVideos: data.recommendedVideos || [],
  };
}

export async function deleteEntry(id) {
  return request(`/journal/${id}`, {
    method: 'DELETE',
  });
}

export async function markEntryResolved(id, resolvedNote = '') {
  const data = await request(`/journal/${id}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ resolvedNote }),
  });
  return data.entry;
}

export async function searchEntries(query) {
  const data = await request('/journal/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  return data.results || [];
}

// 3. AI Companion Chat Operations
export async function getChatHistory() {
  const data = await request('/chat/history');
  return data.messages || [];
}

export async function sendChatMessage(content) {
  const data = await request('/chat/message', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  return {
    reply: data.reply,
    messages: data.messages,
    support: data.support,
    recommendedVideos: data.recommendedVideos || [],
    pastSelfRecommendation: data.pastSelfRecommendation || null,
  };
}

// 4. Thought Ladder Operations
export async function buildThoughtLadder(situation) {
  const data = await request('/journal/thought-ladder', {
    method: 'POST',
    body: JSON.stringify({ situation }),
  });
  return data.ladder;
}

// 5. Analytics Dashboard Operations
export async function getAnalyticsDashboard() {
  return request('/analytics/dashboard');
}

// 6. Future Letters Operations
export async function getFutureLetters() {
  const data = await request('/letters');
  return data.letters || [];
}

export async function createFutureLetter({ title, body, triggerThemes }) {
  const data = await request('/letters', {
    method: 'POST',
    body: JSON.stringify({ title, body, triggerThemes }),
  });
  return data.letter;
}

export async function deleteFutureLetter(id) {
  return request(`/letters/${id}`, {
    method: 'DELETE',
  });
}

// 7. Profile Settings Operations
export async function updateProfile(name) {
  const data = await request('/users/me', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
  return data.user;
}

export async function updatePreferences(preferences) {
  const data = await request('/users/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify({ preferences }),
  });
  return data.user;
}

// 8. Video Reflection Operations
export async function getVideoReflections() {
  const data = await request('/videos');
  return data.videos || [];
}

export async function uploadVideoReflection(formData) {
  const data = await request('/videos', {
    method: 'POST',
    body: formData,
  });
  return data.reflection;
}

export async function deleteVideoReflection(id) {
  return request(`/videos/${id}`, {
    method: 'DELETE',
  });
}

export async function retryVideoAnalysis(id) {
  return request(`/videos/${id}/retry-analysis`, {
    method: 'POST',
  });
}
// 9. Letter From MindMirror
export async function getLetterFromMirror() {
  return request('/letter-from-mirror');
}

// 10. Life Report
export async function getLifeReport() {
  return request('/life-report');
}
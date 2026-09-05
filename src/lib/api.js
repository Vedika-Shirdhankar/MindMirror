// lib/api.js — MindMirror frontend API client and shared UI constants

// In production (Vercel), VITE_API_URL is set to the Render backend URL.
// In development, Vite's proxy forwards /api → localhost:4000, so we use the relative path.
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

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

export const EMOTION_META = {
  joy:        { label: 'Joy',        emoji: '✨' },
  sadness:    { label: 'Sadness',    emoji: '💧' },
  anger:      { label: 'Anger',      emoji: '🔥' },
  fear:       { label: 'Fear',       emoji: '😨' },
  anxiety:    { label: 'Anxiety',    emoji: '🌀' },
  shame:      { label: 'Shame',      emoji: '🫥' },
  guilt:      { label: 'Guilt',      emoji: '🪨' },
  loneliness: { label: 'Loneliness', emoji: '🌙' },
  relief:     { label: 'Relief',     emoji: '🌤️' },
  hope:       { label: 'Hope',       emoji: '🌱' },
  frustration:{ label: 'Frustration',emoji: '⚡' },
  numbness:   { label: 'Numbness',   emoji: '🩶' },
  gratitude:  { label: 'Gratitude',  emoji: '🌸' },
  overwhelm:  { label: 'Overwhelm',  emoji: '🌊' },
  calm:       { label: 'Calm',       emoji: '🌿' },
};

export const DISTORTION_LABELS = {
  catastrophizing: 'Catastrophizing',
  black_and_white_thinking: 'All-or-nothing thinking',
  overgeneralization: 'Overgeneralizing',
  mind_reading: 'Mind reading',
  fortune_telling: 'Fortune telling',
  should_statements: '"Should" statements',
  personalization: 'Personalizing',
  emotional_reasoning: 'Emotional reasoning',
  labeling: 'Self-labeling',
  discounting_positives: 'Discounting the positives',
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

export async function changePassword(currentPassword, newPassword) {
  return request('/users/me/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function deleteAccount(password) {
  return request('/users/me', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
}

/**
 * Downloads the user's full data export as a JSON file via a browser save prompt.
 */
export async function exportUserData() {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/users/me/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mindmirror-export.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
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

export async function togglePinEntry(id) {
  const data = await request(`/journal/${id}/pin`, {
    method: 'PATCH',
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

/**
 * Streaming variant of sendChatMessage — calls onChunk(text) as tokens arrive.
 * Resolves with the same shape as sendChatMessage once the stream completes.
 * Uses fetch (not EventSource) because EventSource can't send POST bodies or auth headers.
 */
export async function streamChatMessage(content, onChunk) {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/chat/message/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok || !response.body) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullReply = '';
  let finalPayload = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sepIndex;
    while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);
      const line = frame.split('\n').find(l => l.startsWith('data: '));
      if (!line) continue;

      let payload;
      try {
        payload = JSON.parse(line.slice(6));
      } catch {
        continue;
      }

      if (payload.event === 'chunk') {
        fullReply += payload.text;
        onChunk?.(payload.text, fullReply);
      } else if (payload.event === 'done') {
        finalPayload = payload;
      } else if (payload.event === 'error') {
        throw new Error(payload.message || 'The companion had trouble responding. Please try again.');
      }
    }
  }

  return {
    reply: fullReply,
    messages: finalPayload?.messages,
    support: finalPayload?.support,
    recommendedVideos: finalPayload?.recommendedVideos || [],
    pastSelfRecommendation: finalPayload?.pastSelfRecommendation || null,
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

export async function updateLanguage(language) {
  return request('/users/me/language', {
    method: 'PATCH',
    body: JSON.stringify({ language }),
  });
}

// 8. Video Reflection Operations
export async function getVideoReflections() {
  const response = await request('/videos');
  return response.data?.videos || response.videos || [];
}

export async function uploadVideoReflection(formData) {
  const response = await request('/videos', {
    method: 'POST',
    body: formData,
  });
  return response.data?.reflection || response.reflection;
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

export async function updateVideoTranscript(id, transcript) {
  return request(`/videos/${id}/transcript`, {
    method: 'PATCH',
    body: JSON.stringify({ transcript }),
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
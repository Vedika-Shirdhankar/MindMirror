import type { Collection } from '../types/journal';

export const DEFAULT_COLLECTIONS: Collection[] = [
  { id: 'everyday',  name: 'Everyday Thoughts',      emoji: '☁️' },
  { id: 'happy',     name: 'Little Happy Moments',   emoji: '🌼' },
  { id: 'letters',   name: 'Letters to Myself',      emoji: '💌' },
  { id: 'unsent',    name: 'Unsent Letters',         emoji: '🕊️' },
  { id: 'memories',  name: 'Memories',               emoji: '📷' },
  { id: 'dreams',    name: 'Dreams and Goals',       emoji: '🌙' },
];

import type { PromptCategory } from '../types/journal';

export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'emotions', name: 'Emotions', blurb: 'Name what is here, gently.',
    prompts: [
      'What am I feeling right now?',
      'What have I been keeping to myself?',
      'What do I wish someone understood about me?',
    ],
  },
  {
    id: 'self-discovery', name: 'Self-discovery', blurb: 'Get to know who you are.',
    prompts: [
      'What am I learning about myself?',
      'What would I tell my younger self?',
      'What does a peaceful life look like to me?',
    ],
  },
  {
    id: 'gratitude', name: 'Gratitude', blurb: 'Notice the small good things.',
    prompts: [
      'What made me smile today?',
      'What little thing am I grateful for?',
      'Who made my day better?',
    ],
  },
  {
    id: 'memories', name: 'Memories', blurb: 'Keep a moment before it fades.',
    prompts: [
      'What moment do I want to remember?',
      'What is a memory that makes me smile?',
      'What would I like to remember about today?',
    ],
  },
  {
    id: 'future-self', name: 'Future self', blurb: 'Write forward.',
    prompts: [
      'What do I hope my future self remembers?',
      'What is one thing I want to improve?',
      'What kind of person am I becoming?',
    ],
  },
  {
    id: 'late-night', name: 'Late-night thoughts', blurb: 'For when the house is quiet.',
    prompts: [
      'What keeps coming back to my mind?',
      'What do I need to let go of?',
      'If nobody judged me, what would I say?',
    ],
  },
];

export const ALL_PROMPTS: string[] = PROMPT_CATEGORIES.flatMap((c) => c.prompts);

export function randomPrompt(exclude?: string | null): string {
  const pool = ALL_PROMPTS.filter((p) => p !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Used by the "replace prompt" shuffle inside the editor. */
export function randomPromptFrom(categoryId: string | null, exclude?: string | null): string {
  const cat = PROMPT_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return randomPrompt(exclude);
  const pool = cat.prompts.filter((p) => p !== exclude);
  return (pool.length ? pool : cat.prompts)[Math.floor(Math.random() * (pool.length || cat.prompts.length))];
}

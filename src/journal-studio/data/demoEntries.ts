import type { JournalEntry, PlacedSticker } from '../types/journal';

const daysAgo = (n: number, hour = 20) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 12, 0, 0);
  return d.toISOString();
};

const stk = (
  id: string, type: string, x: number, y: number, width: number, aspect: number, rotation: number,
  z = 1, layer: PlacedSticker['layer'] = 'front',
): PlacedSticker => ({ id, type, x, y, width, height: width * aspect, rotation, z, layer });

/** Sample content. Every entry is flagged isDemo so the UI can label and remove it. */
export function buildDemoEntries(): JournalEntry[] {
  return [
    {
      id: 'demo_slow-sunday',
      title: 'A slow Sunday',
      content:
        '<p>Woke up without an alarm for the first time in weeks. The light on the wall was <strong>golden</strong> and I just watched it move.</p>' +
        '<p>Made coffee, read three chapters, and did <em>absolutely nothing</em> productive. I think I needed that more than I knew.</p>' +
        '<blockquote><p>Rest is not a reward. It is part of the work.</p></blockquote>' +
        '<p>Want to remember: the quiet, the coffee, the window open a crack.</p>',
      createdAt: daysAgo(1), updatedAt: daysAgo(1),
      mood: 'peaceful', prompt: 'What would I like to remember about today?', favorite: false, theme: 'lined',
      collectionId: 'everyday', isDemo: true,
      stickers: [
        stk('d1a', 'washi-blush', 0.5, 0.01, 0.34, 0.28, 4, 1),
        stk('d1b', 'coffee', 0.8, 0.5, 0.13, 1, 8, 2),
        stk('d1c', 'daisy', 0.04, 0.62, 0.15, 1, -10, 3),
        stk('d1d', 'sprig', 0.86, 0.15, 0.1, 1, 12, 4),
      ],
    },
    {
      id: 'demo_smile',
      title: 'Things that made me smile',
      content:
        '<p>1. The bus driver who waved at me like we were old friends.</p>' +
        '<p>2. Finding a <mark data-color="#FBE3E4" style="background-color: #FBE3E4">handwritten note</mark> in an old coat pocket.</p>' +
        '<p>3. Warm rain on the walk home. I stopped walking and just let it happen.</p>' +
        '<p style="text-align: center">Small things. Big warmth.</p>',
      createdAt: daysAgo(3), updatedAt: daysAgo(3),
      mood: 'grateful', prompt: 'What made me smile today?', favorite: true, theme: 'blush',
      collectionId: 'happy', isDemo: true,
      stickers: [
        stk('d2a', 'label-joys', 0.08, 0.03, 0.3, 0.34, -4, 1),
        stk('d2b', 'sparkle-gold', 0.78, 0.08, 0.1, 1, 10, 2),
        stk('d2c', 'heart-blush', 0.68, 0.52, 0.13, 1, 12, 3),
        stk('d2d', 'butterfly', 0.1, 0.55, 0.12, 1, -14, 4),
      ],
    },
    {
      id: 'demo_future-me',
      title: 'Dear future me',
      content:
        '<p>I hope you still stop to look at the moon.</p>' +
        '<p>I hope you learned to say <u>no</u> without writing a three-paragraph apology. I hope you are kinder to yourself than I am today.</p>' +
        '<p>Whatever happened with the big scary thing: <strong>you were braver than you thought.</strong></p>',
      createdAt: daysAgo(6), updatedAt: daysAgo(6),
      mood: 'hopeful', prompt: 'What do I hope my future self remembers?', favorite: true, theme: 'lavender',
      collectionId: 'letters', isDemo: true,
      stickers: [
        stk('d3a', 'constellation', 0.62, 0.04, 0.26, 0.83, 0, 1),
        stk('d3b', 'crescent', 0.08, 0.5, 0.12, 1, -12, 2),
        stk('d3c', 'clip-heart', 0.9, 0.02, 0.05, 2.5, 8, 3),
      ],
    },
    {
      id: 'demo_late-night',
      title: 'Late-night loop',
      content:
        '<p>It is 1:40am and my brain has decided to replay every awkward thing I have ever said.</p>' +
        '<p>Writing it down so it can stay on the page instead of in my head.</p>' +
        '<ul><li>I cannot control what people think.</li><li>I can control how I speak to myself tomorrow.</li><li>Sleep first. Solve later.</li></ul>',
      createdAt: daysAgo(9, 1), updatedAt: daysAgo(9, 1),
      mood: 'anxious', prompt: 'What keeps coming back to my mind?', favorite: false, theme: 'dotted',
      collectionId: 'unsent', isDemo: true,
      stickers: [
        stk('d4a', 'cloud-face', 0.7, 0.04, 0.2, 0.75, 6, 1),
        stk('d4b', 'doodle-squiggle', 0.1, 0.62, 0.22, 0.33, -4, 2),
        stk('d4c', 'ghost', 0.78, 0.55, 0.13, 1, -8, 3),
      ],
    },
  ];
}

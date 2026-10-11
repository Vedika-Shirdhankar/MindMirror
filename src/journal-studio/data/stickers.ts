/**
 * Sticker catalog. Entries store only a sticker `type` (the id below) so the
 * artwork can be swapped or extended without migrating saved journals.
 */

export type StickerKind = 'emoji' | 'svg' | 'label';

export interface StickerDef {
  id: string;
  category: StickerCategoryId;
  label: string;
  kind: StickerKind;
  /** emoji glyph, raw <svg> markup, or label text */
  value: string;
  /** height / width of the sticker box */
  aspect: number;
  /** default width as a fraction of page width */
  width: number;
  /** label stickers only */
  bg?: string;
  fg?: string;
  /** washi tape and similar sit above text by default; everything else too, unless set */
  defaultLayer?: 'front' | 'back';
}

export type StickerCategoryId =
  | 'nature' | 'hearts' | 'stars' | 'characters' | 'books'
  | 'washi' | 'clips' | 'labels' | 'doodles';

export const STICKER_CATEGORIES: { id: StickerCategoryId; name: string; icon: string }[] = [
  { id: 'nature',     name: 'Flowers & nature',    icon: '🌸' },
  { id: 'hearts',     name: 'Hearts & emotions',   icon: '💗' },
  { id: 'stars',      name: 'Stars & sparkles',    icon: '✨' },
  { id: 'characters', name: 'Cute characters',     icon: '🐻' },
  { id: 'books',      name: 'Books & coffee',      icon: '☕' },
  { id: 'washi',      name: 'Washi tape',          icon: '🎀' },
  { id: 'clips',      name: 'Paper clips',         icon: '📎' },
  { id: 'labels',     name: 'Decorative labels',   icon: '🏷️' },
  { id: 'doodles',    name: 'Hand-drawn doodles',  icon: '✏️' },
];

const NS = 'xmlns="http://www.w3.org/2000/svg"';
const svg = (viewBox: string, body: string) => `<svg ${NS} viewBox="${viewBox}">${body}</svg>`;

/** Data URL so stickers render in <img> (isolated, safe, and cheap to repeat). */
export const svgToDataUrl = (markup: string) => `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;

/* ---------- SVG artwork ---------- */

const daisy = svg('0 0 100 100',
  `<g transform="translate(50 50)" fill="#FFFFFF" stroke="#E4BFC6" stroke-width="2">${
    [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse rx="9" ry="22" cy="-24" transform="rotate(${a})"/>`).join('')
  }</g><circle cx="50" cy="50" r="12" fill="#F6C75A" stroke="#DDA43A" stroke-width="2"/>`);

const tulip = svg('0 0 100 100',
  `<path d="M50 94 C50 74 48 62 50 48" stroke="#7FA16C" stroke-width="5" fill="none" stroke-linecap="round"/>
   <path d="M50 80 C34 78 26 66 24 56 C38 58 48 66 50 80Z" fill="#A9C79A" stroke="#7FA16C" stroke-width="2"/>
   <path d="M30 18 C30 40 36 52 50 54 C64 52 70 40 70 18 C62 26 56 22 50 12 C44 22 38 26 30 18Z" fill="#F2A6B3" stroke="#D77C8D" stroke-width="2.5" stroke-linejoin="round"/>`);

const sprig = svg('0 0 100 100',
  `<path d="M24 94 C34 66 46 40 74 8" stroke="#7FA16C" stroke-width="4" fill="none" stroke-linecap="round"/>
   ${[[34, 74, -40], [44, 56, -40], [54, 40, -40], [64, 24, -40]].map(([x, y, r]) =>
     `<ellipse cx="${x - 9}" cy="${y}" rx="11" ry="5.5" transform="rotate(${r} ${x - 9} ${y})" fill="#B7D2A8" stroke="#7FA16C" stroke-width="1.6"/>
      <ellipse cx="${x + 11}" cy="${y - 4}" rx="11" ry="5.5" transform="rotate(${Number(r) + 85} ${x + 11} ${y - 4})" fill="#CFE2C3" stroke="#7FA16C" stroke-width="1.6"/>`).join('')}`);

const heartPath = 'M50 88 C8 58 4 26 27 18 C40 14 50 22 50 31 C50 22 60 14 73 18 C96 26 92 58 50 88Z';
const heartBlush = svg('0 0 100 100', `<path d="${heartPath}" fill="#F7B8C2" stroke="#D9788A" stroke-width="3.5" stroke-linejoin="round"/><path d="M26 32 C30 26 36 26 40 30" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`);
const heartLav = svg('0 0 100 100', `<path d="${heartPath}" fill="#D4C8F0" stroke="#9A87CF" stroke-width="3.5" stroke-linejoin="round"/><path d="M26 32 C30 26 36 26 40 30" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`);
const heartLine = svg('0 0 100 100', `<path d="${heartPath}" fill="none" stroke="#C9788A" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="1 9"/><path d="${heartPath}" fill="none" stroke="#C9788A" stroke-width="2.5" stroke-linejoin="round" transform="translate(50 50) scale(.78) translate(-50 -50)"/>`);

const sparklePath = 'M50 4 C54 34 66 46 96 50 C66 54 54 66 50 96 C46 66 34 54 4 50 C34 46 46 34 50 4Z';
const sparkleGold = svg('0 0 100 100', `<path d="${sparklePath}" fill="#F8D874" stroke="#E0B03F" stroke-width="3" stroke-linejoin="round"/>`);
const sparkleLav = svg('0 0 100 100', `<path d="${sparklePath}" fill="#DCD2F4" stroke="#A593D6" stroke-width="3" stroke-linejoin="round"/>`);
const starPath = 'M50 7 L61 38 L94 39 L68 59 L77 91 L50 72 L23 91 L32 59 L6 39 L39 38Z';
const starBlush = svg('0 0 100 100', `<path d="${starPath}" fill="#F9C6CD" stroke="#DB8793" stroke-width="3.5" stroke-linejoin="round"/>`);
const starSage = svg('0 0 100 100', `<path d="${starPath}" fill="#CFE0C4" stroke="#8DAE7B" stroke-width="3.5" stroke-linejoin="round"/>`);
const constellation = svg('0 0 120 100',
  `<polyline points="14,70 44,34 78,56 106,18" fill="none" stroke="#B6A8DE" stroke-width="2" stroke-dasharray="3 5"/>
   ${[[14, 70, 8], [44, 34, 10], [78, 56, 8], [106, 18, 11]].map(([x, y, r]) =>
     `<path d="M${x} ${Number(y) - Number(r)} L${Number(x) + Number(r) * .3} ${Number(y) - Number(r) * .3} L${Number(x) + Number(r)} ${y} L${Number(x) + Number(r) * .3} ${Number(y) + Number(r) * .3} L${x} ${Number(y) + Number(r)} L${Number(x) - Number(r) * .3} ${Number(y) + Number(r) * .3} L${Number(x) - Number(r)} ${y} L${Number(x) - Number(r) * .3} ${Number(y) - Number(r) * .3}Z" fill="#F8D874" stroke="#E0B03F" stroke-width="1.5"/>`).join('')}`);

const ghost = svg('0 0 100 100',
  `<path d="M20 90 V46 C20 22 34 10 50 10 C66 10 80 22 80 46 V90 L70 82 L60 90 L50 82 L40 90 L30 82Z" fill="#FFFFFF" stroke="#B9AECC" stroke-width="3.5" stroke-linejoin="round"/>
   <circle cx="40" cy="44" r="4.5" fill="#4A3F55"/><circle cx="60" cy="44" r="4.5" fill="#4A3F55"/>
   <ellipse cx="33" cy="56" rx="6" ry="3.5" fill="#F7B8C2" opacity=".8"/><ellipse cx="67" cy="56" rx="6" ry="3.5" fill="#F7B8C2" opacity=".8"/>
   <path d="M45 58 Q50 63 55 58" stroke="#4A3F55" stroke-width="3" fill="none" stroke-linecap="round"/>`);

const cloudFace = svg('0 0 120 90',
  `<path d="M30 74 A20 20 0 0 1 32 34 A28 28 0 0 1 86 28 A22 22 0 0 1 92 74Z" fill="#E6DDF7" stroke="#A593D6" stroke-width="3.5" stroke-linejoin="round"/>
   <circle cx="50" cy="52" r="3.5" fill="#4A3F55"/><circle cx="72" cy="52" r="3.5" fill="#4A3F55"/>
   <path d="M56 59 Q61 64 66 59" stroke="#4A3F55" stroke-width="3" fill="none" stroke-linecap="round"/>
   <ellipse cx="44" cy="60" rx="5" ry="3" fill="#F7B8C2"/><ellipse cx="78" cy="60" rx="5" ry="3" fill="#F7B8C2"/>`);

/* Washi tape: torn-edge strip with a pattern */
const tape = (name: string, base: string, pattern: string) => svg('0 0 200 56',
  `<defs><pattern id="${name}" width="20" height="20" patternUnits="userSpaceOnUse">${pattern}</pattern></defs>
   <path d="M6 2 L12 6 L6 10 L12 14 L6 18 L12 22 L6 26 L12 30 L6 34 L12 38 L6 42 L12 46 L6 50 L12 54 L194 54 L188 50 L194 46 L188 42 L194 38 L188 34 L194 30 L188 26 L194 22 L188 18 L194 14 L188 10 L194 6 L188 2Z" fill="${base}" opacity=".92"/>
   <path d="M6 2 L12 6 L6 10 L12 14 L6 18 L12 22 L6 26 L12 30 L6 34 L12 38 L6 42 L12 46 L6 50 L12 54 L194 54 L188 50 L194 46 L188 42 L194 38 L188 34 L194 30 L188 26 L194 22 L188 18 L194 14 L188 10 L194 6 L188 2Z" fill="url(#${name})" opacity=".92"/>`);

const washiBlushStripes = tape('wbs', '#F8D3D8', '<rect width="10" height="20" fill="#fff" opacity=".55"/>');
const washiLavDots = tape('wld', '#DCD2F4', '<circle cx="10" cy="10" r="3.2" fill="#fff" opacity=".85"/>');
const washiSageGingham = tape('wsg', '#D3E3C8', '<rect width="10" height="20" fill="#fff" opacity=".4"/><rect width="20" height="10" fill="#fff" opacity=".4"/>');
const washiButterHearts = tape('wbh', '#FBEBB8', '<path d="M10 15 C4 11 4 6 7.5 6 C9 6 10 7 10 8 C10 7 11 6 12.5 6 C16 6 16 11 10 15Z" fill="#F2A6B3" opacity=".8"/>');
const washiSkyWaves = tape('wsw', '#D5E4F4', '<path d="M0 10 Q5 4 10 10 T20 10" stroke="#fff" stroke-width="2.4" fill="none" opacity=".85"/>');
const washiPeachStars = tape('wps', '#FAD9C4', '<path d="M10 4 L11.8 8.2 L16 10 L11.8 11.8 L10 16 L8.2 11.8 L4 10 L8.2 8.2Z" fill="#fff" opacity=".85"/>');

/* Paper clips */
const clip = (stroke: string) => svg('0 0 40 100',
  `<path d="M13 72 V26 A8 8 0 0 1 29 26 V76 A12 12 0 0 1 5 76 V34" fill="none" stroke="${stroke}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>`);
const heartClip = svg('0 0 40 100',
  `<path d="M13 72 V26 A8 8 0 0 1 29 26 V76 A12 12 0 0 1 5 76 V34" fill="none" stroke="#D9788A" stroke-width="4.2" stroke-linecap="round"/>
   <path d="M20 94 C10 88 10 80 15 80 C18 80 20 82 20 83 C20 82 22 80 25 80 C30 80 30 88 20 94Z" fill="#F7B8C2" stroke="#D9788A" stroke-width="1.6"/>`);

/* Hand-drawn doodles (ink strokes) */
const stroke = (d: string, color = '#7A6A86', w = 3.4) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const squiggle = svg('0 0 120 40', stroke('M6 22 Q16 2 26 22 T46 22 T66 22 T86 22 T106 22', '#C9788A'));
const arrow = svg('0 0 100 100', stroke('M10 78 C22 30 58 14 86 42') + stroke('M70 34 L88 44 L80 62'));
const underline = svg('0 0 120 30', stroke('M5 16 C32 4 62 26 114 9', '#9A87CF') + stroke('M16 25 C48 17 78 27 104 21', '#9A87CF', 2.4));
const spiral = svg('0 0 100 100', stroke('M52 52 C52 46 58 44 61 48 C65 54 58 62 50 60 C38 57 36 42 44 34 C56 24 74 32 76 48 C79 68 62 82 44 80 C22 77 12 56 18 38 C25 18 46 8 66 12', '#82A070'));
const cloud = svg('0 0 120 80', stroke('M30 62 A16 16 0 0 1 32 32 A24 24 0 0 1 78 26 A19 19 0 0 1 86 62Z', '#8FA6C9'));
const sunDoodle = svg('0 0 100 100',
  stroke('M50 30 A20 20 0 1 0 50.1 30Z', '#E0A93A') +
  [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<g transform="rotate(${a} 50 50)">${stroke('M50 14 L50 6', '#E0A93A')}</g>`).join(''));
const moonDoodle = svg('0 0 100 100', stroke('M64 14 A38 38 0 1 0 86 62 A30 30 0 0 1 64 14Z', '#9A87CF') + stroke('M78 22 L78 30 M74 26 L82 26', '#9A87CF', 2.6));
const flowerDoodle = svg('0 0 100 100',
  stroke('M50 96 C50 80 50 70 50 58', '#82A070') +
  stroke('M50 82 C40 80 34 74 34 66 C42 66 48 72 50 82', '#82A070', 2.6) +
  [0, 72, 144, 216, 288].map((a) => `<g transform="rotate(${a} 50 38)">${stroke('M50 32 C42 18 58 18 50 32', '#C9788A', 3)}</g>`).join('') +
  stroke('M46 38 A4 4 0 1 0 54 38 A4 4 0 1 0 46 38Z', '#E0A93A', 2.6));
const swirlHeart = svg('0 0 100 100', stroke('M50 82 C14 58 12 30 32 24 C42 22 50 28 50 36 C50 28 58 22 68 24 C88 30 86 58 50 82Z', '#C9788A') + stroke('M50 64 C34 52 34 40 42 38', '#C9788A', 2.4));

/* ---------- Catalog ---------- */

const emoji = (id: string, category: StickerCategoryId, glyph: string, label: string): StickerDef =>
  ({ id, category, label, kind: 'emoji', value: glyph, aspect: 1, width: 0.13 });
const art = (id: string, category: StickerCategoryId, label: string, markup: string, aspect = 1, width = 0.15, defaultLayer?: 'front' | 'back'): StickerDef =>
  ({ id, category, label, kind: 'svg', value: markup, aspect, width, defaultLayer });
const tag = (id: string, text: string, bg: string, fg: string): StickerDef =>
  ({ id, category: 'labels', label: text, kind: 'label', value: text, aspect: 0.34, width: 0.28, bg, fg });

export const STICKERS: StickerDef[] = [
  // Flowers & nature
  art('daisy', 'nature', 'Daisy', daisy),
  art('tulip', 'nature', 'Tulip', tulip),
  art('sprig', 'nature', 'Leafy sprig', sprig),
  emoji('cherry-blossom', 'nature', '🌸', 'Cherry blossom'),
  emoji('sunflower', 'nature', '🌻', 'Sunflower'),
  emoji('hibiscus', 'nature', '🌺', 'Hibiscus'),
  emoji('herb', 'nature', '🌿', 'Herb'),
  emoji('leaf', 'nature', '🍃', 'Leaves'),
  emoji('mushroom', 'nature', '🍄', 'Mushroom'),
  emoji('four-leaf', 'nature', '🍀', 'Four-leaf clover'),
  // Hearts & emotions
  art('heart-blush', 'hearts', 'Blush heart', heartBlush),
  art('heart-lavender', 'hearts', 'Lavender heart', heartLav),
  art('heart-dotted', 'hearts', 'Dotted heart', heartLine),
  emoji('heart-pink', 'hearts', '🩷', 'Pink heart'),
  emoji('heart-purple', 'hearts', '💜', 'Purple heart'),
  emoji('heart-green', 'hearts', '💚', 'Green heart'),
  emoji('hearts-two', 'hearts', '💕', 'Two hearts'),
  emoji('love-letter', 'hearts', '💌', 'Love letter'),
  emoji('hug', 'hearts', '🫶', 'Heart hands'),
  emoji('bandaged-heart', 'hearts', '❤️‍🩹', 'Mending heart'),
  // Stars & sparkles
  art('sparkle-gold', 'stars', 'Gold sparkle', sparkleGold),
  art('sparkle-lavender', 'stars', 'Lavender sparkle', sparkleLav),
  art('star-blush', 'stars', 'Blush star', starBlush),
  art('star-sage', 'stars', 'Sage star', starSage),
  art('constellation', 'stars', 'Constellation', constellation, 0.83, 0.24),
  emoji('sparkles', 'stars', '✨', 'Sparkles'),
  emoji('glowing-star', 'stars', '🌟', 'Glowing star'),
  emoji('dizzy', 'stars', '💫', 'Shooting stars'),
  emoji('crescent', 'stars', '🌙', 'Crescent moon'),
  emoji('rainbow', 'stars', '🌈', 'Rainbow'),
  // Cute characters
  art('ghost', 'characters', 'Friendly ghost', ghost),
  art('cloud-face', 'characters', 'Sleepy cloud', cloudFace, 0.75, 0.2),
  emoji('bear', 'characters', '🐻', 'Bear'),
  emoji('bunny', 'characters', '🐰', 'Bunny'),
  emoji('cat', 'characters', '🐱', 'Cat'),
  emoji('chick', 'characters', '🐥', 'Chick'),
  emoji('frog', 'characters', '🐸', 'Frog'),
  emoji('butterfly', 'characters', '🦋', 'Butterfly'),
  emoji('teddy', 'characters', '🧸', 'Teddy'),
  emoji('snail', 'characters', '🐌', 'Snail'),
  // Books & coffee
  emoji('coffee', 'books', '☕', 'Coffee'),
  emoji('tea', 'books', '🍵', 'Matcha'),
  emoji('book-open', 'books', '📖', 'Open book'),
  emoji('books', 'books', '📚', 'Stack of books'),
  emoji('pencil', 'books', '✏️', 'Pencil'),
  emoji('candle', 'books', '🕯️', 'Candle'),
  emoji('cupcake', 'books', '🧁', 'Cupcake'),
  emoji('cookie', 'books', '🍪', 'Cookie'),
  emoji('croissant', 'books', '🥐', 'Croissant'),
  emoji('headphones', 'books', '🎧', 'Headphones'),
  // Washi tape
  art('washi-blush', 'washi', 'Blush stripes', washiBlushStripes, 0.28, 0.32),
  art('washi-lavender', 'washi', 'Lavender dots', washiLavDots, 0.28, 0.32),
  art('washi-sage', 'washi', 'Sage gingham', washiSageGingham, 0.28, 0.32),
  art('washi-butter', 'washi', 'Butter hearts', washiButterHearts, 0.28, 0.32),
  art('washi-sky', 'washi', 'Sky waves', washiSkyWaves, 0.28, 0.32),
  art('washi-peach', 'washi', 'Peach stars', washiPeachStars, 0.28, 0.32),
  // Paper clips
  art('clip-silver', 'clips', 'Silver clip', clip('#9A93A6'), 2.5, 0.06),
  art('clip-gold', 'clips', 'Gold clip', clip('#D9A93F'), 2.5, 0.06),
  art('clip-blush', 'clips', 'Blush clip', clip('#E08C9B'), 2.5, 0.06),
  art('clip-sage', 'clips', 'Sage clip', clip('#82A070'), 2.5, 0.06),
  art('clip-heart', 'clips', 'Heart clip', heartClip, 2.5, 0.06),
  // Decorative labels
  tag('label-today', 'today', '#FBE3E4', '#9B4651'),
  tag('label-dear-me', 'dear me,', '#E9E3F7', '#6B4E97'),
  tag('label-note', 'note to self', '#E1EAD9', '#4A6B3E'),
  tag('label-joys', 'little joys', '#FDEFC9', '#8A6516'),
  tag('label-remember', 'remember this', '#D9E4F2', '#43628A'),
  tag('label-gentle', 'be gentle', '#F9DADD', '#9B4651'),
  // Hand-drawn doodles
  art('doodle-squiggle', 'doodles', 'Squiggle', squiggle, 0.33, 0.22),
  art('doodle-arrow', 'doodles', 'Arrow', arrow),
  art('doodle-underline', 'doodles', 'Underline', underline, 0.25, 0.26),
  art('doodle-spiral', 'doodles', 'Spiral', spiral),
  art('doodle-cloud', 'doodles', 'Cloud', cloud, 0.67, 0.2),
  art('doodle-sun', 'doodles', 'Sun', sunDoodle),
  art('doodle-moon', 'doodles', 'Moon', moonDoodle),
  art('doodle-flower', 'doodles', 'Flower', flowerDoodle),
  art('doodle-heart', 'doodles', 'Swirl heart', swirlHeart),
];

export const STICKER_BY_ID: Record<string, StickerDef> =
  Object.fromEntries(STICKERS.map((s) => [s.id, s]));

export const stickersIn = (category: StickerCategoryId) => STICKERS.filter((s) => s.category === category);

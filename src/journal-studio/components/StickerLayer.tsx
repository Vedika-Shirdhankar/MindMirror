import { memo } from 'react';
import type { PlacedSticker } from '../types/journal';
import { STICKER_BY_ID } from '../data/stickers';
import { StickerArt } from './StickerVisual';
import { stickerZ } from './PaperPage';

/** CSS box for a sticker; geometry is relative to page width (100cqw). */
export const stickerBox = (s: PlacedSticker) => ({
  left: `${s.x * 100}%`,
  top: `calc(${s.y} * 100cqw)`,
  width: `${s.width * 100}%`,
  height: `calc(${s.height} * 100cqw)`,
  transform: `rotate(${s.rotation}deg)`,
});

export const StaticSticker = memo(function StaticSticker({ sticker }: { sticker: PlacedSticker }) {
  const def = STICKER_BY_ID[sticker.type];
  if (!def) return null;
  return (
    <div
      className={`sticker ${sticker.layer === 'back' ? 'sticker-back' : 'sticker-front'}`}
      style={{ ...stickerBox(sticker), zIndex: stickerZ(sticker), cursor: 'default', pointerEvents: 'none' }}
    >
      <StickerArt def={def} />
    </div>
  );
});

/** Read-only sticker layer for previews, cards and the home collage. */
export function StaticStickerLayer({ stickers }: { stickers: PlacedSticker[] }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {stickers.map((s) => <StaticSticker key={s.id} sticker={s} />)}
    </div>
  );
}

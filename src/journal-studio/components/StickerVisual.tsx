import { memo } from 'react';
import { STICKER_BY_ID, svgToDataUrl, type StickerDef } from '../data/stickers';

const urlCache = new Map<string, string>();
const urlFor = (def: StickerDef) => {
  let u = urlCache.get(def.id);
  if (!u) { u = svgToDataUrl(def.value); urlCache.set(def.id, u); }
  return u;
};

/** Draws a sticker's artwork filling its (container-query) parent. */
export function StickerArt({ def }: { def: StickerDef }) {
  if (def.kind === 'emoji') {
    return (
      <div className="sticker-art">
        <span className="sticker-emoji sticker-die-cut" role="img" aria-label={def.label}>{def.value}</span>
      </div>
    );
  }
  if (def.kind === 'label') {
    return (
      <div className="sticker-label" style={{ background: def.bg, color: def.fg }}>{def.value}</div>
    );
  }
  return (
    <div className="sticker-art">
      <img src={urlFor(def)} alt={def.label} draggable={false} className={def.category === 'washi' ? 'sticker-soft' : 'sticker-die-cut'} />
    </div>
  );
}

/** Small preview used in the library grid. */
export const StickerThumb = memo(function StickerThumb({ def, size = 52 }: { def: StickerDef; size?: number }) {
  const tall = def.aspect > 1;
  const w = tall ? size / def.aspect : size;
  const h = tall ? size : Math.max(size * def.aspect, 18);
  return (
    <div style={{ width: w, height: h, containerType: 'inline-size' }}>
      <StickerArt def={def} />
    </div>
  );
});

export const hasSticker = (type: string) => Boolean(STICKER_BY_ID[type]);

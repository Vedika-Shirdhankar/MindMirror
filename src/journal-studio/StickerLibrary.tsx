import { useState } from 'react';
import { STICKER_CATEGORIES, stickersIn, type StickerCategoryId, type StickerDef } from '../data/stickers';
import { StickerThumb } from './StickerVisual';

interface Props {
  onAdd: (def: StickerDef) => void;
}

/** Sticker drawer. Choosing a sticker places a real, editable sticker on the page. */
export function StickerLibrary({ onAdd }: Props) {
  const [cat, setCat] = useState<StickerCategoryId>('nature');
  const list = stickersIn(cat);
  const active = STICKER_CATEGORIES.find((c) => c.id === cat)!;

  return (
    <div>
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2" role="tablist" aria-label="Sticker categories">
        {STICKER_CATEGORIES.map((c) => (
          <button
            key={c.id} role="tab" aria-selected={cat === c.id} aria-pressed={cat === c.id}
            className="chip shrink-0" onClick={() => setCat(c.id)} title={c.name}
          >
            <span aria-hidden>{c.icon}</span>
            <span className="hidden sm:inline">{c.name}</span>
            <span className="sm:hidden">{c.name.split(' ')[0].replace('&', '')}</span>
          </button>
        ))}
      </div>
      <p className="mb-3 mt-1 text-[13px] text-ink-mute">{active.name}. Tap a sticker to place it on your page.</p>
      <div className="grid grid-cols-4 gap-2" role="group" aria-label={`${active.name} stickers`}>
        {list.map((def) => (
          <button
            key={def.id}
            className="group flex aspect-square items-center justify-center rounded-2xl border border-blush-100 bg-white/80 p-1 transition hover:-translate-y-0.5 hover:border-lav-300 hover:bg-white hover:shadow-soft active:scale-95"
            onClick={() => onAdd(def)} aria-label={`Add ${def.label} sticker`} title={def.label}
          >
            <StickerThumb def={def} />
          </button>
        ))}
      </div>
    </div>
  );
}

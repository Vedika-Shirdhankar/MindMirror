import { memo, useCallback, type KeyboardEvent } from 'react';
import { MoveDiagonal2, RotateCw, X } from 'lucide-react';
import type { PlacedSticker } from '../types/journal';
import { STICKER_BY_ID } from '../data/stickers';
import { useStickerInteraction, measurePage } from '../hooks/useStickerInteraction';
import { moveSticker, rotateBy, scaleSticker } from '../lib/stickers';
import { StickerArt } from './StickerVisual';
import { stickerBox } from './StickerLayer';
import { stickerZ } from './PaperPage';

interface Props {
  sticker: PlacedSticker;
  selected: boolean;
  onSelect: (id: string | null) => void;
  /** live = mid-gesture (no undo entry); otherwise a finished change */
  onChange: (next: PlacedSticker, live: boolean) => void;
  onDelete: (id: string) => void;
}

/** One sticker on the editable canvas: drag, resize, rotate, delete (mouse, touch, keyboard). */
export const StickerCanvasItem = memo(function StickerCanvasItem({ sticker, selected, onSelect, onChange, onDelete }: Props) {
  const def = STICKER_BY_ID[sticker.type];

  const onLive = useCallback((n: PlacedSticker) => onChange(n, true), [onChange]);
  const onCommit = useCallback((n: PlacedSticker) => onChange(n, false), [onChange]);
  const select = useCallback(() => onSelect(sticker.id), [onSelect, sticker.id]);

  const { active, bodyProps, resizeProps, rotateProps } = useStickerInteraction({ sticker, onLive, onCommit, onSelect: select });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const page = e.currentTarget.closest('[data-page]') as HTMLElement | null;
    if (!page) return;
    const { bounds } = measurePage(page);
    const step = e.shiftKey ? 0.02 : 0.006;
    let next: PlacedSticker | null = null;
    switch (e.key) {
      case 'ArrowLeft':  next = moveSticker(sticker, -step, 0, bounds); break;
      case 'ArrowRight': next = moveSticker(sticker, step, 0, bounds); break;
      case 'ArrowUp':    next = moveSticker(sticker, 0, -step, bounds); break;
      case 'ArrowDown':  next = moveSticker(sticker, 0, step, bounds); break;
      case '+': case '=': next = scaleSticker(sticker, 1.1, bounds); break;
      case '-': case '_': next = scaleSticker(sticker, 1 / 1.1, bounds); break;
      case '[': next = rotateBy(sticker, -15); break;
      case ']': next = rotateBy(sticker, 15); break;
      case 'Delete': case 'Backspace': e.preventDefault(); onDelete(sticker.id); return;
      case 'Escape': onSelect(null); return;
      default: return;
    }
    e.preventDefault();
    onChange(next, false);
  };

  if (!def) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${def.label} sticker. Drag to move. Arrow keys nudge, plus and minus resize, brackets rotate, Delete removes.`}
      aria-pressed={selected}
      data-sticker={sticker.id}
      className={`sticker ${sticker.layer === 'back' ? 'sticker-back' : 'sticker-front'} ${selected ? 'sticker-selected' : ''} ${active === 'move' ? 'is-dragging' : ''}`}
      style={{ ...stickerBox(sticker), zIndex: stickerZ(sticker, selected), pointerEvents: 'auto' }}
      onKeyDown={onKeyDown}
      onFocus={select}
      {...bodyProps}
    >
      <StickerArt def={def} />

      {selected && (
        <>
          <div
            className="sticker-handle delete" style={{ left: 0, top: 0 }}
            role="button" aria-label="Remove this sticker" title="Delete"
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(sticker.id); }}
          ><span><X size={11} strokeWidth={3} /></span></div>

          <div
            className="sticker-handle rotate" style={{ left: '50%', top: -34 }}
            role="slider" aria-label="Rotate sticker" aria-valuenow={Math.round(sticker.rotation)} aria-valuemin={-180} aria-valuemax={180} title="Rotate"
            {...rotateProps}
          ><span><RotateCw size={11} strokeWidth={3} /></span></div>

          <div
            className="sticker-handle resize" style={{ left: '100%', top: '100%' }}
            role="slider" aria-label="Resize sticker" aria-valuenow={Math.round(sticker.width * 100)} aria-valuemin={4} aria-valuemax={85} title="Resize"
            {...resizeProps}
          ><span><MoveDiagonal2 size={11} strokeWidth={3} /></span></div>
        </>
      )}
    </div>
  );
});

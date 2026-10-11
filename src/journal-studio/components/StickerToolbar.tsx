import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Check, Copy, Minus, Plus, RotateCcw, RotateCw, Trash2, Undo2, Redo2, Layers } from 'lucide-react';
import type { PlacedSticker } from '../types/journal';
import { STICKER_BY_ID } from '../data/stickers';

function B({ label, onClick, children, danger, pressed }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean; pressed?: boolean }) {
  return (
    <button
      type="button" className={`icon-btn shrink-0 ${danger ? '!text-[#B94A4A] hover:!bg-[#FBE3E4]' : ''}`}
      aria-label={label} title={label} aria-pressed={pressed} onClick={onClick}
    >{children}</button>
  );
}

interface Props {
  sticker: PlacedSticker;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSmaller: () => void;
  onBigger: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onForward: () => void;
  onBackward: () => void;
  onToggleLayer: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDone: () => void;
}

/** Large, touch-friendly controls that appear whenever a sticker is selected. */
export function StickerToolbar(p: Props) {
  const def = STICKER_BY_ID[p.sticker.type];
  const behind = p.sticker.layer === 'back';
  return (
    <div role="toolbar" aria-label="Selected sticker" className="no-scrollbar flex items-center gap-0.5 overflow-x-auto bg-lav-50/80 px-2 py-1.5">
      <span className="mr-1 hidden shrink-0 pl-2 text-sm font-semibold text-[#4d3d78] sm:inline">{def?.label ?? 'Sticker'}</span>
      <B label="Undo sticker change" onClick={p.onUndo}><Undo2 size={19} className={p.canUndo ? '' : 'opacity-35'} /></B>
      <B label="Redo sticker change" onClick={p.onRedo}><Redo2 size={19} className={p.canRedo ? '' : 'opacity-35'} /></B>
      <span className="mx-1 h-6 w-px shrink-0 bg-lav-200" aria-hidden />
      <B label="Smaller" onClick={p.onSmaller}><Minus size={19} /></B>
      <B label="Bigger" onClick={p.onBigger}><Plus size={19} /></B>
      <B label="Rotate left" onClick={p.onRotateLeft}><RotateCcw size={19} /></B>
      <B label="Rotate right" onClick={p.onRotateRight}><RotateCw size={19} /></B>
      <span className="mx-1 h-6 w-px shrink-0 bg-lav-200" aria-hidden />
      <B label="Bring forward" onClick={p.onForward}><ArrowUp size={19} /></B>
      <B label="Send backward" onClick={p.onBackward}><ArrowDown size={19} /></B>
      <button
        type="button" className="chip !min-h-[40px] shrink-0 !bg-white" aria-pressed={behind} onClick={p.onToggleLayer}
        title={behind ? 'Sticker is behind your text. Tap to bring it over the text.' : 'Sticker is over your text. Tap to tuck it behind the text.'}
      ><Layers size={16} /> {behind ? 'Behind text' : 'Over text'}</button>
      <span className="mx-1 h-6 w-px shrink-0 bg-lav-200" aria-hidden />
      <B label="Duplicate" onClick={p.onDuplicate}><Copy size={19} /></B>
      <B label="Delete sticker" onClick={p.onDelete} danger><Trash2 size={19} /></B>
      <span className="flex-1" />
      <button type="button" className="btn-lav !min-h-[40px] shrink-0 !px-4" onClick={p.onDone}><Check size={17} /> Done</button>
    </div>
  );
}

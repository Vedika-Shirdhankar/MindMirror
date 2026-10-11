import { useCallback, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import type { PlacedSticker } from '../types/journal';
import {
  moveSticker, resizeFromPointer, rotateFromPointer,
  type PageBounds, type Point,
} from '../lib/stickers';

type Mode = 'move' | 'resize' | 'rotate';

interface DragState {
  mode: Mode;
  pointerId: number;
  page: HTMLElement;
  startPt: Point;       // pointer, in page-width fractions
  px: Point;            // pointer, in screen pixels (for the tap-vs-drag threshold)
  origin: PlacedSticker;
  last: PlacedSticker;
  moved: boolean;
}

interface Args {
  sticker: PlacedSticker;
  /** Called continuously while a gesture is in progress (not added to undo history). */
  onLive: (next: PlacedSticker) => void;
  /** Called once when the gesture ends with its final value. */
  onCommit: (next: PlacedSticker) => void;
  onSelect: () => void;
}

const MOVE_THRESHOLD_PX = 3;

export function measurePage(page: HTMLElement): { rect: DOMRect; bounds: PageBounds } {
  const rect = page.getBoundingClientRect();
  const w = rect.width || 1;
  return { rect, bounds: { width: 1, height: rect.height / w } };
}

/**
 * Pointer-driven drag / resize / rotate for one sticker. Works for mouse, touch
 * and pen through Pointer Events + pointer capture. Geometry is converted to
 * fractions of the page width so it stays resolution-independent.
 */
export function useStickerInteraction({ sticker, onLive, onCommit, onSelect }: Args) {
  const drag = useRef<DragState | null>(null);
  const [active, setActive] = useState<Mode | null>(null);

  const toPage = (page: HTMLElement, e: { clientX: number; clientY: number }): Point => {
    const { rect } = measurePage(page);
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.width };
  };

  const begin = useCallback((mode: Mode) => (e: RPointerEvent<HTMLElement>) => {
    if (e.button !== undefined && e.button > 0) return; // primary button / touch only
    const page = e.currentTarget.closest('[data-page]') as HTMLElement | null;
    if (!page) return;
    e.stopPropagation();
    e.preventDefault();
    if (mode === 'move') {
      onSelect();
      (e.currentTarget as HTMLElement).focus({ preventScroll: true });
    }
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not all environments support capture */ }
    const startPt = toPage(page, e);
    drag.current = { mode, pointerId: e.pointerId, page, startPt, px: { x: e.clientX, y: e.clientY }, origin: sticker, last: sticker, moved: false };
    setActive(mode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sticker, onSelect]);

  const move = useCallback((e: RPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    e.stopPropagation();
    if (!d.moved && Math.hypot(e.clientX - d.px.x, e.clientY - d.px.y) < MOVE_THRESHOLD_PX) return;
    d.moved = true;
    const { bounds } = measurePage(d.page);
    const cur = toPage(d.page, e);
    let next: PlacedSticker;
    if (d.mode === 'move') next = moveSticker(d.origin, cur.x - d.startPt.x, cur.y - d.startPt.y, bounds);
    else if (d.mode === 'resize') next = resizeFromPointer(d.origin, d.startPt, cur, bounds);
    else next = rotateFromPointer(d.origin, cur, !e.altKey);
    d.last = next;
    onLive(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLive]);

  const end = useCallback((e: RPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    e.stopPropagation();
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    drag.current = null;
    setActive(null);
    if (d.moved) onCommit(d.last);
  }, [onCommit]);

  const props = (mode: Mode) => ({
    onPointerDown: begin(mode),
    onPointerMove: move,
    onPointerUp: end,
    onPointerCancel: end,
  });

  return { active, bodyProps: props('move'), resizeProps: props('resize'), rotateProps: props('rotate') };
}

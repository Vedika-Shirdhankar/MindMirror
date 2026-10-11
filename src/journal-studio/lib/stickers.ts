/**
 * Pure sticker logic: creation, clamping, resizing, rotation and z-order.
 * No React in here, so it is easy to unit-test and reuse.
 * All geometry is in fractions of the page WIDTH.
 */
import type { PlacedSticker, StickerLayer } from '../types/journal';
import type { StickerDef } from '../data/stickers';
import { uid } from './ids';

export const MIN_WIDTH = 0.04;
export const MAX_WIDTH = 0.85;
export const ROTATE_SNAP = 15;

export interface Point { x: number; y: number }

/** Bounds of the page, in fractions of page width. */
export interface PageBounds { width: number; height: number }

const maxZ = (list: PlacedSticker[], layer: StickerLayer) =>
  list.filter((s) => s.layer === layer).reduce((m, s) => Math.max(m, s.z), 0);

export function clampSticker(s: PlacedSticker, page: PageBounds): PlacedSticker {
  const width = Math.min(Math.max(s.width, MIN_WIDTH), Math.min(MAX_WIDTH, page.width));
  const height = width * (s.height / s.width || 1);
  return {
    ...s,
    width,
    height,
    x: Math.min(Math.max(s.x, 0), Math.max(0, page.width - width)),
    y: Math.min(Math.max(s.y, 0), Math.max(0, page.height - height)),
  };
}

/** Create a sticker centred on `at` (fractions of page width), slightly jittered so repeats don't stack exactly. */
export function createSticker(def: StickerDef, existing: PlacedSticker[], at: Point, page: PageBounds): PlacedSticker {
  const layer: StickerLayer = def.defaultLayer ?? 'front';
  const jitter = () => (Math.random() - 0.5) * 0.04;
  const rotation = def.category === 'washi' ? -6 + Math.round(Math.random() * 12) : Math.round((Math.random() - 0.5) * 16);
  const raw: PlacedSticker = {
    id: uid('stk'),
    type: def.id,
    x: at.x - def.width / 2 + jitter(),
    y: at.y - (def.width * def.aspect) / 2 + jitter(),
    width: def.width,
    height: def.width * def.aspect,
    rotation,
    z: maxZ(existing, layer) + 1,
    layer,
  };
  return clampSticker(raw, page);
}

export function moveSticker(s: PlacedSticker, dx: number, dy: number, page: PageBounds): PlacedSticker {
  return clampSticker({ ...s, x: s.x + dx, y: s.y + dy }, page);
}

const center = (s: PlacedSticker): Point => ({ x: s.x + s.width / 2, y: s.y + s.height / 2 });

/** Scale around the sticker's centre so it grows in place. */
export function scaleSticker(s: PlacedSticker, factor: number, page: PageBounds): PlacedSticker {
  const c = center(s);
  const ratio = s.height / s.width;
  const width = Math.min(Math.max(s.width * factor, MIN_WIDTH), MAX_WIDTH);
  const height = width * ratio;
  return clampSticker({ ...s, width, height, x: c.x - width / 2, y: c.y - height / 2 }, page);
}

/**
 * Resize driven by dragging a corner handle. `start` is the pointer position
 * when the drag began, `current` is where it is now (both in page-width fractions).
 */
export function resizeFromPointer(origin: PlacedSticker, start: Point, current: Point, page: PageBounds): PlacedSticker {
  const c = center(origin);
  const d0 = Math.hypot(start.x - c.x, start.y - c.y) || 0.0001;
  const d1 = Math.hypot(current.x - c.x, current.y - c.y);
  return scaleSticker(origin, d1 / d0, page);
}

export function normalizeAngle(deg: number): number {
  let a = ((deg + 180) % 360 + 360) % 360 - 180;
  if (a === -180) a = 180;
  return Math.round(a * 10) / 10;
}

/** Rotation from the pointer's angle around the sticker centre. 0° = handle straight above. */
export function rotateFromPointer(origin: PlacedSticker, pointer: Point, snap = true): PlacedSticker {
  const c = center(origin);
  let deg = (Math.atan2(pointer.y - c.y, pointer.x - c.x) * 180) / Math.PI + 90;
  if (snap) {
    const nearest = Math.round(deg / ROTATE_SNAP) * ROTATE_SNAP;
    if (Math.abs(deg - nearest) < 4) deg = nearest;
  }
  return { ...origin, rotation: normalizeAngle(deg) };
}

export const rotateBy = (s: PlacedSticker, delta: number): PlacedSticker =>
  ({ ...s, rotation: normalizeAngle(s.rotation + delta) });

export function setLayer(list: PlacedSticker[], id: string, layer: StickerLayer): PlacedSticker[] {
  const target = list.find((s) => s.id === id);
  if (!target || target.layer === layer) return list;
  const z = maxZ(list, layer) + 1;
  return list.map((s) => (s.id === id ? { ...s, layer, z } : s));
}

export type ReorderMode = 'front' | 'back' | 'forward' | 'backward';

/** Reorder within a layer, then renumber z so values stay compact. */
export function reorderSticker(list: PlacedSticker[], id: string, mode: ReorderMode): PlacedSticker[] {
  const target = list.find((s) => s.id === id);
  if (!target) return list;
  const same = list.filter((s) => s.layer === target.layer).sort((a, b) => a.z - b.z);
  const i = same.findIndex((s) => s.id === id);
  same.splice(i, 1);
  const j = mode === 'front' ? same.length
    : mode === 'back' ? 0
    : mode === 'forward' ? Math.min(i + 1, same.length)
    : Math.max(i - 1, 0);
  same.splice(j, 0, target);
  const zById = new Map(same.map((s, k) => [s.id, k + 1]));
  return list.map((s) => (zById.has(s.id) ? { ...s, z: zById.get(s.id)! } : s));
}

export function duplicateSticker(list: PlacedSticker[], id: string, page: PageBounds): PlacedSticker[] {
  const src = list.find((s) => s.id === id);
  if (!src) return list;
  const copy = clampSticker({ ...src, id: uid('stk'), x: src.x + 0.035, y: src.y + 0.035, z: maxZ(list, src.layer) + 1 }, page);
  return [...list, copy];
}

export const removeSticker = (list: PlacedSticker[], id: string) => list.filter((s) => s.id !== id);

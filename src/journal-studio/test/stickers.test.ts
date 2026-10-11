import { describe, expect, it } from 'vitest';
import type { PlacedSticker } from '../types/journal';
import { STICKER_BY_ID, STICKERS, STICKER_CATEGORIES } from '../data/stickers';
import {
  clampSticker, createSticker, duplicateSticker, moveSticker, normalizeAngle, reorderSticker,
  resizeFromPointer, rotateBy, rotateFromPointer, scaleSticker, setLayer, MAX_WIDTH, MIN_WIDTH,
} from '../lib/stickers';

const page = { width: 1, height: 1.3 };
const mk = (over: Partial<PlacedSticker> = {}): PlacedSticker => ({
  id: 's1', type: 'daisy', x: 0.4, y: 0.4, width: 0.2, height: 0.2, rotation: 0, z: 1, layer: 'front', ...over,
});

describe('sticker catalog', () => {
  it('has every required category with stickers', () => {
    expect(STICKER_CATEGORIES.map((c) => c.id)).toEqual(['nature', 'hearts', 'stars', 'characters', 'books', 'washi', 'clips', 'labels', 'doodles']);
    for (const c of STICKER_CATEGORIES) expect(STICKERS.filter((s) => s.category === c.id).length).toBeGreaterThanOrEqual(5);
  });
  it('has unique ids and well-formed SVG', () => {
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length);
    for (const s of STICKERS.filter((x) => x.kind === 'svg')) {
      expect(s.value.startsWith('<svg')).toBe(true);
      expect(s.value.endsWith('</svg>')).toBe(true);
      expect((s.value.match(/</g) ?? []).length).toBe((s.value.match(/>/g) ?? []).length);
    }
  });
});

describe('sticker geometry', () => {
  it('moves and clamps inside the page', () => {
    expect(moveSticker(mk(), 0.1, 0.1, page)).toMatchObject({ x: 0.5, y: 0.5 });
    const far = moveSticker(mk(), 5, 5, page);
    expect(far.x).toBeCloseTo(0.8); expect(far.y).toBeCloseTo(1.1);
    const neg = moveSticker(mk(), -5, -5, page);
    expect(neg.x).toBe(0); expect(neg.y).toBe(0);
  });
  it('scales about the centre and preserves aspect ratio', () => {
    const s = mk({ width: 0.2, height: 0.1 });
    const big = scaleSticker(s, 2, page);
    expect(big.width).toBeCloseTo(0.4); expect(big.height).toBeCloseTo(0.2);
    expect(big.x + big.width / 2).toBeCloseTo(s.x + s.width / 2);
    expect(big.y + big.height / 2).toBeCloseTo(s.y + s.height / 2);
  });
  it('limits size', () => {
    expect(scaleSticker(mk(), 100, page).width).toBeLessThanOrEqual(MAX_WIDTH);
    expect(scaleSticker(mk(), 0.0001, page).width).toBeGreaterThanOrEqual(MIN_WIDTH);
  });
  it('resizes from a pointer drag relative to the centre', () => {
    const s = mk(); // centre (0.5, 0.5)
    const r = resizeFromPointer(s, { x: 0.6, y: 0.5 }, { x: 0.7, y: 0.5 }, page);
    expect(r.width).toBeCloseTo(0.4);
  });
  it('rotates from the pointer angle with snapping', () => {
    const s = mk();
    expect(rotateFromPointer(s, { x: 0.5, y: 0.2 }).rotation).toBe(0);      // straight above
    expect(rotateFromPointer(s, { x: 0.8, y: 0.5 }).rotation).toBe(90);     // to the right
    expect(rotateFromPointer(s, { x: 0.5, y: 0.8 }).rotation).toBe(180);    // below
    expect(rotateFromPointer(s, { x: 0.2, y: 0.5 }).rotation).toBe(-90);    // to the left
  });
  it('normalises angles', () => {
    expect(normalizeAngle(190)).toBe(-170);
    expect(normalizeAngle(-190)).toBe(170);
    expect(rotateBy(mk({ rotation: 170 }), 30).rotation).toBe(-160);
  });
  it('creates stickers from the catalog inside the page', () => {
    const def = STICKER_BY_ID['washi-blush'];
    const s = createSticker(def, [], { x: 0.5, y: 0.2 }, page);
    expect(s.type).toBe('washi-blush');
    expect(s.width).toBeCloseTo(def.width);
    expect(s.height).toBeCloseTo(def.width * def.aspect);
    expect(clampSticker(s, page)).toEqual(s);
  });
});

describe('layering', () => {
  const list = [mk({ id: 'a', z: 1 }), mk({ id: 'b', z: 2 }), mk({ id: 'c', z: 3 }), mk({ id: 'd', z: 1, layer: 'back' })];
  const order = (l: PlacedSticker[]) => l.filter((s) => s.layer === 'front').sort((x, y) => x.z - y.z).map((s) => s.id).join('');
  it('reorders within a layer', () => {
    expect(order(reorderSticker(list, 'a', 'front'))).toBe('bca');
    expect(order(reorderSticker(list, 'c', 'back'))).toBe('cab');
    expect(order(reorderSticker(list, 'b', 'forward'))).toBe('acb');
    expect(order(reorderSticker(list, 'b', 'backward'))).toBe('bac');
  });
  it('moves between front and behind-text layers', () => {
    const next = setLayer(list, 'a', 'back');
    expect(next.find((s) => s.id === 'a')).toMatchObject({ layer: 'back', z: 2 });
  });
  it('duplicates with an offset', () => {
    const next = duplicateSticker(list, 'a', page);
    expect(next).toHaveLength(5);
    expect(next[4].id).not.toBe('a');
    expect(next[4].x).toBeGreaterThan(0.4);
  });
});

import '@testing-library/jest-dom/vitest';

// jsdom lacks a few browser APIs TipTap / our UI touch.
if (!('ResizeObserver' in globalThis)) {
  (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
if (!window.matchMedia) {
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, onchange: null,
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
const rect = { x: 0, y: 0, top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, toJSON() {} };
const rangeProto = Range.prototype as unknown as Record<string, unknown>;
if (!rangeProto.getClientRects) rangeProto.getClientRects = () => ({ item: () => null, length: 0, [Symbol.iterator]: function* () {} });
if (!rangeProto.getBoundingClientRect) rangeProto.getBoundingClientRect = () => rect;
const textProto = Text.prototype as unknown as Record<string, unknown>;
if (!textProto.getClientRects) textProto.getClientRects = () => [];

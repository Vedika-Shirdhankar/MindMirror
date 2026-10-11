/**
 * Journal data model. Everything the feature persists lives here, so the shape
 * can be mirrored 1:1 by a MindMirror API later.
 */

export type MoodId =
  | 'happy' | 'peaceful' | 'grateful' | 'excited' | 'sad'
  | 'anxious' | 'overwhelmed' | 'angry' | 'hopeful' | 'numb';

export type PageThemeId = 'cream' | 'lined' | 'dotted' | 'grid' | 'blush' | 'lavender' | 'sage';

/** 'front' renders above the text, 'back' renders behind it. */
export type StickerLayer = 'front' | 'back';

/**
 * A sticker placed on a page. Geometry is stored relative to the page WIDTH
 * (0..1) so an arrangement scales between desktop, mobile, previews and cards.
 */
export interface PlacedSticker {
  id: string;
  /** Catalog id, see data/stickers.tsx */
  type: string;
  x: number;       // left edge, fraction of page width
  y: number;       // top edge, fraction of page width
  width: number;   // fraction of page width
  height: number;  // fraction of page width
  rotation: number; // degrees
  z: number;       // stacking order within its layer
  layer: StickerLayer;
}

export interface JournalEntry {
  id: string;
  title: string;
  /** TipTap HTML */
  content: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  mood: MoodId | null;
  prompt: string | null;
  favorite: boolean;
  theme: PageThemeId;
  stickers: PlacedSticker[];
  collectionId: string | null;
  /** True for sample entries so they are always clearly labelled. */
  isDemo?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  emoji: string;
}

export interface Draft {
  entry: JournalEntry;
  savedAt: string;
  /** false when this draft belongs to an entry that has never been saved. */
  isNew: boolean;
}

export interface PromptCategory {
  id: string;
  name: string;
  blurb: string;
  prompts: string[];
}

export interface MoodDef {
  id: MoodId;
  label: string;
  /** soft background / strong foreground, Tailwind-independent for inline use */
  bg: string;
  fg: string;
}

import type { Collection, Draft, JournalEntry, PlacedSticker } from '../types/journal';
import { DEFAULT_COLLECTIONS } from '../data/collections';
import { StorageError, type JournalMeta, type JournalStorage } from './JournalStorage';

/**
 * Prototype persistence in the browser's localStorage.
 *
 * NOTE: localStorage is plain, unencrypted, per-browser storage. It is fine for
 * evaluating the UI but must not be used for real private journals.
 */
const PREFIX = 'mindmirror-journal-studio:v1:';
const KEYS = {
  entries: `${PREFIX}entries`,
  collections: `${PREFIX}collections`,
  drafts: `${PREFIX}drafts`,
  meta: `${PREFIX}meta`,
};

const THEMES = ['cream', 'lined', 'dotted', 'grid', 'blush', 'lavender', 'sage'];

function normalizeSticker(raw: Partial<PlacedSticker>, i: number): PlacedSticker | null {
  if (!raw || typeof raw.type !== 'string') return null;
  const width = Number(raw.width) > 0 ? Number(raw.width) : 0.14;
  return {
    id: typeof raw.id === 'string' ? raw.id : `stk_legacy_${i}`,
    type: raw.type,
    x: Number(raw.x) || 0,
    y: Number(raw.y) || 0,
    width,
    height: Number(raw.height) > 0 ? Number(raw.height) : width,
    rotation: Number(raw.rotation) || 0,
    z: Number.isFinite(Number(raw.z)) ? Number(raw.z) : i + 1,
    layer: raw.layer === 'back' ? 'back' : 'front',
  };
}

/** Defensive read: older or hand-edited data never crashes the UI. */
export function normalizeEntry(raw: Partial<JournalEntry>): JournalEntry | null {
  if (!raw || typeof raw.id !== 'string') return null;
  const created = typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString();
  return {
    id: raw.id,
    title: typeof raw.title === 'string' ? raw.title : '',
    content: typeof raw.content === 'string' ? raw.content : '',
    createdAt: created,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : created,
    mood: (raw.mood as JournalEntry['mood']) ?? null,
    prompt: typeof raw.prompt === 'string' ? raw.prompt : null,
    favorite: Boolean(raw.favorite),
    theme: THEMES.includes(raw.theme as string) ? (raw.theme as JournalEntry['theme']) : 'cream',
    stickers: Array.isArray(raw.stickers)
      ? raw.stickers.map(normalizeSticker).filter((s): s is PlacedSticker => s !== null)
      : [],
    collectionId: typeof raw.collectionId === 'string' ? raw.collectionId : null,
    isDemo: raw.isDemo ? true : undefined,
  };
}

export class LocalStorageJournalStorage implements JournalStorage {
  constructor(private readonly store: Storage = window.localStorage) {}

  private read<T>(key: string, fallback: T): T {
    try {
      const raw = this.store.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private write(key: string, value: unknown): void {
    try {
      this.store.setItem(key, JSON.stringify(value));
    } catch (err) {
      throw new StorageError(
        'Your browser could not save this entry. Storage may be full or disabled (for example in a private window).',
        err,
      );
    }
  }

  private readEntries(): JournalEntry[] {
    const raw = this.read<Partial<JournalEntry>[]>(KEYS.entries, []);
    return (Array.isArray(raw) ? raw : []).map(normalizeEntry).filter((e): e is JournalEntry => e !== null);
  }

  async listEntries() {
    return this.readEntries();
  }

  async getEntry(id: string) {
    return this.readEntries().find((e) => e.id === id) ?? null;
  }

  async saveEntry(entry: JournalEntry) {
    const all = this.readEntries();
    const i = all.findIndex((e) => e.id === entry.id);
    if (i >= 0) all[i] = entry; else all.push(entry);
    this.write(KEYS.entries, all);
    return entry;
  }

  async deleteEntry(id: string) {
    this.write(KEYS.entries, this.readEntries().filter((e) => e.id !== id));
  }

  async listCollections() {
    const stored = this.read<Collection[] | null>(KEYS.collections, null);
    return Array.isArray(stored) ? stored : DEFAULT_COLLECTIONS;
  }

  async saveCollections(collections: Collection[]) {
    this.write(KEYS.collections, collections);
  }

  private readDrafts(): Draft[] {
    const raw = this.read<Draft[]>(KEYS.drafts, []);
    return (Array.isArray(raw) ? raw : [])
      .map((d) => {
        const entry = normalizeEntry(d?.entry);
        return entry ? { entry, savedAt: d.savedAt, isNew: Boolean(d.isNew) } : null;
      })
      .filter((d): d is Draft => d !== null);
  }

  async listDrafts() {
    return this.readDrafts();
  }

  async saveDraft(draft: Draft) {
    const all = this.readDrafts().filter((d) => d.entry.id !== draft.entry.id);
    all.push(draft);
    this.write(KEYS.drafts, all);
  }

  async deleteDraft(entryId: string) {
    this.write(KEYS.drafts, this.readDrafts().filter((d) => d.entry.id !== entryId));
  }

  async getMeta(): Promise<JournalMeta> {
    return { demoSeeded: false, ...this.read<Partial<JournalMeta>>(KEYS.meta, {}) };
  }

  async setMeta(meta: Partial<JournalMeta>) {
    this.write(KEYS.meta, { ...(await this.getMeta()), ...meta });
  }
}

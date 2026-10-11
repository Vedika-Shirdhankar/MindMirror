import type { Collection, Draft, JournalEntry } from '../types/journal';

/**
 * The ONLY persistence contract the journal UI depends on.
 *
 * The prototype ships a localStorage implementation. To integrate with
 * MindMirror later, write another class that implements this interface using
 * the existing backend's REST calls and pass it to <JournalProvider storage={...} />.
 * No component needs to change.
 *
 * Every method is async on purpose, so swapping in network calls is a drop-in.
 */
export interface JournalMeta {
  /** true once sample entries have been offered (so deleting them is respected) */
  demoSeeded: boolean;
}

export interface JournalStorage {
  listEntries(): Promise<JournalEntry[]>;
  getEntry(id: string): Promise<JournalEntry | null>;
  /** Create or update. Returns the stored entry. */
  saveEntry(entry: JournalEntry): Promise<JournalEntry>;
  deleteEntry(id: string): Promise<void>;

  listCollections(): Promise<Collection[]>;
  saveCollections(collections: Collection[]): Promise<void>;

  /** Autosaved, not-yet-committed work. */
  listDrafts(): Promise<Draft[]>;
  saveDraft(draft: Draft): Promise<void>;
  deleteDraft(entryId: string): Promise<void>;

  getMeta(): Promise<JournalMeta>;
  setMeta(meta: Partial<JournalMeta>): Promise<void>;
}

export class StorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}

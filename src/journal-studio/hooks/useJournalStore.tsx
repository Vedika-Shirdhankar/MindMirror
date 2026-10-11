import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Collection, Draft, JournalEntry } from '../types/journal';
import type { JournalStorage } from '../storage';
import { ApiJournalStorage } from '../storage';
import { buildDemoEntries } from '../data/demoEntries';
import { nowIso } from '../lib/ids';

export interface JournalStore {
  ready: boolean;
  error: string | null;
  entries: JournalEntry[];
  collections: Collection[];
  drafts: Draft[];
  /** Commit an entry to the journal (also clears its draft). */
  saveEntry: (entry: JournalEntry) => Promise<JournalEntry>;
  deleteEntry: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  removeDemoEntries: () => Promise<void>;
  restoreDemoEntries: () => Promise<void>;
  updateCollections: (next: Collection[]) => Promise<void>;
  saveDraft: (entry: JournalEntry, isNew: boolean) => Promise<void>;
  discardDraft: (entryId: string) => Promise<void>;
  clearError: () => void;
}

const Ctx = createContext<JournalStore | null>(null);

const msg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong while saving.');

export function JournalProvider({ children, storage }: { children: ReactNode; storage?: JournalStorage }) {
  // One adapter for the lifetime of the provider. Uses MongoDB-backed ApiJournalStorage by default.
  const store = useRef<JournalStorage>(storage ?? new ApiJournalStorage());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = store.current;
        const meta = await s.getMeta();
        if (!meta.demoSeeded) {
          const existing = await s.listEntries();
          // Only offer sample entries to a truly empty journal.
          if (existing.length === 0) for (const e of buildDemoEntries()) await s.saveEntry(e);
          await s.setMeta({ demoSeeded: true });
        }
        const [e, c, d] = await Promise.all([s.listEntries(), s.listCollections(), s.listDrafts()]);
        if (!alive) return;
        setEntries(e); setCollections(c); setDrafts(d);
      } catch (err) {
        if (alive) setError(msg(err));
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  const saveEntry = useCallback(async (entry: JournalEntry) => {
    const toSave = { ...entry, updatedAt: nowIso() };
    try {
      await store.current.saveEntry(toSave);
      await store.current.deleteDraft(entry.id);
    } catch (err) {
      setError(msg(err));
      throw err;
    }
    setEntries((prev) => (prev.some((e) => e.id === toSave.id) ? prev.map((e) => (e.id === toSave.id ? toSave : e)) : [...prev, toSave]));
    setDrafts((prev) => prev.filter((d) => d.entry.id !== entry.id));
    return toSave;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      await store.current.deleteEntry(id);
      await store.current.deleteDraft(id);
    } catch (err) { setError(msg(err)); throw err; }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDrafts((prev) => prev.filter((d) => d.entry.id !== id));
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    const current = (await store.current.getEntry(id));
    if (!current) return;
    // Favouriting is metadata: it must not bump "last updated" or touch the text.
    const next = { ...current, favorite: !current.favorite };
    try { await store.current.saveEntry(next); } catch (err) { setError(msg(err)); throw err; }
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, favorite: next.favorite } : e)));
  }, []);

  const removeDemoEntries = useCallback(async () => {
    try {
      const all = await store.current.listEntries();
      for (const e of all.filter((x) => x.isDemo)) { await store.current.deleteEntry(e.id); await store.current.deleteDraft(e.id); }
      await store.current.setMeta({ demoSeeded: true });
    } catch (err) { setError(msg(err)); throw err; }
    setEntries((prev) => prev.filter((e) => !e.isDemo));
    setDrafts((prev) => prev.filter((d) => !d.entry.isDemo));
  }, []);

  const restoreDemoEntries = useCallback(async () => {
    try {
      const have = new Set((await store.current.listEntries()).map((e) => e.id));
      for (const e of buildDemoEntries()) if (!have.has(e.id)) await store.current.saveEntry(e);
      setEntries(await store.current.listEntries());
    } catch (err) { setError(msg(err)); throw err; }
  }, []);

  const updateCollections = useCallback(async (next: Collection[]) => {
    try {
      await store.current.saveCollections(next);
      const alive = new Set(next.map((c) => c.id));
      const orphaned = (await store.current.listEntries()).filter((e) => e.collectionId && !alive.has(e.collectionId));
      for (const e of orphaned) await store.current.saveEntry({ ...e, collectionId: null });
      if (orphaned.length) setEntries(await store.current.listEntries());
    } catch (err) { setError(msg(err)); throw err; }
    setCollections(next);
  }, []);

  const saveDraft = useCallback(async (entry: JournalEntry, isNew: boolean) => {
    const draft: Draft = { entry, savedAt: nowIso(), isNew };
    try { await store.current.saveDraft(draft); } catch (err) { setError(msg(err)); throw err; }
    setDrafts((prev) => [...prev.filter((d) => d.entry.id !== entry.id), draft]);
  }, []);

  const discardDraft = useCallback(async (entryId: string) => {
    try { await store.current.deleteDraft(entryId); } catch (err) { setError(msg(err)); throw err; }
    setDrafts((prev) => prev.filter((d) => d.entry.id !== entryId));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<JournalStore>(() => ({
    ready, error, entries, collections, drafts,
    saveEntry, deleteEntry, toggleFavorite, removeDemoEntries, restoreDemoEntries,
    updateCollections, saveDraft, discardDraft, clearError,
  }), [ready, error, entries, collections, drafts, saveEntry, deleteEntry, toggleFavorite, removeDemoEntries, restoreDemoEntries, updateCollections, saveDraft, discardDraft, clearError]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJournalStore(): JournalStore {
  const v = useContext(Ctx);
  if (!v) throw new Error('useJournalStore must be used inside <JournalProvider>');
  return v;
}

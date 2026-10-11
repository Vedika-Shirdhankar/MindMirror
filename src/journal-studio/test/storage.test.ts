import { beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageJournalStorage, normalizeEntry } from '../storage/localStorageAdapter';
import type { JournalEntry } from '../types/journal';

const entry = (over: Partial<JournalEntry> = {}): JournalEntry => ({
  id: 'e1', title: 'Hello', content: '<p>Hi <strong>there</strong></p>', createdAt: '2025-01-01T10:00:00.000Z', updatedAt: '2025-01-01T10:00:00.000Z',
  mood: 'hopeful', prompt: 'What made me smile today?', favorite: false, theme: 'dotted', collectionId: 'happy',
  stickers: [{ id: 's1', type: 'daisy', x: 0.12, y: 0.34, width: 0.2, height: 0.2, rotation: 33, z: 1, layer: 'back' }], ...over,
});

describe('LocalStorageJournalStorage', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips every field, including sticker geometry', async () => {
    await new LocalStorageJournalStorage().saveEntry(entry());
    // a brand-new instance == a page refresh
    const after = await new LocalStorageJournalStorage().getEntry('e1');
    expect(after).toEqual(expect.objectContaining(entry()));
  });

  it('updates in place and deletes', async () => {
    const s = new LocalStorageJournalStorage();
    await s.saveEntry(entry());
    await s.saveEntry(entry({ title: 'Changed' }));
    expect(await s.listEntries()).toHaveLength(1);
    expect((await s.getEntry('e1'))!.title).toBe('Changed');
    await s.deleteEntry('e1');
    expect(await s.listEntries()).toHaveLength(0);
  });

  it('survives corrupted storage', async () => {
    localStorage.setItem('mindmirror-journal-studio:v1:entries', '{not json');
    expect(await new LocalStorageJournalStorage().listEntries()).toEqual([]);
    localStorage.setItem('mindmirror-journal-studio:v1:entries', JSON.stringify([{ nope: true }, entry()]));
    expect(await new LocalStorageJournalStorage().listEntries()).toHaveLength(1);
  });

  it('fills in defaults for older entries', () => {
    const e = normalizeEntry({ id: 'old', title: 'x' } as Partial<JournalEntry>)!;
    expect(e).toMatchObject({ theme: 'cream', stickers: [], mood: null, favorite: false, collectionId: null });
  });

  it('manages drafts, collections and meta', async () => {
    const s = new LocalStorageJournalStorage();
    expect((await s.listCollections()).map((c) => c.name)).toContain('Unsent Letters');
    await s.saveDraft({ entry: entry(), savedAt: 'now', isNew: true });
    expect(await s.listDrafts()).toHaveLength(1);
    await s.deleteDraft('e1');
    expect(await s.listDrafts()).toHaveLength(0);
    await s.setMeta({ demoSeeded: true });
    expect((await s.getMeta()).demoSeeded).toBe(true);
  });
});

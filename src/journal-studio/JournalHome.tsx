import { useMemo, useState } from 'react';
import { BookHeart, FolderHeart, Heart, PenLine, Plus, Search, Sparkles, X } from 'lucide-react';
import type { Draft, JournalEntry, MoodId, PlacedSticker } from '../types/journal';
import { MOODS, MOOD_ICONS } from '../data/moods';
import { useJournalStore } from '../hooks/useJournalStore';
import { htmlToText } from '../lib/text';
import { ConfirmDialog, Modal } from './Modal';
import { useToast } from './Toast';
import { EntryCard } from './EntryCard';
import { CollectionManager } from './CollectionManager';
import { PaperPage } from './PaperPage';
import { StaticStickerLayer } from './StickerLayer';

interface Props {
  onWriteFreely: () => void;
  onStartWithPrompt: () => void;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onResumeDraft: (draft: Draft) => void;
}

const stk = (id: string, type: string, x: number, y: number, width: number, aspect: number, rotation: number, z: number): PlacedSticker =>
  ({ id, type, x, y, width, height: width * aspect, rotation, z, layer: 'front' });

const HERO_STICKERS: PlacedSticker[] = [
  stk('h1', 'washi-lavender', 0.28, -0.02, 0.44, 0.28, -3, 1),
  stk('h2', 'daisy', 0.7, 0.44, 0.2, 1, 12, 2),
  stk('h3', 'label-today', 0.06, 0.62, 0.34, 0.34, -6, 3),
  stk('h4', 'sparkle-gold', 0.8, 0.12, 0.11, 1, 10, 4),
  stk('h5', 'heart-blush', 0.1, 0.9, 0.14, 1, -12, 5),
  stk('h6', 'coffee', 0.62, 0.8, 0.15, 1, 8, 6),
];

function HeroCollage() {
  return (
    <div className="hero-collage relative mx-auto w-full max-w-[380px] rotate-[2.5deg]" aria-hidden>
      <PaperPage
        theme="lined" stickers={HERO_STICKERS} layer={<StaticStickerLayer stickers={HERO_STICKERS} />}
        className="min-h-[430px]" hideHoles contentClassName="px-7 pb-8 pt-12"
      >
        <p className="hand text-[1.75rem] leading-[32px] text-ink-soft">Dear me,</p>
        <p className="hand mt-0 max-w-[16rem] text-[1.45rem] leading-[32px] text-ink">
          today the light on the wall was golden and I let myself stay a while.
        </p>
      </PaperPage>
    </div>
  );
}

function Section({ title, count, children, action }: { title: string; count?: number; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="font-serif text-2xl text-ink sm:text-[1.75rem]">
          {title}{typeof count === 'number' && <span className="ml-2 text-lg font-normal text-ink-mute">{count}</span>}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function JournalHome({ onWriteFreely, onStartWithPrompt, onOpen, onEdit, onResumeDraft }: Props) {
  const store = useJournalStore();
  const toast = useToast();
  const { entries, collections, drafts } = store;

  const [query, setQuery] = useState('');
  const [mood, setMood] = useState<MoodId | null>(null);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [chooser, setChooser] = useState(false);
  const [managing, setManaging] = useState(false);
  const [deleting, setDeleting] = useState<JournalEntry | null>(null);

  const filtering = query.trim() !== '' || mood !== null || collectionId !== null;
  const byRecent = useMemo(
    () => [...entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [entries],
  );
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byRecent.filter((e) => {
      if (mood && e.mood !== mood) return false;
      if (collectionId && e.collectionId !== collectionId) return false;
      if (!q) return true;
      return `${e.title} ${htmlToText(e.content)} ${e.prompt ?? ''}`.toLowerCase().includes(q);
    });
  }, [byRecent, query, mood, collectionId]);
  const favorites = byRecent.filter((e) => e.favorite);
  const demoCount = entries.filter((e) => e.isDemo).length;
  const counts = useMemo(
    () => entries.reduce<Record<string, number>>((m, e) => { if (e.collectionId) m[e.collectionId] = (m[e.collectionId] ?? 0) + 1; return m; }, {}),
    [entries],
  );
  const colOf = (e: JournalEntry) => collections.find((c) => c.id === e.collectionId);

  const clearFilters = () => { setQuery(''); setMood(null); setCollectionId(null); };

  const toggleFav = async (e: JournalEntry) => {
    try { await store.toggleFavorite(e.id); toast(e.favorite ? 'Removed from favorites' : 'Added to favorites'); }
    catch { toast('Could not update favorites.', 'error'); }
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    const t = deleting;
    setDeleting(null);
    try { await store.deleteEntry(t.id); toast('Entry deleted'); } catch { toast('Could not delete this entry.', 'error'); }
  };

  const card = (e: JournalEntry, className = '') => (
    <EntryCard
      key={e.id} entry={e} collection={colOf(e)} className={className}
      onOpen={() => onOpen(e.id)} onEdit={() => onEdit(e.id)} onToggleFavorite={() => void toggleFav(e)} onDelete={() => setDeleting(e)}
    />
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
      <header className="flex items-center gap-3 py-5">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-blush-100 text-blush-400"><BookHeart size={22} /></span>
        <div className="leading-tight">
          <p className="font-serif text-lg font-semibold">MindMirror Journal Studio</p>
          <p className="text-[13px] text-ink-mute">Prototype. Everything stays in this browser.</p>
        </div>
      </header>

      {/* Hero */}
      <section className="grid items-center gap-10 pb-6 pt-4 md:grid-cols-[1.15fr_.85fr] md:pt-10">
        <div>
          <h1 className="font-serif text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl">Your little corner of the world.</h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">A space for everything you're feeling, thinking, and becoming.</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button className="btn-primary !min-h-[56px] px-8 text-base" onClick={() => setChooser(true)}><Plus size={20} /> Create New Entry</button>
            <button className="btn-soft !min-h-[56px]" onClick={onWriteFreely}><PenLine size={18} /> Write Freely</button>
            <button className="btn-lav !min-h-[56px]" onClick={onStartWithPrompt}><Sparkles size={18} /> Start With a Prompt</button>
          </div>
        </div>
        <HeroCollage />
      </section>

      {/* Drafts */}
      {drafts.length > 0 && (
        <div className="mt-8 space-y-2" aria-label="Unsaved drafts">
          {drafts.map((d) => (
            <div key={d.entry.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-lav-200 bg-lav-50/90 px-5 py-3">
              <p className="flex-1 text-[15px] text-ink-soft">
                You have an unsaved draft: <strong className="font-semibold text-ink">{d.entry.title || 'Untitled entry'}</strong>
              </p>
              <button className="btn-lav !min-h-[40px]" onClick={() => onResumeDraft(d)}>Continue writing</button>
              <button className="btn-ghost !min-h-[40px]" onClick={() => void store.discardDraft(d.entry.id)}>Discard draft</button>
            </div>
          ))}
        </div>
      )}

      {/* Demo notice */}
      {demoCount > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-sage-300 bg-sage-50 px-5 py-3" data-testid="demo-banner">
          <p className="flex-1 text-[15px] text-sage-600">
            {demoCount === 1 ? 'One entry here is' : `${demoCount} entries here are`} demo content, so you can look around. Your own entries are never touched.
          </p>
          <button
            className="btn-soft !min-h-[40px]"
            onClick={async () => { try { await store.removeDemoEntries(); toast('Demo entries removed'); } catch { toast('Could not remove demo entries.', 'error'); } }}
          >Remove demo entries</button>
        </div>
      )}

      {/* Search & filters */}
      <section className="mt-10" aria-label="Find entries">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={19} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink-mute" aria-hidden />
            <input
              type="search" className="field !pl-12" placeholder="Search your entries" aria-label="Search entries"
              value={query} onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <p className="text-[15px] text-ink-soft" data-testid="entry-count">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by mood">
          {MOODS.map((m) => {
            const Icon = MOOD_ICONS[m.id];
            const on = mood === m.id;
            return (
              <button
                key={m.id} className="chip shrink-0" aria-pressed={on} onClick={() => setMood(on ? null : m.id)}
                style={on ? undefined : { background: `${m.bg}cc`, color: m.fg, borderColor: 'transparent' }}
              ><Icon size={15} /> {m.label}</button>
            );
          })}
        </div>
      </section>

      {!store.ready ? (
        <p className="mt-12 text-ink-mute">Opening your journal…</p>
      ) : filtering ? (
        <Section
          title="Results" count={matches.length}
          action={<button className="btn-ghost !min-h-[40px]" onClick={clearFilters}><X size={16} /> Clear filters</button>}
        >
          {collectionId && (
            <p className="-mt-2 mb-4 text-sm text-ink-mute">In {collections.find((c) => c.id === collectionId)?.name}</p>
          )}
          {matches.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-blush-300 bg-white/50 px-6 py-10 text-center text-ink-soft">
              Nothing matches that yet. Try a different word, mood, or collection.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{matches.map((e) => card(e))}</div>
          )}
        </Section>
      ) : entries.length === 0 ? (
        <section className="mt-12 rounded-[28px] border border-dashed border-blush-300 bg-white/50 px-6 py-14 text-center">
          <p className="font-serif text-3xl text-ink">A blank page, ready when you are.</p>
          <p className="mx-auto mt-3 max-w-md text-ink-soft">Nothing here yet. Write whatever comes, or begin with a prompt.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="btn-primary" onClick={onWriteFreely}><PenLine size={18} /> Write Freely</button>
            <button className="btn-lav" onClick={onStartWithPrompt}><Sparkles size={18} /> Start With a Prompt</button>
            <button className="btn-soft" onClick={() => void store.restoreDemoEntries()}>Load demo entries</button>
          </div>
        </section>
      ) : (
        <>
          {favorites.length > 0 && (
            <Section title="Favorites" count={favorites.length}>
              <div className="no-scrollbar -mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0">
                {favorites.map((e) => card(e, 'w-[280px] shrink-0 snap-start'))}
              </div>
            </Section>
          )}

          <Section
            title="Collections"
            action={<button className="btn-ghost !min-h-[40px]" onClick={() => setManaging(true)}><FolderHeart size={17} /> Manage</button>}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {collections.map((c, i) => (
                <button
                  key={c.id} onClick={() => setCollectionId(c.id)}
                  className="rounded-2xl border border-blush-200/80 p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-paper"
                  style={{ background: ['#FDEDEE', '#F1ECFA', '#EBF1E4'][i % 3] }}
                >
                  <span className="text-2xl" aria-hidden>{c.emoji}</span>
                  <span className="mt-2 block font-serif text-[15px] font-semibold leading-snug">{c.name}</span>
                  <span className="text-[13px] text-ink-mute">{counts[c.id] ?? 0} {(counts[c.id] ?? 0) === 1 ? 'entry' : 'entries'}</span>
                </button>
              ))}
              {collections.length === 0 && <p className="col-span-full text-ink-mute">No collections yet. Use Manage to add one.</p>}
            </div>
          </Section>

          <Section title="Recently written" count={byRecent.length}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{byRecent.map((e) => card(e))}</div>
          </Section>
        </>
      )}

      <footer className="mt-16 flex items-start gap-2 text-[13px] leading-relaxed text-ink-mute">
        <Heart size={14} className="mt-1 shrink-0" aria-hidden />
        <p>
          Entries are kept in this browser's local storage. That storage is not encrypted, so it's for testing the feature, not for anything private you'd mind someone else on this device reading.
        </p>
      </footer>

      {chooser && (
        <Modal title="How do you want to begin?" onClose={() => setChooser(false)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              data-autofocus className="rounded-3xl border border-blush-200 bg-blush-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-soft"
              onClick={() => { setChooser(false); onWriteFreely(); }}
            >
              <PenLine className="text-blush-400" />
              <span className="mt-3 block font-serif text-xl font-semibold">Write Freely</span>
              <span className="mt-1 block text-[15px] text-ink-soft">A blank page. No questions.</span>
            </button>
            <button
              className="rounded-3xl border border-lav-200 bg-lav-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-soft"
              onClick={() => { setChooser(false); onStartWithPrompt(); }}
            >
              <Sparkles className="text-lav-400" />
              <span className="mt-3 block font-serif text-xl font-semibold">Start With a Prompt</span>
              <span className="mt-1 block text-[15px] text-ink-soft">A gentle question to begin with.</span>
            </button>
          </div>
        </Modal>
      )}

      {managing && (
        <CollectionManager collections={collections} counts={counts} onSave={store.updateCollections} onClose={() => setManaging(false)} />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this entry?" tone="danger" confirmLabel="Delete entry"
          message={<>“{deleting.title || 'Untitled entry'}” and its stickers will be removed from this browser. This cannot be undone.</>}
          onConfirm={() => void confirmDelete()} onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

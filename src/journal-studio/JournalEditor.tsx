import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { ArrowLeft, Check, Eye, Minimize2, Save, Trash2 } from 'lucide-react';
import type { JournalEntry, MoodId, PageThemeId, PlacedSticker } from '../types/journal';
import type { StickerDef } from '../data/stickers';
import { randomPrompt, randomPromptFrom } from '../data/prompts';
import { useJournalStore } from '../hooks/useJournalStore';
import { nowIso } from '../lib/ids';
import { formatTime, htmlToText, isEmptyHtml, wordCount } from '../lib/text';
import {
  createSticker, duplicateSticker, removeSticker, reorderSticker, rotateBy, scaleSticker, setLayer,
} from '../lib/stickers';
import { measurePage } from '../hooks/useStickerInteraction';
import { ConfirmDialog } from './Modal';
import { useToast } from './Toast';
import { EditorToolbar } from './EditorToolbar';
import { StickerToolbar } from './StickerToolbar';
import { WritingCanvas } from './WritingCanvas';
import { EditorPanel, PANEL_TABS, type PanelTab } from './EditorPanel';
import { EntryPreview } from './EntryPreview';
import { CollectionManager } from './CollectionManager';
import { categoryOfPrompt } from './PromptSelector';

interface Props {
  initial: JournalEntry;
  isNew: boolean;
  /** true when `initial` is an autosaved draft rather than the saved version */
  restoredDraft?: boolean;
  onExit: () => void;
}

interface History { past: PlacedSticker[][]; future: PlacedSticker[][] }

export function JournalEditor({ initial, isNew: isNewProp, restoredDraft, onExit }: Props) {
  const store = useJournalStore();
  const toast = useToast();

  // ----- entry fields -----
  const [isNew, setIsNew] = useState(isNewProp);
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [mood, setMood] = useState<MoodId | null>(initial.mood);
  const [prompt, setPrompt] = useState<string | null>(initial.prompt);
  const [theme, setTheme] = useState<PageThemeId>(initial.theme);
  const [collectionId, setCollectionId] = useState<string | null>(initial.collectionId);
  const [favorite, setFavorite] = useState(initial.favorite);
  const [stickers, setStickers] = useState<PlacedSticker[]>(initial.stickers);

  // ----- UI state -----
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<PanelTab>('stickers');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [peek, setPeek] = useState(false);
  const [confirm, setConfirm] = useState<null | 'exit' | 'delete'>(null);
  const [managing, setManaging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftAt, setDraftAt] = useState<string | null>(null);
  const [draftSnap, setDraftSnap] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // ----- rich text -----
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2] }, codeBlock: false, code: false, horizontalRule: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: "Dear me, what's on your mind today?" }),
    ],
    content: initial.content,
    editorProps: { attributes: { 'aria-label': 'Journal entry text', 'aria-multiline': 'true', role: 'textbox' } },
    onUpdate: ({ editor: ed }) => setContent(ed.getHTML()),
  });

  // ----- sticker state with undo / redo -----
  const stickersRef = useRef(stickers);
  stickersRef.current = stickers;
  const gestureBase = useRef<PlacedSticker[] | null>(null);
  const historyRef = useRef<History>({ past: [], future: [] });
  const [history, setHistoryState] = useState<History>(historyRef.current);
  const setHistory = (h: History) => { historyRef.current = h; setHistoryState(h); };

  const applyStickers = useCallback((update: (cur: PlacedSticker[]) => PlacedSticker[], live = false) => {
    const cur = stickersRef.current;
    const next = update(cur);
    if (live) {
      if (!gestureBase.current) gestureBase.current = cur;
      stickersRef.current = next; setStickers(next);
      return;
    }
    const base = gestureBase.current ?? cur;
    gestureBase.current = null;
    stickersRef.current = next; setStickers(next);
    if (JSON.stringify(base) !== JSON.stringify(next)) {
      const h = historyRef.current;
      historyRef.current = { past: [...h.past.slice(-49), base], future: [] };
      setHistoryState(historyRef.current);
    }
  }, []);

  const restoreStickers = (to: PlacedSticker[]) => {
    stickersRef.current = to; setStickers(to);
    setSelectedId((id) => (id && to.some((s) => s.id === id) ? id : null));
  };
  // Undo/redo read from refs (never from inside a state updater) so React StrictMode can't double-apply them.
  const undoStickers = () => {
    const h = historyRef.current;
    if (!h.past.length) return;
    const cur = stickersRef.current;
    restoreStickers(h.past[h.past.length - 1]);
    setHistory({ past: h.past.slice(0, -1), future: [cur, ...h.future] });
  };
  const redoStickers = () => {
    const h = historyRef.current;
    if (!h.future.length) return;
    const cur = stickersRef.current;
    restoreStickers(h.future[0]);
    setHistory({ past: [...h.past, cur], future: h.future.slice(1) });
  };

  const getBounds = () => {
    const el = pageRef.current;
    return el ? measurePage(el).bounds : { width: 1, height: 1.3 };
  };

  const onStickerChange = useCallback((next: PlacedSticker, live: boolean) => {
    applyStickers((cur) => cur.map((s) => (s.id === next.id ? next : s)), live);
  }, [applyStickers]);

  const deleteSticker = useCallback((id: string) => {
    applyStickers((cur) => removeSticker(cur, id));
    setSelectedId((s) => (s === id ? null : s));
  }, [applyStickers]);

  /** Place a new sticker in the middle of what the person is currently looking at. */
  const addSticker = (def: StickerDef) => {
    const el = pageRef.current;
    const bounds = getBounds();
    let at = { x: 0.5, y: 0.25 };
    if (el) {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const small = window.innerWidth < 1024;
      const top = Math.max(rect.top, small ? 110 : 150);
      const bottom = Math.min(rect.bottom, small && sheetOpen ? vh * 0.48 : vh - (small ? 80 : 20));
      const cy = Math.min(Math.max((top + bottom) / 2 - rect.top, 40), rect.height - 40);
      at = { x: 0.5, y: cy / rect.width };
    }
    const sticker = createSticker(def, stickersRef.current, at, bounds);
    applyStickers((cur) => [...cur, sticker]);
    setSelectedId(sticker.id);
  };

  const selected = useMemo(() => stickers.find((s) => s.id === selectedId) ?? null, [stickers, selectedId]);
  const updateSelected = (fn: (s: PlacedSticker) => PlacedSticker) => {
    if (!selectedId) return;
    applyStickers((cur) => cur.map((s) => (s.id === selectedId ? fn(s) : s)));
  };

  // ----- dirty tracking & autosave -----
  const snap = useMemo(
    () => JSON.stringify({ title, content, mood, prompt, theme, collectionId, favorite, stickers }),
    [title, content, mood, prompt, theme, collectionId, favorite, stickers],
  );
  const plain = useMemo(() => htmlToText(content), [content]);
  const words = wordCount(plain);
  const isBlank = title.trim() === '' && isEmptyHtml(content) && stickers.length === 0 && mood === null;

  // Establish the "clean" baseline once TipTap has normalised the incoming HTML.
  const baselineSet = useRef(false);
  useEffect(() => {
    if (!editor || baselineSet.current) return;
    baselineSet.current = true;
    const html = editor.getHTML();
    setContent(html);
    setBaseline(restoredDraft ? '__restored_draft__' : JSON.stringify({ title, content: html, mood, prompt, theme, collectionId, favorite, stickers }));
    if (isNewProp && !initial.prompt) titleRef.current?.focus();
    else if (isNewProp) editor.commands.focus('end');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const dirty = baseline !== null && snap !== baseline;

  const buildEntry = (): JournalEntry => ({
    id: initial.id, title: title.trim(), content, createdAt: initial.createdAt, updatedAt: nowIso(),
    mood, prompt, favorite, theme, stickers, collectionId,
    // once the person saves it, it is their entry, not demo content
    isDemo: undefined,
  });
  const latest = useRef({ buildEntry, snap, isNew });
  latest.current = { buildEntry, snap, isNew };

  useEffect(() => {
    if (!dirty || (isNew && isBlank)) return;
    const t = window.setTimeout(async () => {
      try {
        await store.saveDraft(latest.current.buildEntry(), latest.current.isNew);
        setDraftSnap(latest.current.snap); setDraftAt(nowIso());
      } catch { /* the store already surfaced the error */ }
    }, 900);
    return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap, dirty, isNew, isBlank]);

  const dirtyRef = useRef(dirty); dirtyRef.current = dirty;
  const blankRef = useRef(isBlank); blankRef.current = isBlank;

  // Flush a draft if the tab is closed or refreshed mid-edit.
  useEffect(() => {
    const flush = () => {
      const l = latest.current;
      if (dirtyRef.current && !(l.isNew && blankRef.current)) void store.saveDraft(l.buildEntry(), l.isNew);
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = saving ? 'Saving…'
    : dirty ? (draftSnap === snap && draftAt ? `Draft autosaved at ${formatTime(draftAt)}` : 'Unsaved changes')
    : isNew ? 'Blank page' : 'All changes saved';

  // ----- actions -----
  const handleSave = async (): Promise<boolean> => {
    if (isBlank) { toast('Add a title, a few words, or a sticker before saving.', 'error'); return false; }
    setSaving(true);
    try {
      await store.saveEntry(buildEntry());
      setBaseline(snap);
      setIsNew(false);
      toast(isNew ? 'Entry saved to your journal' : 'Changes saved');
      return true;
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not save this entry.', 'error');
      return false;
    } finally { setSaving(false); }
  };

  const requestExit = () => { if (dirty) setConfirm('exit'); else onExit(); };

  const discardAndExit = async () => {
    try { await store.discardDraft(initial.id); } catch { /* ignore */ }
    onExit();
  };

  const saveAndExit = async () => { if (await handleSave()) onExit(); else setConfirm(null); };

  const deleteEntry = async () => {
    try { await store.deleteEntry(initial.id); toast('Entry deleted'); onExit(); }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not delete this entry.', 'error'); setConfirm(null); }
  };

  const shufflePrompt = () => setPrompt((cur) => (cur ? randomPromptFrom(categoryOfPrompt(cur), cur) : randomPrompt()));

  const openPanel = (tab: PanelTab) => {
    setPanelTab(tab);
    setSheetOpen((open) => (open && panelTab === tab ? false : true));
  };

  // ----- keyboard -----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); void handleSave(); return; }
      if (e.key === 'Escape' && focusMode) { setFocusMode(false); return; }
      const inText = (e.target as HTMLElement | null)?.closest?.('.ProseMirror, textarea, input');
      if (mod && !inText && selectedId && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redoStickers(); else undoStickers(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMode, selectedId, snap, isBlank, saving, isNew]);

  // ----- preview -----
  if (mode === 'preview') {
    const e = buildEntry();
    return (
      <EntryPreview
        entry={{ ...e, updatedAt: e.updatedAt }} collections={store.collections} mode="draft"
        backLabel="Back to editing" onBack={() => setMode('edit')}
        onSave={() => void handleSave()} saveDisabled={!dirty && !isNew}
      />
    );
  }

  const sticky = focusMode ? '' : 'sticky top-0 z-40 border-b border-blush-100 bg-cream/90 backdrop-blur';

  return (
    <div className="min-h-screen">
      {focusMode ? (
        <div className="fixed left-1/2 top-3 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-blush-200 bg-white/90 py-1.5 pl-5 pr-2 text-sm shadow-soft backdrop-blur">
          <span className="text-ink-soft" aria-live="polite">{words} {words === 1 ? 'word' : 'words'}</span>
          <button className="btn-ghost !min-h-[40px]" onClick={() => void handleSave()} disabled={saving}><Save size={16} /> Save</button>
          <button className="btn-lav !min-h-[40px]" onClick={() => setFocusMode(false)}><Minimize2 size={16} /> Exit focus</button>
        </div>
      ) : (
        <header className={sticky}>
          <div className="mx-auto flex max-w-[1280px] items-center gap-1 px-2 py-2 sm:gap-2 sm:px-6">
            <button className="btn-ghost !px-3" onClick={requestExit} aria-label="Back to journal"><ArrowLeft size={18} /> <span className="hidden sm:inline">Journal</span></button>
            <p className="min-w-0 flex-1 truncate px-1 text-sm text-ink-mute" role="status" aria-live="polite" data-testid="save-status">{status}</p>
            {!isNew && <button className="icon-btn" aria-label="Delete entry" onClick={() => setConfirm('delete')}><Trash2 size={19} /></button>}
            <button className="btn-soft !px-4" onClick={() => setMode('preview')}><Eye size={18} /> <span className="hidden sm:inline">Preview</span></button>
            <button className="btn-primary !px-5" onClick={() => void handleSave()} disabled={saving || (!dirty && !isNew)}>
              {!dirty && !isNew ? <><Check size={18} /> Saved</> : <><Save size={18} /> Save</>}
            </button>
          </div>
          <div className="mx-auto max-w-[1280px] border-t border-blush-100/70">
            {selected ? (
              <StickerToolbar
                sticker={selected}
                canUndo={history.past.length > 0} canRedo={history.future.length > 0}
                onUndo={undoStickers} onRedo={redoStickers}
                onSmaller={() => updateSelected((s) => scaleSticker(s, 1 / 1.18, getBounds()))}
                onBigger={() => updateSelected((s) => scaleSticker(s, 1.18, getBounds()))}
                onRotateLeft={() => updateSelected((s) => rotateBy(s, -15))}
                onRotateRight={() => updateSelected((s) => rotateBy(s, 15))}
                onForward={() => applyStickers((cur) => reorderSticker(cur, selected.id, 'forward'))}
                onBackward={() => applyStickers((cur) => reorderSticker(cur, selected.id, 'backward'))}
                onToggleLayer={() => applyStickers((cur) => setLayer(cur, selected.id, selected.layer === 'back' ? 'front' : 'back'))}
                onDuplicate={() => {
                  const next = duplicateSticker(stickersRef.current, selected.id, getBounds());
                  applyStickers(() => next);
                  setSelectedId(next[next.length - 1].id);
                }}
                onDelete={() => deleteSticker(selected.id)}
                onDone={() => setSelectedId(null)}
              />
            ) : (
              <EditorToolbar
                editor={editor} favorite={favorite} onToggleFavorite={() => setFavorite((f) => !f)}
                stickerHistory={{ canUndo: history.past.length > 0, canRedo: history.future.length > 0, onUndo: undoStickers, onRedo: redoStickers }}
                peek={peek} onTogglePeek={() => setPeek((p) => !p)} onFocusMode={() => { setFocusMode(true); setSheetOpen(false); }}
              />
            )}
          </div>
        </header>
      )}

      <div className={`mx-auto flex w-full max-w-[1280px] gap-6 px-2 sm:px-6 ${focusMode ? 'pt-16' : 'pt-6'} lg:items-start`}>
        <main className="min-w-0 flex-1 overflow-x-clip px-3 pb-36 pt-6 sm:px-4 lg:pb-16">
          <div className={`mx-auto ${focusMode ? 'max-w-[760px]' : 'max-w-[840px]'}`}>
            <WritingCanvas
              editor={editor} pageRef={pageRef} titleRef={titleRef} theme={theme}
              title={title} onTitle={setTitle} createdAt={initial.createdAt}
              mood={mood} onOpenMood={() => { setPanelTab('mood'); setSheetOpen(true); }}
              prompt={prompt} onShufflePrompt={shufflePrompt} onRemovePrompt={() => setPrompt(null)}
              stickers={stickers} selectedId={selectedId} onSelect={setSelectedId}
              onStickerChange={onStickerChange} onStickerDelete={deleteSticker} peek={peek}
            />
            {!focusMode && (
              <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 text-sm text-ink-mute" data-testid="word-count">
                <span>{words} {words === 1 ? 'word' : 'words'}</span>
                <span>{stickers.length} {stickers.length === 1 ? 'sticker' : 'stickers'}</span>
                <span>Saved in this browser only</span>
              </p>
            )}
          </div>
        </main>

        {!focusMode && (
          <aside
            aria-label="Page tools"
            className={`${sheetOpen ? 'fixed inset-x-0 bottom-[68px] z-40 max-h-[50vh] rounded-t-[28px] border border-blush-200 bg-cream-paper/95 p-4 shadow-paper backdrop-blur animate-sheet' : 'hidden'}
              lg:static lg:z-auto lg:block lg:max-h-[calc(100vh-9.5rem)] lg:w-[340px] lg:shrink-0 lg:self-start lg:rounded-3xl lg:border lg:border-blush-200/70 lg:bg-white/60 lg:p-4 lg:shadow-soft lg:animate-none lg:sticky lg:top-[9.5rem]`}
          >
            <EditorPanel
              tab={panelTab} onTab={setPanelTab}
              onAddSticker={addSticker} stickers={stickers} selectedId={selectedId}
              onSelectSticker={(id) => { setSelectedId(id); setSheetOpen(false); }}
              mood={mood} onMood={setMood}
              theme={theme} onTheme={setTheme}
              prompt={prompt} onPrompt={setPrompt}
              collections={store.collections} collectionId={collectionId} onCollection={setCollectionId}
              onManageCollections={() => setManaging(true)}
            />
          </aside>
        )}
      </div>

      {!focusMode && (
        <nav aria-label="Page tools" className="safe-bottom fixed inset-x-0 bottom-0 z-50 flex h-[68px] items-stretch justify-around border-t border-blush-200 bg-cream/95 backdrop-blur lg:hidden">
          {PANEL_TABS.map(({ id, label, icon: Icon }) => {
            const on = sheetOpen && panelTab === id;
            return (
              <button
                key={id} onClick={() => openPanel(id)} aria-pressed={on} aria-label={`${label} drawer`}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${on ? 'text-[#4d3d78]' : 'text-ink-soft'}`}
              >
                <span className={`grid h-8 w-14 place-items-center rounded-full transition ${on ? 'bg-lav-100' : ''}`}><Icon size={20} /></span>
                {label}
              </button>
            );
          })}
        </nav>
      )}

      {confirm === 'exit' && (
        <ConfirmDialog
          title="Save before leaving?" confirmLabel="Save and close" cancelLabel="Keep writing"
          message="You have changes that are not in your journal yet."
          extra={{ label: 'Discard changes', onClick: () => void discardAndExit() }}
          onConfirm={() => void saveAndExit()} onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === 'delete' && (
        <ConfirmDialog
          title="Delete this entry?" tone="danger" confirmLabel="Delete entry"
          message={<>“{title.trim() || 'Untitled entry'}” and its stickers will be removed from this browser. This cannot be undone.</>}
          onConfirm={() => void deleteEntry()} onCancel={() => setConfirm(null)}
        />
      )}
      {managing && (
        <CollectionManager
          collections={store.collections}
          counts={store.entries.reduce<Record<string, number>>((m, e) => { if (e.collectionId) m[e.collectionId] = (m[e.collectionId] ?? 0) + 1; return m; }, {})}
          onSave={async (next) => { await store.updateCollections(next); if (collectionId && !next.some((c) => c.id === collectionId)) setCollectionId(null); }}
          onClose={() => setManaging(false)}
        />
      )}
    </div>
  );
}

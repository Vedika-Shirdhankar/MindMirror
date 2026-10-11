import { useLayoutEffect, type RefObject } from 'react';
import { EditorContent, type Editor } from '@tiptap/react';
import { Plus, Shuffle, Sparkles, X } from 'lucide-react';
import type { MoodId, PageThemeId, PlacedSticker } from '../types/journal';
import { getMood, MOOD_ICONS } from '../data/moods';
import { formatLongDate } from '../lib/text';
import { PaperPage } from './PaperPage';
import { StickerCanvasItem } from './StickerCanvasItem';

interface Props {
  editor: Editor | null;
  pageRef: RefObject<HTMLDivElement>;
  titleRef: RefObject<HTMLTextAreaElement>;
  theme: PageThemeId;
  title: string;
  onTitle: (t: string) => void;
  createdAt: string;
  mood: MoodId | null;
  onOpenMood: () => void;
  prompt: string | null;
  onShufflePrompt: () => void;
  onRemovePrompt: () => void;
  stickers: PlacedSticker[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onStickerChange: (next: PlacedSticker, live: boolean) => void;
  onStickerDelete: (id: string) => void;
  peek: boolean;
}

/** The writing surface: paper + editable title + rich text + draggable stickers. */
export function WritingCanvas(p: Props) {
  const mood = getMood(p.mood);
  const MoodIcon = mood ? MOOD_ICONS[mood.id] : null;

  // Grow the title field with its content (it wraps instead of scrolling sideways).
  useLayoutEffect(() => {
    const el = p.titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [p.title, p.titleRef]);

  const layer = (
    <div className={`pointer-events-none absolute inset-0 ${p.peek ? 'peek' : ''}`}>
      {p.stickers.map((s) => (
        <StickerCanvasItem
          key={s.id} sticker={s} selected={s.id === p.selectedId}
          onSelect={p.onSelect} onChange={p.onStickerChange} onDelete={p.onStickerDelete}
        />
      ))}
    </div>
  );

  return (
    <div onPointerDown={(e) => { if (!(e.target as Element).closest('[data-sticker]')) p.onSelect(null); }}>
      <PaperPage
        ref={p.pageRef} theme={p.theme} stickers={p.stickers} layer={layer}
        className="min-h-[640px] md:min-h-[860px]"
        contentClassName="px-5 pb-10 pt-7 md:pl-[4.5rem] md:pr-12 md:pt-12"
      >
        <div className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-2 self-start">
          <time className="hand text-[1.55rem] leading-none text-ink-soft" dateTime={p.createdAt}>{formatLongDate(p.createdAt)}</time>
          <button
            type="button" onClick={p.onOpenMood}
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition ${mood ? '' : 'border border-dashed border-lav-300 bg-white/60 text-ink-soft hover:bg-white'}`}
            style={mood ? { background: mood.bg, color: mood.fg } : undefined}
            aria-label={mood ? `Mood: ${mood.label}. Change mood` : 'Add a mood'}
          >
            {MoodIcon ? <><MoodIcon size={15} /> {mood!.label}</> : <><Plus size={15} /> How are you feeling?</>}
          </button>
        </div>

        <textarea
          ref={p.titleRef} rows={1} value={p.title} maxLength={120}
          onChange={(e) => p.onTitle(e.target.value.replace(/\n/g, ' '))}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); p.editor?.commands.focus('start'); } }}
          placeholder="Give this page a title" aria-label="Entry title"
          className="pointer-events-auto mt-4 w-full resize-none overflow-hidden bg-transparent font-serif text-[2rem] font-semibold leading-[1.15] text-ink placeholder:text-[#B3A9BA] focus:outline-none md:text-[2.5rem]"
        />

        {p.prompt && (
          <div className="pointer-events-auto relative mb-4 mt-3 flex items-start gap-3 rounded-2xl border border-dashed border-lav-300 bg-lav-50/85 px-4 py-3 animate-rise">
            <Sparkles size={18} className="mt-1 shrink-0 text-lav-400" aria-hidden />
            <p className="flex-1 font-serif text-lg italic leading-snug text-ink" data-testid="prompt-text">{p.prompt}</p>
            <button type="button" className="icon-btn !min-h-[36px] !min-w-[36px]" aria-label="Try a different prompt" title="Try a different prompt" onClick={p.onShufflePrompt}><Shuffle size={17} /></button>
            <button type="button" className="icon-btn !min-h-[36px] !min-w-[36px]" aria-label="Remove prompt and write freely" title="Remove prompt" onClick={p.onRemovePrompt}><X size={17} /></button>
          </div>
        )}

        <div className="pointer-events-auto mt-2 flex min-h-[18rem] flex-1 flex-col">
          <EditorContent editor={p.editor} className="journal-prose editor-surface flex-1" />
        </div>
      </PaperPage>
    </div>
  );
}

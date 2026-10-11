import { ArrowLeft, Check, Heart, Pencil, Save, Trash2 } from 'lucide-react';
import type { Collection, JournalEntry } from '../types/journal';
import { formatLongDate, sanitizeHtml } from '../lib/text';
import { MoodBadge } from './MoodSelector';
import { PaperPage } from './PaperPage';
import { StaticStickerLayer } from './StickerLayer';

interface Props {
  entry: JournalEntry;
  collections: Collection[];
  /** 'draft' = unsaved preview from the editor; 'saved' = reading a journal entry */
  mode: 'draft' | 'saved';
  backLabel: string;
  onBack: () => void;
  onEdit?: () => void;
  onSave?: () => void;
  saveDisabled?: boolean;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

/** The finished page as it reads: formatting, theme, mood, stickers and their positions are all preserved. */
export function EntryPreview({ entry, collections, mode, backLabel, onBack, onEdit, onSave, saveDisabled, onToggleFavorite, onDelete }: Props) {
  const collection = collections.find((c) => c.id === entry.collectionId);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-blush-100 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-2 sm:px-6">
          <button className="btn-ghost -ml-1" onClick={onBack}><ArrowLeft size={18} /> <span>{backLabel}</span></button>
          <span className="flex-1" />
          {onToggleFavorite && (
            <button className="icon-btn" aria-pressed={entry.favorite} aria-label={entry.favorite ? 'Remove from favorites' : 'Add to favorites'} onClick={onToggleFavorite}>
              <Heart size={20} fill={entry.favorite ? 'currentColor' : 'none'} className={entry.favorite ? 'text-blush-400' : ''} />
            </button>
          )}
          {onDelete && <button className="icon-btn" aria-label="Delete entry" onClick={onDelete}><Trash2 size={20} /></button>}
          {onEdit && <button className="btn-soft" onClick={onEdit}><Pencil size={17} /> Edit</button>}
          {onSave && (
            <button className="btn-primary" onClick={onSave} disabled={saveDisabled}>
              {saveDisabled ? <><Check size={18} /> Saved</> : <><Save size={18} /> Save entry</>}
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[860px] overflow-x-clip px-4 pb-20 pt-8 sm:px-6">
        {mode === 'draft' ? (
          <p className="mb-5 rounded-2xl border border-dashed border-lav-300 bg-lav-50/80 px-4 py-3 text-[15px] text-ink-soft">
            This is how your page will look. Nothing changes in your journal until you save.
          </p>
        ) : entry.isDemo ? (
          <p className="mb-5 rounded-2xl border border-dashed border-sage-300 bg-sage-50 px-4 py-3 text-[15px] text-sage-600">
            Demo entry. It is sample content, and you can remove all demo entries from the journal home.
          </p>
        ) : null}

        <div className="px-2 sm:px-4 pt-6">
          <PaperPage
            theme={entry.theme} stickers={entry.stickers} layer={<StaticStickerLayer stickers={entry.stickers} />}
            className="min-h-[560px] md:min-h-[780px]"
            contentClassName="px-5 pb-10 pt-7 md:pl-[4.5rem] md:pr-12 md:pt-12"
          >
            <div data-testid="preview-page" className="flex flex-1 flex-col">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <time className="hand text-[1.55rem] leading-none text-ink-soft" dateTime={entry.createdAt}>{formatLongDate(entry.createdAt)}</time>
                <MoodBadge mood={entry.mood} />
                {collection && <span className="chip !min-h-[32px] !py-0 text-[13px]"><span aria-hidden>{collection.emoji}</span> {collection.name}</span>}
              </div>
              <h1 className="mt-4 font-serif text-[2rem] font-semibold leading-[1.15] md:text-[2.5rem]">{entry.title || 'Untitled entry'}</h1>
              {entry.prompt && (
                <p className="mb-4 mt-3 rounded-2xl border border-dashed border-lav-300 bg-lav-50/85 px-4 py-3 font-serif text-lg italic leading-snug">{entry.prompt}</p>
              )}
              <div className="journal-prose static mt-2 flex-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(entry.content) }} />
            </div>
          </PaperPage>
        </div>
      </main>
    </div>
  );
}

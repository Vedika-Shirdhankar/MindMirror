import { Heart, Pencil, Trash2 } from 'lucide-react';
import type { Collection, JournalEntry } from '../types/journal';
import { excerpt, formatShortDate } from '../lib/text';
import { MoodBadge } from './MoodSelector';
import { StaticStickerLayer } from './StickerLayer';

interface Props {
  entry: JournalEntry;
  collection?: Collection;
  onOpen: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  className?: string;
}

/** A journal entry as a small paper card with a thumbnail of its sticker arrangement. */
export function EntryCard({ entry, collection, onOpen, onEdit, onToggleFavorite, onDelete, className = '' }: Props) {
  const text = excerpt(entry.content, 150);
  const title = entry.title || 'Untitled entry';
  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-[22px] border border-blush-200/80 bg-cream-paper shadow-soft transition hover:-translate-y-0.5 hover:shadow-paper ${className}`}>
      <div className={`page-wrap theme-${entry.theme} relative w-full overflow-hidden`} style={{ aspectRatio: '1 / 0.6' }} aria-hidden>
        <div className="paper-bg" />
        {entry.stickers.length === 0 && (
          <span className="absolute inset-0 grid place-items-center text-3xl opacity-25">✿</span>
        )}
        <StaticStickerLayer stickers={entry.stickers} />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] font-medium text-ink-mute">{formatShortDate(entry.createdAt)}</span>
          <MoodBadge mood={entry.mood} size="sm" />
          {entry.isDemo && <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-semibold text-sage-600">Demo</span>}
        </div>
        <h3 className="font-serif text-xl font-semibold leading-snug text-ink">
          <button className="line-clamp-2 text-left after:absolute after:inset-0 after:content-['']" onClick={onOpen} aria-label={`Open ${title}`}>{title}</button>
        </h3>
        {text && <p className="line-clamp-3 text-[15px] leading-relaxed text-ink-soft">{text}</p>}
        {collection && (
          <p className="mt-auto pt-1 text-[13px] text-ink-mute"><span aria-hidden>{collection.emoji}</span> {collection.name}</p>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-end gap-0.5 px-2 pb-2">
        <button className="icon-btn" aria-pressed={entry.favorite} aria-label={entry.favorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`} onClick={onToggleFavorite}>
          <Heart size={19} fill={entry.favorite ? 'currentColor' : 'none'} className={entry.favorite ? 'text-blush-400' : ''} />
        </button>
        <button className="icon-btn" aria-label={`Edit ${title}`} onClick={onEdit}><Pencil size={18} /></button>
        <button className="icon-btn" aria-label={`Delete ${title}`} onClick={onDelete}><Trash2 size={18} /></button>
      </div>
    </article>
  );
}

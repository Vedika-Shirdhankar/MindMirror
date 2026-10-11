import { Palette, Smile, Sticker as StickerIcon, X } from 'lucide-react';
import type { Collection, MoodId, PageThemeId, PlacedSticker } from '../types/journal';
import type { StickerDef } from '../data/stickers';
import { STICKER_BY_ID } from '../data/stickers';
import { PAGE_THEMES } from '../data/themes';
import { StickerLibrary } from './StickerLibrary';
import { StickerThumb } from './StickerVisual';
import { MoodSelector } from './MoodSelector';
import { PromptSelector } from './PromptSelector';
import { CollectionPicker } from './CollectionManager';

export type PanelTab = 'stickers' | 'mood' | 'page';

export const PANEL_TABS: { id: PanelTab; label: string; icon: typeof StickerIcon }[] = [
  { id: 'stickers', label: 'Stickers', icon: StickerIcon },
  { id: 'mood', label: 'Mood', icon: Smile },
  { id: 'page', label: 'Page', icon: Palette },
];

interface Props {
  tab: PanelTab;
  onTab: (t: PanelTab) => void;
  onAddSticker: (def: StickerDef) => void;
  stickers: PlacedSticker[];
  selectedId: string | null;
  onSelectSticker: (id: string) => void;
  mood: MoodId | null;
  onMood: (m: MoodId | null) => void;
  theme: PageThemeId;
  onTheme: (t: PageThemeId) => void;
  prompt: string | null;
  onPrompt: (p: string | null) => void;
  collections: Collection[];
  collectionId: string | null;
  onCollection: (id: string | null) => void;
  onManageCollections: () => void;
}

const H = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-2 mt-6 font-serif text-lg text-ink first:mt-0">{children}</h3>
);

/** Sticker drawer, mood, and page settings. A sidebar on desktop; a bottom sheet on mobile. */
export function EditorPanel(p: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 rounded-full bg-white/70 p-1" role="tablist" aria-label="Page tools">
        {PANEL_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id} role="tab" aria-selected={p.tab === id} onClick={() => p.onTab(id)}
            className={`flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition ${p.tab === id ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-white'}`}
          ><Icon size={16} /> {label}</button>
        ))}
      </div>

      <div className="scroll-thin mt-4 flex-1 overflow-y-auto pr-1" role="tabpanel">
        {p.tab === 'stickers' && (
          <>
            <StickerLibrary onAdd={p.onAddSticker} />
            <H>On this page ({p.stickers.length})</H>
            {p.stickers.length === 0 ? (
              <p className="text-sm text-ink-mute">Nothing yet. Stickers you add will be listed here, so you can still select ones tucked behind your text.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {p.stickers.map((s) => {
                  const def = STICKER_BY_ID[s.type];
                  if (!def) return null;
                  return (
                    <li key={s.id}>
                      <button
                        className={`grid h-12 w-12 place-items-center rounded-xl border bg-white/80 transition ${s.id === p.selectedId ? 'border-lav-400 ring-2 ring-lav-200' : 'border-blush-100 hover:border-lav-300'}`}
                        aria-label={`Select ${def.label}${s.layer === 'back' ? ' (behind text)' : ''}`} aria-pressed={s.id === p.selectedId}
                        onClick={() => p.onSelectSticker(s.id)}
                      >
                        <StickerThumb def={def} size={30} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {p.tab === 'mood' && <MoodSelector value={p.mood} onChange={p.onMood} />}

        {p.tab === 'page' && (
          <>
            <H>Paper</H>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Page theme">
              {PAGE_THEMES.map((t) => (
                <button
                  key={t.id} role="radio" aria-checked={p.theme === t.id} onClick={() => p.onTheme(t.id)}
                  className={`group text-center text-[12px] font-medium text-ink-soft`} title={t.label}
                >
                  <span
                    className={`theme-${t.id} relative block h-14 overflow-hidden rounded-xl border-2 transition ${p.theme === t.id ? 'border-ink' : 'border-blush-200 group-hover:border-lav-300'}`}
                    style={{ ['--line-h' as string]: '12px' }}
                  >
                    <span className="paper-bg !rounded-none" />
                    {t.id === 'lined' && <span className="editor-surface absolute inset-x-0 bottom-0 top-1.5" />}
                  </span>
                  <span className="mt-1 block truncate">{t.label}</span>
                </button>
              ))}
            </div>

            <H>Writing prompt</H>
            {p.prompt ? (
              <div className="mb-4 flex items-start gap-2 rounded-2xl border border-dashed border-lav-300 bg-lav-50/80 p-3">
                <p className="flex-1 font-serif text-[15px] italic leading-snug">{p.prompt}</p>
                <button className="icon-btn !min-h-[32px] !min-w-[32px]" aria-label="Remove prompt" onClick={() => p.onPrompt(null)}><X size={16} /></button>
              </div>
            ) : (
              <p className="mb-3 text-sm text-ink-mute">No prompt. You are writing freely. Pick one below if you want a nudge.</p>
            )}
            <PromptSelector variant="panel" current={p.prompt} onSelect={(pr) => p.onPrompt(pr)} />

            <H>Collection</H>
            <CollectionPicker collections={p.collections} value={p.collectionId} onChange={p.onCollection} onManage={p.onManageCollections} />
          </>
        )}
      </div>
    </div>
  );
}

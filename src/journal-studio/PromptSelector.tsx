import { useState } from 'react';
import { ArrowLeft, Camera, Compass, Dices, Heart, Moon, PenLine, Sprout, Telescope, type LucideIcon } from 'lucide-react';
import { ALL_PROMPTS, PROMPT_CATEGORIES } from '../data/prompts';

const ICONS: Record<string, LucideIcon> = {
  emotions: Heart, 'self-discovery': Compass, gratitude: Sprout, memories: Camera, 'future-self': Telescope, 'late-night': Moon,
};
const TINTS = [
  { bg: '#FBE3E4', fg: '#9B4651', ring: '#EBA9AE' },
  { bg: '#E9E3F7', fg: '#6B4E97', ring: '#BDAFE3' },
  { bg: '#E1EAD9', fg: '#4A6B3E', ring: '#A7BD98' },
];
const tint = (i: number) => TINTS[i % TINTS.length];

export const categoryOfPrompt = (prompt: string) =>
  PROMPT_CATEGORIES.find((c) => c.prompts.includes(prompt))?.id ?? null;

interface Props {
  variant?: 'page' | 'panel';
  current?: string | null;
  onSelect: (prompt: string, categoryId: string | null) => void;
  onBack?: () => void;
  onWriteFreely?: () => void;
}

export function PromptSelector({ variant = 'page', current, onSelect, onBack, onWriteFreely }: Props) {
  const [activeId, setActiveId] = useState(PROMPT_CATEGORIES[0].id);
  const active = PROMPT_CATEGORIES.find((c) => c.id === activeId)!;
  const activeIdx = PROMPT_CATEGORIES.indexOf(active);

  const surprise = () => {
    const pool = ALL_PROMPTS.filter((p) => p !== current);
    const p = pool[Math.floor(Math.random() * pool.length)];
    onSelect(p, categoryOfPrompt(p));
  };

  if (variant === 'panel') {
    return (
      <div>
        <p className="mb-3 text-[13px] text-ink-mute">Swap your prompt any time. Or ignore it completely.</p>
        <button className="btn-lav mb-3 w-full" onClick={surprise}><Dices size={18} /> Surprise me</button>
        <div className="space-y-2">
          {PROMPT_CATEGORIES.map((c, i) => {
            const open = c.id === activeId;
            const t = tint(i);
            const Icon = ICONS[c.id];
            return (
              <div key={c.id} className="overflow-hidden rounded-2xl border border-blush-100 bg-white/75">
                <button
                  className="flex min-h-[48px] w-full items-center gap-3 px-3 text-left text-[15px] font-semibold"
                  aria-expanded={open} onClick={() => setActiveId(open ? '' : c.id)}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: t.bg, color: t.fg }}><Icon size={16} /></span>
                  {c.name}
                </button>
                {open && (
                  <ul className="space-y-1.5 px-3 pb-3">
                    {c.prompts.map((p) => (
                      <li key={p}>
                        <button
                          className={`w-full rounded-xl px-3 py-2.5 text-left font-serif text-[15px] italic leading-snug transition hover:bg-lav-50 ${p === current ? 'bg-lav-100 text-[#4d3d78]' : 'text-ink-soft'}`}
                          onClick={() => onSelect(p, c.id)}
                        >{p}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-8">
      {onBack && (
        <button className="btn-ghost -ml-3" onClick={onBack}><ArrowLeft size={18} /> Back to journal</button>
      )}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h1 className="font-serif text-4xl leading-[1.1] text-ink sm:text-5xl">Choose a place to begin.</h1>
          <p className="mt-3 text-lg text-ink-soft">Pick a prompt that feels right. You can change it, ignore it, or write about something else entirely.</p>
        </div>
        <button className="btn-primary !min-h-[52px] px-7 text-base" onClick={surprise}>
          <Dices size={20} /> Surprise me
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        <nav aria-label="Prompt categories" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {PROMPT_CATEGORIES.map((c, i) => {
            const t = tint(i);
            const Icon = ICONS[c.id];
            const on = c.id === activeId;
            return (
              <button
                key={c.id} aria-pressed={on} onClick={() => setActiveId(c.id)}
                className="flex min-h-[64px] shrink-0 items-center gap-3 rounded-2xl border px-4 text-left transition lg:w-full"
                style={{ background: on ? t.bg : 'rgba(255,255,255,.7)', borderColor: on ? t.ring : '#F5CBCD90', color: on ? t.fg : '#3A3040' }}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: on ? '#ffffffa0' : t.bg, color: t.fg }}><Icon size={20} /></span>
                <span>
                  <span className="block font-serif text-lg leading-tight">{c.name}</span>
                  <span className="hidden text-sm opacity-80 lg:block">{c.blurb}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div key={active.id} className="animate-rise">
          <h2 className="font-serif text-2xl text-ink">{active.name}</h2>
          <ul className="mt-4 space-y-3">
            {active.prompts.map((p, i) => {
              const t = tint(activeIdx + i);
              return (
                <li key={p}>
                  <button
                    onClick={() => onSelect(p, active.id)}
                    className="group relative w-full rounded-[22px] border bg-cream-paper px-6 py-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-paper"
                    style={{ borderColor: t.ring, transform: `rotate(${(i - 1) * 0.35}deg)` }}
                  >
                    <span className="absolute -top-2 left-6 h-4 w-14 -rotate-3 rounded-sm opacity-80" style={{ background: t.bg }} aria-hidden />
                    <span className="block font-serif text-xl italic leading-snug text-ink sm:text-2xl">{p}</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: t.fg }}>
                      <PenLine size={15} /> Write about this
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {onWriteFreely && (
            <button className="btn-soft mt-6" onClick={onWriteFreely}>Skip prompts and write freely</button>
          )}
        </div>
      </div>
    </section>
  );
}

import type { MoodId } from '../types/journal';
import { MOODS, MOOD_ICONS, getMood } from '../data/moods';

interface Props {
  value: MoodId | null;
  onChange: (mood: MoodId | null) => void;
}

/** Optional mood picker. Pressing the selected mood again clears it. */
export function MoodSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="mb-3 text-[13px] text-ink-mute">Optional. Pick whatever feels closest.</p>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Mood">
        {MOODS.map((m) => {
          const Icon = MOOD_ICONS[m.id];
          const on = value === m.id;
          return (
            <button
              key={m.id} role="radio" aria-checked={on}
              onClick={() => onChange(on ? null : m.id)}
              className="flex min-h-[48px] items-center gap-2.5 rounded-2xl border px-3 text-left text-[15px] font-medium transition active:scale-[.97]"
              style={{
                background: on ? m.bg : 'rgba(255,255,255,.75)',
                color: on ? m.fg : '#5E5466',
                borderColor: on ? m.fg : '#F5CBCD80',
                boxShadow: on ? `0 0 0 2px ${m.bg}, 0 0 0 3.5px ${m.fg}` : undefined,
              }}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: m.bg, color: m.fg }}>
                <Icon size={17} />
              </span>
              {m.label}
            </button>
          );
        })}
      </div>
      {value && (
        <button className="btn-ghost mt-3 !min-h-[40px] text-sm" onClick={() => onChange(null)}>Clear mood</button>
      )}
    </div>
  );
}

export function MoodBadge({ mood, size = 'md' }: { mood: MoodId | null | undefined; size?: 'sm' | 'md' }) {
  const m = getMood(mood);
  if (!m) return null;
  const Icon = MOOD_ICONS[m.id];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      style={{ background: m.bg, color: m.fg }}
    >
      <Icon size={size === 'sm' ? 12 : 15} aria-hidden /> {m.label}
    </span>
  );
}

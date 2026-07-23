import { useState, useEffect } from 'react'
import * as api from '../lib/api.js'
import { THEMES } from '../lib/api.js'
import { format, parseISO } from 'date-fns'
import { MapPin, Sparkles, Heart } from 'lucide-react'

const MOOD_COLOR = m => {
  if (m == null) return '#888'
  if (m <= 3) return '#5DCAA5'
  if (m <= 5) return '#97C459'
  if (m <= 7) return '#EF9F27'
  return '#E24B4A'
}

const MOOD_LABEL = m =>
  m == null ? '' : m <= 3 ? 'calm & grounded' : m <= 5 ? 'mild tension' : m <= 7 ? 'anxious' : 'high distress'

const MOOD_EMOJI = m =>
  m == null ? '🌱' : m <= 3 ? '🌿' : m <= 5 ? '🌤' : m <= 7 ? '🌧' : '⛈'

function groupByMonth(entries) {
  const groups = {}
  entries.forEach(e => {
    const key = format(parseISO(e.date), 'MMMM yyyy')
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  })
  return groups
}

export default function Timeline() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getEntries()
      .then(data => setEntries(data.sort((a, b) => new Date(b.date) - new Date(a.date))))
      .finally(() => setLoading(false))
  }, [])

  const grouped = groupByMonth(entries)

  if (loading) return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full animate-breathe flex items-center justify-center"
        style={{ background: 'rgba(139,130,236,0.15)', border: '1px solid rgba(139,130,236,0.25)' }}>
        <Heart size={18} style={{ color: 'var(--color-primary)' }} />
      </div>
      <p className="text-sm" style={{ color: 'var(--color-text-faint)' }}>Tracing your journey…</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">

      {/* ── Hero Header ─────────────────────────────────── */}
      <div className="relative mb-10 overflow-hidden rounded-3xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(139,130,236,0.12) 0%, rgba(100,216,180,0.07) 100%)',
          border: '1px solid rgba(139,130,236,0.2)',
        }}>
        {/* ambient glow */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full blur-[60px] pointer-events-none"
          style={{ background: 'rgba(139,130,236,0.2)' }} />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139,130,236,0.2)' }}>
              <MapPin size={15} style={{ color: 'var(--color-primary)' }} />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'var(--color-primary)', opacity: 0.8 }}>Your Emotional Map</span>
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Every step is part of the story
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)', maxWidth: '420px' }}>
            This is your emotional journey laid out in time — the hard days, the calm ones, and everything in between. Each entry is proof you showed up.
          </p>

          {entries.length > 0 && (
            <div className="flex items-center gap-6 mt-5">
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{entries.length}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>moments captured</p>
              </div>
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <p className="text-2xl font-bold" style={{ color: '#5DCAA5' }}>
                  {entries.filter(e => e.resolved).length}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>resolved &amp; moved through</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Timeline Entries ─────────────────────────────── */}
      {Object.entries(grouped).map(([month, monthEntries]) => (
        <div key={month} className="mb-10">
          {/* Month header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2">
              <Sparkles size={12} style={{ color: 'var(--color-primary)', opacity: 0.7 }} />
              <h2 className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--color-primary)', opacity: 0.85 }}>{month}</h2>
            </div>
            <div className="flex-1 h-px" style={{ background: 'rgba(139,130,236,0.15)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
              {monthEntries.length} {monthEntries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {/* Cards */}
          <div className="relative pl-7">
            {/* Vertical line */}
            <div className="absolute left-2.5 top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(to bottom, rgba(139,130,236,0.3), rgba(100,216,180,0.1))' }} />

            <div className="flex flex-col gap-3">
              {monthEntries.map((e, idx) => {
                const moodScore = e.mood_score ?? e.mood
                const color = MOOD_COLOR(moodScore)
                const emoji = MOOD_EMOJI(moodScore)

                return (
                  <div key={e._id} className="relative fade-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                    {/* Timeline dot */}
                    <div className="absolute -left-5 top-4 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                      style={{
                        background: color,
                        border: '2px solid var(--color-bg)',
                        boxShadow: `0 0 12px ${color}60, 0 0 4px ${color}80`,
                      }} />

                    {/* Card */}
                    <div className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01]"
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-surface-border)',
                        backdropFilter: 'blur(12px)',
                      }}>

                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-2.5 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                            {format(parseISO(e.date), 'MMMM d, yyyy')}
                          </span>
                          {moodScore != null && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                              style={{
                                background: `${color}15`,
                                color,
                                border: `1px solid ${color}35`,
                              }}>
                              {emoji} {moodScore}/10 · {MOOD_LABEL(moodScore)}
                            </span>
                          )}
                          {e.resolved && (
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                background: 'rgba(93,202,165,0.1)',
                                color: '#5DCAA5',
                                border: '1px solid rgba(93,202,165,0.25)',
                              }}>
                              ✓ resolved
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Journal text */}
                      <p className="text-sm leading-relaxed mb-2.5"
                        style={{ color: 'rgba(var(--color-text-rgb),0.85)' }}>
                        {e.text.length > 180 ? e.text.slice(0, 180) + '…' : e.text}
                      </p>

                      {/* Themes */}
                      {e.themes?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {e.themes.map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                background: 'rgba(139,130,236,0.08)',
                                color: '#AFA9EC',
                                border: '1px solid rgba(139,130,236,0.18)',
                              }}>
                              {THEMES[t]?.label || t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* AI summary */}
                      {e.summary && (
                        <p className="text-xs italic mt-1" style={{ color: 'var(--color-text-faint)' }}>
                          "{e.summary}"
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}

      {/* ── Empty State ──────────────────────────────────── */}
      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full mb-6 flex items-center justify-center animate-breathe"
            style={{ background: 'rgba(139,130,236,0.1)', border: '1px solid rgba(139,130,236,0.2)' }}>
            <MapPin size={22} style={{ color: 'var(--color-primary)', opacity: 0.7 }} />
          </div>
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Your journey starts here
          </h3>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--color-text-faint)' }}>
            Every journal entry becomes a marker on your emotional map. Your first entry is the beginning of something meaningful.
          </p>
        </div>
      )}
    </div>
  )
}
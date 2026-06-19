import { useState, useEffect } from 'react'
import * as api from '../lib/api.js'
import { THEMES } from '../lib/api.js'
import { format, parseISO } from 'date-fns'

const MOOD_COLOR = m => {
  if (m == null) return '#888'
  if (m <= 3) return '#1D9E75'
  if (m <= 5) return '#97C459'
  if (m <= 7) return '#EF9F27'
  return '#E24B4A'
}
const MOOD_LABEL = m => m == null ? '' : m <= 3 ? 'calm' : m <= 5 ? 'mild stress' : m <= 7 ? 'anxious' : 'high distress'

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

  if (loading) return <div className="max-w-2xl mx-auto px-6 py-8"><p className="text-sm" style={{ color: 'rgba(232,230,240,0.4)' }}>Loading timeline…</p></div>

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold" style={{ color: '#e8e6f0' }}>Emotional Timeline</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(232,230,240,0.45)' }}>Your journey, month by month</p>
      </div>

      {Object.entries(grouped).map(([month, monthEntries]) => (
        <div key={month} className="mb-8">
          <h2 className="text-xs font-medium mb-4 tracking-widest uppercase" style={{ color: '#7F77DD' }}>{month}</h2>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px" style={{ background: 'rgba(127,119,221,0.2)' }} />
            <div className="flex flex-col gap-4">
              {monthEntries.map(e => {
                const moodScore = e.mood_score ?? e.mood
                const color = MOOD_COLOR(moodScore)
                return (
                  <div key={e._id} className="relative fade-up">
                    <div className="absolute -left-5 top-3 w-3 h-3 rounded-full border-2" style={{ background: color, borderColor: '#0f0f13', boxShadow: `0 0 8px ${color}60` }} />
                    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs" style={{ color: 'rgba(232,230,240,0.45)' }}>{format(parseISO(e.date), 'MMM d')}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
                          {moodScore ?? '—'}/10 · {MOOD_LABEL(moodScore)}
                        </span>
                        {e.resolved && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(29,158,117,0.1)', color: '#5DCAA5', border: '1px solid rgba(29,158,117,0.2)' }}>✓ resolved</span>}
                      </div>
                      <p className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(232,230,240,0.75)' }}>
                        {e.text.length > 160 ? e.text.slice(0, 160) + '…' : e.text}
                      </p>
                      {e.themes?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {e.themes.map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(127,119,221,0.08)', color: '#AFA9EC', border: '1px solid rgba(127,119,221,0.15)' }}>
                              {THEMES[t]?.label || t}
                            </span>
                          ))}
                        </div>
                      )}
                      {e.summary && (
                        <p className="text-xs italic" style={{ color: 'rgba(232,230,240,0.4)' }}>{e.summary}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'rgba(232,230,240,0.4)' }}>Your timeline will grow as you journal. Start with your first entry.</p>
        </div>
      )}
    </div>
  )
}
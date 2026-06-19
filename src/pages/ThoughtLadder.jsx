// pages/ThoughtLadder.jsx
//
// NOTE on integration: the Thought Ladder feature calls the same AI directly
// via a lightweight dedicated backend route (added below) rather than reusing
// /api/chat/message, since it needs structured JSON back, not a conversational reply.
// See backend/routes/journalRoutes.js — actually implemented as its own endpoint:
//   POST /api/journal/thought-ladder  (added in journalController.js / journalRoutes.js)

import { useState } from 'react'
import * as api from '../lib/api.js'
import { Loader, ChevronRight, AlertTriangle, HelpCircle, Lightbulb } from 'lucide-react'

const TYPE_STYLE = {
  assumption: { label: 'Assumption', color: '#EF9F27', bg: 'rgba(239,159,39,0.08)', border: 'rgba(239,159,39,0.2)' },
  prediction: { label: 'Prediction', color: '#D85A30', bg: 'rgba(216,90,48,0.08)', border: 'rgba(216,90,48,0.2)' },
}

export default function ThoughtLadder() {
  const [situation, setSituation] = useState('')
  const [ladder, setLadder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function analyze() {
    if (!situation.trim()) return
    setLoading(true); setError(''); setLadder(null)
    try {
      const result = await api.buildThoughtLadder(situation.trim())
      setLadder(result)
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const EXAMPLES = [
    "I left my internship and now my career is over",
    "I failed this exam and I'll never get placed",
    "My friend hasn't replied in days — they hate me",
    "I made a mistake at work, I'll get fired",
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: '#e8e6f0' }}>Thought Ladder</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(232,230,240,0.45)' }}>Break down catastrophic thinking into its parts</p>
      </div>

      <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <label className="text-xs font-medium block mb-2" style={{ color: 'rgba(232,230,240,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Describe your situation or worry
        </label>
        <textarea
          value={situation}
          onChange={e => setSituation(e.target.value)}
          placeholder="e.g. I ruined my future by leaving my internship…"
          rows={3}
          className="w-full text-sm outline-none resize-none leading-relaxed mb-4"
          style={{ background: 'transparent', color: '#e8e6f0', border: 'none' }}
        />
        <div className="flex flex-wrap gap-2 mb-4">
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => setSituation(ex)} className="text-xs px-3 py-1.5 rounded-full border transition-opacity hover:opacity-80" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(232,230,240,0.45)', background: 'transparent' }}>
              {ex.slice(0, 35)}…
            </button>
          ))}
        </div>
        <button onClick={analyze} disabled={!situation.trim() || loading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-30" style={{ background: '#7F77DD', color: 'white' }}>
          {loading ? <><Loader size={13} className="animate-spin" /> Analyzing…</> : 'Break it down →'}
        </button>
        {error && <p className="text-xs mt-3" style={{ color: '#f09595' }}>{error}</p>}
      </div>

      {ladder && (
        <div className="fade-up">
          <div className="rounded-xl p-4 mb-2 flex items-start gap-3" style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)' }}>
            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'rgba(29,158,117,0.2)' }}>
              <CheckIcon />
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#5DCAA5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fact</p>
              <p className="text-sm" style={{ color: 'rgba(232,230,240,0.8)' }}>{ladder.fact}</p>
            </div>
          </div>

          <div className="flex justify-center mb-2"><ChevronRight size={14} style={{ color: 'rgba(232,230,240,0.2)', transform: 'rotate(90deg)' }} /></div>

          {ladder.predictions?.map((p, i) => {
            const style = TYPE_STYLE[p.type] || TYPE_STYLE.prediction
            return (
              <div key={i}>
                <div className="rounded-xl p-4 mb-2 flex items-start gap-3" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: `${style.color}20` }}>
                    <HelpCircle size={12} color={style.color} />
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: style.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{style.label}</p>
                    <p className="text-sm" style={{ color: 'rgba(232,230,240,0.8)' }}>{p.text}</p>
                  </div>
                </div>
                {i < ladder.predictions.length - 1 && <div className="flex justify-center mb-2"><ChevronRight size={14} style={{ color: 'rgba(232,230,240,0.2)', transform: 'rotate(90deg)' }} /></div>}
              </div>
            )
          })}

          <div className="flex justify-center mb-2"><ChevronRight size={14} style={{ color: 'rgba(232,230,240,0.2)', transform: 'rotate(90deg)' }} /></div>

          <div className="rounded-xl p-4 mb-5 flex items-start gap-3" style={{ background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)' }}>
            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'rgba(226,75,74,0.15)' }}>
              <AlertTriangle size={12} color="#f09595" />
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#f09595', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Catastrophic conclusion</p>
              <p className="text-sm" style={{ color: 'rgba(232,230,240,0.8)' }}>{ladder.catastrophe}</p>
            </div>
          </div>

          <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(127,119,221,0.08)', border: '1px solid rgba(127,119,221,0.2)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb size={13} color="#AFA9EC" />
              <p className="text-xs font-medium" style={{ color: '#AFA9EC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>A more realistic view</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,230,240,0.75)' }}>{ladder.reframe}</p>
          </div>

          {ladder.question && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'rgba(232,230,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reflect on this</p>
              <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(232,230,240,0.6)' }}>"{ladder.question}"</p>
            </div>
          )}

          <button onClick={() => { setLadder(null); setSituation('') }} className="mt-4 text-xs px-4 py-2 rounded-lg border transition-opacity hover:opacity-70" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(232,230,240,0.4)' }}>
            Try another situation
          </button>
        </div>
      )}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
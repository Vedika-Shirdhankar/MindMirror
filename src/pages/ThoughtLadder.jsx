// pages/ThoughtLadder.jsx
//
// NOTE on integration: the Thought Ladder feature calls the same AI directly
// via a lightweight dedicated backend route (added below) rather than reusing
// /api/chat/message, since it needs structured JSON back, not a conversational reply.
// See backend/routes/journalRoutes.js — actually implemented as its own endpoint:
//   POST /api/journal/thought-ladder  (added in journalController.js / journalRoutes.js)

import { useState } from 'react'
import * as api from '../lib/api.js'
import { Loader, ChevronDown, AlertTriangle, HelpCircle, Lightbulb, CheckCircle2 } from 'lucide-react'

const TYPE_STYLE = {
  fact: { label: 'Fact', color: '#5fb89a', bg: 'rgba(135, 194, 179, 0.28)', border: 'rgba(95, 184, 154, 0.2)' },
  assumption: { label: 'Assumption', color: '#e7a356', bg: 'rgba(231, 163, 86, 0.12)', border: 'rgba(231, 163, 86, 0.16)' },
  prediction: { label: 'Prediction', color: '#d77b5e', bg: 'rgba(215, 123, 94, 0.12)', border: 'rgba(215, 123, 94, 0.16)' },
  catastrophe: { label: 'Catastrophic conclusion', color: '#e58789', bg: 'rgba(229, 135, 137, 0.12)', border: 'rgba(229, 135, 137, 0.16)' },
  reframe: { label: 'A more realistic view', color: '#9a9ad8', bg: 'rgba(154, 154, 216, 0.12)', border: 'rgba(154, 154, 216, 0.2)' },
}

const DEMO_LADDER = {
  fact: 'I went through the final round of interviews and did not receive an offer.',
  predictions: [
    { type: 'assumption', text: 'The interview panel probably saw me as less capable than I really am.' },
    { type: 'prediction', text: 'If I do not get this role, my career path is probably over before it even starts.' },
    { type: 'prediction', text: 'This means I am likely to fail in every future interview and never get placed.' },
  ],
  catastrophe: 'If this happens, my entire future is ruined and I will be stuck with no career options.',
  reframe: "It's common to feel anxious and self-critical after an interview, but your perception of your performance might not align with the interviewer's, and the actual outcome is still unknown.",
}

export default function ThoughtLadder() {
  const [situation, setSituation] = useState('')
  const [ladder, setLadder] = useState(DEMO_LADDER)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function analyze() {
    if (!situation.trim()) return
    setLoading(true)
    setError('')
    setLadder(null)

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
    'I left my internship and now my career is over',
    "I failed this exam and I'll never get placed",
    "My friend hasn't replied in days — they hate me",
    "I made a mistake at work, I'll get fired",
  ]

  return (
    <div className="min-h-screen" style={{ background: '#f1efe9' }}>
      <div className="mx-auto max-w-[760px] px-4 py-8 sm:px-6 lg:px-8">
        {!ladder ? (
          <div className="rounded-2xl border p-5 shadow-sm" style={{ background: 'rgba(255,255,255,0.38)', borderColor: 'rgba(132, 125, 114, 0.15)' }}>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: '#6f756d' }}>
              Describe your situation or worry
            </label>
            <textarea
              value={situation}
              onChange={e => setSituation(e.target.value)}
              placeholder="e.g. I ruined my future by leaving my internship…"
              rows={3}
              className="mb-4 w-full resize-none border-none bg-transparent text-sm leading-relaxed text-[#2d2a2a] outline-none placeholder:text-[#7b7b7b]"
            />
            <div className="mb-4 flex flex-wrap gap-2">
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => setSituation(ex)}
                  className="rounded-full border px-3 py-1.5 text-[11px] transition-opacity hover:opacity-80"
                  style={{ borderColor: 'rgba(84, 80, 72, 0.18)', color: '#5b615c', background: 'rgba(255,255,255,0.25)' }}
                >
                  {ex.slice(0, 35)}…
                </button>
              ))}
            </div>
            <button
              onClick={analyze}
              disabled={!situation.trim() || loading}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: '#7f7ad8' }}
            >
              {loading ? <><Loader size={13} className="animate-spin" /> Analyzing…</> : 'Break it down →'}
            </button>
            {error && <p className="mt-3 text-xs" style={{ color: '#d77b5e' }}>{error}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className="flex items-start gap-3 rounded-[18px] border p-4"
              style={{ background: TYPE_STYLE.fact.bg, borderColor: TYPE_STYLE.fact.border }}
            >
              <div
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'rgba(95, 184, 154, 0.18)' }}
              >
                <CheckCircle2 size={12} color={TYPE_STYLE.fact.color} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: TYPE_STYLE.fact.color }}>
                  {TYPE_STYLE.fact.label}
                </p>
                <p className="text-[15px] leading-relaxed" style={{ color: '#4b4a4a' }}>{ladder.fact}</p>
              </div>
            </div>

            <div className="flex justify-center py-0.5 text-[#7d7a74]">
              <ChevronDown size={16} />
            </div>

            {ladder.predictions?.map((prediction, index) => {
              const style = TYPE_STYLE[prediction.type] || TYPE_STYLE.prediction
              return (
                <div key={`${prediction.type}-${index}`}>
                  <div
                    className="flex items-start gap-3 rounded-[18px] border p-4"
                    style={{ background: style.bg, borderColor: style.border }}
                  >
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ background: `${style.color}20` }}
                    >
                      <HelpCircle size={12} color={style.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: style.color }}>
                        {style.label}
                      </p>
                      <p className="text-[15px] leading-relaxed" style={{ color: '#4b4a4a' }}>{prediction.text}</p>
                    </div>
                  </div>
                  {index < ladder.predictions.length - 1 && (
                    <div className="flex justify-center py-0.5 text-[#7d7a74]">
                      <ChevronDown size={16} />
                    </div>
                  )}
                </div>
              )
            })}

            <div className="flex justify-center py-0.5 text-[#7d7a74]">
              <ChevronDown size={16} />
            </div>

            <div
              className="flex items-start gap-3 rounded-[18px] border p-4"
              style={{ background: TYPE_STYLE.catastrophe.bg, borderColor: TYPE_STYLE.catastrophe.border }}
            >
              <div
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'rgba(229, 135, 137, 0.18)' }}
              >
                <AlertTriangle size={12} color={TYPE_STYLE.catastrophe.color} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: TYPE_STYLE.catastrophe.color }}>
                  {TYPE_STYLE.catastrophe.label}
                </p>
                <p className="text-[15px] leading-relaxed" style={{ color: '#4b4a4a' }}>{ladder.catastrophe}</p>
              </div>
            </div>

            <div
              className="rounded-[18px] border p-4"
              style={{ background: TYPE_STYLE.reframe.bg, borderColor: TYPE_STYLE.reframe.border }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb size={14} color={TYPE_STYLE.reframe.color} />
                <p className="text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: TYPE_STYLE.reframe.color }}>
                  {TYPE_STYLE.reframe.label}
                </p>
              </div>
              <p className="text-[15px] leading-relaxed" style={{ color: '#4b4a4a' }}>{ladder.reframe}</p>
            </div>

            {ladder.question && (
              <div className="rounded-[18px] border p-4" style={{ background: 'rgba(255,255,255,0.34)', borderColor: 'rgba(123, 117, 110, 0.12)' }}>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: '#7a7b7c' }}>
                  Reflect on this
                </p>
                <p className="text-[15px] italic leading-relaxed" style={{ color: '#4b4a4a' }}>"{ladder.question}"</p>
              </div>
            )}

            <button
              onClick={() => {
                setLadder(null)
                setSituation('')
                setError('')
              }}
              className="mt-2 rounded-lg border px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition-opacity hover:opacity-70"
              style={{ borderColor: 'rgba(94, 90, 85, 0.18)', color: '#6b6a68', background: 'rgba(255,255,255,0.2)' }}
            >
              Try another situation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle, Sparkles, AlertTriangle, Loader, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import * as api from '../lib/api.js'
import { THEMES, TRIGGERS, COPING_LABELS, RISK_COLORS } from '../lib/api.js'
import { format } from 'date-fns'

const MOOD_COLOR = m => {
  if (m == null) return '#888'
  if (m <= 3) return '#1D9E75'
  if (m <= 5) return '#97C459'
  if (m <= 7) return '#EF9F27'
  return '#E24B4A'
}

const TREND_ICON = { improving: TrendingDown, worsening: TrendingUp, stable: Minus, unknown: Minus }
const TREND_LABEL = { improving: 'Improving', worsening: 'Worsening', stable: 'Stable', unknown: 'Not enough data' }
const TREND_COLOR = { improving: '#5DCAA5', worsening: '#E24B4A', stable: '#AFA9EC', unknown: 'rgba(232,230,240,0.4)' }

function CrisisSupportBanner({ support }) {
  if (!support) return null
  return (
    <div className="rounded-xl p-4 mb-4 fade-up" style={{ background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)' }}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={14} color="#f09595" />
        <p className="text-sm font-medium" style={{ color: '#f09595' }}>{support.message}</p>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {support.resources.map(r => (
          <div key={r.name} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(232,230,240,0.8)' }}>
            <strong>{r.name}:</strong> {r.contact} <span className="opacity-50">({r.hours})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalysisCard({ entry }) {
  if (!entry.summary && !entry.themes?.length) return null
  const TrendIcon = TREND_ICON[entry.trend] || Minus

  return (
    <div className="mt-3 rounded-lg p-3" style={{ background: 'rgba(127,119,221,0.06)', border: '1px solid rgba(127,119,221,0.15)' }}>
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={11} color="#7F77DD" />
        <span className="text-xs font-medium" style={{ color: '#7F77DD', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '10px' }}>AI reflection</span>
      </div>
      {entry.summary && <p className="text-xs mb-2 leading-relaxed" style={{ color: 'rgba(232,230,240,0.7)' }}>{entry.summary}</p>}

      <div className="flex flex-wrap gap-1.5 mb-2">
        {entry.themes?.map(t => (
          <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(127,119,221,0.12)', color: '#AFA9EC' }}>{THEMES[t]?.label || t}</span>
        ))}
        {entry.triggers?.map(t => (
          <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,159,39,0.1)', color: '#FAC775' }}>⚡ {TRIGGERS[t] || t}</span>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(232,230,240,0.5)' }}>
        <span className="flex items-center gap-1" style={{ color: TREND_COLOR[entry.trend] }}>
          <TrendIcon size={11} /> {TREND_LABEL[entry.trend] || 'Unknown'}
        </span>
        {entry.risk_level && entry.risk_level !== 'none' && (
          <span style={{ color: RISK_COLORS[entry.risk_level] }}>Risk: {entry.risk_level}</span>
        )}
      </div>

      {entry.coping_suggestions?.length > 0 && (
        <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs mb-1" style={{ color: 'rgba(232,230,240,0.4)' }}>Suggestions:</p>
          <ul className="text-xs space-y-0.5" style={{ color: 'rgba(232,230,240,0.6)' }}>
            {entry.coping_suggestions.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
      )}

      {entry.related_memories?.length > 0 && (
        <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs mb-1" style={{ color: 'rgba(232,230,240,0.4)' }}>Similar past moments:</p>
          {entry.related_memories.map((m, i) => (
            <p key={i} className="text-xs" style={{ color: 'rgba(232,230,240,0.55)' }}>
              • {m.reason} {m.entryId?.date && <span className="opacity-50">({format(new Date(m.entryId.date), 'MMM d')})</span>}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [writing, setWriting] = useState(false)
  const [text, setText] = useState('')
  const [coping, setCoping] = useState([])
  const [saving, setSaving] = useState(false)
  const [lastSupport, setLastSupport] = useState(null)
  const [lastAiError, setLastAiError] = useState('')
  const [error, setError] = useState('')
  const [resolvingId, setResolvingId] = useState(null)
  const [resolvedNote, setResolvedNote] = useState('')
  const [resolving, setResolving] = useState(false)

  useEffect(() => { loadEntries() }, [])

  async function loadEntries() {
    setLoadingList(true)
    try {
      const data = await api.getEntries()
      setEntries(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingList(false)
    }
  }

  function toggleCoping(c) {
    setCoping(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  async function handleSave() {
    if (!text.trim() || saving) return
    setSaving(true)
    setError('')
    setLastSupport(null)
    setLastAiError('')
    try {
      const { entry, aiError, support } = await api.addEntry({ text: text.trim(), copingUsed: coping })
      setEntries(prev => [entry, ...prev])
      if (aiError) setLastAiError(aiError)
      if (support) setLastSupport(support)
      setText('')
      setCoping([])
      setWriting(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteEntry(id)
      setEntries(prev => prev.filter(e => e._id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleResolveSubmit(id) {
    if (resolving) return
    setResolving(true)
    setError('')
    try {
      const updatedEntry = await api.markEntryResolved(id, resolvedNote.trim())
      setEntries(prev => prev.map(e => e._id === id ? updatedEntry : e))
      setResolvingId(null)
      setResolvedNote('')
    } catch (e) {
      setError(e.message)
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#e8e6f0' }}>Journal</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(232,230,240,0.45)' }}>{entries.length} entries</p>
        </div>
        <button onClick={() => setWriting(!writing)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80" style={{ background: '#7F77DD', color: 'white' }}>
          <Plus size={14} /> New entry
        </button>
      </div>

      {error && <p className="text-xs mb-4" style={{ color: '#f09595' }}>{error}</p>}
      <CrisisSupportBanner support={lastSupport} />
      {lastAiError && (
        <p className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,159,39,0.08)', color: '#FAC775' }}>{lastAiError}</p>
      )}

      {writing && (
        <div className="rounded-2xl p-5 mb-6 fade-up" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What's on your mind today? Write freely — AI will detect themes, triggers, and mood automatically."
            rows={5}
            className="w-full text-sm outline-none resize-none leading-relaxed mb-4"
            style={{ background: 'transparent', color: '#e8e6f0', border: 'none' }}
          />

          <div className="mb-5">
            <p className="text-xs font-medium mb-2" style={{ color: 'rgba(232,230,240,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What helped? (optional)</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(COPING_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => toggleCoping(key)}
                  className="text-xs px-3 py-1.5 rounded-full border transition-all"
                  style={{
                    borderColor: coping.includes(key) ? '#1D9E75' : 'rgba(255,255,255,0.12)',
                    background: coping.includes(key) ? 'rgba(29,158,117,0.12)' : 'transparent',
                    color: coping.includes(key) ? '#5DCAA5' : 'rgba(232,230,240,0.5)',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setWriting(false)} className="px-4 py-2 rounded-xl text-sm border transition-opacity hover:opacity-70" style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(232,230,240,0.5)' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={!text.trim() || saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: '#7F77DD', color: 'white' }}>
              {saving ? <><Loader size={13} className="animate-spin" /> Analyzing & saving…</> : 'Save entry'}
            </button>
          </div>
        </div>
      )}

      {loadingList ? (
        <p className="text-sm" style={{ color: 'rgba(232,230,240,0.4)' }}>Loading entries…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map(e => (
            <div key={e._id} className="rounded-xl p-4 group transition-all"
              style={{
                background: e.resolved ? 'rgba(29, 158, 117, 0.02)' : 'rgba(255,255,255,0.04)',
                border: e.resolved ? '1px solid rgba(29, 158, 117, 0.15)' : '1px solid rgba(255,255,255,0.07)'
              }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs" style={{ color: 'rgba(232,230,240,0.45)' }}>{format(new Date(e.date), 'MMM d, yyyy')}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${MOOD_COLOR(e.mood_score)}20`, color: MOOD_COLOR(e.mood_score), border: `1px solid ${MOOD_COLOR(e.mood_score)}40` }}>
                      {e.mood_score ?? e.mood ?? '—'}/10
                    </span>
                    {e.resolved && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(29,158,117,0.1)', color: '#5DCAA5' }}>resolved</span>}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,230,240,0.8)' }}>{e.text}</p>
                  
                  {e.resolved && e.resolvedNote && (
                    <div className="mt-2 text-xs p-2.5 rounded-lg" style={{ background: 'rgba(29, 158, 117, 0.05)', border: '1px dashed rgba(29, 158, 117, 0.2)', color: 'rgba(232, 230, 240, 0.65)' }}>
                      <span className="font-semibold text-emerald-400" style={{ color: '#5DCAA5', marginRight: '4px' }}>Resolution Note:</span>
                      {e.resolvedNote}
                    </div>
                  )}

                  {resolvingId === e._id && (
                    <div className="mt-3 p-3 rounded-lg fade-up animate-in fade-in zoom-in duration-200" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(29,158,117,0.3)' }}>
                      <p className="text-xs mb-2 font-medium" style={{ color: '#5DCAA5' }}>Mark this entry as resolved?</p>
                      <textarea
                        value={resolvedNote}
                        onChange={ev => setResolvedNote(ev.target.value)}
                        placeholder="Optional note: what helped resolve this, or what did you learn?"
                        rows={2}
                        className="w-full text-xs outline-none resize-none leading-relaxed p-2 rounded-lg mb-2"
                        style={{ background: 'rgba(0,0,0,0.2)', color: '#e8e6f0', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setResolvingId(null); setResolvedNote(''); }} className="px-3 py-1 rounded-lg text-xs border" style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(232,230,240,0.5)' }}>
                          Cancel
                        </button>
                        <button onClick={() => handleResolveSubmit(e._id)} disabled={resolving} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: '#1D9E75', color: 'white' }}>
                          {resolving ? 'Resolving...' : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  )}

                  <AnalysisCard entry={e} />
                </div>
                <div className="flex flex-col gap-1 items-center">
                  {!e.resolved && (
                    <button onClick={() => { setResolvingId(e._id); setResolvedNote(''); }} className="opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity p-1.5 rounded-lg" style={{ color: '#5DCAA5' }} title="Mark as resolved">
                      <CheckCircle size={13} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(e._id)} className="opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity p-1.5 rounded-lg" style={{ color: '#E24B4A' }} title="Delete entry">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-center py-12" style={{ color: 'rgba(232,230,240,0.35)' }}>No entries yet. Write your first one above.</p>
          )}
        </div>
      )}
    </div>
  )
}
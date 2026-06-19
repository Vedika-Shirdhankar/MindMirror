import { useState, useEffect } from 'react'
import * as api from '../lib/api.js'
import { THEMES } from '../lib/api.js'
import { format } from 'date-fns'
import { Plus, Trash2, Mail, Heart, Loader } from 'lucide-react'

export default function FutureLetters() {
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [writing, setWriting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [triggerThemes, setTriggerThemes] = useState([])
  const [reading, setReading] = useState(null)

  useEffect(() => {
    loadLetters()
  }, [])

  async function loadLetters() {
    setLoading(true)
    setError('')
    try {
      const data = await api.getFutureLetters()
      setLetters(data)
    } catch (e) {
      setError(e.message || 'Failed to load letters.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!title.trim() || !body.trim() || saving) return
    setSaving(true)
    setError('')
    try {
      await api.createFutureLetter({ title: title.trim(), body: body.trim(), triggerThemes })
      setTitle(''); setBody(''); setTriggerThemes([])
      setWriting(false)
      await loadLetters()
    } catch (e) {
      setError(e.message || 'Failed to save letter.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setError('')
    try {
      await api.deleteFutureLetter(id)
      if (reading?.id === id || reading?._id === id) setReading(null)
      await loadLetters()
    } catch (e) {
      setError(e.message || 'Failed to delete letter.')
    }
  }

  function toggleTheme(t) {
    setTriggerThemes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  if (reading) {
    const letterDate = reading.date ? new Date(reading.date) : new Date()
    return (
      <div className="max-w-xl mx-auto px-6 py-8">
        <button onClick={() => setReading(null)} className="text-xs mb-6 flex items-center gap-1 opacity-50 hover:opacity-80 transition-opacity" style={{ color: '#e8e6f0' }}>
          ← Back to letters
        </button>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(127,119,221,0.06)', border: '1px solid rgba(127,119,221,0.15)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Heart size={13} color="#AFA9EC" />
            <span className="text-xs" style={{ color: 'rgba(232,230,240,0.4)' }}>
              Written {format(letterDate, 'MMMM d, yyyy')}
            </span>
          </div>
          <h2 className="text-lg font-medium mb-5" style={{ color: '#e8e6f0' }}>{reading.title}</h2>
          <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(232,230,240,0.75)' }}>
            {reading.body}
          </div>
          {reading.triggerThemes?.length > 0 && (
            <div className="mt-5 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <p className="text-xs mb-2" style={{ color: 'rgba(232,230,240,0.35)' }}>Surfaces when you feel:</p>
              <div className="flex flex-wrap gap-1.5">
                {reading.triggerThemes.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(127,119,221,0.1)', color: '#AFA9EC', border: '1px solid rgba(127,119,221,0.15)' }}>
                    {THEMES[t]?.label || t}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => handleDelete(reading._id || reading.id)} className="mt-4 text-xs flex items-center gap-1.5 opacity-30 hover:opacity-70 transition-opacity" style={{ color: '#E24B4A' }}>
            <Trash2 size={11} /> Delete letter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#e8e6f0' }}>Future Letters</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(232,230,240,0.45)' }}>Messages from your calmer self</p>
        </div>
        <button onClick={() => setWriting(!writing)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80" style={{ background: '#7F77DD', color: 'white' }}>
          <Plus size={14} /> Write letter
        </button>
      </div>

      {error && <p className="text-xs mb-4" style={{ color: '#f09595' }}>{error}</p>}

      {/* Writing form */}
      {writing && (
        <div className="rounded-2xl p-5 mb-6 fade-up" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(232,230,240,0.4)' }}>
            Write a message to yourself for the next time you're struggling. The AI companion may surface this letter when similar emotions appear.
          </p>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Letter title (e.g. To future me during hard times)"
            className="w-full px-0 py-2 text-sm outline-none mb-3 border-b"
            style={{ background: 'transparent', color: '#e8e6f0', borderColor: 'rgba(255,255,255,0.1)' }}
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Dear future me,&#10;&#10;If you're reading this while feeling overwhelmed, remember that…"
            rows={7}
            className="w-full text-sm outline-none resize-none leading-relaxed mb-4"
            style={{ background: 'transparent', color: '#e8e6f0', border: 'none' }}
          />

          <div className="mb-5">
            <p className="text-xs font-medium mb-2" style={{ color: 'rgba(232,230,240,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Surface this letter when I feel…</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(THEMES).map(([key, { label }]) => (
                <button key={key} onClick={() => toggleTheme(key)}
                  className="text-xs px-3 py-1.5 rounded-full border transition-all"
                  style={{
                    borderColor: triggerThemes.includes(key) ? '#7F77DD' : 'rgba(255,255,255,0.1)',
                    background: triggerThemes.includes(key) ? 'rgba(127,119,221,0.12)' : 'transparent',
                    color: triggerThemes.includes(key) ? '#AFA9EC' : 'rgba(232,230,240,0.4)',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setWriting(false)} className="px-4 py-2 rounded-xl text-sm border transition-opacity hover:opacity-70" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(232,230,240,0.4)' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={!title.trim() || !body.trim() || saving} className="px-5 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-30 flex items-center gap-1.5" style={{ background: '#7F77DD', color: 'white' }}>
              {saving && <Loader size={12} className="animate-spin" />}
              Save letter
            </button>
          </div>
        </div>
      )}

      {/* Letters list */}
      {loading ? (
        <p className="text-sm" style={{ color: 'rgba(232,230,240,0.4)' }}>Loading letters…</p>
      ) : (
        <div className="grid gap-3">
          {letters.map(l => {
            const letterDate = l.date ? new Date(l.date) : new Date()
            return (
              <div
                key={l._id || l.id}
                onClick={() => setReading(l)}
                className="rounded-xl p-4 cursor-pointer transition-all hover:border-opacity-50 group"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'rgba(127,119,221,0.12)' }}>
                      <Mail size={13} color="#AFA9EC" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium mb-1 truncate" style={{ color: '#e8e6f0' }}>{l.title}</p>
                      <p className="text-xs mb-2 leading-relaxed" style={{ color: 'rgba(232,230,240,0.45)' }}>
                        {l.body.slice(0, 100)}…
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(232,230,240,0.3)' }}>{format(letterDate, 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDelete(l._id || l.id) }} className="opacity-0 group-hover:opacity-30 hover:!opacity-70 transition-opacity p-1.5 ml-2" style={{ color: '#E24B4A' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && letters.length === 0 && (
        <div className="text-center py-16">
          <Heart size={24} color="rgba(232,230,240,0.15)" className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'rgba(232,230,240,0.35)' }}>Write your first letter on a good day. Future you will thank you.</p>
        </div>
      )}
    </div>
  )
}

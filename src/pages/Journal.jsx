import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, CheckCircle, Sparkles, AlertTriangle, Loader, TrendingUp, TrendingDown, Minus, Play, Search, X, Pin, PinOff, Filter } from 'lucide-react'
import * as api from '../lib/api.js'
import { THEMES, TRIGGERS, COPING_LABELS, RISK_COLORS, EMOTION_META, DISTORTION_LABELS } from '../lib/api.js'
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
    <div className="rounded-standard p-4 mb-4 fade-up bg-red-500/10 border border-red-500/30">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={14} className="text-red-400" />
        <p className="text-sm font-medium text-red-400">{support.message}</p>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {support.resources.map(r => (
          <div key={r.name} className="text-xs px-3 py-1.5 rounded-standard bg-surface text-text/80">
            <strong>{r.name}:</strong> {r.contact} <span className="opacity-50">({r.hours})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalysisCard({ entry, onPlayVideo }) {
  const { t } = useTranslation()
  if (!entry.summary && !entry.themes?.length) return null
  const TrendIcon = TREND_ICON[entry.trend] || Minus

  return (
    <div className="mt-3 rounded-standard p-3 bg-primary/5 border border-primary/10">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={11} className="text-primary" />
        <span className="text-xs font-medium text-primary uppercase tracking-wider text-[10px]">{t('journal.aiReflection')}</span>
      </div>
      {entry.summary && <p className="text-xs mb-2 leading-relaxed text-text/70">{entry.summary}</p>}

      {entry.emotions?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {entry.emotions.map(em => (
            <span key={em.emotion} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text/70 flex items-center gap-1">
              {EMOTION_META[em.emotion]?.emoji} {EMOTION_META[em.emotion]?.label || em.emotion}
              <span className="flex gap-0.5 ml-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`w-1 h-1 rounded-full ${i < em.intensity ? 'bg-primary' : 'bg-white/10'}`} />
                ))}
              </span>
            </span>
          ))}
        </div>
      )}

      {(entry.stress_level || entry.anxiety_level) && (
        <div className="flex flex-wrap gap-4 mb-2">
          {entry.stress_level != null && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-text/40 w-10">Stress</span>
              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-orange-400" style={{ width: `${entry.stress_level * 10}%` }} />
              </div>
            </div>
          )}
          {entry.anxiety_level != null && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-text/40 w-10">Anxiety</span>
              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${entry.anxiety_level * 10}%` }} />
              </div>
            </div>
          )}
          {entry.burnout_signal && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Signs of running on empty</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-2">
        {entry.themes?.map(t => (
          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{THEMES[t]?.label || t}</span>
        ))}
        {entry.triggers?.map(t => (
          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">⚡ {TRIGGERS[t] || t}</span>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs text-text/50">
        <span className="flex items-center gap-1" style={{ color: TREND_COLOR[entry.trend] }}>
          <TrendIcon size={11} /> {TREND_LABEL[entry.trend] || 'Unknown'}
        </span>
        {entry.risk_level && entry.risk_level !== 'none' && (
          <span style={{ color: RISK_COLORS[entry.risk_level] }}>Risk: {entry.risk_level}</span>
        )}
      </div>

      {entry.coping_suggestions?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <p className="text-xs mb-1 text-text/40">Suggestions:</p>
          <ul className="text-xs space-y-0.5 text-text/60">
            {entry.coping_suggestions.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
      )}

      {entry.distortions?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <p className="text-xs mb-1 text-text/40">Thinking patterns worth noticing — no judgment, just awareness:</p>
          <div className="flex flex-wrap gap-1.5">
            {entry.distortions.map(d => (
              <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text/60">{DISTORTION_LABELS[d] || d}</span>
            ))}
          </div>
        </div>
      )}

      {entry.growth_suggestion && (
        <div className="mt-2 pt-2 border-t border-white/5 flex items-start gap-1.5">
          <span className="text-xs">🌱</span>
          <p className="text-xs text-text/60 leading-relaxed">{entry.growth_suggestion}</p>
        </div>
      )}

      {entry.affirmation && (
        <div className="mt-3 p-2.5 rounded-standard bg-accent/5 border border-accent/10">
          <p className="text-xs text-accent italic leading-relaxed">"{entry.affirmation}"</p>
        </div>
      )}

      {entry.related_memories?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <p className="text-xs mb-1 text-text/40">Similar past moments:</p>
          {entry.related_memories.map((m, i) => (
            <p key={i} className="text-xs text-text/60">
              • {m.reason} {m.entryId?.date && <span className="opacity-50">({format(new Date(m.entryId.date), 'MMM d')})</span>}
            </p>
          ))}
        </div>
      )}

      {entry.recommendedVideos?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs font-semibold mb-2.5 flex items-center gap-1.5 text-primary">
            <span>🎥</span> Your Past Self Has Something To Say
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entry.recommendedVideos.map(video => (
              <div key={video._id} className="rounded-standard overflow-hidden border border-white/5 bg-black/20 hover:border-white/10 transition-all flex flex-col group relative">
                <div className="relative aspect-video bg-black/40 cursor-pointer" onClick={() => onPlayVideo(video)}>
                  <video src={video.videoUrl} className="w-full h-full object-cover" preload="metadata" />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/55 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play size={14} className="ml-0.5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h4 className="text-xs font-medium text-text/90 line-clamp-1 group-hover:text-primary transition-colors">{video.title}</h4>
                  <p className="text-[10px] text-text/40 mt-1">{format(new Date(video.createdAt), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const DRAFT_KEY = 'mm_journal_draft'

export default function Journal() {
  const { t } = useTranslation()
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
  const [playingVideo, setPlayingVideo] = useState(null)
  const [pinningId, setPinningId] = useState(null)

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  // Filter
  const [themeFilter, setThemeFilter] = useState('')
  const [moodFilter, setMoodFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Bhashini voice input
  const { transcribeAudio, isAvailable: bhashiniAvailable } = useBhashini()
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  async function startVoiceInput() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []
      recorder.ondataavailable = e => audioChunksRef.current.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const transcript = await transcribeAudio(blob)
        if (transcript) setText(prev => prev ? `${prev} ${transcript}` : transcript)
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch {
      alert('Could not access microphone.')
    }
  }

  function stopVoiceInput() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  useEffect(() => { loadEntries() }, [])

  // Restore an autosaved draft on load, and open the composer if one exists.
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft?.trim()) {
      setText(draft)
      setWriting(true)
    }
  }, [])

  // Autosave the draft as the user types (debounced by React's own batching).
  useEffect(() => {
    if (!writing) return
    if (text) localStorage.setItem(DRAFT_KEY, text)
    else localStorage.removeItem(DRAFT_KEY)
  }, [text, writing])

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
      const { entry, recommendedVideos, aiError, support } = await api.addEntry({ text: text.trim(), copingUsed: coping })
      const entryWithRecs = { ...entry, recommendedVideos };
      setEntries(prev => [entryWithRecs, ...prev])
      if (aiError) setLastAiError(aiError)
      if (support) setLastSupport(support)
      setText('')
      setCoping([])
      setWriting(false)
      localStorage.removeItem(DRAFT_KEY)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function handleCancelWriting() {
    setWriting(false)
    setText('')
    setCoping([])
    localStorage.removeItem(DRAFT_KEY)
  }

  async function handleTogglePin(id) {
    setPinningId(id)
    try {
      const updated = await api.togglePinEntry(id)
      setEntries(prev => prev.map(e => e._id === id ? updated : e))
    } catch (e) {
      setError(e.message)
    } finally {
      setPinningId(null)
    }
  }

  async function handleSearch(e) {
    e?.preventDefault?.()
    if (!searchQuery.trim()) { setSearchResults(null); return }
    setSearching(true)
    setSearchError('')
    try {
      const results = await api.searchEntries(searchQuery.trim())
      setSearchResults(results)
    } catch (e) {
      setSearchError(e.message || 'Search failed.')
    } finally {
      setSearching(false)
    }
  }

  function clearSearch() {
    setSearchQuery('')
    setSearchResults(null)
    setSearchError('')
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

  const moodInRange = (score, bucket) => {
    if (score == null) return false
    if (bucket === 'low') return score <= 3
    if (bucket === 'mid') return score >= 4 && score <= 7
    if (bucket === 'high') return score >= 8
    return true
  }

  let displayedEntries = entries
  if (searchResults) {
    const resultIds = new Set(searchResults.map(r => r._id))
    displayedEntries = entries.filter(e => resultIds.has(e._id))
  }
  if (themeFilter) {
    displayedEntries = displayedEntries.filter(e => e.themes?.includes(themeFilter))
  }
  if (moodFilter) {
    displayedEntries = displayedEntries.filter(e => moodInRange(e.mood_score ?? e.mood, moodFilter))
  }
  displayedEntries = [...displayedEntries].sort((a, b) => {
    if (!!b.pinned !== !!a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
    return 0 // preserve existing date-desc order from the server otherwise
  })

  return (
    <div className="journal-sanctuary max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('journal.title')}</h1>
          <p className="text-xs mt-1 text-text/50">{t('journal.subtitle')}</p>
        </div>
        <button onClick={() => setWriting(!writing)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all hover:scale-105 shadow-lg shadow-primary/20 bg-primary text-white">
          <Plus size={15} /> Write reflection
        </button>
      </div>

      {error && <p className="text-xs mb-4 text-red-400">{error}</p>}
      <CrisisSupportBanner support={lastSupport} />
      {lastAiError && (
        <p className="text-xs mb-4 px-3 py-2 rounded-standard bg-orange-500/10 text-orange-400">{lastAiError}</p>
      )}

      {writing && (
        <div className="journal-paper rounded-3xl p-5 mb-6 fade-up bg-surface border border-white/10 shadow-sm">
          <p className="journal-paper__prompt">What has been on your mind?</p>
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t('journal.placeholder')}
            rows={5}
            className="journal-paper__field w-full text-sm outline-none resize-none leading-relaxed mb-2 bg-transparent text-text border-none"
          />
          <div className="flex justify-end mb-4">
            <span className="text-[10px] text-text/30">
              {text.trim() ? `${text.trim().split(/\s+/).length} words · ${text.length} characters` : "Start typing whenever you're ready"}
            </span>
          </div>

          <div className="mb-5">
            <p className="text-xs font-medium mb-2 uppercase tracking-wider text-text/50">{t('journal.copingLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(COPING_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => toggleCoping(key)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${coping.includes(key) ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 bg-transparent text-text/50'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleCancelWriting} className="px-4 py-2 rounded-standard text-sm border border-white/10 text-text/50 transition-opacity hover:opacity-70">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!text.trim() || saving}
              className="flex items-center gap-2 px-5 py-2 rounded-standard text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40 bg-primary text-white">
              {saving ? <><Loader size={13} className="animate-spin" /> Analyzing & saving…</> : 'Save entry'}
            </button>
          </div>
        </div>
      )}

      {/* ── Search & Filter ──────────────────────────────── */}
      {!loadingList && entries.length > 0 && (
        <div className="mb-5">
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl bg-surface border border-white/10">
              <Search size={13} className="text-text/40 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search your reflections by meaning, not just keywords…"
                className="flex-1 bg-transparent text-sm outline-none text-text placeholder:text-text/30"
              />
              {searchQuery && (
                <button type="button" onClick={clearSearch} className="text-text/30 hover:text-text/60 transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(s => !s)}
              className={`p-2.5 rounded-2xl border transition-all ${showFilters || themeFilter || moodFilter ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-text/40'}`}
              title="Filters"
            >
              <Filter size={13} />
            </button>
          </form>

          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-2 fade-up">
              <select
                value={themeFilter}
                onChange={e => setThemeFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-surface text-text/70 outline-none"
              >
                <option value="">All themes</option>
                {Array.from(new Set(entries.flatMap(e => e.themes || []))).map(t => (
                  <option key={t} value={t}>{THEMES[t]?.label || t}</option>
                ))}
              </select>
              <select
                value={moodFilter}
                onChange={e => setMoodFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-surface text-text/70 outline-none"
              >
                <option value="">Any mood</option>
                <option value="low">Low (1–3)</option>
                <option value="mid">Mid (4–7)</option>
                <option value="high">High (8–10)</option>
              </select>
              {(themeFilter || moodFilter) && (
                <button onClick={() => { setThemeFilter(''); setMoodFilter('') }} className="text-xs px-3 py-1.5 rounded-full text-text/40 hover:text-text/70 transition-colors">
                  Clear filters
                </button>
              )}
            </div>
          )}

          {searching && <p className="text-xs text-text/40">Searching…</p>}
          {searchError && <p className="text-xs text-red-400">{searchError}</p>}
          {searchResults && !searching && (
            <p className="text-xs text-text/40">
              {searchResults.length ? `${searchResults.length} matching reflection${searchResults.length === 1 ? '' : 's'}` : 'No reflections matched that search.'}
            </p>
          )}
        </div>
      )}

      {loadingList ? (
        <p className="text-sm text-text/40">Loading entries…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {displayedEntries.map(e => (
            <div key={e._id} className={`rounded-3xl p-4 group transition-all ${e.resolved ? 'bg-accent/5 border border-accent/20' : 'bg-surface border border-white/5'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-text/50">{format(new Date(e.date), 'MMM d, yyyy')}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full border" style={{ background: `${MOOD_COLOR(e.mood_score)}20`, color: MOOD_COLOR(e.mood_score), borderColor: `${MOOD_COLOR(e.mood_score)}40` }}>
                      {e.mood_score ?? e.mood ?? '—'}/10
                    </span>
                    {e.resolved && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">resolved</span>}
                    {e.pinned && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1"><Pin size={9} /> pinned</span>}
                  </div>
                  <p className="text-sm leading-relaxed text-text/80">{e.text}</p>
                  
                  {e.resolved && e.resolvedNote && (
                    <div className="mt-2 text-xs p-2.5 rounded-standard bg-accent/5 border border-dashed border-accent/20 text-text/70">
                      <span className="font-semibold text-accent mr-1">Resolution Note:</span>
                      {e.resolvedNote}
                    </div>
                  )}

                  {resolvingId === e._id && (
                    <div className="mt-3 p-3 rounded-standard fade-up animate-in fade-in zoom-in duration-200 bg-black/15 border border-accent/30">
                      <p className="text-xs mb-2 font-medium text-accent">Mark this entry as resolved?</p>
                      <textarea
                        value={resolvedNote}
                        onChange={ev => setResolvedNote(ev.target.value)}
                        placeholder="Optional note: what helped resolve this, or what did you learn?"
                        rows={2}
                        className="w-full text-xs outline-none resize-none leading-relaxed p-2 rounded-standard mb-2 bg-black/20 text-text border border-white/10"
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setResolvingId(null); setResolvedNote(''); }} className="px-3 py-1 rounded-standard text-xs border border-white/10 text-text/50">
                          Cancel
                        </button>
                        <button onClick={() => handleResolveSubmit(e._id)} disabled={resolving} className="px-3 py-1 rounded-standard text-xs font-medium bg-accent text-white">
                          {resolving ? 'Resolving...' : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  )}

                  <AnalysisCard entry={e} onPlayVideo={setPlayingVideo} />
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <button
                    onClick={() => handleTogglePin(e._id)}
                    disabled={pinningId === e._id}
                    className={`p-1.5 rounded-standard transition-opacity ${e.pinned ? 'opacity-70 hover:!opacity-100 text-primary' : 'opacity-0 group-hover:opacity-40 hover:!opacity-80 text-text/60'}`}
                    title={e.pinned ? 'Unpin' : 'Pin to top'}
                  >
                    {e.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                  </button>
                  {!e.resolved && (
                    <button onClick={() => { setResolvingId(e._id); setResolvedNote(''); }} className="opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity p-1.5 rounded-standard text-accent" title="Mark as resolved">
                      <CheckCircle size={13} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(e._id)} className="opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity p-1.5 rounded-standard text-red-400" title="Delete entry">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-center py-16 px-6 rounded-3xl bg-surface/50 border border-white/10 my-4 fade-up">
              <div className="text-4xl mb-3">✍️</div>
              <h3 className="text-base font-bold text-text mb-1">{t('journal.noEntries')}</h3>
              <p className="text-xs text-text/50 max-w-sm mx-auto mb-5 leading-relaxed">
                Write your first reflection today. Your future self will look back on this moment with deep gratitude.
              </p>
              <button
                onClick={() => setWriting(true)}
                className="px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/25 hover:scale-105 transition-all"
              >
                Write your first reflection
              </button>
            </div>
          )}
          {entries.length > 0 && displayedEntries.length === 0 && (
            <div className="text-center py-14 px-6 rounded-3xl bg-surface/50 border border-white/10 my-4 fade-up">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-sm font-bold text-text mb-1">Nothing matches this search or filter</h3>
              <p className="text-xs text-text/50 max-w-sm mx-auto mb-4 leading-relaxed">
                Try a different search phrase, or clear your filters to see everything again.
              </p>
              <button
                onClick={() => { clearSearch(); setThemeFilter(''); setMoodFilter('') }}
                className="px-4 py-2 rounded-2xl bg-primary/15 text-primary font-medium text-xs hover:bg-primary/25 transition-all"
              >
                Clear search & filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Playback Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPlayingVideo(null)}
        >
          <div className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-standard p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto fade-up"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setPlayingVideo(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10">
              <span className="text-lg">×</span>
            </button>
            <h3 className="text-sm font-semibold pr-8 text-white">{playingVideo.title}</h3>
            
            <div className="aspect-video w-full rounded-standard overflow-hidden bg-black border border-white/5 relative">
              <video src={playingVideo.videoUrl} controls autoPlay className="w-full h-full" />
            </div>

            {playingVideo.note && (
              <div className="bg-white/5 border border-white/10 rounded-standard p-4 mt-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1">Reflection Note</p>
                <p className="text-xs leading-relaxed text-white/70 whitespace-pre-wrap">{playingVideo.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

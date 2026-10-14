import React, { useState } from 'react'
import {
  X, Calendar as CalendarIcon, Sparkles, Plus, Clock, Smile, Frown,
  Meh, AlertCircle, Heart, ArrowRight, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react'
import { format, parseISO, isAfter, startOfDay } from 'date-fns'
import { CALENDAR_MOOD_PALETTE, getMoodPaletteForEmotion, EMOTION_META, COPING_LABELS } from '../../lib/api'

export default function DailyJournalModal({
  isOpen,
  onClose,
  dateStr,
  dayData,
  onSaveNewEntry,
  savingEntry,
}) {
  const [isWriting, setIsWriting] = useState(false)
  const [newText, setNewText] = useState('')
  const [newMood, setNewMood] = useState(5)
  const [newCoping, setNewCoping] = useState([])
  const [expandedEntries, setExpandedEntries] = useState({})
  const [writeError, setWriteError] = useState('')

  if (!isOpen || !dateStr) return null

  // Date parsing & comparison
  const parsedDate = new Date(`${dateStr}T12:00:00`)
  const isFutureDate = isAfter(startOfDay(parsedDate), startOfDay(new Date()))
  const entries = dayData?.entries || []

  const toggleExpand = (id) => {
    setExpandedEntries(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleCoping = (strategy) => {
    setNewCoping(prev =>
      prev.includes(strategy) ? prev.filter(s => s !== strategy) : [...prev, strategy]
    )
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!newText.trim()) {
      setWriteError('Please write your reflection before saving.')
      return
    }
    setWriteError('')
    try {
      await onSaveNewEntry({
        text: newText.trim(),
        mood: Number(newMood),
        copingUsed: newCoping,
        date: new Date(`${dateStr}T12:00:00`).toISOString(),
      })
      setNewText('')
      setNewMood(5)
      setNewCoping([])
      setIsWriting(false)
    } catch (err) {
      setWriteError(err.message || 'Failed to save entry.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-[28px] border border-white/60 shadow-[0_20px_60px_rgba(36,59,58,0.18)]"
        style={{ background: 'var(--color-surface, #ffffff)' }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-black/5 bg-gradient-to-r from-lav-50/70 via-blush-50/50 to-sage-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
              <CalendarIcon size={18} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-text">
                {format(parsedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-xs text-text/50">
                {entries.length === 0
                  ? 'No reflections recorded for this day'
                  : `${entries.length} ${entries.length === 1 ? 'reflection' : 'reflections'} recorded`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text/50 hover:text-text hover:bg-black/5 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* List of Existing Entries */}
          {entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry, idx) => {
                const palette = getMoodPaletteForEmotion(entry.primaryEmotion)
                const isExpanded = !!expandedEntries[entry._id || idx]

                return (
                  <div
                    key={entry._id || idx}
                    className="rounded-2xl p-4 transition-all border"
                    style={{
                      background: palette.bg,
                      borderColor: palette.border,
                    }}
                  >
                    {/* Top Row: Meta & Mood */}
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{palette.emoji}</span>
                        <span className="text-xs font-semibold" style={{ color: palette.color }}>
                          {palette.label}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/60 text-text/60 border border-black/5">
                          Distress: {entry.mood_score ?? entry.mood ?? '—'}/10
                        </span>
                      </div>
                      <span className="text-[11px] text-text/40 flex items-center gap-1">
                        <Clock size={11} />
                        {entry.date ? format(parseISO(entry.date), 'h:mm a') : 'Recorded'}
                      </span>
                    </div>

                    {/* Emotions & Intensity */}
                    {entry.emotions && entry.emotions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {entry.emotions.map((em, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-white/70 text-text/80 shadow-xs"
                          >
                            <span>{EMOTION_META[em.emotion]?.emoji || '•'}</span>
                            <span className="font-medium capitalize">{em.emotion}</span>
                            <span className="flex gap-0.5 ml-1">
                              {Array.from({ length: 5 }).map((_, starIdx) => (
                                <span
                                  key={starIdx}
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor:
                                      starIdx < (em.intensity || 1)
                                        ? palette.color
                                        : 'rgba(0,0,0,0.1)',
                                  }}
                                />
                              ))}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* AI Reflection Summary (if available) */}
                    {entry.summary && (
                      <div className="mb-3 p-3 rounded-xl bg-white/75 border border-white/80 shadow-xs">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
                          <Sparkles size={13} />
                          <span>AI Reflection</span>
                        </div>
                        <p className="text-xs text-text/75 leading-relaxed italic">
                          "{entry.summary}"
                        </p>
                      </div>
                    )}

                    {/* Original Journal Text */}
                    <div className="mt-2 text-xs text-text/80 leading-relaxed bg-white/40 p-3 rounded-xl">
                      <p className={isExpanded ? '' : 'line-clamp-3'}>
                        {entry.text}
                      </p>
                      {entry.text && entry.text.length > 180 && (
                        <button
                          onClick={() => toggleExpand(entry._id || idx)}
                          className="mt-2 text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5"
                        >
                          {isExpanded ? (
                            <>Show less <ChevronUp size={12} /></>
                          ) : (
                            <>Read full reflection <ChevronDown size={12} /></>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Coping & Themes */}
                    {((entry.copingUsed && entry.copingUsed.length > 0) || (entry.themes && entry.themes.length > 0)) && (
                      <div className="mt-3 pt-2.5 border-t border-black/5 flex flex-wrap gap-1.5 text-[10px] text-text/60">
                        {entry.copingUsed?.map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded-md bg-white/50">
                            🌿 Used: {COPING_LABELS[c] || c}
                          </span>
                        ))}
                        {entry.themes?.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-white/50">
                            🏷️ {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 px-4 rounded-2xl bg-lav-50/40 border border-lav-100">
              <span className="text-3xl block mb-2">🌿</span>
              <p className="text-sm font-medium text-text">A serene pause in time</p>
              <p className="text-xs text-text/50 mt-1 max-w-sm mx-auto">
                No journal reflections were logged on this day. Each day holds its own quiet rhythm.
              </p>
            </div>
          )}

          {/* New Entry Creation Section */}
          <div className="pt-2">
            {!isWriting ? (
              isFutureDate ? (
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-black/5 text-text/50 text-xs">
                  <AlertCircle size={15} />
                  <span>Future reflections cannot be created in advance. Come back when this day arrives.</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsWriting(true)}
                  className="w-full py-3 px-4 rounded-2xl border border-dashed border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 font-semibold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Plus size={15} />
                  <span>Write a reflection for this date</span>
                </button>
              )
            ) : (
              <form onSubmit={handleCreateSubmit} className="p-4 rounded-2xl bg-lav-50/60 border border-lav-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-text flex items-center gap-1.5">
                    <Sparkles size={13} className="text-primary" />
                    <span>Log reflection for {format(parsedDate, 'MMM d, yyyy')}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => { setIsWriting(false); setWriteError('') }}
                    className="text-[11px] text-text/50 hover:text-text"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="How were you feeling on this day? Write freely..."
                    className="w-full text-xs p-3 rounded-xl bg-white/90 border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-text"
                  />
                  {writeError && <p className="text-[11px] text-red-500 mt-1">{writeError}</p>}
                </div>

                {/* Mood Score Slider */}
                <div>
                  <div className="flex justify-between text-xs text-text/70 mb-1">
                    <span>Distress / Intensity level:</span>
                    <span className="font-semibold text-primary">{newMood} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newMood}
                    onChange={(e) => setNewMood(e.target.value)}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text/40 mt-0.5">
                    <span>1 (Calm & Peaceful)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Overwhelming)</span>
                  </div>
                </div>

                {/* Coping Strategies Tagging */}
                <div>
                  <p className="text-[11px] text-text/60 mb-1.5">Gentle actions you took:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(COPING_LABELS).map(([key, label]) => {
                      const selected = newCoping.includes(key)
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleCoping(key)}
                          className={`text-[11px] px-2.5 py-1 rounded-full transition-all border ${
                            selected
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-white/70 text-text/70 border-black/5 hover:bg-white'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWriting(false)}
                    className="text-xs px-4 py-2 rounded-xl text-text/60 hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEntry}
                    className="text-xs px-5 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingEntry ? 'Saving & Analyzing...' : 'Save Reflection'}
                    <ArrowRight size={13} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

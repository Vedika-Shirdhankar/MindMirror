import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Calendar, ArrowRight, Loader, Sparkles, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import * as api from '../lib/api.js'
import { format } from 'date-fns'

const SUGGESTIONS = [
  'Happy moments',
  'Work stress',
  'Goals & habits',
  'Coping strategies',
  'Breakthroughs',
]

const MOOD_COLOR = m =>
  m == null ? '#888' : m <= 3 ? '#5DCAA5' : m <= 5 ? '#97C459' : m <= 7 ? '#EF9F27' : '#E24B4A'

export default function SearchPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchError, setSearchError] = useState('')
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80)
      setSelectedIndex(0)
    } else {
      setQuery('')
      setResults(null)
      setSelectedIndex(0)
      setSearchError('')
    }
  }, [isOpen])

  // Reset selectedIndex whenever results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  // Keep selected item scrolled into view
  useEffect(() => {
    if (listRef.current && results?.length > 0) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex, results])

  // Keyboard navigation: Escape, ArrowDown, ArrowUp, Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (results && results.length > 0) {
          setSelectedIndex(prev => (prev + 1) % results.length)
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (results && results.length > 0) {
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results && results.length > 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]._id)
        } else if (query.trim()) {
          performSearch(query.trim())
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, query, onClose])

  // Debounced search on query change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1) {
        performSearch(query.trim())
      } else {
        setResults(null)
        setSearchError('')
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  async function performSearch(searchTerm) {
    if (!searchTerm?.trim()) return
    setSearching(true)
    setSearchError('')
    try {
      const res = await api.searchEntries(searchTerm.trim())
      setResults(res || [])
    } catch (e) {
      console.warn('Search error:', e.message)
      setSearchError('Search is temporarily resting. Please try again in a moment.')
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSelect = (entryId) => {
    onClose()
    navigate('/journal', { state: { highlightEntryId: entryId } })
  }

  const handleSuggestionClick = (text) => {
    setQuery(text)
    performSearch(text)
    inputRef.current?.focus()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-[12vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
          >
            <div
              className="backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
              style={{ background: 'var(--color-surface, #ffffff)', color: 'var(--color-text, #1a1a24)' }}
            >
              {/* Search input header */}
              <div className="flex items-center px-4 py-3.5 border-b border-primary/10 gap-3">
                <Search size={18} className="text-primary flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your thoughts, moments, patterns..."
                  className="flex-1 bg-transparent border-none outline-none text-sm md:text-base placeholder:text-text/40 text-text"
                />
                {searching && <Loader size={16} className="text-primary animate-spin flex-shrink-0" />}
                {query && !searching && (
                  <button
                    onClick={() => { setQuery(''); setResults(null); inputRef.current?.focus(); }}
                    className="p-1 rounded-md hover:bg-black/5 text-text/40 hover:text-text transition-colors flex-shrink-0"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-black/5 text-text/50 hover:text-text transition-colors flex-shrink-0"
                  title="Close (Esc)"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search results & empty states container */}
              <div ref={listRef} className="max-h-[58vh] overflow-y-auto p-2">
                {/* 1. Initial Empty State with Quick Suggestions */}
                {!query.trim() && (
                  <div className="py-6 px-4">
                    <p className="text-xs text-text/50 mb-3 text-center">
                      Type to search through your past journal entries and reflections.
                    </p>
                    <div className="flex items-center gap-1.5 justify-center flex-wrap pt-1">
                      <span className="text-[11px] text-text/40 mr-1 flex items-center gap-1">
                        <Sparkles size={11} className="text-primary" /> Try:
                      </span>
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-all hover:scale-105 active:scale-95"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Error State */}
                {searchError && (
                  <div className="px-4 py-8 text-center text-xs text-red-400">
                    {searchError}
                  </div>
                )}

                {/* 3. No Results State */}
                {query.trim().length > 0 && !searching && !searchError && results?.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-text/50">
                    No matching thoughts found for "{query}". Try checking a different word or theme.
                  </div>
                )}

                {/* 4. Active Results List */}
                {results?.map((entry, idx) => {
                  const isSelected = selectedIndex === idx
                  const mood = entry.mood_score ?? entry.mood
                  return (
                    <button
                      key={entry._id}
                      data-index={idx}
                      onClick={() => handleSelect(entry._id)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-3.5 rounded-xl transition-all flex flex-col gap-1.5 mb-1.5 border ${
                        isSelected
                          ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20 shadow-sm'
                          : 'border-transparent hover:bg-primary/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-text/70 flex items-center gap-1">
                            <Calendar size={12} className="text-primary" />
                            {format(new Date(entry.date), 'MMMM d, yyyy')}
                          </span>
                          {mood != null && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: `${MOOD_COLOR(mood)}20`, color: MOOD_COLOR(mood) }}
                            >
                              {mood}/10
                            </span>
                          )}
                          {entry.resolved && (
                            <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5">
                              <CheckCircle2 size={10} /> Resolved
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs font-semibold text-primary transition-opacity">
                          <span className={`text-[11px] ${isSelected ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}>
                            Open
                          </span>
                          <ArrowRight size={13} className={isSelected ? 'translate-x-0.5' : ''} />
                        </div>
                      </div>

                      <p className="text-xs md:text-sm text-text leading-relaxed line-clamp-2">
                        {entry.text?.startsWith?.('enc:v1:') ? 'Personal reflection entry' : entry.text}
                      </p>

                      {entry.summary && !entry.summary?.startsWith?.('enc:v1:') && (
                        <p className="text-xs text-primary/80 line-clamp-1 italic bg-primary/5 p-1.5 rounded-md mt-0.5">
                          AI Note: {entry.summary}
                        </p>
                      )}

                      {entry.themes && entry.themes.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-0.5">
                          {entry.themes.slice(0, 3).map((th) => (
                            <span key={th} className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 text-text/60">
                              #{th}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Footer with keyboard hints */}
              <div className="px-4 py-2.5 bg-black/5 border-t border-primary/10 text-[11px] text-text/40 flex justify-between items-center select-none">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-black/5 border border-black/10 font-mono text-[10px]">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/5 border border-black/10 font-mono text-[10px]">↓</kbd> Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-black/5 border border-black/10 font-mono text-[10px]">↵</kbd> Select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-black/5 border border-black/10 font-mono text-[10px]">esc</kbd> Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

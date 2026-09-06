import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Calendar, ArrowRight, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import * as api from '../lib/api.js'
import { format } from 'date-fns'

export default function SearchPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults(null)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1) {
        performSearch()
      } else {
        setResults(null)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  async function performSearch() {
    setSearching(true)
    try {
      const res = await api.searchEntries(query.trim())
      setResults(res)
    } catch (e) {
      console.error(e)
    } finally {
      setSearching(false)
    }
  }

  const handleSelect = (entryId) => {
    onClose()
    navigate('/journal')
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
            className="fixed inset-0 bg-text/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
              <div className="flex items-center px-4 py-3 border-b border-primary/10">
                <Search size={18} className="text-text/50 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your thoughts, moments, patterns..."
                  className="flex-1 bg-transparent border-none outline-none text-text text-base placeholder:text-text/40"
                />
                {searching && <Loader size={16} className="text-primary animate-spin mr-3" />}
                <button onClick={onClose} className="p-1 rounded-md hover:bg-black/5 text-text/50 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {!query.trim() && (
                  <div className="px-4 py-8 text-center text-sm text-text/40">
                    Type to search through your past journal entries and reflections.
                  </div>
                )}
                
                {query.trim().length > 0 && !searching && results?.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-text/40">
                    No matching thoughts found for "{query}".
                  </div>
                )}

                {results?.map((entry) => (
                  <button
                    key={entry._id}
                    onClick={() => handleSelect(entry._id)}
                    className="w-full text-left p-3 hover:bg-primary/5 rounded-xl transition-colors flex flex-col gap-1.5 mb-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium text-text/50">
                        <Calendar size={12} />
                        {format(new Date(entry.date), 'MMMM d, yyyy')}
                      </div>
                      <ArrowRight size={14} className="text-primary/0 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-text line-clamp-2 leading-relaxed">
                      {entry.text}
                    </p>
                    {entry.summary && (
                      <p className="text-xs text-primary/70 line-clamp-1 italic bg-primary/5 p-1.5 rounded-md mt-1">
                        AI Note: {entry.summary}
                      </p>
                    )}
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 bg-black/5 border-t border-primary/10 text-[10px] text-text/40 flex justify-between">
                <span>Enter to select</span>
                <span>ESC to close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

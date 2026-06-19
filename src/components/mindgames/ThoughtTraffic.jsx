// components/mindgames/ThoughtTraffic.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, RotateCcw } from 'lucide-react'

const CATEGORIES = [
  { key: 'green',  label: 'Helpful',   color: '#5DCAA5', desc: 'Moves you forward' },
  { key: 'yellow', label: 'Maybe',     color: '#EF9F27', desc: 'Worth questioning' },
  { key: 'red',    label: 'Unhelpful', color: '#E24B4A', desc: "Doesn't serve you" },
]

export default function ThoughtTraffic() {
  const [input, setInput] = useState('')
  const [pending, setPending] = useState([])
  const [classified, setClassified] = useState({ green: [], yellow: [], red: [] })
  const [showSummary, setShowSummary] = useState(false)

  function addThought() {
    const text = input.trim()
    if (!text) return
    setPending(prev => [...prev, { id: Date.now(), text }])
    setInput('')
    setShowSummary(false)
  }

  function classify(thought, category) {
    setPending(prev => prev.filter(t => t.id !== thought.id))
    setClassified(prev => {
      const updated = { ...prev, [category]: [...prev[category], thought.text] }
      return updated
    })
  }

  const totalClassified = classified.green.length + classified.yellow.length + classified.red.length

  function finishSession() {
    if (totalClassified === 0) return
    setShowSummary(true)
  }

  function reset() {
    setPending([])
    setClassified({ green: [], yellow: [], red: [] })
    setShowSummary(false)
  }

  if (showSummary) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center gap-5 py-8">
        <p className="text-base font-medium" style={{ color: '#e8e6f0' }}>Here's how your thoughts sorted out</p>
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {CATEGORIES.map(cat => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 flex flex-col items-center gap-1"
              style={{ background: `${cat.color}12`, border: `1px solid ${cat.color}40` }}
            >
              <span className="text-2xl font-semibold" style={{ color: cat.color }}>{classified[cat.key].length}</span>
              <span className="text-xs" style={{ color: cat.color }}>{cat.label}</span>
            </motion.div>
          ))}
        </div>
        <p className="text-xs max-w-sm leading-relaxed" style={{ color: 'rgba(232,230,240,0.45)' }}>
          {classified.red.length > classified.green.length
            ? "Noticing more unhelpful thoughts isn't a failure — it's awareness. Try the Thought Ladder on one of your red thoughts."
            : "You're spotting more helpful thoughts than unhelpful ones. That's a sign of a mind that's working with you, not against you."}
        </p>
        <button onClick={reset} className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-opacity hover:opacity-80" style={{ background: 'rgba(127,119,221,0.2)', color: '#AFA9EC' }}>
          <RotateCcw size={12} /> Sort new thoughts
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <p className="text-sm mb-4" style={{ color: 'rgba(232,230,240,0.55)' }}>
        List out what's running through your head, then sort each one into a lane — helpful, maybe, or unhelpful.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addThought()}
          placeholder="e.g. Everyone is judging me right now"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e6f0' }}
        />
        <button onClick={addThought} disabled={!input.trim()} className="px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-30" style={{ background: '#7F77DD', color: 'white' }}>
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Pending thoughts to sort */}
      {pending.length > 0 && (
        <div className="mb-4">
          <p className="text-xs mb-2" style={{ color: 'rgba(232,230,240,0.4)' }}>Sort these into a lane:</p>
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {pending.map(t => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span className="text-sm flex-1" style={{ color: 'rgba(232,230,240,0.8)' }}>{t.text}</span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => classify(t, cat.key)}
                        title={cat.label}
                        className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                        style={{ background: cat.color }}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Lanes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
        {CATEGORIES.map(cat => (
          <div key={cat.key} className="rounded-xl p-3 flex flex-col gap-2" style={{ background: `${cat.color}08`, border: `1px solid ${cat.color}25`, minHeight: 140 }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: cat.color }}>{cat.label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${cat.color}20`, color: cat.color }}>{classified[cat.key].length}</span>
            </div>
            <p className="text-xs" style={{ color: 'rgba(232,230,240,0.3)' }}>{cat.desc}</p>
            <div className="flex flex-col gap-1.5 mt-1">
              <AnimatePresence>
                {classified[cat.key].map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs px-2.5 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(232,230,240,0.65)' }}
                  >
                    {text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {totalClassified > 0 && (
        <button onClick={finishSession} className="mt-4 self-center text-xs px-5 py-2.5 rounded-xl font-medium transition-opacity hover:opacity-80" style={{ background: '#7F77DD', color: 'white' }}>
          See summary
        </button>
      )}
    </div>
  )
}
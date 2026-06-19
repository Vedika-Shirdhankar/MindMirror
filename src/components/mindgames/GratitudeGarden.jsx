// components/mindgames/GratitudeGarden.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Sprout } from 'lucide-react'

const STAGE_THRESHOLDS = { tree: 20, flower: 5, seed: 1 }

function stageFor(index) {
  // index is 1-based position of this entry among all entries
  if (index >= STAGE_THRESHOLDS.tree) return 'tree'
  if (index >= STAGE_THRESHOLDS.flower) return 'flower'
  return 'seed'
}

function PlantIcon({ stage, color }) {
  if (stage === 'tree') {
    return (
      <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
        <rect x="12" y="22" width="4" height="12" rx="1.5" fill="#8B6F47" />
        <circle cx="14" cy="13" r="11" fill={color} opacity="0.85" />
      </svg>
    )
  }
  if (stage === 'flower') {
    return (
      <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
        <rect x="10" y="16" width="2" height="11" rx="1" fill="#5A8F4F" />
        {[0, 72, 144, 216, 288].map(deg => (
          <ellipse key={deg} cx="11" cy="8" rx="4" ry="6" fill={color} opacity="0.85"
            transform={`rotate(${deg} 11 8) translate(0 -3)`} />
        ))}
        <circle cx="11" cy="8" r="3" fill="#FAC775" />
      </svg>
    )
  }
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
      <rect x="6" y="10" width="2" height="8" rx="1" fill="#5A8F4F" />
      <ellipse cx="7" cy="7" rx="5" ry="7" fill={color} opacity="0.7" />
    </svg>
  )
}

const COLORS = ['#5DCAA5', '#7F77DD', '#EF9F27', '#D4537E', '#AFA9EC', '#97C459']

export default function GratitudeGarden() {
  const [input, setInput] = useState('')
  const [entries, setEntries] = useState([])

  function addEntry() {
    const text = input.trim()
    if (!text) return
    setEntries(prev => [...prev, { id: Date.now(), text, color: COLORS[prev.length % COLORS.length] }])
    setInput('')
  }

  const total = entries.length
  const nextMilestone = total < 5 ? 5 - total : total < 20 ? 20 - total : null

  return (
    <div className="flex flex-col h-full">
      <p className="text-sm mb-4" style={{ color: 'rgba(232,230,240,0.55)' }}>
        Name one small thing you're grateful for. Every entry plants something new in your garden — watch it grow over time.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addEntry()}
          placeholder="e.g. My friend checked in on me today"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e6f0' }}
        />
        <button
          onClick={addEntry}
          disabled={!input.trim()}
          className="px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-30"
          style={{ background: '#5DCAA5', color: '#04342C' }}
        >
          <Plus size={14} /> Plant
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(232,230,240,0.45)' }}>
          <span>{total} entr{total === 1 ? 'y' : 'ies'} planted</span>
          {nextMilestone && <span>{nextMilestone} more to next stage</span>}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full" style={{ width: `${Math.min(100, (total / 20) * 100)}%`, background: 'linear-gradient(90deg, #97C459, #5DCAA5)' }} />
        </div>
      </div>

      {/* Garden */}
      <div
        className="relative rounded-2xl flex-1 p-5 overflow-y-auto"
        style={{ background: 'linear-gradient(180deg, rgba(93,202,165,0.04), rgba(151,196,89,0.06))', border: '1px solid rgba(255,255,255,0.07)', minHeight: 300 }}
      >
        {entries.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-center px-8" style={{ color: 'rgba(232,230,240,0.3)' }}>
              <Sprout size={20} className="mx-auto mb-2" style={{ opacity: 0.4 }} />
              Your garden is empty. Plant your first gratitude above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <AnimatePresence>
              {entries.map((entry, i) => {
                const stage = stageFor(i + 1)
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, scale: 0.3, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl group relative"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                    title={entry.text}
                  >
                    <PlantIcon stage={stage} color={entry.color} />
                    <p className="text-xs text-center leading-tight line-clamp-2" style={{ color: 'rgba(232,230,240,0.6)', fontSize: 10 }}>
                      {entry.text.length > 28 ? entry.text.slice(0, 28) + '…' : entry.text}
                    </p>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-3 text-xs" style={{ color: 'rgba(232,230,240,0.35)' }}>
        <span>🌱 1 = seed</span>
        <span>🌸 5 = flower</span>
        <span>🌳 20 = tree</span>
      </div>
    </div>
  )
}
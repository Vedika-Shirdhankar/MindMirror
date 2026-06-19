// components/mindgames/ThoughtCloudBurst.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Sparkles } from 'lucide-react'

const BUBBLE_COLORS = ['#7F77DD', '#5DCAA5', '#EF9F27', '#D4537E', '#AFA9EC']

function randomPos(existing) {
  // Keep bubbles spread out without overlapping too much
  for (let i = 0; i < 20; i++) {
    const x = 10 + Math.random() * 75
    const y = 10 + Math.random() * 65
    const tooClose = existing.some(b => Math.hypot(b.x - x, b.y - y) < 18)
    if (!tooClose) return { x, y }
  }
  return { x: 10 + Math.random() * 75, y: 10 + Math.random() * 65 }
}

export default function ThoughtCloudBurst() {
  const [input, setInput] = useState('')
  const [bubbles, setBubbles] = useState([])
  const [popped, setPopped] = useState(0)
  const [poppingIds, setPoppingIds] = useState([])
  const [showMessage, setShowMessage] = useState(false)

  function addThought() {
    const text = input.trim()
    if (!text) return
    const pos = randomPos(bubbles)
    const newBubble = {
      id: Date.now() + Math.random(),
      text,
      color: BUBBLE_COLORS[bubbles.length % BUBBLE_COLORS.length],
      size: Math.min(150, 90 + text.length * 1.8),
      ...pos,
    }
    setBubbles(prev => [...prev, newBubble])
    setInput('')
    setShowMessage(false)
  }

  function popBubble(id) {
    if (poppingIds.includes(id)) return
    setPoppingIds(prev => [...prev, id])
    setTimeout(() => {
      setBubbles(prev => {
        const updated = prev.filter(b => b.id !== id)
        if (updated.length === 0 && prev.length > 0) {
          setTimeout(() => setShowMessage(true), 200)
        }
        return updated
      })
      setPopped(p => p + 1)
      setPoppingIds(prev => prev.filter(pid => pid !== id))
    }, 350)
  }

  return (
    <div className="flex flex-col h-full">
      <p className="text-sm mb-4" style={{ color: 'rgba(232,230,240,0.55)' }}>
        Type out the thoughts looping in your head. Watch them float, then pop each one when you're ready to let it go.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addThought()}
          placeholder="e.g. I'm going to fail this exam…"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e6f0' }}
        />
        <button
          onClick={addThought}
          disabled={!input.trim()}
          className="px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-30"
          style={{ background: '#7F77DD', color: 'white' }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <div
        className="relative rounded-2xl flex-1 overflow-hidden"
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(127,119,221,0.08), transparent 70%)', border: '1px solid rgba(255,255,255,0.07)', minHeight: 340 }}
      >
        {bubbles.length === 0 && !showMessage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-center px-8" style={{ color: 'rgba(232,230,240,0.3)' }}>
              Your thought bubbles will appear here.<br />Add one above to begin.
            </p>
          </div>
        )}

        <AnimatePresence>
          {bubbles.map(b => (
            <motion.button
              key={b.id}
              onClick={() => popBubble(b.id)}
              initial={{ scale: 0, opacity: 0 }}
              animate={poppingIds.includes(b.id)
                ? { scale: 1.4, opacity: 0 }
                : { scale: 1, opacity: 1, y: [0, -8, 0] }
              }
              exit={{ scale: 0, opacity: 0 }}
              transition={poppingIds.includes(b.id)
                ? { duration: 0.35, ease: 'easeOut' }
                : { y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.3 } }
              }
              className="absolute flex items-center justify-center text-center rounded-full px-3 cursor-pointer"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size,
                background: `${b.color}22`,
                border: `1.5px solid ${b.color}66`,
                color: '#e8e6f0',
                fontSize: 12,
                lineHeight: 1.3,
                backdropFilter: 'blur(2px)',
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
            >
              {b.text}
            </motion.button>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center"
            >
              <Sparkles size={22} color="#AFA9EC" />
              <p className="text-base font-medium" style={{ color: '#e8e6f0' }}>
                Thoughts are temporary.<br />You are not your thoughts.
              </p>
              <p className="text-xs" style={{ color: 'rgba(232,230,240,0.4)' }}>You popped {popped} thought{popped === 1 ? '' : 's'} today.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {bubbles.length > 0 && (
        <p className="text-xs text-center mt-3" style={{ color: 'rgba(232,230,240,0.35)' }}>
          {bubbles.length} thought{bubbles.length === 1 ? '' : 's'} floating · click to pop
        </p>
      )}
    </div>
  )
}
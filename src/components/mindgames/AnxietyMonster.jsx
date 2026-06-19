// components/mindgames/AnxietyMonster.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wind, Heart, RefreshCw, NotebookPen, PartyPopper } from 'lucide-react'

const ACTIONS = [
  { key: 'breathing', label: 'Deep breathing', icon: Wind, reduce: 18, color: '#5DCAA5' },
  { key: 'gratitude', label: 'Gratitude', icon: Heart, reduce: 15, color: '#D4537E' },
  { key: 'reframe', label: 'Positive reframing', icon: RefreshCw, reduce: 20, color: '#7F77DD' },
  { key: 'journal', label: 'Journaling', icon: NotebookPen, reduce: 16, color: '#EF9F27' },
]

const MAX_STRESS = 100

export default function AnxietyMonster() {
  const [stress, setStress] = useState(80)
  const [usedActions, setUsedActions] = useState([])
  const [celebrate, setCelebrate] = useState(false)
  const [actionFeedback, setActionFeedback] = useState(null)

  const size = 80 + (stress / MAX_STRESS) * 160 // 80px → 240px
  const wobble = stress > 60 ? 1 : stress > 30 ? 0.5 : 0.15

  function performAction(action) {
    if (stress <= 0) return
    const reduction = action.reduce + Math.random() * 6
    const next = Math.max(0, stress - reduction)
    setStress(next)
    setUsedActions(prev => [...prev, action.key])
    setActionFeedback(action.key)
    setTimeout(() => setActionFeedback(null), 600)
    if (next === 0) {
      setTimeout(() => setCelebrate(true), 400)
    }
  }

  function reset() {
    setStress(80)
    setUsedActions([])
    setCelebrate(false)
  }

  const monsterColor = stress > 60 ? '#E24B4A' : stress > 30 ? '#EF9F27' : '#97C459'

  return (
    <div className="flex flex-col h-full">
      <p className="text-sm mb-4" style={{ color: 'rgba(232,230,240,0.55)' }}>
        This monster grows with stress. Use calming actions below to shrink it down — each one chips away at the anxiety.
      </p>

      <div className="relative rounded-2xl flex-1 flex flex-col items-center justify-center gap-6 py-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', minHeight: 340 }}>
        {/* Stress meter */}
        <div className="w-full max-w-xs px-6">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(232,230,240,0.45)' }}>
            <span>Stress level</span>
            <span style={{ color: monsterColor }}>{Math.round(stress)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: monsterColor }}
              animate={{ width: `${stress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Monster */}
        <AnimatePresence mode="wait">
          {!celebrate ? (
            <motion.div
              key="monster"
              animate={{
                width: size,
                height: size,
                rotate: [0, -wobble * 4, wobble * 4, 0],
              }}
              transition={{
                width: { duration: 0.5, ease: 'easeOut' },
                height: { duration: 0.5, ease: 'easeOut' },
                rotate: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="relative flex items-center justify-center rounded-full"
              style={{ background: `${monsterColor}25`, border: `2px solid ${monsterColor}` }}
            >
              {/* Eyes */}
              <div className="absolute flex gap-3" style={{ top: '32%' }}>
                <div className="rounded-full" style={{ width: size * 0.1, height: size * 0.1, background: '#1a1921' }} />
                <div className="rounded-full" style={{ width: size * 0.1, height: size * 0.1, background: '#1a1921' }} />
              </div>
              {/* Mouth */}
              <div
                className="absolute rounded-full"
                style={{
                  bottom: '28%',
                  width: size * (0.3 + stress / 400),
                  height: size * 0.12,
                  background: '#1a1921',
                  borderRadius: stress > 50 ? '50%' : '0 0 50px 50px',
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="celebrate"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.6, repeat: 2 }}>
                <PartyPopper size={48} color="#5DCAA5" />
              </motion.div>
              <p className="text-base font-medium text-center" style={{ color: '#e8e6f0' }}>You shrank the monster to nothing!</p>
              <p className="text-xs text-center max-w-xs" style={{ color: 'rgba(232,230,240,0.45)' }}>
                Anxiety feels huge in the moment, but it responds to small, steady actions — just like you showed it can.
              </p>
              <button onClick={reset} className="mt-2 text-xs px-4 py-2 rounded-lg transition-opacity hover:opacity-80" style={{ background: 'rgba(127,119,221,0.2)', color: '#AFA9EC' }}>
                Summon another round
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      {!celebrate && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {ACTIONS.map(action => {
            const Icon = action.icon
            const isActive = actionFeedback === action.key
            return (
              <motion.button
                key={action.key}
                onClick={() => performAction(action)}
                disabled={stress <= 0}
                whileTap={{ scale: 0.93 }}
                animate={isActive ? { scale: [1, 1.08, 1] } : {}}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-opacity disabled:opacity-30"
                style={{ background: `${action.color}15`, border: `1px solid ${action.color}40`, color: action.color }}
              >
                <Icon size={16} />
                {action.label}
              </motion.button>
            )
          })}
        </div>
      )}

      {usedActions.length > 0 && !celebrate && (
        <p className="text-xs text-center mt-3" style={{ color: 'rgba(232,230,240,0.35)' }}>
          {usedActions.length} calming action{usedActions.length === 1 ? '' : 's'} used
        </p>
      )}
    </div>
  )
}
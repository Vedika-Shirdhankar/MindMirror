// components/mindgames/GroundingHunt.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Hand, Volume2, Sparkles, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react'

const SENSES_STAGES = [
  {
    step: 5,
    title: '5 things you can see',
    prompt: 'Look around you. Notice the details — a pattern on the wall, light reflecting off a surface, a shadow, or an object nearby.',
    icon: Eye,
    color: '#7F77DD',
    placeholder: 'Name something you see...',
    countRequired: 5,
  },
  {
    step: 4,
    title: '4 things you can feel',
    prompt: 'Bring awareness to your body. Feel the texture of your clothes, the temperature of the air, the seat underneath you, or the ground beneath your feet.',
    icon: Hand,
    color: '#5DCAA5',
    placeholder: 'Name something you feel...',
    countRequired: 4,
  },
  {
    step: 3,
    title: '3 things you can hear',
    prompt: 'Listen closely. Notice distant sounds, sounds in the room, the hum of electronics, chirping birds, or the sound of your own breath.',
    icon: Volume2,
    color: '#EF9F27',
    placeholder: 'Name something you hear...',
    countRequired: 3,
  },
  {
    step: 2,
    title: '2 things you can smell',
    prompt: 'Breathe in slowly. Try to identify scents in the air, the smell of wood, a book, perfume, food, or simply the clean smell of the room.',
    icon: Sparkles,
    color: '#D4537E',
    placeholder: 'Name something you smell...',
    countRequired: 2,
  },
  {
    step: 1,
    title: '1 thing you can taste',
    prompt: 'Focus on your mouth. Notice any lingering taste, or focus on how the air tastes as you breathe in, or imagine the taste of a clean glass of water.',
    icon: CheckCircle2,
    color: '#AFA9EC',
    placeholder: 'Name something you taste...',
    countRequired: 1,
  },
]

export default function GroundingHunt() {
  const [stageIndex, setStageIndex] = useState(0)
  const [currentInput, setCurrentInput] = useState('')
  const [currentItems, setCurrentItems] = useState([])
  const [completed, setCompleted] = useState(false)

  const stage = SENSES_STAGES[stageIndex]
  const Icon = stage ? stage.icon : Eye

  function handleAddItem() {
    if (!currentInput.trim()) return
    const updated = [...currentItems, currentInput.trim()]
    setCurrentItems(updated)
    setCurrentInput('')

    if (updated.length >= stage.countRequired) {
      setTimeout(() => {
        if (stageIndex < SENSES_STAGES.length - 1) {
          setStageIndex(prev => prev + 1)
          setCurrentItems([])
        } else {
          setCompleted(true)
        }
      }, 500)
    }
  }

  function handleSkipOrNext() {
    // Allows user to skip typing if they prefer to just do the exercise mentally
    if (stageIndex < SENSES_STAGES.length - 1) {
      setStageIndex(prev => prev + 1)
      setCurrentItems([])
    } else {
      setCompleted(true)
    }
  }

  function handleReset() {
    setStageIndex(0)
    setCurrentInput('')
    setCurrentItems([])
    setCompleted(false)
  }

  if (completed) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center gap-6 py-10 fade-up">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(93,202,165,0.15)', border: '1px solid rgba(93,202,165,0.3)' }}>
          <CheckCircle2 size={32} color="#5DCAA5" />
        </div>
        <div>
          <h2 className="text-lg font-medium mb-2" style={{ color: '#e8e6f0' }}>You are grounded.</h2>
          <p className="text-xs max-w-sm leading-relaxed mx-auto mb-4" style={{ color: 'rgba(232,230,240,0.5)' }}>
            By engaging your five senses, you have interrupted the cycle of racing thoughts and anchored your awareness back to the present moment. Take one slow, deep breath.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs px-5 py-2.5 rounded-xl transition-all hover:opacity-85"
          style={{ background: 'rgba(127,119,221,0.2)', color: '#AFA9EC' }}
        >
          <RefreshCw size={13} /> Play again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full fade-up">
      {/* Progress Bar */}
      <div className="flex justify-between items-center text-xs mb-3" style={{ color: 'rgba(232,230,240,0.45)' }}>
        <span>5-4-3-2-1 Senses Exercise</span>
        <span>Stage {stageIndex + 1} of 5</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-6 flex" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: stage.color }}
          animate={{ width: `${((stageIndex + 1) / 5) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main card */}
      <div className="rounded-2xl p-5 mb-4 flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', minHeight: 280 }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${stage.color}15`, border: `1px solid ${stage.color}35` }}>
            <Icon size={20} color={stage.color} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: '#e8e6f0' }}>{stage.title}</h2>
            <p className="text-xs" style={{ color: 'rgba(232,230,240,0.45)' }}>Mental grounding exercise</p>
          </div>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,230,240,0.65)' }}>{stage.prompt}</p>

        {/* List of items found */}
        {currentItems.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {currentItems.map((item, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
                style={{ background: `${stage.color}10`, color: stage.color, border: `1px solid ${stage.color}25` }}
              >
                ✓ {item}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-4">
          <input
            type="text"
            value={currentInput}
            onChange={e => setCurrentInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddItem()}
            placeholder={stage.placeholder}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e6f0' }}
          />
          <button
            onClick={handleAddItem}
            disabled={!currentInput.trim()}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-85 disabled:opacity-30"
            style={{ background: stage.color, color: '#0f0f13' }}
          >
            Add ({currentItems.length}/{stage.countRequired})
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 px-1">
        <p className="text-[10px]" style={{ color: 'rgba(232,230,240,0.3)' }}>
          Tip: You can also search for items mentally.
        </p>
        <button
          onClick={handleSkipOrNext}
          className="flex items-center gap-1 text-xs opacity-50 hover:opacity-80 transition-opacity"
          style={{ color: '#e8e6f0' }}
        >
           mental scan / skip <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
}
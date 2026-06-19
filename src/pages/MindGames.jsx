// pages/MindGames.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Ghost, Flower2, Compass, Signpost, ArrowLeft, Gamepad2 } from 'lucide-react'
import ThoughtCloudBurst from '../components/mindgames/ThoughtCloudBurst.jsx'
import AnxietyMonster from '../components/mindgames/AnxietyMonster.jsx'
import GratitudeGarden from '../components/mindgames/GratitudeGarden.jsx'
import GroundingHunt from '../components/mindgames/GroundingHunt.jsx'
import ThoughtTraffic from '../components/mindgames/ThoughtTraffic.jsx'

const GAMES = [
  {
    key: 'cloud-burst',
    title: 'Thought Cloud Burst',
    description: 'Pop intrusive thoughts as floating bubbles, one by one.',
    icon: Cloud,
    color: '#7F77DD',
    component: ThoughtCloudBurst,
  },
  {
    key: 'anxiety-monster',
    title: 'Anxiety Monster',
    description: 'Shrink an anxious monster using calming actions.',
    icon: Ghost,
    color: '#E24B4A',
    component: AnxietyMonster,
  },
  {
    key: 'gratitude-garden',
    title: 'Gratitude Garden',
    description: 'Grow a garden, one gratitude entry at a time.',
    icon: Flower2,
    color: '#5DCAA5',
    component: GratitudeGarden,
  },
  {
    key: 'grounding-hunt',
    title: 'Grounding Hunt',
    description: 'A guided 5-4-3-2-1 senses exercise to anchor you.',
    icon: Compass,
    color: '#EF9F27',
    component: GroundingHunt,
  },
  {
    key: 'thought-traffic',
    title: 'Thought Traffic',
    description: 'Sort racing thoughts into helpful, maybe, or unhelpful.',
    icon: Signpost,
    color: '#D4537E',
    component: ThoughtTraffic,
  },
]

export default function MindGames() {
  const [activeKey, setActiveKey] = useState(null)
  const activeGame = GAMES.find(g => g.key === activeKey)

  if (activeGame) {
    const GameComponent = activeGame.component
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => setActiveKey(null)}
          className="flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-70"
          style={{ color: 'rgba(232,230,240,0.5)' }}
        >
          <ArrowLeft size={13} /> Back to Mind Games
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${activeGame.color}18`, border: `1px solid ${activeGame.color}40` }}>
            <activeGame.icon size={18} color={activeGame.color} />
          </div>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: '#e8e6f0' }}>{activeGame.title}</h1>
            <p className="text-xs" style={{ color: 'rgba(232,230,240,0.45)' }}>{activeGame.description}</p>
          </div>
        </div>

        <motion.div key={activeGame.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <GameComponent />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-1">
        <Gamepad2 size={18} color="#AFA9EC" />
        <h1 className="text-xl font-semibold" style={{ color: '#e8e6f0' }}>Mind Games</h1>
      </div>
      <p className="text-sm mb-7" style={{ color: 'rgba(232,230,240,0.45)' }}>
        Short, interactive exercises to interrupt overthinking, anxiety, and rumination — whenever you need a reset.(Must Try)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GAMES.map((game, i) => {
          const Icon = game.icon
          return (
            <motion.button
              key={game.key}
              onClick={() => setActiveKey(game.key)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="text-left rounded-2xl p-5 flex flex-col gap-3 transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${game.color}18`, border: `1px solid ${game.color}40` }}>
                <Icon size={18} color={game.color} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#e8e6f0' }}>{game.title}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(232,230,240,0.45)' }}>{game.description}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
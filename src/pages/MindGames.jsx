// pages/MindGames.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cloud, Ghost, Flower2, Compass, Signpost, ArrowLeft, Gamepad2,
  Sparkles, Clock, ShieldCheck, HeartHandshake, Flame, RefreshCw,
  Zap, Wind, Eye, Smile, Filter, Play, CheckCircle2, Trophy
} from 'lucide-react'
import ThoughtCloudBurst from '../components/mindgames/ThoughtCloudBurst.jsx'
import AnxietyMonster from '../components/mindgames/AnxietyMonster.jsx'
import GratitudeGarden from '../components/mindgames/GratitudeGarden.jsx'
import GroundingHunt from '../components/mindgames/GroundingHunt.jsx'
import ThoughtTraffic from '../components/mindgames/ThoughtTraffic.jsx'

// ─── Rich Game Data ──────────────────────────────────────────────────────────
const GAMES = [
  {
    key: 'cloud-burst',
    title: 'Thought Cloud Burst',
    subtitle: 'Release intrusive thoughts',
    description: 'Pop floating thought bubbles one by one to externalize overthinking and clear mental clutter.',
    icon: Cloud,
    emoji: '☁️',
    color: '#7F77DD',
    gradient: 'from-[#7F77DD]/20 via-[#7F77DD]/5 to-transparent',
    borderColor: 'rgba(127, 119, 221, 0.25)',
    duration: '2 min',
    category: 'overthinking',
    categoryLabel: 'Overthinking',
    bestFor: 'Intrusive Thoughts & Worry',
    moods: ['anxious', 'racing', 'overwhelmed'],
    recommendationReason: 'Ideal for popping away racing thoughts when your brain feels crowded.',
    component: ThoughtCloudBurst,
  },
  {
    key: 'anxiety-monster',
    title: 'Anxiety Monster Shrinker',
    subtitle: 'De-escalate acute fear',
    description: 'Feed an anxious monster calming reframes and deep breaths to watch it shrink into harmlessness.',
    icon: Ghost,
    emoji: '👾',
    color: '#E24B4A',
    gradient: 'from-[#E24B4A]/20 via-[#E24B4A]/5 to-transparent',
    borderColor: 'rgba(226, 75, 74, 0.25)',
    duration: '3 min',
    category: 'quick-reset',
    categoryLabel: 'Quick Reset',
    bestFor: 'Panic & High Anxiety',
    moods: ['panicked', 'anxious', 'scared'],
    recommendationReason: 'Recommended when panic or heavy tension takes over your body.',
    component: AnxietyMonster,
  },
  {
    key: 'grounding-hunt',
    title: '5-4-3-2-1 Sensory Grounding',
    subtitle: 'Anchor yourself in the present',
    description: 'A guided tactile search through your 5 senses to break dissociation and restore calm.',
    icon: Compass,
    emoji: '🌿',
    color: '#EF9F27',
    gradient: 'from-[#EF9F27]/20 via-[#EF9F27]/5 to-transparent',
    borderColor: 'rgba(239, 159, 39, 0.25)',
    duration: '3 min',
    category: 'grounding',
    categoryLabel: 'Grounding',
    bestFor: 'Dissociation & Overwhelm',
    moods: ['overwhelmed', 'spaced-out', 'stressed'],
    recommendationReason: 'Saves you from emotional spirals by anchoring your awareness to physical reality.',
    component: GroundingHunt,
  },
  {
    key: 'gratitude-garden',
    title: 'Gratitude Garden',
    subtitle: 'Nurture positive perspective',
    description: 'Plant seeds of thankfulness and watch your personal garden bloom with every positive memory.',
    icon: Flower2,
    emoji: '🌸',
    color: '#5DCAA5',
    gradient: 'from-[#5DCAA5]/20 via-[#5DCAA5]/5 to-transparent',
    borderColor: 'rgba(93, 202, 165, 0.25)',
    duration: '2 min',
    category: 'gratitude',
    categoryLabel: 'Gratitude',
    bestFor: 'Low Mood & Pessimism',
    moods: ['down', 'sad', 'empty'],
    recommendationReason: 'Gentle shift to remind you of the subtle beauty and good still present in your life.',
    component: GratitudeGarden,
  },
  {
    key: 'thought-traffic',
    title: 'Thought Traffic Control',
    subtitle: 'Sort & reframe thoughts',
    description: 'Categorize fast-moving thoughts into helpful, neutral, or unhelpful lanes with calm detachment.',
    icon: Signpost,
    emoji: '🚥',
    color: '#D4537E',
    gradient: 'from-[#D4537E]/20 via-[#D4537E]/5 to-transparent',
    borderColor: 'rgba(212, 83, 126, 0.25)',
    duration: '3 min',
    category: 'overthinking',
    categoryLabel: 'Overthinking',
    bestFor: 'Decision Paralysis & Rumination',
    moods: ['confused', 'stuck', 'racing'],
    recommendationReason: 'Perfect when your mind feels like a chaotic intersection of competing thoughts.',
    component: ThoughtTraffic,
  },
]

// ─── Categories Filter Configuration ─────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All Exercises', icon: Sparkles },
  { id: 'quick-reset', label: 'Quick Reset', icon: Zap },
  { id: 'overthinking', label: 'Overthinking', icon: Cloud },
  { id: 'grounding', label: 'Grounding', icon: Compass },
  { id: 'gratitude', label: 'Gratitude', icon: Flower2 },
]

// ─── Mood Options for Interactive Check-In ──────────────────────────────────
const MOOD_CHECKINS = [
  { id: 'anxious', label: 'Anxious', emoji: '🌀', recommendedKey: 'anxiety-monster' },
  { id: 'racing', label: 'Racing Thoughts', emoji: '⚡', recommendedKey: 'cloud-burst' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '🌊', recommendedKey: 'grounding-hunt' },
  { id: 'down', label: 'Feeling Down', emoji: '🌧️', recommendedKey: 'gratitude-garden' },
  { id: 'stuck', label: 'Stuck in Head', emoji: '🚥', recommendedKey: 'thought-traffic' },
]

export default function MindGames() {
  const [activeKey, setActiveKey] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedMood, setSelectedMood] = useState(null)
  const [stats, setStats] = useState({ totalResets: 0, minutesSpent: 0, streak: 1 })
  const [lastPlayed, setLastPlayed] = useState(null)

  // Load persistence stats & last played from localStorage
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('mm_games_stats')
      if (savedStats) setStats(JSON.parse(savedStats))

      const savedLast = localStorage.getItem('mm_games_last_played')
      if (savedLast) setLastPlayed(JSON.parse(savedLast))
    } catch (e) {
      console.error('Error loading game stats:', e)
    }
  }, [])

  // Handle starting a game
  const handleStartGame = (gameKey) => {
    setActiveKey(gameKey)

    const game = GAMES.find(g => g.key === gameKey)
    if (!game) return

    // Update stats optimistically
    const newStats = {
      totalResets: stats.totalResets + 1,
      minutesSpent: stats.minutesSpent + parseInt(game.duration),
      streak: stats.streak || 1,
    }
    setStats(newStats)
    const lastObj = { key: game.key, title: game.title, color: game.color, timestamp: Date.now() }
    setLastPlayed(lastObj)

    try {
      localStorage.setItem('mm_games_stats', JSON.stringify(newStats))
      localStorage.setItem('mm_games_last_played', JSON.stringify(lastObj))
    } catch (e) {
      console.error('Error saving game stats:', e)
    }
  }

  const activeGame = GAMES.find(g => g.key === activeKey)

  // AI Recommendation logic based on user selected mood or default
  const recommendedGame = selectedMood
    ? GAMES.find(g => g.key === MOOD_CHECKINS.find(m => m.id === selectedMood)?.recommendedKey)
    : GAMES[0]

  const filteredGames = selectedCategory === 'all'
    ? GAMES
    : GAMES.filter(g => g.category === selectedCategory)

  // ─── ACTIVE GAME VIEW ───────────────────────────────────────────────────────
  if (activeGame) {
    const GameComponent = activeGame.component
    return (
      <div className="min-h-screen py-6 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Distraction-free top navigation bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <button
            onClick={() => setActiveKey(null)}
            className="flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-xl bg-surface border border-white/10 text-text/70 hover:text-text hover:bg-white/10 transition-all duration-200"
          >
            <ArrowLeft size={16} /> Exit Exercise
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider bg-surface border border-white/10 text-text/60">
              {activeGame.categoryLabel}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full text-white/80" style={{ background: `${activeGame.color}30` }}>
              ⏱️ {activeGame.duration}
            </span>
          </div>
        </div>

        {/* Ambient Game Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 mb-8 text-center relative overflow-hidden border"
          style={{
            background: `linear-gradient(135deg, ${activeGame.color}15 0%, rgba(15,15,19,0.8) 100%)`,
            borderColor: activeGame.borderColor,
          }}
        >
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg" style={{ background: `${activeGame.color}25`, border: `1px solid ${activeGame.color}50` }}>
            <span className="text-2xl">{activeGame.emoji}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">{activeGame.title}</h1>
          <p className="text-sm text-text/60 max-w-lg mx-auto">{activeGame.description}</p>
        </motion.div>

        {/* Game Active Container */}
        <motion.div
          key={activeGame.key}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl p-6 sm:p-8 bg-surface/70 border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          <GameComponent />
        </motion.div>
      </div>
    )
  }

  // ─── MAIN DASHBOARD VIEW ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* ─── Hero Welcoming Section ────────────────────────────────────────── */}
      <section className="pt-8 pb-10 relative">
        {/* Soft Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 blur-[120px] pointer-events-none -z-10 rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary uppercase tracking-widest mb-4">
            <Sparkles size={13} />
            <span>Mindful Micro-Resets</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-3">
            Your Quiet Corner
          </h1>

          <p className="text-base text-text/60 leading-relaxed font-normal">
            Short, gentle interactive experiences designed to pause intrusive thoughts, dissolve anxiety, and bring you back to clarity.
          </p>
        </motion.div>

        {/* Mindful Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 grid grid-cols-3 gap-3 max-w-lg mx-auto p-3 rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-md text-center"
        >
          <div className="p-2 border-r border-white/5">
            <div className="text-lg font-bold text-text flex items-center justify-center gap-1">
              <Trophy size={15} className="text-yellow-400" />
              {stats.totalResets}
            </div>
            <div className="text-[11px] text-text/50 uppercase tracking-wider font-medium">Resets Done</div>
          </div>

          <div className="p-2 border-r border-white/5">
            <div className="text-lg font-bold text-text flex items-center justify-center gap-1">
              <Clock size={15} className="text-accent" />
              {stats.minutesSpent}m
            </div>
            <div className="text-[11px] text-text/50 uppercase tracking-wider font-medium">Mindful Min</div>
          </div>

          <div className="p-2">
            <div className="text-lg font-bold text-text flex items-center justify-center gap-1">
              <Flame size={15} className="text-orange-400" />
              {stats.streak}d
            </div>
            <div className="text-[11px] text-text/50 uppercase tracking-wider font-medium">Peace Streak</div>
          </div>
        </motion.div>
      </section>

      {/* ─── Interactive Mood Check-In & AI Recommendation ─────────────────── */}
      <section className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl p-6 sm:p-7 border border-white/10 bg-gradient-to-br from-surface via-surface/80 to-surface/40 backdrop-blur-xl shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
                <HeartHandshake size={14} />
                <span>How is your mind feeling right now?</span>
              </div>
              <p className="text-sm text-text/70">
                Select an emotion below to get a tailored micro-reset recommendation:
              </p>
            </div>

            {selectedMood && (
              <button
                onClick={() => setSelectedMood(null)}
                className="text-xs text-text/40 hover:text-text underline transition-colors"
              >
                Reset check-in
              </button>
            )}
          </div>

          {/* Mood Selector Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {MOOD_CHECKINS.map(mood => {
              const active = selectedMood === mood.id
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(active ? null : mood.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 border ${
                    active
                      ? 'bg-accent/20 border-accent text-text shadow-lg scale-105'
                      : 'bg-black/20 border-white/5 text-text/60 hover:text-text hover:border-white/20'
                  }`}
                >
                  <span className="text-sm">{mood.emoji}</span>
                  {mood.label}
                </button>
              )
            })}
          </div>

          {/* AI Recommendation Highlight Card */}
          {recommendedGame && (
            <div
              className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              style={{
                background: `linear-gradient(135deg, ${recommendedGame.color}15 0%, rgba(0,0,0,0.2) 100%)`,
                borderColor: recommendedGame.borderColor,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: `${recommendedGame.color}25` }}>
                  <span className="text-2xl">{recommendedGame.emoji}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${recommendedGame.color}30`, color: recommendedGame.color }}>
                      Recommended for you
                    </span>
                    <span className="text-xs text-text/40">• {recommendedGame.duration}</span>
                  </div>
                  <h4 className="text-base font-semibold text-text mt-0.5">{recommendedGame.title}</h4>
                  <p className="text-xs text-text/60">{recommendedGame.recommendationReason}</p>
                </div>
              </div>

              <button
                onClick={() => handleStartGame(recommendedGame.key)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-xs text-white transition-all hover:scale-105 flex items-center justify-center gap-2 flex-shrink-0 shadow-lg"
                style={{ background: recommendedGame.color }}
              >
                <Play size={14} fill="currentColor" /> Begin Reset
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* ─── Continue Last Session Banner (if applicable) ──────────────────── */}
      {lastPlayed && !activeKey && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-2xl bg-surface/50 border border-white/5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${lastPlayed.color}20` }}>
              <RefreshCw size={14} style={{ color: lastPlayed.color }} />
            </div>
            <div>
              <p className="text-xs text-text/50">Continue where you left off</p>
              <p className="text-sm font-medium text-text">{lastPlayed.title}</p>
            </div>
          </div>
          <button
            onClick={() => handleStartGame(lastPlayed.key)}
            className="text-xs px-3.5 py-1.5 rounded-lg border border-white/10 text-text/80 hover:text-text hover:bg-white/10 transition-colors"
          >
            Resume
          </button>
        </motion.div>
      )}

      {/* ─── Category Filter Navigation ────────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const active = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap border ${
                  active
                    ? 'bg-primary/20 border-primary text-primary shadow-md'
                    : 'bg-surface border-white/5 text-text/50 hover:text-text hover:border-white/15'
                }`}
              >
                <Icon size={14} />
                {cat.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* ─── Rich Exercises Grid ───────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredGames.map((game, index) => {
            const Icon = game.icon
            return (
              <motion.div
                key={game.key}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group relative rounded-3xl p-6 flex flex-col justify-between border border-white/10 bg-surface/60 backdrop-blur-lg hover:border-white/20 transition-all duration-300 hover:shadow-2xl overflow-hidden"
              >
                {/* Background Gradient Accent on Hover */}
                <div
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundImage: `linear-gradient(135deg, ${game.color}15 0%, transparent 60%)` }}
                />

                <div>
                  {/* Top metadata badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border" style={{ background: `${game.color}15`, borderColor: `${game.color}30`, color: game.color }}>
                      {game.categoryLabel}
                    </span>
                    <span className="text-xs text-text/50 font-medium flex items-center gap-1">
                      <Clock size={12} /> {game.duration}
                    </span>
                  </div>

                  {/* Header Title & Icon */}
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner transition-transform group-hover:scale-110 duration-300"
                      style={{ background: `${game.color}20`, border: `1px solid ${game.color}40` }}
                    >
                      <span className="text-2xl">{game.emoji}</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-xs font-medium text-text/50">{game.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text/65 leading-relaxed mb-4">
                    {game.description}
                  </p>

                  {/* Best For Tag */}
                  <div className="mb-6 flex items-center gap-1.5 text-[11px] text-text/50 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: game.color }} />
                    Best for: <span className="text-text/75">{game.bestFor}</span>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <button
                  onClick={() => handleStartGame(game.key)}
                  className="w-full py-3 px-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all duration-300 group-hover:shadow-lg"
                  style={{
                    background: `${game.color}15`,
                    borderColor: `${game.color}35`,
                    color: 'var(--color-text)',
                  }}
                >
                  <Play size={13} fill="currentColor" className="transition-transform group-hover:scale-110" />
                  Begin Reset
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </section>

      {/* ─── Footer Quote / Encouragement ──────────────────────────────────── */}
      <footer className="mt-16 text-center border-t border-white/5 pt-8">
        <p className="text-xs text-text/40 italic max-w-md mx-auto">
          "Resting your mind is not a waste of time. It is how you rebuild your strength for what comes next."
        </p>
      </footer>
    </div>
  )
}
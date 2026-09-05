import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Sparkles, Flame, BookOpen, Wind, Flower2, Gamepad2,
  ArrowRight, Feather, NotebookPen
} from 'lucide-react'
import { useAuth } from '../lib/AuthContext.jsx'
import * as api from '../lib/api.js'
import { format, differenceInCalendarDays, subDays, parseISO } from 'date-fns'

// ─── Original, in-house affirmations & reflections (rotate daily) ──────────
const AFFIRMATIONS = [
  "You don't have to have it figured out to be doing okay.",
  "Whatever today held, you showed up. That counts.",
  "Small steps still move you forward.",
  "It's safe to slow down here.",
  "You're allowed to take up space with how you feel.",
  "Progress doesn't have to look impressive to be real.",
  "You've gotten through every hard day so far.",
  "Rest is not something you have to earn.",
  "Your feelings make sense, even the confusing ones.",
  "You're doing better than the voice in your head says.",
  "One gentle breath is enough to begin again.",
  "You are allowed to be a work in progress.",
  "Nothing about today has to be perfect for it to matter.",
  "You can be proud of yourself and still have more to do.",
  "Being kind to yourself is not the same as letting yourself off easy.",
]

const QUOTES = [
  "The quiet moments count as much as the loud ones.",
  "Healing rarely moves in a straight line — and that's alright.",
  "Noticing a feeling is the first act of taking care of it.",
  "A slower pace is still a pace forward.",
  "You don't need permission to feel what you feel.",
  "What you write down tonight, your future self may thank you for.",
  "Some days ask for effort. Others just ask for rest.",
  "You're allowed to outgrow versions of yourself without judging them.",
  "Comfort and growth can share the same day.",
  "Every entry you write is a small act of self-respect.",
]

function dayIndex(len) {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const diff = new Date() - start
  const dayOfYear = Math.floor(diff / 86400000)
  return dayOfYear % len
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Still up'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good evening'
}

function computeStreak(entries) {
  if (!entries.length) return 0
  const days = [...new Set(entries.map(e => format(parseISO(e.date), 'yyyy-MM-dd')))]
    .sort((a, b) => new Date(b) - new Date(a))
  const today = new Date()
  let streak = 0
  let cursor = today
  // Allow the streak to still count if today has no entry yet, as long as yesterday does.
  if (differenceInCalendarDays(today, parseISO(days[0])) > 1) return 0
  for (const d of days) {
    const diff = differenceInCalendarDays(cursor, parseISO(d))
    if (diff === 0 || diff === 1) {
      streak += 1
      cursor = parseISO(d)
    } else {
      break
    }
  }
  return streak
}

function buildWeekData(entries) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const key = format(date, 'yyyy-MM-dd')
    const dayEntries = entries.filter(e => format(parseISO(e.date), 'yyyy-MM-dd') === key)
    const avg = dayEntries.length
      ? Math.round((dayEntries.reduce((s, e) => s + (e.mood_score ?? e.mood ?? 5), 0) / dayEntries.length) * 10) / 10
      : null
    days.push({ label: format(date, 'EEEEE'), fullLabel: format(date, 'EEE, MMM d'), distress: avg })
  }
  return days
}

const MOOD_TAPS = [
  { id: 'calm', emoji: '🌿', label: 'Calm' },
  { id: 'okay', emoji: '🙂', label: 'Okay' },
  { id: 'tired', emoji: '😮\u200d💨', label: 'Tired' },
  { id: 'anxious', emoji: '🌀', label: 'Anxious' },
  { id: 'low', emoji: '🌧️', label: 'Low' },
]

const MOOD_RESPONSES = {
  calm: "That's lovely to hear. Let this feeling take up space today.",
  okay: "Okay is a completely valid place to be. No need to perform more than that.",
  tired: "Your energy matters as much as your output. Be gentle with yourself.",
  anxious: "That's a lot to carry. A few slow breaths or a grounding exercise might help right now.",
  low: "Thank you for naming it. You don't have to push through this alone.",
}

function SkeletonBlock({ className }) {
  return <div className={`animate-pulse rounded-standard bg-surface ${className}`} />
}

function CardShell({ children, className = '' }) {
  return (
    <div className={`wellness-card rounded-[24px] p-5 bg-white/65 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pickedMood, setPickedMood] = useState(null)

  useEffect(() => {
    let mounted = true
    api.getEntries()
      .then(data => { if (mounted) setEntries(data) })
      .catch(e => { if (mounted) setError(e.message) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const affirmation = useMemo(() => AFFIRMATIONS[dayIndex(AFFIRMATIONS.length)], [])
  const quote = useMemo(() => QUOTES[dayIndex(QUOTES.length)], [])
  const streak = useMemo(() => computeStreak(entries), [entries])
  const weekData = useMemo(() => buildWeekData(entries), [entries])
  const recent = useMemo(() => entries.slice(0, 3), [entries])
  const latestWithInsight = useMemo(() => entries.find(e => e.summary), [entries])
  const firstName = user?.name?.split(' ')[0]

  const shortcuts = [
    { icon: Wind, label: 'Breathe & ground', desc: 'A guided moment to settle your body', color: '#EF9F27', to: '/mind-games?game=anxiety-monster' },
    { icon: Flower2, label: 'Gratitude Garden', desc: 'Notice something good, however small', color: '#5DCAA5', to: '/mind-games?game=gratitude-garden' },
    { icon: NotebookPen, label: 'Write a reflection', desc: 'Pour out whatever is on your mind', color: '#7F77DD', to: '/journal' },
    { icon: Gamepad2, label: 'Mind Games', desc: 'Two-minute resets for a racing mind', color: '#D4537E', to: '/mind-games' },
  ]

  return (
    <div className={`sanctuary-dashboard max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pb-16 ${pickedMood ? `sanctuary-dashboard--${pickedMood}` : ''}`}>
      {/* ── Signature hero: greeting + daily affirmation ── */}
      <div className="dashboard-hero relative min-h-[330px] rounded-[30px] p-7 sm:p-10 mb-5 overflow-hidden fade-up shadow-[0_18px_45px_rgba(36,59,58,0.08)]">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/20 blur-[90px] animate-breathe pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-accent/15 blur-[80px] animate-glow pointer-events-none" />
        <div className="relative max-w-lg pt-3 sm:pt-8">
          <p className="text-xs font-semibold tracking-wide text-primary mb-3">
            {getGreeting()}, {firstName || 'friend'} <span aria-hidden="true">🌿</span>
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-text leading-[1.08] max-w-xl">
            {affirmation}
          </h1>
          <p className="text-sm text-text/60 mt-5 max-w-md leading-relaxed">"{quote}"</p>
        </div>
      </div>

      <div className="wellness-card flex flex-col sm:flex-row sm:items-center gap-4 justify-between rounded-[22px] p-4 sm:px-5 mb-5 bg-white/75">
        <div>
          <p className="text-sm font-semibold text-text">How are you feeling today?</p>
          <p className="text-xs text-text/45 mt-1">Write, speak, or share a moment...</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/journal')} className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/8 text-primary" aria-label="Write a journal entry"><NotebookPen size={15} /></button>
          <button onClick={() => navigate('/videos')} className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/8 text-primary" aria-label="Record a video reflection"><Feather size={15} /></button>
          <button onClick={() => navigate('/journal')} className="inline-flex items-center gap-2 rounded-full bg-primary text-white text-xs font-semibold px-5 py-3 hover:-translate-y-0.5 transition-transform">Start Journaling <ArrowRight size={14} /></button>
        </div>
      </div>

      {error && <p className="text-xs mb-4 text-red-400">{error}</p>}

      {/* ── Mood check-in + AI insight ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <CardShell>
          <p className="text-sm font-semibold text-text mb-3">A gentle check-in</p>
          {!pickedMood ? (
            <div className="flex flex-wrap gap-2">
              {MOOD_TAPS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setPickedMood(m.id)}
                  aria-pressed={pickedMood === m.id}
                  className="mood-orb flex flex-col items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-white/55 border border-white/70 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <span className="text-xl leading-none">{m.emoji}</span>
                  <span className="text-[10px] text-text/60">{m.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="fade-up">
              <p className="text-sm text-text/80 leading-relaxed mb-3">{MOOD_RESPONSES[pickedMood]}</p>
              <div className="flex gap-2">
                <button onClick={() => navigate('/journal')} className="text-xs px-3.5 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
                  Write more about it
                </button>
                <button onClick={() => setPickedMood(null)} className="text-xs px-3.5 py-2 rounded-xl border border-white/10 text-text/50 hover:text-text/80 transition-colors">
                  Check in again
                </button>
              </div>
            </div>
          )}
          <p className="text-[10px] text-text/30 mt-3">This quick check-in stays private to this moment — it isn't saved as a journal entry.</p>
        </CardShell>

        <CardShell>
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles size={13} className="text-primary" />
            <p className="text-sm font-semibold text-text">A little something to notice</p>
          </div>
          {loading ? (
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-4/5" />
            </div>
          ) : latestWithInsight ? (
            <>
              <p className="text-sm text-text/80 leading-relaxed">{latestWithInsight.summary}</p>
              <p className="text-[10px] text-text/40 mt-3">From your reflection on {format(parseISO(latestWithInsight.date), 'MMM d')}</p>
            </>
          ) : (
            <p className="text-sm text-text/50 leading-relaxed">
              Write your first reflection and MindMirror will gently surface patterns and insights here.
            </p>
          )}
        </CardShell>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <CardShell className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-orange-500/10 flex-shrink-0">
            <Flame size={18} className="text-orange-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-semibold text-text">{loading ? '—' : streak}</div>
            <div className="text-[11px] text-text/50">{t('dashboard.streak')}</div>
          </div>
        </CardShell>
        <CardShell className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
            <BookOpen size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-semibold text-text">{loading ? '—' : entries.length}</div>
            <div className="text-[11px] text-text/50">{t('dashboard.totalEntries')}</div>
          </div>
        </CardShell>
        <CardShell className="flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-accent/10 flex-shrink-0">
            <Feather size={18} className="text-accent" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-semibold text-text">
              {loading || !entries.length ? '—' : entries.filter(e => e.resolved).length}
            </div>
            <div className="text-[11px] text-text/50">Moments resolved</div>
          </div>
        </CardShell>
      </div>

      {/* ── Weekly mood overview ── */}
      <CardShell className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-text/50 mb-1">{t('dashboard.weeklyMood')}</p>
        <p className="text-[10px] text-text/40 mb-3">Lower is calmer. Days without a reflection are left blank.</p>
        {loading ? (
          <SkeletonBlock className="h-40 w-full" />
        ) : entries.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-xs text-text/40">
            Your weekly overview will appear once you've written a few reflections.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weekData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface-solid, #1a1825)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                formatter={(v) => [v == null ? 'No entry' : `${v}/10`, 'Distress']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ''}
              />
              <Area type="monotone" dataKey="distress" stroke="var(--color-primary)" strokeWidth={2} fill="url(#moodFill)" connectNulls={false} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardShell>

      {/* ── Recent journals ── */}
      <CardShell className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-text">Your recent reflections</p>
          <button onClick={() => navigate('/journal')} className="text-xs text-primary flex items-center gap-1 hover:opacity-80 transition-opacity">
            View all <ArrowRight size={12} />
          </button>
        </div>
        {loading ? (
          <div className="space-y-2">
            <SkeletonBlock className="h-14 w-full" />
            <SkeletonBlock className="h-14 w-full" />
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text/50 mb-3">{t('dashboard.noEntries')}</p>
            <button onClick={() => navigate('/journal')} className="text-xs px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
              Write your first reflection
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map(e => (
              <button
                key={e._id}
                onClick={() => navigate('/journal')}
                className="memory-card text-left p-4 rounded-[18px]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-text/40">{format(parseISO(e.date), 'MMM d, yyyy')}</span>
                  <span className="text-[10px] text-text/40">· {e.mood_score ?? e.mood ?? '—'}/10</span>
                </div>
                <p className="text-sm font-semibold text-text/80 line-clamp-1">{e.text?.split(/[.!?]/)[0] || 'A moment from your day'}</p>
                <p className="text-[11px] text-text/45 mt-1 line-clamp-1">{e.text}</p>
              </button>
            ))}
          </div>
        )}
      </CardShell>

      {/* ── Shortcuts ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {shortcuts.map(({ icon: Icon, label, desc, color, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="wellness-card text-left rounded-[22px] p-4 bg-white/65 hover:-translate-y-1 transition-all group"
          >
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ background: `${color}20` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-xs font-semibold text-text mb-1">{label}</p>
            <p className="text-[10px] text-text/45 leading-relaxed">{desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_.7fr] gap-4 mt-4">
        <CardShell className="relative overflow-hidden bg-[#f8eee5]/75">
          <div className="absolute -right-8 -bottom-12 text-[110px] opacity-15" aria-hidden="true">🌿</div>
          <p className="text-[10px] uppercase tracking-[.18em] text-accent font-semibold mb-3">A thought to carry with you</p>
          <p className="font-serif text-2xl text-text leading-tight max-w-sm">“A peaceful mind creates a beautiful life.”</p>
          <p className="text-[11px] text-text/45 mt-4">Come back to this whenever you need a softer moment.</p>
        </CardShell>
        <CardShell className="bg-[#e8f0eb]/75">
          <p className="text-sm font-semibold text-text">Your progress, not perfection</p>
          <p className="text-xs text-text/50 mt-1">Every reflection is a small act of self-care.</p>
          <div className="flex items-end gap-2 h-20 mt-5">
            {weekData.map(({ distress, label }) => {
              const height = distress == null ? 12 : Math.max(18, Math.min(100, distress * 9))
              return <div key={label} className="flex-1 rounded-t-full bg-primary/20" style={{ height: `${height}%` }}><div className="h-2 rounded-full bg-primary/45" /></div>
            })}
          </div>
          <p className="text-[10px] text-text/40 mt-3">A gentle view of your week</p>
        </CardShell>
      </div>
    </div>
  )
}

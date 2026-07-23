import { useState, useEffect } from 'react'
import * as api from '../lib/api.js'
import { COPING_LABELS } from '../lib/api.js'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts'
import { format } from 'date-fns'
import { TrendingDown, TrendingUp, CheckCircle2, Zap, Star, Heart, Minus, Sprout } from 'lucide-react'

const MOOD_COLOR = m =>
  m == null ? '#888' : m <= 3 ? '#5DCAA5' : m <= 5 ? '#97C459' : m <= 7 ? '#EF9F27' : '#E24B4A'

const CustomDot = (props) => {
  const { cx, cy, payload } = props
  const color = MOOD_COLOR(payload.mood)
  return <circle cx={cx} cy={cy} r={4.5} fill={color} stroke="#0f0f13" strokeWidth={2} />
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0]?.value
    const color = MOOD_COLOR(val)
    return (
      <div className="rounded-xl px-3 py-2 text-xs"
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-surface-border)',
          backdropFilter: 'blur(12px)',
        }}>
        <p className="font-semibold mb-0.5" style={{ color: 'var(--color-text)' }}>{label}</p>
        <p style={{ color }}>{val != null ? `${val}/10 distress` : 'no data'}</p>
      </div>
    )
  }
  return null
}

export default function Growth() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAnalyticsDashboard().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full animate-breathe flex items-center justify-center"
        style={{ background: 'rgba(93,202,165,0.15)', border: '1px solid rgba(93,202,165,0.25)' }}>
        <Sprout size={18} style={{ color: '#5DCAA5' }} />
      </div>
      <p className="text-sm" style={{ color: 'var(--color-text-faint)' }}>Counting your wins…</p>
    </div>
  )

  const {
    moodTrend = [],
    copingEffectiveness = [],
    totalEntries = 0,
    resolvedCount = 0,
    currentTrend = 'unknown',
  } = data || {}

  const trendData = moodTrend.map(e => ({
    date: format(new Date(e.date), 'MMM d'),
    mood: e.mood_score,
  }))

  const topCoping = [...copingEffectiveness].slice(0, 4)

  const TREND_CONFIG = {
    improving: { label: 'Improving 🌱', color: '#5DCAA5', icon: TrendingUp, desc: 'Your distress is gradually easing. Keep going.' },
    worsening: { label: 'Needs care 🌧', color: '#EF9F27', icon: TrendingDown, desc: 'You\'re carrying more lately. That\'s okay — you\'re still here.' },
    stable: { label: 'Steady 🌤', color: '#AFA9EC', icon: Minus, desc: 'You\'re holding consistent ground. Stability is strength.' },
    unknown: { label: 'Building history ✨', color: 'var(--color-text-muted)', icon: Star, desc: 'Keep journaling and your trend will emerge.' },
  }

  const trendConf = TREND_CONFIG[currentTrend] || TREND_CONFIG.unknown
  const TrendIcon = trendConf.icon

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">

      {/* ── Hero Header ─────────────────────────────────── */}
      <div className="relative mb-8 overflow-hidden rounded-3xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(93,202,165,0.1) 0%, rgba(139,130,236,0.07) 100%)',
          border: '1px solid rgba(93,202,165,0.2)',
        }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[60px] pointer-events-none"
          style={{ background: 'rgba(93,202,165,0.2)' }} />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(93,202,165,0.2)' }}>
              <Sprout size={15} style={{ color: '#5DCAA5' }} />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#5DCAA5', opacity: 0.85 }}>Your Growth Story</span>
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Look how far you've come
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)', maxWidth: '380px' }}>
            Every journal entry is evidence of your courage. Here's what your resilience looks like in numbers.
          </p>
        </div>
      </div>

      {/* ── Stats Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          {
            label: 'Moments captured',
            value: totalEntries,
            icon: Star,
            color: '#AFA9EC',
            desc: 'entries written',
          },
          {
            label: 'Things resolved',
            value: resolvedCount,
            icon: CheckCircle2,
            color: '#5DCAA5',
            desc: 'moved through',
          },
          {
            label: 'Current trend',
            value: trendConf.label,
            icon: TrendIcon,
            color: trendConf.color,
            small: true,
            desc: '',
          },
        ].map(({ label, value, icon: Icon, color, small, desc }) => (
          <div key={label} className="rounded-2xl p-4 transition-all hover:scale-[1.02]"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={12} color={color} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.3px' }}>{label}</span>
            </div>
            <p className={small ? 'text-xs font-semibold leading-snug' : 'text-2xl font-bold'}
              style={{ color }}>
              {value}
            </p>
            {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>{desc}</p>}
          </div>
        ))}
      </div>

      {/* ── Trend Banner ─────────────────────────────────── */}
      <div className="rounded-2xl p-4 mb-5 flex items-start gap-3"
        style={{
          background: `${trendConf.color}0a`,
          border: `1px solid ${trendConf.color}25`,
        }}>
        <TrendIcon size={16} style={{ color: trendConf.color, flexShrink: 0, marginTop: 1 }} />
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {trendConf.desc}
        </p>
      </div>

      {/* ── Distress Chart ───────────────────────────────── */}
      {trendData.length > 1 && (
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Distress over time</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>lower score = calmer days</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData} margin={{ top: 10, right: 8, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7F77DD" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#7F77DD" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'rgba(232,230,240,0.35)' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 10, fill: 'rgba(232,230,240,0.35)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={5} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#7F77DD"
                strokeWidth={2}
                fill="url(#moodGrad)"
                dot={<CustomDot />}
                activeDot={{ r: 6, fill: '#AFA9EC', stroke: '#0f0f13', strokeWidth: 2 }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Coping Strategies ────────────────────────────── */}
      {topCoping.length > 0 && (
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} color="#EF9F27" />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              What helps you most
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {topCoping.map((c, idx) => {
              const pct = Math.max(0, Math.min(100, c.effectivenessScore * 10))
              const barColor = pct >= 70 ? '#5DCAA5' : pct >= 40 ? '#EF9F27' : '#AFA9EC'
              return (
                <div key={c.strategy}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      {COPING_LABELS[c.strategy] || c.strategy}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                        used {c.timesUsed}×
                      </span>
                      <span className="text-xs font-semibold" style={{ color: barColor }}>
                        {c.effectivenessScore}/10
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                      }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Resilience Story ─────────────────────────────── */}
      <div className="rounded-2xl p-6"
        style={{ background: 'rgba(93,202,165,0.06)', border: '1px solid rgba(93,202,165,0.18)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Heart size={14} style={{ color: '#5DCAA5' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#5DCAA5' }}>Your resilience, in words</h2>
        </div>
        <ul className="space-y-2.5">
          <li className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            → You've logged <strong style={{ color: 'var(--color-text)' }}>{totalEntries} emotional moments.</strong>{' '}
            That's {totalEntries} times you chose self-awareness over avoidance.
          </li>
          <li className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            → <strong style={{ color: 'var(--color-text)' }}>{resolvedCount} of them resolved.</strong>{' '}
            {resolvedCount > 0 ? 'You faced them and moved through.' : 'Your first resolution is on the way.'}
          </li>
          {topCoping[0] && (
            <li className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              → Your most effective coping strategy so far:{' '}
              <strong style={{ color: 'var(--color-text)' }}>
                {COPING_LABELS[topCoping[0].strategy] || topCoping[0].strategy}.
              </strong>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
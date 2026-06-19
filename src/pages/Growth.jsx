import { useState, useEffect } from 'react'
import * as api from '../lib/api.js'
import { COPING_LABELS } from '../lib/api.js'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format } from 'date-fns'
import { TrendingDown, CheckCircle2, Zap, Star } from 'lucide-react'

const MOOD_COLOR = m => m == null ? '#888' : m <= 3 ? '#1D9E75' : m <= 5 ? '#97C459' : m <= 7 ? '#EF9F27' : '#E24B4A'

export default function Growth() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAnalyticsDashboard().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="max-w-2xl mx-auto px-6 py-8"><p className="text-sm" style={{ color: 'rgba(232,230,240,0.4)' }}>Loading growth data…</p></div>

  const { moodTrend = [], copingEffectiveness = [], totalEntries = 0, resolvedCount = 0, currentTrend = 'unknown' } = data || {}

  const trendData = moodTrend.map(e => ({ date: format(new Date(e.date), 'MMM d'), mood: e.mood_score }))
  const topCoping = [...copingEffectiveness].slice(0, 4)

  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    const color = MOOD_COLOR(payload.mood)
    return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#0f0f13" strokeWidth={2} />
  }

  const TREND_DISPLAY = { improving: { label: 'Improving', color: '#5DCAA5' }, worsening: { label: 'Needs attention', color: '#E24B4A' }, stable: { label: 'Stable', color: '#AFA9EC' }, unknown: { label: 'Building history', color: 'rgba(232,230,240,0.5)' } }
  const trendDisplay = TREND_DISPLAY[currentTrend] || TREND_DISPLAY.unknown

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: '#e8e6f0' }}>Growth Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(232,230,240,0.45)' }}>Evidence of your resilience</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Entries', value: totalEntries, icon: Star, color: '#AFA9EC' },
          { label: 'Resolved', value: `${resolvedCount}/${totalEntries}`, icon: CheckCircle2, color: '#5DCAA5' },
          { label: 'Current trend', value: trendDisplay.label, icon: TrendingDown, color: trendDisplay.color, small: true },
        ].map(({ label, value, icon: Icon, color, small }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={12} color={color} />
              <span className="text-xs" style={{ color: 'rgba(232,230,240,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            </div>
            <p className={small ? 'text-sm font-semibold' : 'text-2xl font-semibold'} style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {trendData.length > 1 && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-medium" style={{ color: '#e8e6f0' }}>Distress over time</h2>
            <span className="text-xs" style={{ color: 'rgba(232,230,240,0.35)' }}>lower = calmer</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData} margin={{ top: 12, right: 8, bottom: 0, left: -20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(232,230,240,0.35)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'rgba(232,230,240,0.35)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1921', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v}/10`]} labelStyle={{ color: '#e8e6f0' }} />
              <ReferenceLine y={5} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="mood" stroke="#7F77DD" strokeWidth={2} dot={<CustomDot />} activeDot={{ r: 6, fill: '#AFA9EC' }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {topCoping.length > 0 && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-sm font-medium mb-3 flex items-center gap-1.5" style={{ color: '#e8e6f0' }}>
            <Zap size={13} color="#EF9F27" /> What helps you most
          </h2>
          <div className="flex flex-col gap-3">
            {topCoping.map(c => (
              <div key={c.strategy} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: 'rgba(232,230,240,0.7)' }}>{COPING_LABELS[c.strategy] || c.strategy}</span>
                    <span className="text-xs" style={{ color: 'rgba(232,230,240,0.4)' }}>used {c.timesUsed}×</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, c.effectivenessScore * 10))}%`, background: '#1D9E75', opacity: 0.8 }} />
                  </div>
                </div>
                <span className="text-xs font-medium w-10 text-right" style={{ color: '#5DCAA5' }}>{c.effectivenessScore}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-5" style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.15)' }}>
        <h2 className="text-sm font-medium mb-2" style={{ color: '#5DCAA5' }}>Your resilience in numbers</h2>
        <ul className="text-sm space-y-1.5" style={{ color: 'rgba(232,230,240,0.65)' }}>
          <li>→ You've logged <strong style={{ color: '#e8e6f0' }}>{totalEntries} emotional moments</strong> — that's radical self-awareness.</li>
          <li>→ <strong style={{ color: '#e8e6f0' }}>{resolvedCount} of them resolved.</strong> You moved through them.</li>
          {topCoping[0] && <li>→ <strong style={{ color: '#e8e6f0' }}>{COPING_LABELS[topCoping[0].strategy] || topCoping[0].strategy}</strong> is your most effective coping tool so far.</li>}
        </ul>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import * as api from '../lib/api.js'
import { THEMES, TRIGGERS } from '../lib/api.js'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function Patterns() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getAnalyticsDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="max-w-2xl mx-auto px-6 py-8"><p className="text-sm" style={{ color: 'var(--color-text-faint)' }}>Loading patterns…</p></div>
  if (error) return <div className="max-w-2xl mx-auto px-6 py-8"><p className="text-sm" style={{ color: '#f09595' }}>{error}</p></div>

  const { themeFrequency = [], triggerFrequency = [], totalEntries = 0 } = data || {}

  const barData = themeFrequency.slice(0, 6).map(p => ({
    name: THEMES[p.theme]?.label || p.theme,
    pct: p.pct,
    fill: THEMES[p.theme]?.color || '#7F77DD',
  }))

  const radarData = themeFrequency.slice(0, 6).map(p => ({
    subject: THEMES[p.theme]?.label?.split(' ')[0] || p.theme,
    value: p.pct,
  }))

  const CustomBar = (props) => {
    const { x, y, width, height, fill } = props
    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} opacity={0.85} />
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Notice What Your Mind Has Been Telling You</h1>
        <p className="text-xs mt-1 text-text/50">Recurring themes and emotional constellations across {totalEntries} reflections.</p>
      </div>

      {themeFrequency.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--color-text-faint)' }}>Start journaling to see patterns emerge here.</p>
        </div>
      )}

      {themeFrequency.length > 0 && (
        <>
          <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
            <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--color-text)' }}>Theme frequency</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgba(232,230,240,0.35)' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'rgba(232,230,240,0.6)' }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v}% of entries`]} labelStyle={{ color: 'var(--color-text)' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="pct" shape={<CustomBar />} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {radarData.length >= 3 && (
            <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
              <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--color-text)' }}>Emotional profile</h2>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'rgba(232,230,240,0.5)' }} />
                  <Radar dataKey="value" stroke="#7F77DD" fill="#7F77DD" fillOpacity={0.15} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Triggers */}
          {triggerFrequency.length > 0 && (
            <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
              <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>Common triggers</h2>
              <div className="flex flex-col gap-3">
                {triggerFrequency.map(t => (
                  <div key={t.trigger}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{TRIGGERS[t.trigger] || t.trigger}</span>
                      <span className="text-xs font-medium" style={{ color: '#EF9F27' }}>{t.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: '#EF9F27', opacity: 0.8 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
            <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>Theme breakdown</h2>
            <div className="flex flex-col gap-3">
              {themeFrequency.map(p => (
                <div key={p.theme}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{THEMES[p.theme]?.label || p.theme}</span>
                    <span className="text-xs font-medium" style={{ color: THEMES[p.theme]?.color || '#7F77DD' }}>{p.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: THEMES[p.theme]?.color || '#7F77DD', opacity: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
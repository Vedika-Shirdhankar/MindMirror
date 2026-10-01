import { useState, useEffect } from 'react'
import * as api from '../lib/api.js'
import { THEMES, TRIGGERS } from '../lib/api.js'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts'
import { Activity, Brain, TrendingUp } from 'lucide-react'

const ML_LABEL_META = {
  anxiety: { label: 'Anxiety', color: '#AFA9EC' },
  normal: { label: 'Balanced / Calm', color: '#5DCAA5' },
  depression: { label: 'Low Mood', color: '#7F77DD' },
  stress: { label: 'Stress', color: '#EF9F27' },
  'personality disorder': { label: 'Emotional Dysregulation', color: '#D4537E' },
  bipolar: { label: 'Mood Fluctuations', color: '#E07A5F' },
  suicidal: { label: 'High Distress', color: '#E24B4A' },
}

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

  const { themeFrequency = [], triggerFrequency = [], totalEntries = 0, mlClassification = [], mlConfidenceTrend = [], mlClassScores = [], mlEntriesAnalyzed = 0 } = data || {}

  const barData = themeFrequency.slice(0, 6).map(p => ({
    name: THEMES[p.theme]?.label || p.theme,
    pct: p.pct,
    fill: THEMES[p.theme]?.color || '#7F77DD',
  }))

  const radarData = themeFrequency.slice(0, 6).map(p => ({
    subject: THEMES[p.theme]?.label?.split(' ')[0] || p.theme,
    value: p.pct,
  }))

  // ML classification pie chart data
  const mlPieData = mlClassification.map(c => ({
    name: ML_LABEL_META[c.label]?.label || c.label,
    value: c.count,
    color: ML_LABEL_META[c.label]?.color || '#7F77DD',
  }))

  // ML softmax radar data
  const mlRadarData = mlClassScores.map(s => ({
    subject: ML_LABEL_META[s.label]?.label?.split(' ')[0] || s.label,
    value: s.avgScore,
  }))

  // ML classification bar data
  const mlBarData = mlClassification.map(c => ({
    name: ML_LABEL_META[c.label]?.label || c.label,
    pct: c.pct,
    confidence: c.avgConfidence,
    fill: ML_LABEL_META[c.label]?.color || '#7F77DD',
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

      {themeFrequency.length === 0 && mlEntriesAnalyzed === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--color-text-faint)' }}>Start journaling to see patterns emerge here.</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* DistilBERT ML Classification Section                                   */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {mlEntriesAnalyzed > 0 && (
        <>
          <div className="mb-6 flex items-center gap-2">
            <Brain size={16} className="text-primary" />
            <h2 className="text-base font-semibold text-text">DistilBERT ML Pattern Analysis</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">{mlEntriesAnalyzed} entries analyzed</span>
          </div>

          {/* ML Classification Distribution (Bar Chart) */}
          <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
            <div className="flex items-center gap-1.5 mb-4">
              <Activity size={13} className="text-primary" />
              <h2 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>ML classification distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mlBarData} layout="vertical" margin={{ left: 8, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgba(232,230,240,0.35)' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'rgba(232,230,240,0.6)' }} axisLine={false} tickLine={false} width={130} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v, name) => {
                    if (name === 'pct') return [`${v}% of entries`, 'Classification']
                    if (name === 'confidence') return [`${v}%`, 'Avg Confidence']
                    return [v]
                  }}
                  labelStyle={{ color: 'var(--color-text)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="pct" shape={<CustomBar />} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-text/30 mt-2 italic">* Classification signals from fine-tuned DistilBERT (7-class, 94.4% accuracy). Not a clinical diagnosis.</p>
          </div>

          {/* ML Softmax Probability Radar */}
          {mlRadarData.length >= 3 && (
            <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
              <div className="flex items-center gap-1.5 mb-4">
                <Brain size={13} className="text-primary" />
                <h2 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>ML emotional signature (avg softmax)</h2>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={mlRadarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'rgba(232,230,240,0.5)' }} />
                  <Radar dataKey="value" stroke="#AFA9EC" fill="#AFA9EC" fillOpacity={0.2} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-text/30 mt-1 italic">Average softmax probability distribution across all journal entries.</p>
            </div>
          )}

          {/* ML Pie Chart */}
          {mlPieData.length > 0 && (
            <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
              <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--color-text)' }}>Classification breakdown</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={mlPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} strokeWidth={0}>
                    {mlPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v, name) => [`${v} entries`, name]}
                    labelStyle={{ color: 'var(--color-text)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(232,230,240,0.6)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ML Confidence Trend Over Time */}
          {mlConfidenceTrend.length >= 2 && (
            <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
              <div className="flex items-center gap-1.5 mb-4">
                <TrendingUp size={13} className="text-primary" />
                <h2 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>ML confidence over time</h2>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={mlConfidenceTrend} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(232,230,240,0.35)' }} tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'rgba(232,230,240,0.35)' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [`${v}%`, 'Confidence']}
                    labelFormatter={d => new Date(d).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                    labelStyle={{ color: 'var(--color-text)' }}
                  />
                  <Line type="monotone" dataKey="confidence" stroke="#AFA9EC" strokeWidth={2} dot={{ r: 3, fill: '#AFA9EC' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ML Classification Details Table */}
          <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
            <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>ML classification details</h2>
            <div className="flex flex-col gap-3">
              {mlClassification.map(c => (
                <div key={c.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: ML_LABEL_META[c.label]?.color || '#7F77DD' }} />
                      {ML_LABEL_META[c.label]?.label || c.label}
                    </span>
                    <span className="text-xs font-medium flex items-center gap-3">
                      <span style={{ color: ML_LABEL_META[c.label]?.color || '#7F77DD' }}>{c.pct}%</span>
                      <span className="text-text/30 font-mono text-[10px]">conf: {c.avgConfidence}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: ML_LABEL_META[c.label]?.color || '#7F77DD', opacity: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5 my-6" />
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* Gemini AI Theme & Trigger Analysis (existing)                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {themeFrequency.length > 0 && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-base">✨</span>
            <h2 className="text-base font-semibold text-text">Gemini AI Theme Analysis</h2>
          </div>

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
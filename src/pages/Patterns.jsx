import { useState, useEffect } from 'react'
import * as api from '../lib/api.js'
import { THEMES, TRIGGERS } from '../lib/api.js'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Activity, Brain, TrendingUp, Sparkles } from 'lucide-react'

const ML_LABEL_META = {
  anxiety: { label: 'Anxiety', color: '#8B82EC' },
  normal: { label: 'Balanced / Calm', color: '#1D9E75' },
  depression: { label: 'Low Mood', color: '#6358DC' },
  stress: { label: 'Stress', color: '#E07D10' },
  'personality disorder': { label: 'Emotional Dysregulation', color: '#C83B68' },
  bipolar: { label: 'Mood Fluctuations', color: '#D95D39' },
  suicidal: { label: 'High Distress', color: '#D93838' },
}

const THEME_FALLBACK_COLORS = {
  academic: '#8B82EC',
  career: '#6358DC',
  relationships: '#C83B68',
  health: '#1D9E75',
  existential: '#E07D10',
  growth: '#2E90FA',
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted, #666)' }}>
          Loading your pattern insights…
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-sm font-medium" style={{ color: '#E24B4A' }}>{error}</p>
      </div>
    )
  }

  const {
    themeFrequency = [],
    triggerFrequency = [],
    totalEntries = 0,
    mlClassification = [],
    mlConfidenceTrend = [],
    mlClassScores = [],
    mlEntriesAnalyzed = 0,
  } = data || {}

  const barData = themeFrequency.slice(0, 6).map(p => ({
    name: THEMES[p.theme]?.label || p.theme,
    pct: p.pct,
    fill: THEMES[p.theme]?.color || THEME_FALLBACK_COLORS[p.theme] || '#8B82EC',
  }))

  const radarData = themeFrequency.slice(0, 6).map(p => ({
    subject: THEMES[p.theme]?.label?.split(' ')[0] || p.theme,
    value: p.pct,
  }))

  const mlPieData = mlClassification.map(c => ({
    name: ML_LABEL_META[c.label]?.label || c.label,
    value: c.count,
    color: ML_LABEL_META[c.label]?.color || '#8B82EC',
  }))

  const mlRadarData = mlClassScores.map(s => ({
    subject: ML_LABEL_META[s.label]?.label?.split(' ')[0] || s.label,
    value: s.avgScore,
  }))

  const mlBarData = mlClassification.map(c => ({
    name: ML_LABEL_META[c.label]?.label || c.label,
    pct: c.pct,
    confidence: c.avgConfidence,
    fill: ML_LABEL_META[c.label]?.color || '#8B82EC',
  }))

  const CustomBar = (props) => {
    const { x, y, width, height, fill } = props
    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={5} opacity={0.9} />
  }

  const tooltipStyle = {
    background: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-surface-border, rgba(0,0,0,0.12))',
    borderRadius: '12px',
    fontSize: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    color: 'var(--color-text, #243B3A)',
  }

  const cardStyle = {
    background: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-surface-border, rgba(0,0,0,0.08))',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text, #243B3A)' }}>
          Notice What Your Mind Has Been Telling You
        </h1>
        <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted, #666)' }}>
          Recurring themes and emotional constellations across <strong>{totalEntries}</strong> reflections.
        </p>
      </div>

      {themeFrequency.length === 0 && mlEntriesAnalyzed === 0 && (
        <div className="text-center py-16 rounded-2xl p-8" style={cardStyle}>
          <p className="text-sm" style={{ color: 'var(--color-text-muted, #666)' }}>
            Start journaling to see emotional and ML patterns emerge here.
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. DistilBERT ML Classification Section                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {mlEntriesAnalyzed > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10">
                <Brain size={16} className="text-primary" />
              </div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text, #243B3A)' }}>
                DistilBERT ML Pattern Analysis
              </h2>
            </div>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: 'rgba(139,130,236,0.12)',
                color: 'var(--color-primary, #6358DC)',
              }}
            >
              {mlEntriesAnalyzed} entries analyzed
            </span>
          </div>

          {/* ML Classification Distribution (Bar Chart) */}
          <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
            <div className="flex items-center gap-1.5 mb-3">
              <Activity size={14} className="text-primary" />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text, #243B3A)' }}>
                ML Classification Distribution
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mlBarData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted, #666)' }}
                  tickFormatter={v => `${v}%`}
                  axisLine={{ stroke: 'var(--color-surface-border, #ddd)' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'var(--color-text, #243B3A)', fontWeight: 500 }}
                  axisLine={{ stroke: 'var(--color-surface-border, #ddd)' }}
                  tickLine={false}
                  width={140}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v, name) => {
                    if (name === 'pct') return [`${v}% of entries`, 'Frequency']
                    if (name === 'confidence') return [`${v}%`, 'Avg Confidence']
                    return [v]
                  }}
                  labelStyle={{ color: 'var(--color-text, #243B3A)', fontWeight: 600 }}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Bar dataKey="pct" shape={<CustomBar />} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] mt-2 italic" style={{ color: 'var(--color-text-muted, #777)' }}>
              * Classification signals from fine-tuned DistilBERT (7-class, 94.4% accuracy). Text pattern signal only.
            </p>
          </div>

          {/* ML Softmax Probability Radar */}
          {mlRadarData.length >= 3 && (
            <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
              <div className="flex items-center gap-1.5 mb-2">
                <Brain size={14} className="text-primary" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text, #243B3A)' }}>
                  ML Emotional Signature (Average Softmax Probability)
                </h3>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted, #666)' }}>
                Average probability distribution across all 7 language pattern classes:
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={mlRadarData}>
                  <PolarGrid stroke="var(--color-surface-border, rgba(0,0,0,0.12))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: 'var(--color-text, #243B3A)', fontWeight: 500 }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#8B82EC"
                    fill="#8B82EC"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ML Pie Chart */}
          {mlPieData.length > 0 && (
            <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text, #243B3A)' }}>
                Classification Proportion
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={mlPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {mlPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v, name) => [`${v} entries`, name]}
                    labelStyle={{ color: 'var(--color-text, #243B3A)', fontWeight: 600 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: 'var(--color-text, #243B3A)', paddingTop: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ML Confidence Trend Over Time */}
          {mlConfidenceTrend.length >= 2 && (
            <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp size={14} className="text-primary" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text, #243B3A)' }}>
                  ML Confidence Trend Over Time
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={mlConfidenceTrend} margin={{ left: 0, right: 12, top: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border, rgba(0,0,0,0.08))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'var(--color-text-muted, #666)' }}
                    tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    axisLine={{ stroke: 'var(--color-surface-border, #ddd)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: 'var(--color-text-muted, #666)' }}
                    tickFormatter={v => `${v}%`}
                    axisLine={{ stroke: 'var(--color-surface-border, #ddd)' }}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [`${v}%`, 'Model Confidence']}
                    labelFormatter={d => new Date(d).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                    labelStyle={{ color: 'var(--color-text, #243B3A)', fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    stroke="#8B82EC"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#8B82EC' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ML Classification Breakdown List */}
          <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text, #243B3A)' }}>
              ML Classification Summary
            </h3>
            <div className="flex flex-col gap-3">
              {mlClassification.map(c => (
                <div key={c.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium flex items-center gap-2" style={{ color: 'var(--color-text, #243B3A)' }}>
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ background: ML_LABEL_META[c.label]?.color || '#8B82EC' }}
                      />
                      {ML_LABEL_META[c.label]?.label || c.label}
                    </span>
                    <span className="text-xs flex items-center gap-3">
                      <strong style={{ color: ML_LABEL_META[c.label]?.color || '#8B82EC' }}>{c.pct}%</strong>
                      <span className="text-[11px] font-mono" style={{ color: 'var(--color-text-muted, #666)' }}>
                        avg conf: {c.avgConfidence}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-border, rgba(0,0,0,0.08))' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${c.pct}%`,
                        background: ML_LABEL_META[c.label]?.color || '#8B82EC',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. Gemini AI Theme & Trigger Analysis                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {themeFrequency.length > 0 && (
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/10">
              <Sparkles size={16} className="text-accent" />
            </div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text, #243B3A)' }}>
              Gemini AI Theme & Trigger Analysis
            </h2>
          </div>

          {/* Theme Frequency Chart */}
          <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text, #243B3A)' }}>
              Theme Frequency
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted, #666)' }}
                  tickFormatter={v => `${v}%`}
                  axisLine={{ stroke: 'var(--color-surface-border, #ddd)' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'var(--color-text, #243B3A)', fontWeight: 500 }}
                  axisLine={{ stroke: 'var(--color-surface-border, #ddd)' }}
                  tickLine={false}
                  width={120}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={v => [`${v}% of entries`, 'Frequency']}
                  labelStyle={{ color: 'var(--color-text, #243B3A)', fontWeight: 600 }}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Bar dataKey="pct" shape={<CustomBar />} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Emotional Profile Radar Chart */}
          {radarData.length >= 3 && (
            <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text, #243B3A)' }}>
                Emotional Theme Profile
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--color-surface-border, rgba(0,0,0,0.12))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: 'var(--color-text, #243B3A)', fontWeight: 500 }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#8B82EC"
                    fill="#8B82EC"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Common Triggers */}
          {triggerFrequency.length > 0 && (
            <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text, #243B3A)' }}>
                Common Triggers
              </h3>
              <div className="flex flex-col gap-3">
                {triggerFrequency.map(t => (
                  <div key={t.trigger}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text, #243B3A)' }}>
                        ⚡ {TRIGGERS[t.trigger] || t.trigger}
                      </span>
                      <strong className="text-xs" style={{ color: '#E07D10' }}>
                        {t.pct}%
                      </strong>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-border, rgba(0,0,0,0.08))' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${t.pct}%`, background: '#E07D10' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Theme Breakdown */}
          <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text, #243B3A)' }}>
              Theme Breakdown
            </h3>
            <div className="flex flex-col gap-3">
              {themeFrequency.map(p => (
                <div key={p.theme}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text, #243B3A)' }}>
                      {THEMES[p.theme]?.label || p.theme}
                    </span>
                    <strong className="text-xs" style={{ color: THEMES[p.theme]?.color || '#8B82EC' }}>
                      {p.pct}%
                    </strong>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-border, rgba(0,0,0,0.08))' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${p.pct}%`, background: THEMES[p.theme]?.color || '#8B82EC' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
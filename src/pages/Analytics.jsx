// pages/Analytics.jsx
// Redesigned with warm wellness aesthetic — "Insights" reframed as self-awareness.

import { useState, useEffect } from 'react'
import * as api from '../lib/api.js'
import { RISK_COLORS } from '../lib/api.js'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { AlertCircle, Activity, PieChart as PieIcon, Layers, Zap, Heart } from 'lucide-react'

const SENTIMENT_COLORS = {
  positive: '#5DCAA5',
  neutral: '#AFA9EC',
  negative: '#E24B4A',
  mixed: '#EF9F27',
}

const SENTIMENT_LABELS = {
  positive: 'At peace',
  neutral: 'Balanced',
  negative: 'Struggling',
  mixed: 'Complex',
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload
    return (
      <div className="rounded-xl px-3 py-2 text-xs"
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-surface-border)',
          backdropFilter: 'blur(12px)',
          color: 'var(--color-text)',
        }}>
        <p style={{ color: SENTIMENT_COLORS[name] || '#888' }} className="font-semibold">
          {SENTIMENT_LABELS[name] || name}
        </p>
        <p style={{ color: 'var(--color-text-muted)' }}>{value} {value === 1 ? 'entry' : 'entries'}</p>
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getAnalyticsDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full animate-breathe flex items-center justify-center"
        style={{ background: 'rgba(139,130,236,0.15)', border: '1px solid rgba(139,130,236,0.25)' }}>
        <PieIcon size={18} style={{ color: 'var(--color-primary)' }} />
      </div>
      <p className="text-sm" style={{ color: 'var(--color-text-faint)' }}>Reading your patterns…</p>
    </div>
  )

  if (error) return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-center">
      <p className="text-sm" style={{ color: '#f09595' }}>{error}</p>
    </div>
  )

  const {
    sentimentBreakdown = {},
    totalEntries = 0,
    riskFlags = 0,
    themeFrequency = [],
    triggerFrequency = [],
  } = data || {}

  const sentimentData = Object.entries(sentimentBreakdown)
    .map(([key, value]) => ({ name: key, value, color: SENTIMENT_COLORS[key] || '#888' }))

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">

      {/* ── Hero Header ─────────────────────────────────── */}
      <div className="relative mb-8 overflow-hidden rounded-3xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(100,216,180,0.1) 0%, rgba(139,130,236,0.08) 100%)',
          border: '1px solid rgba(100,216,180,0.2)',
        }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[60px] pointer-events-none"
          style={{ background: 'rgba(100,216,180,0.18)' }} />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(100,216,180,0.2)' }}>
              <PieIcon size={15} style={{ color: 'var(--color-accent)' }} />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'var(--color-accent)', opacity: 0.8 }}>Self-Awareness Insights</span>
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            What your entries reveal
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
            Patterns only become visible over time. Here's what your journal has quietly been tracking — the emotional colors of your days.
          </p>

          {totalEntries > 0 && (
            <div className="flex items-center gap-6 mt-5">
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{totalEntries}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>entries analyzed</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Empty State ─────────────────────────────────── */}
      {totalEntries === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full mb-6 flex items-center justify-center animate-breathe"
            style={{ background: 'rgba(100,216,180,0.1)', border: '1px solid rgba(100,216,180,0.2)' }}>
            <PieIcon size={22} style={{ color: 'var(--color-accent)', opacity: 0.7 }} />
          </div>
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Insights grow with you
          </h3>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--color-text-faint)' }}>
            Once you've journaled a few entries, this page will reveal the hidden patterns in your emotional landscape.
          </p>
        </div>
      )}

      {totalEntries > 0 && (
        <>
          {/* ── Wellbeing Check ─────────────────────────── */}
          <div className="rounded-2xl p-5 mb-4 flex items-center gap-4"
            style={{
              background: riskFlags > 0 ? 'rgba(226,75,74,0.06)' : 'rgba(93,202,165,0.06)',
              border: `1px solid ${riskFlags > 0 ? 'rgba(226,75,74,0.2)' : 'rgba(93,202,165,0.2)'}`,
            }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: riskFlags > 0 ? 'rgba(226,75,74,0.12)' : 'rgba(93,202,165,0.12)' }}>
              {riskFlags > 0
                ? <AlertCircle size={18} color="#f09595" />
                : <Activity size={18} color="#5DCAA5" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold"
                style={{ color: riskFlags > 0 ? '#f09595' : '#5DCAA5' }}>
                {riskFlags === 0
                  ? 'Your emotional wellbeing looks stable 🌿'
                  : `${riskFlags} moment${riskFlags === 1 ? '' : 's'} showed elevated distress`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>
                {riskFlags === 0
                  ? 'Based on AI analysis of your journal entries'
                  : 'Support resources were shown at the time of these entries'}
              </p>
            </div>
          </div>

          {/* ── Sentiment Pie ────────────────────────────── */}
          {sentimentData.length > 0 && (
            <div className="rounded-2xl p-6 mb-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
              <div className="flex items-center gap-2 mb-5">
                <PieIcon size={14} style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  Emotional color breakdown
                </h2>
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={82}
                    innerRadius={50}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {sentimentData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={v => (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                        {SENTIMENT_LABELS[v] || v}
                      </span>
                    )}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Quick Insights Grid ──────────────────────── */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl p-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Layers size={12} style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Most visited theme</p>
              </div>
              <p className="text-sm font-semibold capitalize" style={{ color: '#AFA9EC' }}>
                {themeFrequency[0]?.theme?.replace(/_/g, ' ') || '—'}
              </p>
              {themeFrequency[0] && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>
                  {themeFrequency[0].count}× mentioned
                </p>
              )}
            </div>

            <div className="rounded-2xl p-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={12} style={{ color: '#EF9F27', opacity: 0.8 }} />
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Common trigger</p>
              </div>
              <p className="text-sm font-semibold capitalize" style={{ color: '#EF9F27' }}>
                {triggerFrequency[0]?.trigger?.replace(/_/g, ' ') || '—'}
              </p>
              {triggerFrequency[0] && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>
                  {triggerFrequency[0].count}× noticed
                </p>
              )}
            </div>
          </div>

          {/* ── Gentle Closing Note ──────────────────────── */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(139,130,236,0.06)', border: '1px solid rgba(139,130,236,0.15)' }}>
            <div className="flex items-start gap-3">
              <Heart size={16} style={{ color: 'var(--color-primary)', opacity: 0.7, flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Awareness is the first step to change. Simply noticing your patterns — without judgment — is already an act of self-compassion.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
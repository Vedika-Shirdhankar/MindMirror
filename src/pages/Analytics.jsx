// pages/Analytics.jsx
// New page dedicated to enhancement #9 (Analytics Dashboard).
// Distinct from Growth.jsx (personal narrative/resilience framing) and
// Patterns.jsx (theme/trigger charts) — this page focuses on the raw
// sentiment + risk overview an analytics dashboard is expected to show.

import { useState, useEffect } from 'react'
import * as api from '../lib/api.js'
import { RISK_COLORS } from '../lib/api.js'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { AlertCircle, Activity } from 'lucide-react'

const SENTIMENT_COLORS = { positive: '#5DCAA5', neutral: '#AFA9EC', negative: '#E24B4A', mixed: '#EF9F27' }

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

  if (loading) return <div className="max-w-2xl mx-auto px-6 py-8"><p className="text-sm" style={{ color: 'rgba(232,230,240,0.4)' }}>Loading analytics…</p></div>
  if (error) return <div className="max-w-2xl mx-auto px-6 py-8"><p className="text-sm" style={{ color: '#f09595' }}>{error}</p></div>

  const { sentimentBreakdown = {}, totalEntries = 0, riskFlags = 0, themeFrequency = [], triggerFrequency = [] } = data || {}

  const sentimentData = Object.entries(sentimentBreakdown).map(([key, value]) => ({
    name: key, value, color: SENTIMENT_COLORS[key] || '#888',
  }))

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: '#e8e6f0' }}>Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(232,230,240,0.45)' }}>Full overview across {totalEntries} entries</p>
      </div>

      {totalEntries === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'rgba(232,230,240,0.4)' }}>Analytics will appear once you've journaled a few entries.</p>
        </div>
      )}

      {totalEntries > 0 && (
        <>
          {/* Risk overview */}
          <div className="rounded-2xl p-5 mb-4 flex items-center gap-4" style={{ background: riskFlags > 0 ? 'rgba(226,75,74,0.06)' : 'rgba(255,255,255,0.04)', border: `1px solid ${riskFlags > 0 ? 'rgba(226,75,74,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: riskFlags > 0 ? 'rgba(226,75,74,0.15)' : 'rgba(93,202,165,0.1)' }}>
              {riskFlags > 0 ? <AlertCircle size={18} color="#f09595" /> : <Activity size={18} color="#5DCAA5" />}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: riskFlags > 0 ? '#f09595' : '#5DCAA5' }}>
                {riskFlags === 0 ? 'No elevated risk entries detected' : `${riskFlags} entr${riskFlags === 1 ? 'y' : 'ies'} flagged for elevated risk`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(232,230,240,0.4)' }}>
                {riskFlags === 0 ? 'Based on AI risk analysis of your journal entries' : 'Resources were shown when these entries were saved'}
              </p>
            </div>
          </div>

          {/* Sentiment pie chart */}
          {sentimentData.length > 0 && (
            <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-sm font-medium mb-4" style={{ color: '#e8e6f0' }}>Sentiment breakdown</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2}>
                    {sentimentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1921', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#e8e6f0' }} formatter={v => <span style={{ color: 'rgba(232,230,240,0.7)' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(232,230,240,0.45)' }}>Top theme</p>
              <p className="text-sm font-medium" style={{ color: '#AFA9EC' }}>{themeFrequency[0]?.theme?.replace(/_/g, ' ') || '—'}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(232,230,240,0.45)' }}>Top trigger</p>
              <p className="text-sm font-medium" style={{ color: '#EF9F27' }}>{triggerFrequency[0]?.trigger?.replace(/_/g, ' ') || '—'}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
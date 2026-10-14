import React from 'react'
import {
  Sparkles, TrendingUp, TrendingDown, Minus, Flame, CalendarCheck,
  BarChart2, PieChart, Activity, ArrowUpRight, ArrowDownRight, Compass
} from 'lucide-react'
import { CALENDAR_MOOD_PALETTE, getMoodPaletteForEmotion, EMOTION_META } from '../../lib/api'

export default function MoodInsights({ insights, monthName, year }) {
  if (!insights || insights.totalEntries === 0) {
    return (
      <div className="rounded-[24px] p-6 bg-lav-50/40 border border-lav-100 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center mx-auto mb-3 shadow-xs text-xl">
          🌱
        </div>
        <h4 className="text-sm font-semibold text-text">No emotional trends yet for {monthName}</h4>
        <p className="text-xs text-text/50 max-w-sm mx-auto mt-1">
          Insights are generated exclusively from your actual journal reflections. As you write, your emotional patterns and rhythms will appear here.
        </p>
      </div>
    )
  }

  const {
    totalEntries,
    activeDays,
    consistencyPercentage,
    maxStreakInMonth,
    mostFrequentEmotions = [],
    weeklyDistribution = [],
    moodDistribution = {},
    patternChanges = {},
    previousMonthComparison = {},
  } = insights

  const moodBuckets = [
    { key: 'calm', label: 'Calm & Grounded', color: '#529672', count: moodDistribution.calm || 0 },
    { key: 'balanced', label: 'Balanced', color: '#8A76C9', count: moodDistribution.balanced || 0 },
    { key: 'elevated', label: 'Stressed / Elevated', color: '#D9822B', count: moodDistribution.elevated || 0 },
    { key: 'distressed', label: 'High Distress', color: '#C64F42', count: moodDistribution.distressed || 0 },
  ]
  const totalBucketCounts = moodBuckets.reduce((acc, b) => acc + b.count, 0) || 1

  return (
    <div className="space-y-4">
      {/* ── Top Summary Grid: Consistency, Streak & Shift ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Consistency */}
        <div className="p-4 rounded-2xl bg-white/70 border border-white/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-text/50">Journaling Rhythm</span>
            <CalendarCheck size={15} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-text">{consistencyPercentage}%</span>
            <span className="text-xs text-text/50">({activeDays} active days)</span>
          </div>
          <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${consistencyPercentage}%` }}
            />
          </div>
        </div>

        {/* Longest Streak */}
        <div className="p-4 rounded-2xl bg-white/70 border border-white/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-text/50">Monthly Streak</span>
            <Flame size={15} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-text">{maxStreakInMonth}</span>
            <span className="text-xs text-text/50">consecutive days</span>
          </div>
          <p className="text-[10px] text-text/40 mt-1">
            {maxStreakInMonth > 2 ? 'Great momentum in staying present with yourself' : 'Every reflection logged matters'}
          </p>
        </div>

        {/* Pattern Shift Over Time */}
        <div className="p-4 rounded-2xl bg-white/70 border border-white/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-text/50">Pattern Evolution</span>
            <Compass size={15} className="text-purple-600" />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {patternChanges.shift === 'becoming_calmer' ? (
              <>
                <TrendingDown size={18} className="text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600">Softening & Calmer</span>
              </>
            ) : patternChanges.shift === 'increasing_intensity' ? (
              <>
                <TrendingUp size={18} className="text-amber-500" />
                <span className="text-xs font-semibold text-amber-600">Higher Intensity</span>
              </>
            ) : patternChanges.shift === 'steady_balance' ? (
              <>
                <Minus size={18} className="text-purple-500" />
                <span className="text-xs font-semibold text-purple-600">Steady Balance</span>
              </>
            ) : (
              <span className="text-xs text-text/50">Exploring initial rhythm</span>
            )}
          </div>
          <p className="text-[10px] text-text/40 mt-1.5">
            {patternChanges.firstHalfAvg != null && patternChanges.secondHalfAvg != null
              ? `Days 1-15 avg: ${patternChanges.firstHalfAvg}/10 → Days 16+ avg: ${patternChanges.secondHalfAvg}/10`
              : 'Logged across the selected month'}
          </p>
        </div>
      </div>

      {/* ── Two Column: Emotion Frequency & Mood Distribution ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Frequently Recorded Emotions */}
        <div className="p-5 rounded-2xl bg-white/75 border border-white/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-primary" />
              <span>Most Frequent Emotions</span>
            </h5>
            <span className="text-[11px] text-text/40">{totalEntries} entries analyzed</span>
          </div>

          {mostFrequentEmotions.length > 0 ? (
            <div className="space-y-2.5">
              {mostFrequentEmotions.slice(0, 5).map((emItem) => {
                const palette = getMoodPaletteForEmotion(emItem.emotion)
                return (
                  <div key={emItem.emotion} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{EMOTION_META[emItem.emotion]?.emoji || '•'}</span>
                        <span className="font-medium capitalize text-text/80">{emItem.emotion}</span>
                        <span className="text-[10px] text-text/40">
                          (avg intensity: {emItem.averageIntensity}/5)
                        </span>
                      </div>
                      <span className="font-semibold text-text/60">
                        {emItem.count} ({emItem.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: palette.color,
                          width: `${Math.max(8, emItem.percentage)}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-text/40 py-4 text-center">No fine-grained emotions logged yet.</p>
          )}
        </div>

        {/* Monthly & Weekly Mood Rhythm */}
        <div className="p-5 rounded-2xl bg-white/75 border border-white/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 size={13} className="text-primary" />
                <span>Weekly Emotional Rhythm</span>
              </h5>
              <span className="text-[11px] text-text/40">Distress (1-10)</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center mb-4">
              {weeklyDistribution.map((w) => (
                <div
                  key={w.weekNumber}
                  className="p-2 rounded-xl bg-lav-50/50 border border-lav-100 flex flex-col items-center justify-center"
                >
                  <span className="text-[10px] text-text/40 block">W{w.weekNumber}</span>
                  <span className="text-xs font-semibold text-text mt-0.5">
                    {w.averageMoodScore != null ? `${w.averageMoodScore}` : '—'}
                  </span>
                  <span className="text-[9px] text-text/45 mt-0.5">
                    {w.entriesCount} {w.entriesCount === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Mood Bracket Distribution */}
          <div>
            <p className="text-[11px] font-semibold text-text/60 mb-2">Monthly Mood Distribution</p>
            <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5 bg-black/5 p-0.5">
              {moodBuckets.map((b) => {
                const pct = Math.round((b.count / totalBucketCounts) * 100)
                if (pct === 0) return null
                return (
                  <div
                    key={b.key}
                    className="h-full rounded-sm transition-all"
                    style={{ backgroundColor: b.color, width: `${pct}%` }}
                    title={`${b.label}: ${b.count} (${pct}%)`}
                  />
                )
              })}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-text/50">
              {moodBuckets.map((b) => (
                <div key={b.key} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                  <span>{b.label} ({b.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Comparison with Previous Month ── */}
      {previousMonthComparison.prevMonthEntriesCount > 0 && (
        <div className="p-3.5 px-4 rounded-2xl bg-lav-100/40 border border-lav-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-primary" />
            <span className="text-text/75">
              <strong>Compared to previous month:</strong>{' '}
              {previousMonthComparison.entryCountDiff >= 0
                ? `+${previousMonthComparison.entryCountDiff} more reflections logged`
                : `${previousMonthComparison.entryCountDiff} fewer reflections logged`}
            </span>
          </div>
          {previousMonthComparison.moodDelta != null && (
            <span className="text-[11px] text-text/60">
              Average distress shift:{' '}
              <strong className={previousMonthComparison.moodDelta <= 0 ? 'text-emerald-600' : 'text-amber-600'}>
                {previousMonthComparison.moodDelta > 0 ? `+${previousMonthComparison.moodDelta}` : previousMonthComparison.moodDelta}
              </strong>{' '}
              points
            </span>
          )}
        </div>
      )}
    </div>
  )
}

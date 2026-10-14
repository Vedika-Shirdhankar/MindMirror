import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ChevronLeft, ChevronRight, Sparkles, Calendar as CalendarIcon, RotateCcw,
  BarChart2, Info, Plus, Loader2, ArrowRight
} from 'lucide-react'
import {
  format, addMonths, subMonths, startOfMonth, getDay, isSameDay, isToday, parseISO
} from 'date-fns'
import * as api from '../../lib/api'
import { CALENDAR_MOOD_PALETTE, getMoodPaletteForEmotion, EMOTION_META } from '../../lib/api'
import DailyJournalModal from './DailyJournalModal'
import MoodInsights from './MoodInsights'
import MonthlyReflectionCard from './MonthlyReflectionCard'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function SmartMoodCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Selected date modal state
  const [selectedDateStr, setSelectedDateStr] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [savingEntry, setSavingEntry] = useState(false)

  // AI Reflection state
  const [generatingReflection, setGeneratingReflection] = useState(false)
  const [reflectionError, setReflectionError] = useState(null)
  const [activeTab, setActiveTab] = useState('calendar') // 'calendar' | 'insights' | 'reflection'

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const monthName = format(currentDate, 'MMMM')

  // Fetch calendar data for the current month
  const fetchCalendar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      const res = await api.getCalendarData(year, month, tz)
      setCalendarData(res)
    } catch (err) {
      console.error('Failed to fetch calendar data:', err)
      setError(err.message || 'Unable to load mood calendar data.')
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchCalendar()
  }, [fetchCalendar])

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1))
  }

  const handleGoToToday = () => {
    setCurrentDate(new Date())
  }

  // Open daily journal details
  const handleDayClick = (dateStr) => {
    setSelectedDateStr(dateStr)
    setIsModalOpen(true)
  }

  // Save new entry for selected date
  const handleSaveEntryForDate = async (entryPayload) => {
    setSavingEntry(true)
    try {
      await api.addEntry(entryPayload)
      // Refetch calendar to update markers & insights
      await fetchCalendar()
    } finally {
      setSavingEntry(false)
    }
  }

  // Trigger Gemini Monthly Reflection
  const handleGenerateReflection = async (forceRegenerate = true) => {
    setGeneratingReflection(true)
    setReflectionError(null)
    try {
      const res = await api.generateMonthlyReflection(year, month, forceRegenerate)
      if (res && res.reflection) {
        setCalendarData((prev) => ({
          ...prev,
          monthlyReflection: res.reflection,
        }))
        setActiveTab('reflection')
      }
    } catch (err) {
      console.error('Failed to generate monthly reflection:', err)
      setReflectionError(err.message || 'Failed to synthesize monthly reflection.')
    } finally {
      setGeneratingReflection(false)
    }
  }

  // Compute month layout
  const firstDayOfMonth = useMemo(() => startOfMonth(currentDate), [currentDate])
  const startingDayIndex = useMemo(() => getDay(firstDayOfMonth), [firstDayOfMonth])

  // Map days from response
  const daysByDate = useMemo(() => {
    const map = {}
    if (calendarData?.days) {
      calendarData.days.forEach((d) => {
        map[d.date] = d
      })
    }
    return map
  }, [calendarData])

  const selectedDayData = selectedDateStr ? daysByDate[selectedDateStr] : null

  return (
    <div className="w-full space-y-6">
      {/* ── Outer Shell ── */}
      <div className="rounded-[30px] p-6 sm:p-8 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_16px_50px_rgba(156,139,207,0.08)]">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-lav-100 text-lav-500">
                <CalendarIcon size={16} />
              </span>
              <h2 className="font-serif text-2xl font-bold text-text">
                Smart Mood Calendar
              </h2>
            </div>
            <p className="text-xs text-text/50">
              Visual emotional rhythms, journaling milestones & AI monthly reflections
            </p>
          </div>

          {/* Month Navigation & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-white/80 border border-black/5 rounded-2xl p-1 shadow-xs">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-text/60 hover:text-text hover:bg-black/5 transition-colors"
                title="Previous month"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-serif font-semibold text-sm px-3 min-w-[130px] text-center text-text">
                {monthName} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-text/60 hover:text-text hover:bg-black/5 transition-colors"
                title="Next month"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              onClick={handleGoToToday}
              className="px-3 py-2 rounded-2xl bg-white/80 border border-black/5 text-xs font-medium text-text/70 hover:text-text hover:bg-white transition-all shadow-xs"
            >
              Today
            </button>

            <button
              onClick={() => handleGenerateReflection(true)}
              disabled={generatingReflection || loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-lav-400 to-primary text-white text-xs font-semibold shadow-sm hover:opacity-95 hover:shadow-md transition-all disabled:opacity-50"
            >
              {generatingReflection ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Generate Monthly Reflection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-lav-50/70 border border-lav-100 max-w-fit mb-6">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'calendar'
                ? 'bg-white text-text shadow-xs'
                : 'text-text/50 hover:text-text'
            }`}
          >
            Calendar Grid
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'insights'
                ? 'bg-white text-text shadow-xs'
                : 'text-text/50 hover:text-text'
            }`}
          >
            Mood Insights
          </button>
          <button
            onClick={() => setActiveTab('reflection')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'reflection'
                ? 'bg-white text-text shadow-xs'
                : 'text-text/50 hover:text-text'
            }`}
          >
            <Sparkles size={12} className={calendarData?.monthlyReflection ? 'text-primary' : 'text-text/30'} />
            <span>Monthly Reflection</span>
          </button>
        </div>

        {reflectionError && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
            {reflectionError}
          </div>
        )}

        {/* ── TAB 1: CALENDAR GRID ── */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {loading ? (
              <div className="h-72 flex flex-col items-center justify-center gap-3 text-text/40">
                <Loader2 size={24} className="animate-spin text-primary" />
                <span className="text-xs">Gathering your emotional footprints...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-xs text-red-500 bg-red-50/50 rounded-2xl">
                {error}
              </div>
            ) : (
              <div>
                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-[11px] font-semibold tracking-wider uppercase text-text/40 py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid Cells */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty placeholders for days before the 1st */}
                  {Array.from({ length: startingDayIndex }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="min-h-[92px] sm:min-h-[105px] rounded-2xl border border-transparent opacity-20 pointer-events-none"
                    />
                  ))}

                  {/* Days of the month */}
                  {calendarData?.days?.map((dayObj) => {
                    const parsed = new Date(`${dayObj.date}T12:00:00`)
                    const isCurrentDay = isToday(parsed)
                    const hasEntries = dayObj.hasEntries
                    const palette = hasEntries
                      ? getMoodPaletteForEmotion(dayObj.dominantEmotion)
                      : null

                    return (
                      <div
                        key={dayObj.date}
                        onClick={() => handleDayClick(dayObj.date)}
                        className={`group relative min-h-[92px] sm:min-h-[105px] rounded-2xl p-2.5 sm:p-3 transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                          isCurrentDay
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-white shadow-sm'
                            : ''
                        } ${
                          hasEntries
                            ? 'hover:shadow-md hover:-translate-y-0.5'
                            : 'bg-white/40 border-black/5 hover:bg-white/70 hover:border-black/10'
                        }`}
                        style={{
                          background: hasEntries ? palette.bg : undefined,
                          borderColor: hasEntries ? palette.border : undefined,
                        }}
                      >
                        {/* Day Number & Multi-entry Count */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${
                              isCurrentDay
                                ? 'w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold'
                                : hasEntries
                                ? 'text-text font-bold'
                                : 'text-text/50'
                            }`}
                          >
                            {dayObj.dayNumber}
                          </span>

                          {hasEntries && dayObj.entriesCount > 1 && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-white/70 text-text/70 border border-black/5">
                              {dayObj.entriesCount}
                            </span>
                          )}
                        </div>

                        {/* Mood Indicator / Visual Footprint */}
                        {hasEntries ? (
                          <div className="space-y-1">
                            {/* Stacked Dots if multiple entries */}
                            <div className="flex items-center gap-1">
                              {dayObj.entries.slice(0, 3).map((e, idx) => {
                                const p = getMoodPaletteForEmotion(e.primaryEmotion)
                                return (
                                  <span
                                    key={idx}
                                    className="w-2 h-2 rounded-full shadow-xs"
                                    style={{ backgroundColor: p.color }}
                                  />
                                )
                              })}
                              {dayObj.entries.length > 3 && (
                                <span className="text-[9px] text-text/40">+</span>
                              )}
                            </div>

                            {/* Emotion Label & Emoji */}
                            <div className="flex items-center gap-1 text-[11px] font-medium truncate" style={{ color: palette.color }}>
                              <span>{palette.emoji}</span>
                              <span className="hidden sm:inline capitalize truncate">
                                {dayObj.dominantEmotion || palette.label}
                              </span>
                            </div>

                            {/* Distress Rating */}
                            {dayObj.averageMoodScore != null && (
                              <div className="text-[9px] text-text/40 hidden sm:block">
                                score: {dayObj.averageMoodScore}/10
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-primary/70 font-medium">
                            + Reflect
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Clean Mood Legend ── */}
            <div className="pt-4 border-t border-black/5">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-text/60">
                <Info size={13} />
                <span>Emotional Palette & Legend</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {Object.values(CALENDAR_MOOD_PALETTE).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-xl text-xs border"
                    style={{ background: item.bg, borderColor: item.border }}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-[11px] font-medium" style={{ color: item.color }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MOOD INSIGHTS ── */}
        {activeTab === 'insights' && (
          <MoodInsights
            insights={calendarData?.insights}
            monthName={monthName}
            year={year}
          />
        )}

        {/* ── TAB 3: AI MONTHLY REFLECTION ── */}
        {activeTab === 'reflection' && (
          <div>
            {calendarData?.monthlyReflection ? (
              <MonthlyReflectionCard
                reflection={calendarData.monthlyReflection}
                monthName={monthName}
                year={year}
                onRegenerate={() => handleGenerateReflection(true)}
                isRegenerating={generatingReflection}
              />
            ) : (
              <div className="text-center py-12 px-6 rounded-3xl bg-lav-50/50 border border-lav-200/60 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs flex items-center justify-center mx-auto mb-3 text-2xl text-lav-500">
                  <Sparkles size={24} />
                </div>
                <h4 className="font-serif text-lg font-bold text-text mb-1">
                  Ready to weave your monthly story?
                </h4>
                <p className="text-xs text-text/60 leading-relaxed mb-5">
                  Gemini will gently analyze your journal entries for {monthName} {year} to illuminate recurring themes, positive achievements, and mindful questions for your path forward.
                </p>
                <button
                  onClick={() => handleGenerateReflection(false)}
                  disabled={generatingReflection}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white text-xs font-semibold shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {generatingReflection ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Synthesizing reflections...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Generate {monthName} Reflection</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Daily Journal Details Modal ── */}
      <DailyJournalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dateStr={selectedDateStr}
        dayData={selectedDayData}
        onSaveNewEntry={handleSaveEntryForDate}
        savingEntry={savingEntry}
      />
    </div>
  )
}

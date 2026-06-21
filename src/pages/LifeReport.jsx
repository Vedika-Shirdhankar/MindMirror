// pages/LifeReport.jsx
import { useState, useEffect, useRef } from 'react'
import * as api from '../lib/api.js'
import { 
  Sparkles, Calendar, BookOpen, Video, Mail, CheckCircle, 
  X, Printer, Play, Heart, Flame, ShieldAlert, Award, 
  ChevronRight, BarChart3, TrendingUp, HelpCircle, Activity, Bookmark
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

const MOOD_COLOR = m => {
  if (m == null) return '#888'
  if (m <= 3) return '#5DCAA5' // Ease / calm
  if (m <= 5) return '#AFA9EC' // Balanced
  if (m <= 7) return '#EF9F27' // Warning / stress
  return '#E24B4A' // High distress
}

const MOOD_LABEL = m => {
  if (m == null) return ''
  if (m <= 3) return 'Calm'
  if (m <= 5) return 'Stable'
  if (m <= 7) return 'Stressed'
  return 'Distressed'
}

export default function LifeReport() {
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [activeItem, setActiveItem] = useState(null) // For timeline item detail modal
  const [playingVideo, setPlayingVideo] = useState(null) // For video reflection playback modal
  const [readingMode, setReadingMode] = useState(false) // Toggle reading mode for the letter

  const printRef = useRef(null)

  useEffect(() => {
    fetchReport()
  }, [])

  async function fetchReport() {
    setLoading(true)
    setError('')
    try {
      const data = await api.getLifeReport()
      if (data.reason === 'not_enough_data') {
        setError(data.message)
      } else {
        setReport(data)
      }
    } catch (err) {
      setError(err.message || 'Failed to generate your Life Report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Native print handler
  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6" style={{ background: '#0f0f13' }}>
        <div className="relative mb-12">
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#7F77DD]/10 border border-[#7F77DD]/30">
            <Sparkles size={32} className="text-[#AFA9EC] animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full animate-ping bg-[#7F77DD]/10" style={{ transform: 'scale(1.4)', animationDuration: '3s' }} />
        </div>
        <h2 className="text-xl font-light mb-2 text-[#e8e6f0]">Mirroring your history…</h2>
        <p className="text-xs text-white/40 max-w-xs leading-relaxed">
          Aggregating your journals, video reflections, companion insights, and action memories into a personalized story of growth.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6" style={{ background: '#0f0f13' }}>
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-red-400">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-lg font-medium text-white mb-2">Unlocking Life Report</h2>
        <p className="text-sm text-white/50 max-w-sm mb-8 leading-relaxed">
          {error}
        </p>
        <button
          onClick={fetchReport}
          className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
        >
          Try Again
        </button>
      </div>
    )
  }

  const { stats, timeline, letter, aiJourneySummary, whatHelps, whatDoesntHelp, resolutionInsights, adviceFromPastSelf, patterns } = report

  // Split letter paragraphs
  const letterParagraphs = letter ? letter.split(/\n{2,}/).filter(Boolean) : []

  return (
    <div className="min-h-full py-8 px-4 sm:px-8 relative" style={{ background: '#0f0f13', color: '#e8e6f0' }}>
      
      {/* Global CSS Style tag to handle custom A4 Multi-page printing/PDF export perfectly */}
      <style>{`
        @media print {
          /* Hide sidebar, navigation and action elements */
          body, html {
            background: #ffffff !important;
            color: #111111 !important;
          }
          aside, nav, button, .no-print, header, .print-btn {
            display: none !important;
          }
          /* Expand layout to full-width */
          .main-content, .print-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #111111 !important;
          }
          /* Print styled cards and text styling */
          .print-card {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            color: #111111 !important;
            box-shadow: none !important;
            margin-bottom: 1.5rem !important;
            page-break-inside: avoid !important;
          }
          .print-text {
            color: #111111 !important;
          }
          .print-muted {
            color: #4a5568 !important;
          }
          .print-border {
            border-color: #cbd5e1 !important;
          }
          .print-page-break {
            page-break-before: always !important;
          }
          .print-timeline-line {
            background-color: #cbd5e1 !important;
          }
          .print-timeline-dot {
            border-color: #ffffff !important;
            background-color: #4a5568 !important;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className={`max-w-5xl mx-auto print-wrapper ${readingMode ? 'max-w-2xl' : ''}`}>
        
        {/* Header (hidden in readingMode to focus on letter) */}
        {!readingMode && (
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-white/5 no-print">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={16} className="text-[#AFA9EC]" />
                <span className="text-xs font-semibold tracking-wider uppercase text-[#AFA9EC]">Flagship Feature</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Personal Life Report</h1>
              <p className="text-xs text-white/40 mt-0.5">A reflective synthesis of your history and growth patterns</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white/80"
              >
                <Printer size={13} />
                Export Life Report as PDF
              </button>
            </div>
          </header>
        )}

        {/* ── SECTION 9 — LETTER FROM MINDMIRROR ── */}
        <section className={`rounded-3xl border mb-10 transition-all duration-300 relative ${
          readingMode 
            ? 'p-8 sm:p-12 bg-[#171620]/40 border-white/10 shadow-2xl mt-12' 
            : 'p-6 sm:p-8 bg-gradient-to-br from-[#1b1926] to-[#12111a] border-white/5 shadow-xl'
        } print-card`}>
          
          {/* Header controls inside card */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5 print-border no-print">
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-[#D4537E]" />
              <span className="text-xs font-bold tracking-widest uppercase text-white/40 print-muted">Letter from MindMirror</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setReadingMode(!readingMode)}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white/80"
              >
                {readingMode ? 'Show Full Report' : 'Focus Mode'}
              </button>
            </div>
          </div>

          {/* Letter Body (Using Elegant Serif Typography) */}
          <div 
            ref={printRef}
            className="prose max-w-none print-text" 
            style={{ 
              fontFamily: "'EB Garamond', Georgia, serif", 
              lineHeight: 1.85,
              fontSize: readingMode ? '19px' : '17px',
              color: 'rgba(232, 230, 240, 0.9)'
            }}
          >
            {letterParagraphs.map((para, i) => (
              <p 
                key={i} 
                className="mb-6 leading-relaxed" 
                style={{
                  textIndent: i > 0 ? '1.5em' : '0',
                  color: 'inherit',
                  ...(i === 0 ? { fontSize: '1.05em', fontWeight: '500' } : {}),
                  ...(i === letterParagraphs.length - 1 ? { fontStyle: 'italic', marginTop: '2.5rem', color: 'rgba(232, 230, 240, 0.65)' } : {})
                }}
              >
                {para}
              </p>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 print-border flex justify-between items-center text-[10px] text-white/30 print-muted">
            <span>Written fresh based on your unique history</span>
            <span>{format(new Date(), 'MMMM d, yyyy')}</span>
          </div>
        </section>

        {/* If readingMode is active, hide everything else */}
        {!readingMode && (
          <div className="space-y-10 fade-up">
            
            {/* ── SECTION 8 — PERSONAL STATS ── */}
            <section className="print-page-break">
              <h2 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-5 flex items-center gap-2 print-muted">
                <BarChart3 size={14} className="text-[#7F77DD]" />
                Personal stats
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 print-card">
                  <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider print-muted">Journal Entries</span>
                  <div className="text-3xl font-light mt-2 text-[#7F77DD]">{stats.journalEntriesWritten}</div>
                  <p className="text-[10px] text-white/40 mt-1">Written to date</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 print-card">
                  <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider print-muted">Current Streak</span>
                  <div className="text-3xl font-light mt-2 text-[#5DCAA5] flex items-center gap-1">
                    {stats.currentStreak}
                    <Flame size={20} className="text-orange-500 fill-orange-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">Consecutive days</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 print-card">
                  <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider print-muted">Average Mood</span>
                  <div className="text-3xl font-light mt-2 text-[#EF9F27]">{stats.averageMood ?? '—'}<span className="text-xs text-white/30">/10</span></div>
                  <p className="text-[10px] text-white/40 mt-1">Average distress score</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 print-card">
                  <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider print-muted">Milestones Hit</span>
                  <div className="text-3xl font-light mt-2 text-[#AFA9EC] flex items-center gap-1.5">
                    {stats.growthMilestones}
                    <Award size={18} className="text-[#AFA9EC]" />
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">Major events log</p>
                </div>
              </div>
            </section>

            {/* Grid for AI Journey & Helpful/Unhelpful Actions */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 print-page-break">
              
              {/* ── SECTION 2 — AI JOURNEY SUMMARY ── */}
              <div className="md:col-span-6 space-y-6">
                <section className="h-full flex flex-col">
                  <h2 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-4 flex items-center gap-2 print-muted">
                    <TrendingUp size={14} className="text-[#5DCAA5]" />
                    AI Journey Summary
                  </h2>
                  <div className="flex-1 p-6 rounded-2xl bg-white/[0.02] border border-white/5 print-card flex flex-col justify-center">
                    <p className="text-sm leading-relaxed text-white/70 print-text">
                      {aiJourneySummary}
                    </p>
                    {stats.mostCommonTheme && (
                      <div className="mt-6 pt-4 border-t border-white/5 print-border flex items-center justify-between text-xs">
                        <span className="text-white/40 print-muted">Dominant theme:</span>
                        <span className="font-semibold text-[#AFA9EC]">{stats.mostCommonTheme.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* ── SECTION 3 & 4 — WHAT HELPS / DOESN'T HELP ── */}
              <div className="md:col-span-6 space-y-6">
                <section>
                  <h2 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-4 flex items-center gap-2 print-muted">
                    <Activity size={14} className="text-[#EF9F27]" />
                    Coping analysis
                  </h2>

                  <div className="space-y-4">
                    {/* What Helps */}
                    <div className="p-5 rounded-2xl bg-[#152a22]/30 border border-[#2e6d53]/20 print-card">
                      <h3 className="text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-3">What usually helps</h3>
                      <ul className="space-y-2.5">
                        {whatHelps.map((h, i) => (
                          <li key={i} className="flex justify-between items-center text-xs">
                            <span className="text-white/80 print-text flex items-center gap-2">
                              <span className="text-[#5DCAA5]">✓</span> {h.action}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#5DCAA5]/10 text-[#5DCAA5]">
                              {h.confidence} Confidence
                            </span>
                          </li>
                        ))}
                        {whatHelps.length === 0 && <p className="text-xs text-white/40">No positive coping records yet.</p>}
                      </ul>
                    </div>

                    {/* What Doesn't Help */}
                    <div className="p-5 rounded-2xl bg-[#2e1d1f]/30 border border-[#6b2f34]/20 print-card">
                      <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">What usually doesn't help</h3>
                      <ul className="space-y-2.5">
                        {whatDoesntHelp.map((dh, i) => (
                          <li key={i} className="text-xs leading-relaxed">
                            <span className="text-white/80 print-text font-medium flex items-center gap-2">
                              <span className="text-red-400">✗</span> {dh.action}
                            </span>
                            <p className="text-[10px] text-white/40 mt-0.5 ml-4 print-muted">{dh.explanation}</p>
                          </li>
                        ))}
                        {whatDoesntHelp.length === 0 && <p className="text-xs text-white/40">No negative outcomes documented yet.</p>}
                      </ul>
                    </div>
                  </div>
                </section>
              </div>

            </div>

            {/* ── SECTION 7 — PATTERN DETECTION ── */}
            <section className="print-page-break">
              <h2 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-5 flex items-center gap-2 print-muted">
                <Bookmark size={14} className="text-[#AFA9EC]" />
                Pattern Detection
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {patterns.map((pat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all flex gap-3 items-start print-card">
                    <div className="w-6 h-6 rounded-lg bg-[#AFA9EC]/10 text-[#AFA9EC] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles size={12} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#AFA9EC] mb-0.5">Pattern {i + 1}</h4>
                      <p className="text-xs text-white/60 leading-relaxed print-text">{pat}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECTION 5 — RESOLUTION INSIGHTS ── */}
            <section className="print-page-break">
              <h2 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-5 flex items-center gap-2 print-muted">
                <CheckCircle size={14} className="text-[#5DCAA5]" />
                Resolution Insights
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resolutionInsights.map(resObj => (
                  <div key={resObj.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between print-card">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <span className="text-[10px] font-bold text-[#5DCAA5] uppercase tracking-wider">RESOLVED ISSUE</span>
                        <span className="text-[10px] text-white/30">{format(new Date(resObj.dateResolved), 'MMM d, yyyy')}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-2">{resObj.title.replace(/_/g, ' ')}</h3>
                      
                      <div className="space-y-3 mt-4">
                        <div className="p-3 rounded-lg bg-white/[0.01] border border-white/5">
                          <p className="text-[9px] uppercase font-bold text-white/40 mb-1">Resolution Strategy</p>
                          <p className="text-xs text-white/70 print-text leading-relaxed">{resObj.resolutionStrategy}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.01] border border-white/5">
                          <p className="text-[9px] uppercase font-bold text-white/40 mb-1">Lesson Learned</p>
                          <p className="text-xs text-white/70 print-text leading-relaxed">{resObj.lessonsLearned}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {resolutionInsights.length === 0 && (
                  <div className="col-span-full p-8 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                    <p className="text-xs text-white/40">No resolved issues documented yet. Solve issues in your Journal to reflect insights here.</p>
                  </div>
                )}
              </div>
            </section>

            {/* ── SECTION 6 — ADVICE FROM YOUR PAST SELF ── */}
            <section className="print-page-break">
              <h2 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-5 flex items-center gap-2 print-muted">
                <Video size={14} className="text-[#AFA9EC]" />
                Advice From Your Past Self
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adviceFromPastSelf.map(videoObj => (
                  <div key={videoObj._id} className="rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all flex flex-col justify-between print-card">
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <span className="text-[10px] font-bold text-[#AFA9EC] uppercase tracking-wider">Video Reflection</span>
                          <span className="text-[10px] text-white/30">{format(new Date(videoObj.date), 'MMM d, yyyy')}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-2">{videoObj.title}</h3>
                        
                        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mt-2">
                          <p className="text-[9px] uppercase font-bold text-[#AFA9EC] mb-1">Why watch this now?</p>
                          <p className="text-xs text-white/70 leading-relaxed print-text">{videoObj.whyValuable}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setPlayingVideo(videoObj)}
                        className="flex items-center justify-center gap-2 px-4 py-2 w-full rounded-xl text-xs font-semibold bg-[#7F77DD] text-white transition-opacity hover:opacity-90 mt-2 no-print"
                      >
                        <Play size={12} fill="white" />
                        Play Video Reflection
                      </button>
                    </div>
                  </div>
                ))}
                {adviceFromPastSelf.length === 0 && (
                  <div className="col-span-full p-8 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                    <p className="text-xs text-white/40">No video reflections recorded yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* ── SECTION 1 — GROWTH TIMELINE ── */}
            <section className="print-page-break">
              <h2 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-5 flex items-center gap-2 print-muted">
                <Calendar size={14} className="text-[#5DCAA5]" />
                Growth Timeline
              </h2>

              <div className="relative pl-6 py-2">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-white/10 print-timeline-line" />
                <div className="flex flex-col gap-5">
                  {timeline.map((item) => {
                    const isMilestone = item.type === 'resolved' || item.mood_score >= 8;
                    return (
                      <div key={item.id} className="relative group">
                        
                        {/* Timeline dot marker */}
                        <div 
                          className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-[#0f0f13] print-timeline-dot transition-all group-hover:scale-125"
                          style={{
                            borderColor: item.type === 'resolved' 
                              ? '#5DCAA5' 
                              : item.type === 'video' 
                                ? '#AFA9EC' 
                                : item.type === 'future_letter' 
                                  ? '#3b82f6' 
                                  : MOOD_COLOR(item.mood_score)
                          }}
                        />

                        {/* Interactive Timeline Card */}
                        <div 
                          onClick={() => setActiveItem(item)}
                          className="rounded-2xl p-4 cursor-pointer transition-all hover:bg-white/[0.04] bg-white/[0.02] border border-white/5 hover:border-white/10 print-card"
                        >
                          <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-white/40 print-muted">{format(parseISO(item.date), 'MMM d, yyyy')}</span>
                              <span className="text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider"
                                style={{
                                  background: item.type === 'resolved' 
                                    ? 'rgba(93,202,165,0.1)' 
                                    : item.type === 'video' 
                                      ? 'rgba(175,169,236,0.1)' 
                                      : item.type === 'future_letter' 
                                        ? 'rgba(59,130,246,0.1)' 
                                        : 'rgba(255,255,255,0.05)',
                                  color: item.type === 'resolved' 
                                    ? '#5DCAA5' 
                                    : item.type === 'video' 
                                      ? '#AFA9EC' 
                                      : item.type === 'future_letter' 
                                        ? '#60a5fa' 
                                        : '#ffffff'
                                }}
                              >
                                {item.type.replace(/_/g, ' ')}
                              </span>
                            </div>

                            {item.mood_score && (
                              <span className="text-[10px] font-semibold" style={{ color: MOOD_COLOR(item.mood_score) }}>
                                Mood: {item.mood_score}/10
                              </span>
                            )}
                          </div>

                          <h3 className="text-xs font-semibold text-white/90 mb-1 leading-snug group-hover:text-[#AFA9EC] transition-colors">{item.title}</h3>
                          <p className="text-xs text-white/50 print-muted line-clamp-1 leading-relaxed">{item.detail}</p>
                          
                          {/* Indicator for interactive clicking details popup */}
                          <div className="flex justify-end text-[9px] text-[#AFA9EC] font-semibold opacity-0 group-hover:opacity-100 transition-opacity no-print">
                            View details <ChevronRight size={10} className="mt-0.5 ml-0.5" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

          </div>
        )}

      </div>

      {/* ── TIMELINE DETAIL POPUP MODAL ── */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveItem(null)}
        >
          <div className="relative w-full max-w-lg bg-[#13121a] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setActiveItem(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10">
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-xs text-white/40">
              <Calendar size={12} />
              <span>{format(parseISO(activeItem.date), 'MMMM d, yyyy')}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider bg-white/5 text-white ml-2">
                {activeItem.type.replace(/_/g, ' ')}
              </span>
            </div>

            <h3 className="text-base font-semibold text-white">{activeItem.title}</h3>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 mt-2">
              <p className="text-xs leading-relaxed text-white/80 whitespace-pre-wrap">{activeItem.detail}</p>
            </div>

            {activeItem.mood_score && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-white/40">Distress Rating:</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: `${MOOD_COLOR(activeItem.mood_score)}20`,
                    color: MOOD_COLOR(activeItem.mood_score),
                    border: `1px solid ${MOOD_COLOR(activeItem.mood_score)}40`
                  }}
                >
                  {activeItem.mood_score}/10 · {MOOD_LABEL(activeItem.mood_score)}
                </span>
              </div>
            )}

            {activeItem.themes && activeItem.themes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeItem.themes.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/60">
                    {t.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}

            {activeItem.triggers && activeItem.triggers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {activeItem.triggers.map(tr => (
                  <span key={tr} className="text-[10px] px-2 py-0.5 rounded-full border border-red-500/10 bg-red-500/5 text-red-400">
                    Trigger: {tr}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VIDEO PLAYBACK MODAL ── */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPlayingVideo(null)}
        >
          <div className="relative w-full max-w-2xl bg-[#13121a] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setPlayingVideo(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10">
              <X size={18} />
            </button>
            <div className="flex items-center justify-between text-xs text-white/40 pr-8">
              <h3 className="font-semibold text-white text-sm">{playingVideo.title}</h3>
              <span>{format(new Date(playingVideo.date), 'MMM d, yyyy')}</span>
            </div>
            
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/5 relative mt-2">
              <video src={playingVideo.videoUrl} controls autoPlay className="w-full h-full" />
            </div>

            {playingVideo.note && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mt-2">
                <p className="text-[9px] uppercase font-bold tracking-wider text-white/40 mb-1">Reflection Note</p>
                <p className="text-xs leading-relaxed text-white/70 whitespace-pre-wrap">{playingVideo.note}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

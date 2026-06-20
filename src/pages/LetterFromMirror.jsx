import { useState, useRef } from 'react'
import { Sparkles, RefreshCw, Printer, BookOpen, ChevronDown } from 'lucide-react'
import { getLetterFromMirror } from '../lib/api.js'
import { format } from 'date-fns'

const MOOD_DIRECTION_LABEL = {
  improving: { text: 'distress easing over time', color: '#5DCAA5' },
  worsening: { text: 'carrying more lately', color: '#EF9F27' },
  stable: { text: 'holding steady', color: '#AFA9EC' },
}

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-light mb-0.5" style={{ color: '#e8e6f0', letterSpacing: '-0.02em' }}>{value}</div>
      <div className="text-xs" style={{ color: 'rgba(232,230,240,0.4)', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  )
}

function IdleState({ onGenerate }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      {/* Candle / ambient glow element */}
      <div className="relative mb-10">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(127,119,221,0.1)', border: '1px solid rgba(127,119,221,0.2)' }}>
          <BookOpen size={24} style={{ color: '#AFA9EC' }} />
        </div>
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(127,119,221,0.15) 0%, transparent 70%)', transform: 'scale(2.5)' }} />
      </div>

      <h1 className="text-2xl font-light mb-3" style={{ color: '#e8e6f0', letterSpacing: '-0.02em' }}>
        Letter From MindMirror
      </h1>
      <p className="text-sm leading-relaxed mb-10 max-w-sm" style={{ color: 'rgba(232,230,240,0.45)' }}>
        A personal reflection written just for you — drawing on everything you've shared. Your struggles, your growth, your patterns. What MindMirror has noticed.
      </p>

      <button
        onClick={onGenerate}
        className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #7F77DD 0%, #5DCAA5 100%)', color: 'white', boxShadow: '0 4px 24px rgba(127,119,221,0.3)' }}
      >
        <Sparkles size={15} />
        Write my letter
      </button>

      <p className="text-xs mt-5" style={{ color: 'rgba(232,230,240,0.25)' }}>
        Takes 10–20 seconds · Powered by Gemini
      </p>
    </div>
  )
}

function LoadingState() {
  const lines = [
    'Reading your journal entries…',
    'Noticing your patterns…',
    'Tracing your emotional arc…',
    'Finding what mattered most…',
    'Writing your letter…',
  ]
  const [lineIdx, setLineIdx] = useState(0)

  useState(() => {
    const id = setInterval(() => setLineIdx(i => Math.min(i + 1, lines.length - 1)), 2800)
    return () => clearInterval(id)
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="relative mb-10">
        <div className="w-16 h-16 rounded-full" style={{ background: 'rgba(127,119,221,0.06)', border: '1px solid rgba(127,119,221,0.15)' }}>
          <div className="w-full h-full rounded-full animate-spin" style={{ background: 'conic-gradient(from 0deg, transparent 0%, #7F77DD 100%)', opacity: 0.6 }} />
        </div>
      </div>
      <p className="text-sm transition-all" style={{ color: 'rgba(232,230,240,0.5)', minHeight: '1.5em' }}>
        {lines[lineIdx]}
      </p>
    </div>
  )
}

function LetterDisplay({ letter, meta, onRefresh }) {
  const printRef = useRef()
  const moodDir = MOOD_DIRECTION_LABEL[meta.moodDirection]

  function handlePrint() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Letter From MindMirror</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        body { font-family: 'EB Garamond', Georgia, serif; max-width: 640px; margin: 80px auto; padding: 0 40px; color: #1a1921; line-height: 1.9; font-size: 17px; }
        h2 { font-size: 13px; font-family: sans-serif; letter-spacing: 0.1em; text-transform: uppercase; color: #999; font-weight: 400; margin-bottom: 48px; }
        p { margin-bottom: 1.4em; }
        .stats { display: flex; gap: 48px; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 1px solid #eee; }
        .stat-val { font-size: 24px; color: #1a1921; display: block; }
        .stat-lab { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.08em; }
        .date { font-size: 12px; color: #bbb; font-family: sans-serif; margin-top: 48px; }
        @media print { body { margin: 40px auto; } }
      </style>
      </head><body>${content}</body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 400)
  }

  // Split letter into paragraphs
  const paragraphs = letter.split(/\n{2,}/).filter(Boolean)

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #7F77DD, #5DCAA5)' }} />
          <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(232,230,240,0.35)' }}>
            Letter From MindMirror
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Stat value={meta.totalEntries} label="entries written" />
          <Stat value={meta.resolvedCount} label="things resolved" />
          <Stat
            value={<span style={{ color: moodDir?.color, fontSize: '14px' }}>{moodDir?.text || meta.moodDirection}</span>}
            label="emotional arc"
          />
        </div>

        {/* Date span */}
        {meta.dateRange?.first && (
          <p className="text-xs text-center" style={{ color: 'rgba(232,230,240,0.25)', letterSpacing: '0.04em' }}>
            {format(new Date(meta.dateRange.first), 'MMMM d, yyyy')} — {format(new Date(meta.dateRange.last), 'MMMM d, yyyy')}
          </p>
        )}
      </div>

      {/* The letter itself */}
      <div
        ref={printRef}
        className="mb-12"
        style={{
          fontFamily: "'EB Garamond', 'Georgia', serif",
        }}
      >
        <div className="hidden" aria-hidden>
          <h2>Letter From MindMirror</h2>
          <div className="stats">
            <div><span className="stat-val">{meta.totalEntries}</span><span className="stat-lab">entries</span></div>
            <div><span className="stat-val">{meta.resolvedCount}</span><span className="stat-lab">resolved</span></div>
          </div>
        </div>

        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="leading-loose mb-6"
            style={{
              color: 'rgba(232,230,240,0.88)',
              fontSize: '17px',
              letterSpacing: '0.01em',
              // First paragraph slightly larger
              ...(i === 0 ? { fontSize: '18px', color: '#e8e6f0' } : {}),
              // Last paragraph in italic
              ...(i === paragraphs.length - 1 ? { fontStyle: 'italic', color: 'rgba(232,230,240,0.65)', marginTop: '2rem' } : {}),
            }}
          >
            {para.trim()}
          </p>
        ))}

        <p className="date text-xs mt-8" style={{ color: 'rgba(232,230,240,0.25)', fontFamily: 'system-ui', letterSpacing: '0.04em' }}>
          Generated {format(new Date(), 'MMMM d, yyyy')} · MindMirror
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(127,119,221,0.4)' }} />
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(232,230,240,0.6)' }}
        >
          <Printer size={13} /> Print / Save PDF
        </button>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(232,230,240,0.6)' }}
        >
          <RefreshCw size={13} /> Regenerate
        </button>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: 'rgba(232,230,240,0.2)' }}>
        Each letter is written fresh based on your actual history.
      </p>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <p className="text-sm mb-4" style={{ color: '#f09595' }}>{message}</p>
      <button onClick={onRetry} className="text-sm px-5 py-2.5 rounded-xl transition-opacity hover:opacity-80"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,230,240,0.6)' }}>
        Try again
      </button>
    </div>
  )
}

export default function LetterFromMirror() {
  const [state, setState] = useState('idle') // idle | loading | ready | error
  const [letter, setLetter] = useState(null)
  const [meta, setMeta] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function generate() {
    setState('loading')
    setErrorMsg('')
    try {
      const data = await getLetterFromMirror()
      if (data.reason === 'not_enough_data') {
        setErrorMsg(data.message)
        setState('error')
        return
      }
      setLetter(data.letter)
      setMeta(data.meta)
      setState('ready')
    } catch (e) {
      setErrorMsg(e.message || 'Something went wrong. Please try again.')
      setState('error')
    }
  }

  function reset() {
    setState('idle')
    setLetter(null)
    setMeta(null)
  }

  return (
    <div className="min-h-full" style={{ background: '#0f0f13' }}>
      {state === 'idle' && <IdleState onGenerate={generate} />}
      {state === 'loading' && <LoadingState />}
      {state === 'ready' && letter && meta && <LetterDisplay letter={letter} meta={meta} onRefresh={generate} />}
      {state === 'error' && <ErrorState message={errorMsg} onRetry={reset} />}
    </div>
  )
}
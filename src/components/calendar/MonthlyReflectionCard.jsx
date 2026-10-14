import React from 'react'
import {
  Sparkles, RefreshCw, HelpCircle, Heart, Bookmark, AlertTriangle, ShieldCheck,
  CheckCircle2, MessageSquareQuote, Compass
} from 'lucide-react'

export default function MonthlyReflectionCard({
  reflection,
  monthName,
  year,
  onRegenerate,
  isRegenerating,
}) {
  if (!reflection) return null

  const {
    summary,
    emotionalThemes = [],
    notableChanges = [],
    recurringTopics = [],
    positiveMoments = [],
    reflectionQuestions = [],
    uncertaintyNotes,
    disclaimer,
    generatedAt,
  } = reflection

  return (
    <div className="rounded-[28px] p-6 sm:p-8 bg-gradient-to-br from-lav-50/80 via-white/80 to-blush-50/70 border border-lav-200/80 shadow-[0_12px_40px_rgba(156,139,207,0.12)] space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10 text-primary shadow-xs">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif text-lg font-bold text-text">
                {monthName} {year} Reflection
              </h4>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Gemini AI Synthesis
              </span>
            </div>
            <p className="text-xs text-text/50">
              A holistic perspective on your monthly emotional patterns and growth
            </p>
          </div>
        </div>

        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="self-start sm:self-auto text-xs px-3.5 py-1.5 rounded-xl border border-black/10 bg-white/70 hover:bg-white text-text/70 hover:text-text font-medium flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
            <span>{isRegenerating ? 'Synthesizing...' : 'Regenerate'}</span>
          </button>
        )}
      </div>

      {/* ── Monthly Summary ── */}
      {summary && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-white shadow-xs">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <MessageSquareQuote size={13} />
            <span>Monthly Narrative</span>
          </p>
          <p className="text-sm font-serif text-text/85 leading-relaxed italic">
            "{summary}"
          </p>
        </div>
      )}

      {/* ── Key Patterns Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emotional Themes */}
        <div className="p-4 rounded-2xl bg-white/60 border border-white/80 space-y-2">
          <h5 className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5 text-lav-500">
            <Bookmark size={13} />
            <span>Recurring Emotional Themes</span>
          </h5>
          <ul className="space-y-1.5 text-xs text-text/75">
            {emotionalThemes.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notable Changes */}
        <div className="p-4 rounded-2xl bg-white/60 border border-white/80 space-y-2">
          <h5 className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5 text-accent">
            <Compass size={13} />
            <span>Notable Emotional Shifts</span>
          </h5>
          <ul className="space-y-1.5 text-xs text-text/75">
            {notableChanges.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recurring Topics */}
        <div className="p-4 rounded-2xl bg-white/60 border border-white/80 space-y-2">
          <h5 className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5 text-amber-600">
            <Bookmark size={13} />
            <span>Recurring Life Topics</span>
          </h5>
          <ul className="space-y-1.5 text-xs text-text/75">
            {recurringTopics.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Positive Moments & Achievements */}
        <div className="p-4 rounded-2xl bg-white/60 border border-white/80 space-y-2">
          <h5 className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5 text-emerald-600">
            <Heart size={13} />
            <span>Moments of Resilience & Joy</span>
          </h5>
          <ul className="space-y-1.5 text-xs text-text/75">
            {positiveMoments.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✨</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Reflection Questions ── */}
      {reflectionQuestions.length > 0 && (
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/15 space-y-2.5">
          <h5 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle size={13} />
            <span>Gentle Questions for You to Ponder</span>
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {reflectionQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/70 border border-white text-xs text-text/80 leading-relaxed italic"
              >
                "{q}"
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Uncertainty / Low Data Observation ── */}
      {uncertaintyNotes && (
        <div className="p-3 rounded-xl bg-lav-100/40 text-[11px] text-text/60 italic flex items-center gap-2">
          <span>ℹ️</span>
          <span>{uncertaintyNotes}</span>
        </div>
      )}

      {/* ── Disclaimer ── */}
      <div className="pt-2 flex items-center gap-2 text-[10px] text-text/40 border-t border-black/5">
        <ShieldCheck size={13} className="text-primary/60 shrink-0" />
        <span>
          {disclaimer ||
            'These reflections are generated to support mindful self-exploration. They are not psychological assessments or medical diagnoses.'}
        </span>
      </div>
    </div>
  )
}

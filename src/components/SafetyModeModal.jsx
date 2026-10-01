import { useState } from 'react'
import { Phone, Heart, ShieldAlert, Sparkles, UserCheck, X, Play, Video, Mic, Type } from 'lucide-react'

export default function SafetyModeModal({ support, onClose }) {
  const [showGroundingMessage, setShowGroundingMessage] = useState(false)

  if (!support) return null

  const {
    message = "You don't have to handle this moment alone.",
    resources = [],
    groundingMessage = null,
  } = support

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-5 border border-red-500/30"
        style={{ background: 'var(--color-surface, #19181f)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-500/15 flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                Safety & Support Mode
              </span>
              <h2 className="text-lg font-bold text-text mt-0.5">
                You don't have to handle this moment alone.
              </h2>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-border/20 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <p className="text-xs text-text-muted leading-relaxed">
          {message} If you are feeling overwhelmed, hopeless, or in distress, please connect with someone who can support you right now.
        </p>

        {/* ── GROUNDING MESSAGE (from Future Self) ── */}
        {groundingMessage && (
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/25 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles size={14} />
                <span>Your Past Self's Grounding Anchor</span>
              </div>
              <span className="text-[10px] text-text-faint">Created when feeling okay</span>
            </div>

            <p className="text-xs text-text-muted italic">
              "A personal reminder from when you felt okay. Not a replacement for professional support."
            </p>

            {!showGroundingMessage ? (
              <button
                type="button"
                onClick={() => setShowGroundingMessage(true)}
                className="mt-1 py-2 px-4 rounded-xl bg-primary text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                {groundingMessage.messageType === 'video' && <Video size={14} />}
                {groundingMessage.messageType === 'audio' && <Mic size={14} />}
                {groundingMessage.messageType === 'text' && <Type size={14} />}
                {groundingMessage.messageType === 'text' ? 'Read Message to Future Self' : 'Listen / Watch Grounding Message'}
              </button>
            ) : (
              <div className="mt-2 p-3 rounded-xl bg-surface border border-surface-border flex flex-col gap-2">
                {groundingMessage.messageType === 'video' && (
                  <video
                    src={groundingMessage.mediaUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full aspect-video rounded-lg object-cover"
                  />
                )}
                {groundingMessage.messageType === 'audio' && (
                  <audio src={groundingMessage.mediaUrl} controls autoPlay className="w-full" />
                )}
                {groundingMessage.messageType === 'text' && (
                  <p className="text-xs text-text leading-relaxed whitespace-pre-wrap">
                    {groundingMessage.text}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowGroundingMessage(false)}
                  className="text-[11px] text-text-faint hover:text-text-muted self-end underline"
                >
                  Hide Grounding Message
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CRISIS HELPLINES ── */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-text uppercase tracking-wider">
            Free, Confidential 24/7 Helplines:
          </h3>
          <div className="flex flex-col gap-2">
            {resources.map((res, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-surface border border-surface-border flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-text">{res.name}</h4>
                  <p className="text-[11px] text-text-faint">{res.hours || 'Available 24/7'}</p>
                </div>
                <a
                  href={`tel:${res.contact}`}
                  className="py-1.5 px-3 rounded-lg bg-red-500/15 text-red-400 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-red-500/25 transition-colors shrink-0"
                >
                  <Phone size={12} />
                  {res.contact}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ── EMERGENCY & TRUSTED HUMAN SUPPORT ── */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-surface border border-surface-border flex flex-col justify-between gap-1">
            <span className="font-semibold text-text flex items-center gap-1.5">
              <UserCheck size={14} className="text-accent" /> Reach a Trusted Person
            </span>
            <p className="text-[11px] text-text-faint">
              Call or message a close friend, family member, or mentor.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-surface-border flex flex-col justify-between gap-1">
            <span className="font-semibold text-red-400 flex items-center gap-1.5">
              <Phone size={14} /> Immediate Emergency
            </span>
            <p className="text-[11px] text-text-faint">
              Call <strong>112</strong> (India/EU) or <strong>911</strong> (US) if in immediate danger.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-text-faint text-center">
          * AI reflection models detect text patterns only and cannot replace professional medical diagnosis or clinical care.
        </p>
      </div>
    </div>
  )
}

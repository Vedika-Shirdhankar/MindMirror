import { useState, useEffect, useRef } from 'react'
import {
  Heart, ArrowRight, Sparkles, BookOpen, Video, MessageCircle,
  Gamepad2, Shield, TrendingUp, RefreshCw, Users, Star,
  CheckCircle, ChevronDown, Play, Wind, Layers, Zap, X, Leaf
} from 'lucide-react'

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

// ─── Reusable Reveal wrapper ──────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }) {
  const [count, setCount] = useState(0)
  const [ref, visible] = useReveal()
  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = Math.ceil(to / 60)
    const t = setInterval(() => {
      start = Math.min(start + step, to)
      setCount(start)
      if (start >= to) clearInterval(t)
    }, 20)
    return () => clearInterval(t)
  }, [visible, to])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ─── Habit comparison card ────────────────────────────────────────────────────
function HabitCard({ emoji, label, positive }) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
        positive
          ? 'bg-[#5DCAA5]/8 border-[#5DCAA5]/25 text-[#5DCAA5]'
          : 'bg-white/4 border-white/8 text-white/50 hover:text-white/60'
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-sm font-medium">{label}</span>
      {positive && <CheckCircle size={14} className="ml-auto opacity-70" />}
    </div>
  )
}

// ─── Feature pill ─────────────────────────────────────────────────────────────
function FeaturePill({ icon: Icon, label, color }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 hover:scale-[1.03] cursor-default"
      style={{ background: `${color}10`, borderColor: `${color}25`, color }}
    >
      <Icon size={15} />
      {label}
    </div>
  )
}

// ─── Gratitude vault item ─────────────────────────────────────────────────────
function GratitudeItem({ emoji, label, delay }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/75 hover:bg-[#7F77DD]/15 hover:border-[#7F77DD]/30 hover:text-[#AFA9EC] transition-all duration-300 cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.85)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  )
}

// ─── Emotion chip ─────────────────────────────────────────────────────────────
function EmotionChip({ label, color }) {
  return (
    <span
      className="px-4 py-2 rounded-full text-sm font-semibold border"
      style={{ background: `${color}15`, borderColor: `${color}35`, color }}
    >
      {label}
    </span>
  )
}

// ─── Mindshift card ───────────────────────────────────────────────────────────
function MindShift({ from, to }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/8">
      <div className="flex-1 text-center sm:text-right">
        <p className="text-sm text-white/40 line-through leading-relaxed">"{from}"</p>
      </div>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#7F77DD]/20 border border-[#7F77DD]/30 flex items-center justify-center">
        <ArrowRight size={14} className="text-[#7F77DD]" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <p className="text-sm text-[#AFA9EC] font-medium leading-relaxed">"{to}"</p>
      </div>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ badge, title, subtitle, center = true }) {
  return (
    <Reveal>
      <div className={`mb-14 ${center ? 'text-center' : ''}`}>
        {badge && (
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#7F77DD]/20 bg-[#7F77DD]/6 text-[10px] font-bold tracking-widest text-[#AFA9EC] uppercase mb-4 ${center ? 'mx-auto' : ''}`}>
            <Sparkles size={10} />
            {badge}
          </div>
        )}
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">{title}</h2>
        {subtitle && <p className="text-base text-white/50 max-w-2xl leading-relaxed mx-auto">{subtitle}</p>}
      </div>
    </Reveal>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WhyMindMirror({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false)
  const [activeReset, setActiveReset] = useState(0)
  const [videoOpen, setVideoOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const resetTools = [
    { icon: Wind, label: 'Box Breathing', desc: 'Inhale 4s · Hold 4s · Exhale 4s · Hold 4s. Resets your nervous system.', color: '#4A90E2', emoji: '🌬️' },
    { icon: Layers, label: 'Grounding', desc: '5 things you see · 4 you hear · 3 you touch. Brings you back to now.', color: '#5DCAA5', emoji: '🌿' },
    { icon: Sparkles, label: 'Gratitude Spark', desc: 'Name one person, one memory, one thing you still have.', color: '#FAC775', emoji: '✨' },
    { icon: Zap, label: 'Thought Reframe', desc: 'What is the actual worst case? What is likely? What can you control?', color: '#9B5DE5', emoji: '💭' },
    { icon: Gamepad2, label: 'Mind Game', desc: 'A quick calming puzzle that breaks the anxiety loop in 90 seconds.', color: '#F15BB5', emoji: '🎮' },
  ]

  const gratitudeItems = [
    { emoji: '👨‍👩‍👧', label: 'My parents' },
    { emoji: '👫', label: 'My best friend' },
    { emoji: '🎓', label: 'My education' },
    { emoji: '💼', label: 'My dream internship' },
    { emoji: '❤️', label: 'My health' },
    { emoji: '🐶', label: 'My dog' },
    { emoji: '🌱', label: 'My ability to learn' },
    { emoji: '🏠', label: 'A safe home' },
    { emoji: '☕', label: 'My morning coffee' },
    { emoji: '🎵', label: 'Music that heals' },
    { emoji: '📚', label: 'My favourite book' },
    { emoji: '🌅', label: 'Every new morning' },
  ]

  return (
    <div className="why-page min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-[#7F77DD]/12 blur-[160px]" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-[#5DCAA5]/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[500px] rounded-full bg-[#EF9F27]/8 blur-[180px]" />
      </div>
      <div className="pointer-events-none" aria-hidden="true">
        <Leaf className="floating-leaf floating-leaf-one" size={46} style={{ color: '#2f6f68' }} />
        <Leaf className="floating-leaf floating-leaf-two" size={32} style={{ color: '#d48a5a' }} />
        <Leaf className="floating-leaf floating-leaf-three" size={52} style={{ color: '#5d8f77' }} />
        <Leaf className="floating-leaf floating-leaf-four" size={27} style={{ color: '#7f77dd' }} />
      </div>

      {/* ─── Sticky Nav ───────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled ? 'backdrop-blur-md bg-white/80 border-b border-black/5 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-base text-text">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7F77DD, #534AB7)' }}>
              <Heart size={13} color="white" fill="white" />
            </div>
            <span>MindMirror</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-text/60">
            <a href="#why" className="hover:text-text transition-colors">Why</a>
            <a href="#companion" className="hover:text-text transition-colors">Companion</a>
            <a href="#gratitude" className="hover:text-text transition-colors">Gratitude</a>
            <a href="#reset" className="hover:text-text transition-colors">2-Min Reset</a>
          </div>
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold hover:scale-[1.03] transition-all shadow-lg shadow-[#7F77DD]/20"
            style={{ background: '#7F77DD', color: 'white' }}
          >
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-28 text-center max-w-5xl mx-auto px-6 z-10">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#7F77DD]/20 bg-[#7F77DD]/6 text-[10px] font-bold tracking-widest text-[#AFA9EC] uppercase mb-6">
            <Heart size={10} fill="currentColor" /> A different kind of self-care
          </div>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] text-white mb-6 tracking-tight">
            Why does
            <br />
            <span className="bg-gradient-to-r from-[#AFA9EC] via-[#7F77DD] to-[#FAC775] bg-clip-text text-transparent">
              MindMirror exist?
            </span>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
            Because when life feels heavy, most people reach for their phones and scroll until numb.
            MindMirror offers a different path.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold hover:scale-[1.03] transition-all shadow-2xl shadow-[#7F77DD]/20"
              style={{ background: 'linear-gradient(135deg, #7F77DD, #534AB7)', color: 'white' }}
            >
              Start My Journey <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setVideoOpen(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium text-white border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all"
            >
              <Play size={15} className="text-[#7F77DD]" /> Watch Introduction
            </button>
          </div>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-14 flex justify-center gap-10 flex-wrap">
            {[
              { n: 10000, s: '+', label: 'Reflections made' },
              { n: 93, s: '%', label: 'Feel more understood' },
              { n: 2, s: ' min', label: 'To feel better' },
            ].map(({ n, s, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-white">
                  <Counter to={n} suffix={s} />
                </div>
                <div className="text-xs text-white/40 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown size={14} className="animate-bounce" />
        </div>
      </section>

      {/* ─── SECTION 1: Why this exists ───────────────────────── */}
      <section id="why" className="relative z-10 py-24 max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="The Problem"
          title={"When life gets hard,\nmost people do this…"}
          subtitle="We reach for escape instead of understanding. And it makes everything worse."
        />

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Reveal>
            <div className="rounded-3xl p-7 border border-white/8 bg-white/[0.02] h-full">
              <p className="text-sm font-bold uppercase tracking-widest text-white/30 mb-5">The default response</p>
              <div className="flex flex-col gap-3">
                {[
                  { emoji: '📱', label: 'Doom scrolling for hours' },
                  { emoji: '😔', label: 'Comparing yourself to others' },
                  { emoji: '🤐', label: 'Keeping everything inside' },
                  { emoji: '🌀', label: 'Overthinking for hours' },
                  { emoji: '🚫', label: 'Avoiding everything' },
                ].map(h => <HabitCard key={h.label} {...h} positive={false} />)}
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-3xl p-7 border border-[#5DCAA5]/20 bg-[#5DCAA5]/[0.03] h-full">
              <p className="text-sm font-bold uppercase tracking-widest text-[#5DCAA5]/60 mb-5">With MindMirror</p>
              <div className="flex flex-col gap-3">
                {[
                  { emoji: '✍️', label: 'Write one journal entry', positive: true },
                  { emoji: '🎥', label: 'Record a 2-minute reflection', positive: true },
                  { emoji: '🤖', label: 'Talk to your Companion', positive: true },
                  { emoji: '🎮', label: 'Play a 2-minute mind reset', positive: true },
                  { emoji: '💡', label: 'Read what your past self said', positive: true },
                ].map(h => <HabitCard key={h.label} {...h} />)}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="text-center rounded-3xl py-14 px-8 border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed max-w-2xl mx-auto">
              Instead of opening social media —
            </p>
            <p className="text-3xl md:text-4xl font-bold mt-3 bg-gradient-to-r from-[#AFA9EC] to-[#5DCAA5] bg-clip-text text-transparent">
              Open MindMirror. Pause. Reflect. Move forward.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ─── SECTION 2: Companion ─────────────────────────────── */}
      <section id="companion" className="relative z-10 py-24 max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="Your AI Companion"
          title="Not another chatbot."
          subtitle="A companion that actually remembers who you are, what you've been through, and what has helped you before."
        />

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Reveal>
            {/* Fake companion UI */}
            <div className="rounded-3xl p-6 border border-[#7F77DD]/20 bg-[#7F77DD]/[0.04] space-y-4">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-[#7F77DD]/20 border border-[#7F77DD]/30 flex items-center justify-center">
                  <Heart size={16} className="text-[#7F77DD]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Companion</p>
                  <p className="text-xs text-white/40">Remembers your journey</p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-[#5DCAA5] animate-pulse" />
              </div>

              {[
                { from: 'me', text: "I failed my interview. I don't think I'm good enough." },
                { from: 'ai', text: "I remember you felt exactly this after your first internship rejection in March. You wrote that it taught you to prepare differently — and two weeks later you landed an offer. This feeling is familiar, not final." },
                { from: 'me', text: "I forgot about that…" },
                { from: 'ai', text: "That's why I'm here. Your past self left you a message — want to read it?" },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.from === 'me'
                        ? 'bg-[#7F77DD] text-white rounded-br-sm'
                        : 'bg-white/[0.06] text-white/80 border border-white/8 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Your mentor. Your buddy.<br />Your accountability partner.</h3>
              <p className="text-white/55 leading-relaxed">The Companion doesn't just respond — it holds your entire story. Every journal, every reflection, every pattern becomes context it uses to support you better each day.</p>

              <div className="space-y-3">
                {[
                  { icon: BookOpen, label: 'Reads all your journals', color: '#7F77DD' },
                  { icon: Video, label: 'Watches your video reflections', color: '#5DCAA5' },
                  { icon: TrendingUp, label: 'Tracks your emotional patterns', color: '#FAC775' },
                  { icon: MessageCircle, label: 'Remembers past conversations', color: '#AFA9EC' },
                  { icon: Shield, label: 'Only ever yours — private & secure', color: '#5DCAA5' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-white/70">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── SECTION 3: Past Self ─────────────────────────────── */}
      <section className="relative z-10 py-24 max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="Ask Past Self"
          title="Sometimes the best advice comes from you."
          subtitle="When you're calm, record a message. When life gets hard, MindMirror plays it back."
        />

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Reveal>
            <div className="space-y-5">
              <div className="rounded-2xl p-5 border border-white/8 bg-white/[0.02]">
                <p className="text-xs text-white/40 mb-2">3 months ago — June 2025</p>
                <p className="text-white/70 text-sm leading-relaxed italic">
                  "If you're watching this during another rough week: you've been here before and you found your way through. Don't give up on yourself. The preparation you're doing now will matter."
                </p>
                <p className="text-xs text-[#AFA9EC] mt-3 font-medium">— Your past self</p>
              </div>

              <div className="rounded-2xl p-4 border border-[#7F77DD]/20 bg-[#7F77DD]/[0.04] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#7F77DD]/20 flex items-center justify-center flex-shrink-0">
                  <Play size={18} className="text-[#7F77DD] ml-0.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Watch: "Letter to my future self"</p>
                  <p className="text-xs text-white/40 mt-0.5">Recorded during calm · June 14, 2025</p>
                </div>
              </div>

              <p className="text-white/40 text-sm text-center">↑ MindMirror surfaces this when it's most needed</p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Your calmest self, speaking to your most anxious moment.</h3>
              <p className="text-white/55 leading-relaxed">
                Record short video reflections when you feel clear-headed, hopeful, or proud. MindMirror's AI will detect when you're experiencing similar struggles and recommend those recordings back to you — automatically, without you having to remember they exist.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Speech-to-Text', 'AI Analysis', 'Semantic Matching', 'Auto-surfaced'].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-[#7F77DD]/10 border border-[#7F77DD]/20 text-xs text-[#AFA9EC] font-medium">{tag}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── SECTION 4: Gratitude Vault ───────────────────────── */}
      <section id="gratitude" className="relative z-10 py-24 max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="Gratitude Vault"
          title="On hard days, remember what you still have."
          subtitle="Not toxic positivity. Just perspective. The things you saved are still here — even today."
        />

        <Reveal>
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {gratitudeItems.map((item, i) => (
              <GratitudeItem key={item.label} {...item} delay={i * 60} />
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="max-w-2xl mx-auto rounded-3xl p-8 border border-[#FAC775]/15 bg-[#FAC775]/[0.03] text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-white mb-3">Your Gratitude Vault</h3>
            <p className="text-white/55 leading-relaxed text-sm mb-6">
              When you're feeling happy or grateful, save the people, memories, and joys that matter. On your hardest days, MindMirror gently opens the vault and reminds you:
            </p>
            <div className="rounded-2xl p-4 bg-white/[0.03] border border-[#FAC775]/15">
              <p className="text-[#FAC775] text-sm font-medium italic">
                "Even today, these things are still part of your life."
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── SECTION 5: Feelings are normal ──────────────────── */}
      <section className="relative z-10 py-24 max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="You Are Not Broken"
          title="Your feelings are completely normal."
          subtitle="Feeling anxious, overwhelmed, or lonely doesn't make you weak. It makes you human."
        />

        <Reveal>
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {[
              { label: 'Anxious', color: '#E24B4A' },
              { label: 'Overwhelmed', color: '#EF9F27' },
              { label: 'Lonely', color: '#7F77DD' },
              { label: 'Confused', color: '#4A90E2' },
              { label: 'Stressed', color: '#F15BB5' },
              { label: 'Burned out', color: '#E07A5F' },
              { label: 'Uncertain', color: '#5DCAA5' },
              { label: 'Afraid', color: '#9B5DE5' },
            ].map(e => <EmotionChip key={e.label} {...e} />)}
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { stat: '1 in 4', desc: 'people experience significant anxiety at some point in life', color: '#7F77DD' },
              { stat: '78%', desc: 'of students report feeling overwhelmed during exam periods', color: '#5DCAA5' },
              { stat: '68%', desc: 'of young professionals experience imposter syndrome', color: '#FAC775' },
            ].map(({ stat, desc, color }) => (
              <div key={stat} className="text-center rounded-2xl p-6 border border-white/8 bg-white/[0.02]">
                <div className="text-3xl font-bold mb-2" style={{ color }}>{stat}</div>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={300}>
          <p className="text-center text-white/35 text-sm mt-10 max-w-xl mx-auto">
            The goal isn't to eliminate these emotions. The goal is to understand them, learn from them, and move through them — not around them.
          </p>
        </Reveal>
      </section>

      {/* ─── SECTION 6: Mistakes ──────────────────────────────── */}
      <section className="relative z-10 py-24 max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="Growth Mindset"
          title="Everyone makes mistakes. That's not the point."
          subtitle="The question that matters isn't 'why did this happen?' — it's 'what can I do next?'"
        />

        <div className="max-w-2xl mx-auto space-y-4">
          {[
            { from: 'Why did this happen to me?', to: 'What can I learn from this?' },
            { from: 'I always mess everything up.', to: 'What\'s one small thing I can fix?' },
            { from: 'It\'s too late to recover.', to: 'What is still in my control right now?' },
            { from: 'I\'m not good enough.', to: 'Where have I grown that I haven\'t noticed?' },
          ].map((shift, i) => (
            <Reveal key={i} delay={i * 80}>
              <MindShift {...shift} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── SECTION 7: You've grown before ──────────────────── */}
      <section className="relative z-10 py-24 max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="Your Growth Story"
          title="You have survived 100% of your hardest days."
          subtitle="Growth is only visible when you look backward. MindMirror helps you see how far you've come."
        />

        <Reveal>
          <div className="rounded-3xl p-8 md:p-12 border border-white/8 bg-gradient-to-br from-white/[0.03] to-transparent text-center max-w-3xl mx-auto">
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-6">
              "Remember the problems you thought you would <span className="text-[#7F77DD]">never overcome</span>?"
            </p>
            <p className="text-xl text-white/60 mb-8">You made it through every single one of them.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <FeaturePill icon={TrendingUp} label="Life Reports" color="#5DCAA5" />
              <FeaturePill icon={Star} label="Pattern Detection" color="#FAC775" />
              <FeaturePill icon={CheckCircle} label="Resolved Issues" color="#7F77DD" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── SECTION 8: 2-Minute Reset ────────────────────────── */}
      <section id="reset" className="relative z-10 py-24 max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="2-Minute Reset"
          title="Sometimes you only need two minutes."
          subtitle="A full session is great. But sometimes a tiny reset is all it takes to change your trajectory."
        />

        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {resetTools.map((tool, i) => (
            <Reveal key={tool.label} delay={i * 80}>
              <button
                onClick={() => setActiveReset(i)}
                className={`w-full p-5 rounded-2xl border text-center transition-all duration-300 hover:scale-[1.03] ${
                  activeReset === i
                    ? 'border-opacity-50 scale-[1.03]'
                    : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
                style={activeReset === i ? { borderColor: `${tool.color}40`, background: `${tool.color}08` } : {}}
              >
                <div className="text-2xl mb-2">{tool.emoji}</div>
                <p className="text-xs font-semibold text-white/80">{tool.label}</p>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div
            className="max-w-2xl mx-auto rounded-2xl p-6 border transition-all duration-500"
            style={{ borderColor: `${resetTools[activeReset].color}25`, background: `${resetTools[activeReset].color}06` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${resetTools[activeReset].color}20` }}>
                {(() => { const Icon = resetTools[activeReset].icon; return <Icon size={18} style={{ color: resetTools[activeReset].color }} /> })()}
              </div>
              <div>
                <p className="font-semibold text-white mb-1">{resetTools[activeReset].label}</p>
                <p className="text-sm text-white/55 leading-relaxed">{resetTools[activeReset].desc}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── SECTION 9: You're not alone ─────────────────────── */}
      <section className="relative z-10 py-24 max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="You Are Not Alone"
          title="Millions of people feel exactly what you feel."
          subtitle="Exam stress. Career anxiety. Burnout. Loneliness. These aren't weaknesses — they're shared experiences."
        />

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Reveal>
            <div className="space-y-4">
              {[
                { emoji: '📚', label: 'Exam stress & academic pressure' },
                { emoji: '💼', label: 'Placement & career uncertainty' },
                { emoji: '🌀', label: 'Overthinking and rumination' },
                { emoji: '😮‍💨', label: 'Burnout and emotional exhaustion' },
                { emoji: '🤍', label: 'Loneliness and disconnection' },
                { emoji: '🎭', label: 'Imposter syndrome' },
              ].map(({ emoji, label }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/6 text-sm text-white/65">
                  <span className="text-lg">{emoji}</span>
                  {label}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="space-y-6">
              <div className="rounded-3xl p-8 border border-[#7F77DD]/15 bg-[#7F77DD]/[0.04]">
                <Users size={28} className="text-[#7F77DD] mb-4" />
                <p className="text-xl font-bold text-white mb-3">You are understood here.</p>
                <p className="text-white/55 text-sm leading-relaxed">
                  MindMirror was built for people navigating real-life pressures — not people with everything figured out. If you're struggling, you're exactly who this was made for.
                </p>
              </div>
              <div className="rounded-2xl p-5 border border-white/8 bg-white/[0.02]">
                <p className="text-sm text-white/50 italic leading-relaxed">
                  "I didn't realize how much I was carrying alone until I started writing it down. The Companion said things my closest friends never noticed."
                </p>
                <p className="text-xs text-white/30 mt-3">— MindMirror user</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── SECTION 10: This is your journey ────────────────── */}
      <section className="relative z-10 py-24 max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="MindMirror's Promise"
          title="We are not here to fix you."
          subtitle="You are not broken. You are a human being navigating a complex world."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            { emoji: '🧠', title: 'Understand yourself', desc: 'See your thoughts, patterns, and emotions clearly.' },
            { emoji: '🔍', title: 'Recognize patterns', desc: 'Identify recurring triggers before they control you.' },
            { emoji: '💾', title: 'Remember what helped', desc: 'Your coping strategies, saved and searchable.' },
            { emoji: '🌱', title: 'Build healthier habits', desc: 'Small daily reflections create lasting change.' },
            { emoji: '💪', title: 'Become more resilient', desc: 'Every difficulty you log becomes a lesson you keep.' },
            { emoji: '🤝', title: 'Never feel alone', desc: 'Your Companion is always there — even at 2am.' },
          ].map(({ emoji, title, desc }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 transition-all duration-300">
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────── */}
      <section className="relative z-10 py-32 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[#7F77DD]/10 blur-[120px]" />
        </div>

        <Reveal>
          <div className="max-w-3xl mx-auto text-center relative">
            <div className="text-6xl mb-8">✨</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-6">
              You don't need to have
              <br />
              <span className="bg-gradient-to-r from-[#AFA9EC] via-[#7F77DD] to-[#5DCAA5] bg-clip-text text-transparent">
                everything figured out.
              </span>
            </h2>

            <div className="flex flex-col items-center gap-3 mb-10 text-white/50 text-base">
              {[
                'You only need to take one small step today.',
                'One journal. One reflection. One honest moment.',
                'Your future self will thank you.',
              ].map((line, i) => (
                <Reveal key={i} delay={i * 100}>
                  <p className={i === 2 ? 'text-white/70 font-medium' : ''}>{line}</p>
                </Reveal>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold hover:scale-[1.04] active:scale-[0.97] transition-all shadow-2xl shadow-[#7F77DD]/25"
                style={{ background: 'linear-gradient(135deg, #7F77DD, #534AB7)', color: 'white' }}
              >
                🚀 Start My Journey
                <ArrowRight size={20} />
              </button>
            </div>

            <p className="text-xs text-white/25 mt-6">Free forever · No credit card · Your data stays yours</p>
          </div>
        </Reveal>
      </section>

      {/* ─── Video Modal ──────────────────────────────────────── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-3xl overflow-hidden bg-[#14131a] border border-white/10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={15} className="text-white" />
            </button>
            <div className="p-8 sm:p-10 bg-gradient-to-br from-[#0f0f13] to-[#1a1825]">
              <div className="text-center max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#7F77DD]/20 border border-[#7F77DD]/30 flex items-center justify-center mx-auto mb-5">
                  <Heart size={25} className="text-[#AFA9EC]" fill="currentColor" />
                </div>
                <p className="text-white text-xl font-semibold">A kinder way to check in with yourself</p>
                <p className="text-white/60 text-sm leading-relaxed mt-3">Write what is on your mind, notice the patterns that emerge, and return to your own words whenever you need perspective.</p>
              </div>
              <ol className="grid sm:grid-cols-3 gap-3 mt-8 text-left">
                {[
                  ['1', 'Reflect', 'Capture a thought, feeling, or moment.'],
                  ['2', 'Understand', 'Let MindMirror surface gentle patterns.'],
                  ['3', 'Grow', 'Use small tools when you need a reset.'],
                ].map(([number, title, description]) => (
                  <li key={number} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <span className="text-xs font-bold text-[#AFA9EC]">{number}</span>
                    <p className="text-sm font-semibold text-white mt-2">{title}</p>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">{description}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="p-6 flex justify-center border-t border-white/10">
              <button
                onClick={() => { setVideoOpen(false); onGetStarted(); }}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm"
                style={{ background: '#7F77DD', color: 'white' }}
              >
                Start My Journey Instead <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

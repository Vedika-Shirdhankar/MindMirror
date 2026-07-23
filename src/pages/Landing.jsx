import { useState, useEffect } from 'react'
import {
  Heart, Sparkles, BookOpen, Search, HelpCircle, TrendingUp, Mail,
  Gamepad2, CheckCircle2, ArrowRight, Brain, Compass, MessageSquare,
  Shield, Activity, X, Sun, Moon, Smile, Flame, Play, Clock, Scroll, ChevronRight
} from 'lucide-react'
import Auth from './Auth.jsx'
import WhyMindMirror from './WhyMindMirror.jsx'

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('signup')
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState('companion')
  const [showWhy, setShowWhy] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openAuth = (mode) => {
    setAuthModalMode(mode)
    setShowAuthModal(true)
  }

  const storyModules = [
    {
      id: 'companion',
      icon: Heart,
      color: '#635BFF',
      bgColor: '#F0EFFE',
      emoji: '🤝',
      title: 'Someone Who Remembers',
      tagline: 'A supportive friend, not a robotic script.',
      description: 'Interact with an emotionally intelligent partner that feels like a trusted friend. MindMirror remembers your past struggles, notes what helped, and offers warm, personalized support without clinical jargon.',
      value: 'Reduces loneliness and turns emotional logs into a continuous, supportive conversation.'
    },
    {
      id: 'journaling',
      icon: BookOpen,
      color: '#0D9488',
      bgColor: '#CCFBF1',
      emoji: '✍️',
      title: 'Your Quiet Journal',
      tagline: 'Write freely. Let AI handle the rest.',
      description: 'No checkboxes, rating scales, or tedious logging. Just pour your mind out. Our gentle AI automatically notices underlying themes, triggers, and distress levels, building your profile behind the scenes.',
      value: 'Saves time, eliminates self-reporting bias, and captures thoughts in their most authentic form.'
    },
    {
      id: 'video',
      icon: Play,
      color: '#D97706',
      bgColor: '#FEF3C7',
      emoji: '🎥',
      title: 'Video Memories',
      tagline: 'Advice from your past self.',
      description: 'Record short video reflections when you feel calm and clear. MindMirror automatically surfaces those videos back to you when you hit a tough patch, reminding you of your own wisdom.',
      value: 'Allows your past resilience to speak directly to your present struggle.'
    },
    {
      id: 'ladder',
      icon: Brain,
      color: '#EA580C',
      bgColor: '#FFEDD5',
      emoji: '🪜',
      title: 'Thought Ladder',
      tagline: 'Untangle one thought at a time.',
      description: 'When you are caught in a spiral of catastrophic thinking, our Thought Ladder guides you step-by-step. Identify raw facts, analyze your assumptions, and reconstruct a realistic reframe.',
      value: 'Actively de-escalates panic and reframes thoughts using structured cognitive techniques.'
    },
    {
      id: 'games',
      icon: Gamepad2,
      color: '#059669',
      bgColor: '#D1FAE5',
      emoji: '🌸',
      title: '2-Minute Mind Games',
      tagline: 'Interactive resets to quiet noise.',
      description: 'Need immediate distress relief? Engage in rapid grounding games designed to break spirals of overthinking. Play Grounding Hunt, Gratitude Garden, Anxiety Monster, or Thought Cloud Burst.',
      value: 'Brings you back to the present moment through gentle sensory and mindfulness play.'
    },
    {
      id: 'growth',
      icon: TrendingUp,
      color: '#7C3AED',
      bgColor: '#EDE9FE',
      emoji: '🌱',
      title: 'See How Far You\'ve Come',
      tagline: 'Move from open problems to closed files.',
      description: 'Audit and resolve the challenges you log. Mark old entries as resolved, add a note outlining what helped, and build a personalized library of your own coping strategies.',
      value: 'Fosters closure, builds confidence, and shows clear evidence of your emotional growth.'
    }
  ]

  const steps = [
    {
      num: '01',
      emoji: '✍️',
      title: 'Pour Your Mind Out',
      desc: 'Capture thoughts, emotions, worries, and achievements freely in your quiet journal.'
    },
    {
      num: '02',
      emoji: '🌿',
      title: 'Understand What You Feel',
      desc: 'Receive gentle, non-judgmental insights about sentiment, triggers, and themes.'
    },
    {
      num: '03',
      emoji: '💡',
      title: 'Remember What Helped',
      desc: 'MindMirror recalls similar past events, surfacing what worked for you then.'
    },
    {
      num: '04',
      emoji: '🤝',
      title: 'Talk to Your Companion',
      desc: 'Reflect deeply with a companion who holds your context and supports your growth.'
    },
    {
      num: '05',
      emoji: '🌸',
      title: 'Grow & Celebrate',
      desc: 'Mark issues resolved, build your coping playbook, and watch your resilience bloom.'
    }
  ]

  const testimonials = [
    {
      quote: "MindMirror literally remembered an exam anxiety spiral I had three months ago. When I logged stress last night, it quietly reminded me how I got through it back then. It was like hearing from a version of myself that had already won.",
      author: "Aditi S.",
      role: "Undergrad Student"
    },
    {
      quote: "Most journaling apps feel like graves for memories—you put them in and never look again. MindMirror is the first app that actually helps me use my past to solve my present problems. The Thought Ladder is a game-changer.",
      author: "Rohan M.",
      role: "Software Developer"
    },
    {
      quote: "The Resolution Tracking feature combined with the Companion personality makes it feel so human. Instead of just validating that I'm sad, it actually reminds me what worked last time and nudges me to close old files.",
      author: "Tanya K.",
      role: "Creative Designer"
    }
  ]

  return (
    <div className="min-h-screen text-[#2D3748] selection:bg-[#7C3AED]/20 selection:text-[#5B21B6] relative bg-[#FAF9F6] overflow-x-hidden font-sans">
      {/* Show Why MindMirror page when triggered */}
      {showWhy && (
        <WhyMindMirror onGetStarted={() => { setShowWhy(false); openAuth('signup') }} />
      )}
      
      {showWhy ? null : (
        <>
          {/* Calming Organic Ambient Backgrounds */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-b from-[#E2E8F0]/80 via-[#EDF2F7]/40 to-transparent blur-[140px]" />
            <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] rounded-full bg-[#E6FFFA]/70 blur-[150px]" />
            <div className="absolute bottom-10 -left-20 w-[700px] h-[700px] rounded-full bg-[#FAF5FF]/80 blur-[160px]" />
          </div>

          {/* Airy Navigation Bar */}
          <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl bg-white/80 border-b border-slate-200/60 py-3.5 shadow-sm' : 'bg-transparent py-6'}`}>
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
              <a href="#" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-[#635BFF] to-[#00D4B2] shadow-md shadow-[#635BFF]/15 group-hover:scale-105 transition-transform duration-300">
                  <Heart size={20} color="white" fill="white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-800">MindMirror</span>
              </a>
              
              <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                <a href="#" className="hover:text-slate-900 transition-colors duration-200" onClick={() => setShowWhy(false)}>Home</a>
                <a href="#features" className="hover:text-slate-900 transition-colors duration-200">Features</a>
                <a href="#how-it-works" className="hover:text-slate-900 transition-colors duration-200">How It Works</a>
                <button onClick={() => { setShowWhy(true); window.scrollTo(0,0); }} className="hover:text-slate-900 transition-colors duration-200">Why MindMirror?</button>
                <a href="#about" className="hover:text-slate-900 transition-colors duration-200">Our Story</a>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => openAuth('login')} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 rounded-xl hover:bg-slate-100">
                  Login
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#635BFF]/20 active:scale-95 bg-[#635BFF] hover:bg-[#5249FF] text-white shadow-md shadow-[#635BFF]/15"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 max-w-5xl mx-auto px-6 text-center z-10">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#635BFF]/20 bg-[#635BFF]/5 text-xs font-semibold text-[#5249FF] mb-8 backdrop-blur-md shadow-sm">
              <Sparkles size={14} className="text-[#635BFF] animate-spin" style={{ animationDuration: '6s' }} />
              <span>A peaceful, comforting space for your thoughts</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6 max-w-4xl mx-auto">
              Welcome back.<br />
              <span className="bg-gradient-to-r from-[#5249FF] via-[#0D9488] to-[#D97706] bg-clip-text text-transparent">
                Take a deep breath.
              </span>
            </h1>
            
            <p className="text-lg md:text-2xl font-medium text-slate-700 max-w-2xl mx-auto mb-3 tracking-wide">
              Let's take one small step today.
            </p>

            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              MindMirror is your peaceful journal and memory-aware companion. Write freely, understand what you're feeling, and remember what helped you before — so you never have to face tough moments alone.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <button
                onClick={() => openAuth('signup')}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-base shadow-lg shadow-[#635BFF]/20 hover:shadow-xl hover:shadow-[#635BFF]/30 hover:scale-105 active:scale-95 transition-all duration-300 bg-[#635BFF] hover:bg-[#5249FF] text-white"
              >
                <span>Begin Your Journey</span>
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => { setShowWhy(true); window.scrollTo(0,0); }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-medium text-base border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 text-slate-700 shadow-sm"
              >
                <span>Why MindMirror?</span>
              </button>
            </div>

            {/* Peaceful Light Dashboard Mockup Preview */}
            <div className="mt-16 md:mt-20 rounded-3xl p-3 md:p-4 border border-slate-200/80 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 relative group">
              <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] aspect-[16/9] md:aspect-[21/9] border border-slate-200/60 flex flex-col items-center justify-center p-6 md:p-8 relative">
                
                <div className="z-20 max-w-lg text-center space-y-4 p-6 md:p-8 rounded-2xl bg-white/90 border border-slate-200/80 shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#635BFF] to-[#00D4B2] flex items-center justify-center mx-auto shadow-md shadow-[#635BFF]/20">
                    <Heart size={22} fill="white" className="text-white" />
                  </div>
                  <div className="text-[11px] uppercase tracking-widest text-[#5249FF] font-semibold">Someone who remembers what helped before</div>
                  <p className="text-sm md:text-base text-slate-700 italic leading-relaxed font-medium">
                    "I remember you felt similar anxiety before your exam in March. You wrote that breaking topics into 20-minute chunks helped you regain calm. Would you like to try that today?"
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-ping" />
                    <span className="text-[11px] text-slate-400 tracking-wider uppercase font-semibold">Your Companion is here</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Story Section */}
          <section id="about" className="py-20 md:py-28 border-t border-slate-200/60 relative z-10 bg-white/50">
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Column 1: Core Story */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D97706]/20 bg-[#D97706]/10 text-xs font-semibold text-[#B45309]">
                    <span>🌱 THE STORY BEHIND MINDMIRROR</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                    Created to be a refuge during difficult days.
                  </h2>

                  <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                    MindMirror was born from the personal experiences of its creator, <strong className="text-slate-900 font-semibold">Vedika</strong>. Like many students and young professionals navigating high-pressure transitions, she frequently battled overthinking, anxiety, and emotional overwhelm.
                  </p>

                  <div className="space-y-4 text-slate-600 text-sm md:text-base leading-relaxed">
                    <p>
                      She noticed a pattern: the exact same loops of self-doubt would return periodically. In the middle of those overwhelming moments, it was incredibly hard to remember:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 text-slate-700 font-medium">
                      <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" /> What successfully calmed her down</li>
                      <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" /> How she overcame roadblocks</li>
                      <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" /> Critical lessons already learned</li>
                      <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" /> Her own past strength</li>
                    </ul>
                    <p className="pt-2">
                      Journaling apps existed, but they acted as silent vaults—you write something down, and it gets buried forever. MindMirror bridges yesterday's peace with today's distress.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <p className="text-slate-800 font-semibold text-base mb-3">
                      MindMirror is the companion Vedika wished she had:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm text-[#0D9488] font-semibold">
                      <span className="flex items-center gap-2">✓ A companion that listens with warmth</span>
                      <span className="flex items-center gap-2">✓ A companion that remembers what worked</span>
                      <span className="flex items-center gap-2">✓ A companion that celebrates your growth</span>
                      <span className="flex items-center gap-2">✓ A companion that guides gentle action</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Visual Story Card */}
                <div className="lg:col-span-5">
                  <div className="rounded-3xl p-8 border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60 relative overflow-hidden space-y-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#F0EFFE] border border-[#635BFF]/20 flex items-center justify-center">
                        <Compass className="text-[#635BFF]" size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Our Core Promise</h3>
                        <p className="text-xs text-slate-500">From reflection to resilience</p>
                      </div>
                    </div>

                    <blockquote className="text-sm md:text-base text-slate-700 italic leading-relaxed border-l-2 border-[#635BFF] pl-4 py-1">
                      "We often spend hours overthinking issues we've already solved weeks ago. MindMirror acts as an emotional mirror, showing you that you already possess the keys to your own peace."
                    </blockquote>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#F0EFFE] border border-[#635BFF]/30 flex items-center justify-center text-xs text-[#635BFF] font-bold shrink-0 mt-0.5">1</div>
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed"><strong className="text-slate-900">Break spirals:</strong> Stop rewriting the same worries by matching similar resolved moments instantly.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#CCFBF1] border border-[#0D9488]/30 flex items-center justify-center text-xs text-[#0D9488] font-bold shrink-0 mt-0.5">2</div>
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed"><strong className="text-slate-900">Build resilience:</strong> Create a personal, searchable playbook of your own resolution mechanisms.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Features Story Modules */}
          <section id="features" className="py-20 md:py-28 relative z-10 border-t border-slate-200/60">
            <div className="max-w-6xl mx-auto px-6">
              
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0D9488]/20 bg-[#0D9488]/10 text-xs font-semibold text-[#0D9488]">
                  <span>🌸 EVERYTHING YOU NEED TO FIND CALM</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  Designed for peace & personal growth
                </h2>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                  Every experience in MindMirror is crafted to help you process feelings, trace patterns, and build a loving relationship with your history.
                </p>
              </div>

              {/* Interactive Story Modules Tabs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Left Column: List of Tabs */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  {storyModules.map(f => {
                    const isActive = activeTab === f.id
                    return (
                      <button
                        key={f.id}
                        onClick={() => setActiveTab(f.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 ${
                          isActive
                            ? 'bg-white border border-slate-200 shadow-md scale-[1.01]'
                            : 'hover:bg-white/60 border border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform duration-300"
                          style={{
                            background: f.bgColor,
                            border: `1px solid ${f.color}30`
                          }}
                        >
                          <span>{f.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-bold tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>{f.title}</h3>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{f.tagline}</p>
                        </div>
                        <ChevronRight size={16} className={`text-slate-400 transition-transform ${isActive ? 'rotate-90 text-slate-800' : ''}`} />
                      </button>
                    )
                  })}
                </div>

                {/* Right Column: Active Module Details */}
                <div className="lg:col-span-7">
                  {storyModules.map(f => {
                    if (f.id !== activeTab) return null
                    return (
                      <div key={f.id} className="h-full rounded-3xl p-8 md:p-10 border border-slate-200 bg-white shadow-xl shadow-slate-200/50 relative flex flex-col justify-between transition-all duration-500">
                        <div className="space-y-6 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm" style={{ background: f.bgColor, border: `1px solid ${f.color}40` }}>
                              <span>{f.emoji}</span>
                            </div>
                            <div>
                              <span className="text-[11px] uppercase font-bold tracking-widest" style={{ color: f.color }}>Featured Experience</span>
                              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mt-0.5">{f.title}</h3>
                            </div>
                          </div>

                          <div className="space-y-4 pt-2">
                            <p className="text-base md:text-lg text-slate-800 font-semibold leading-relaxed italic">
                              "{f.tagline}"
                            </p>
                            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-normal">
                              {f.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 relative z-10">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">Human Impact</span>
                          <p className="text-xs md:text-sm text-slate-700 flex items-center gap-3 font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ background: f.color }} />
                            <span>{f.value}</span>
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>

            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="py-20 md:py-28 border-t border-slate-200/60 z-10 relative bg-white/50">
            <div className="max-w-6xl mx-auto px-6">
              
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#635BFF]/20 bg-[#635BFF]/10 text-xs font-semibold text-[#5249FF]">
                  <span>✨ SIMPLE & NATURAL FLOW</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  How MindMirror fits into your life
                </h2>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                  Designed to feel effortless. Takes you from raw emotional noise to self-awareness and peace.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {steps.map(s => (
                  <div key={s.num} className="rounded-2xl p-6 border border-slate-200/80 bg-white hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{s.emoji}</span>
                      <span className="text-xs font-bold text-[#5249FF] bg-[#F0EFFE] px-2 py-0.5 rounded-md border border-[#635BFF]/20">{s.num}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-[#5249FF] transition-colors">{s.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 md:py-28 border-t border-slate-200/60 relative z-10">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0D9488]/20 bg-[#0D9488]/10 text-xs font-semibold text-[#0D9488]">
                  <span>🤍 REAL REFLECTIONS</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  Loved by people navigating real life
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <div key={i} className="rounded-3xl p-8 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 space-y-6 flex flex-col justify-between">
                    <p className="text-sm text-slate-600 italic leading-relaxed">"{t.quote}"</p>
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#635BFF] to-[#00D4B2] flex items-center justify-center font-bold text-xs text-white shadow-sm">
                        {t.author[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{t.author}</p>
                        <p className="text-[11px] text-slate-400">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <footer className="py-20 border-t border-slate-200/60 relative z-10 text-center bg-white">
            <div className="max-w-4xl mx-auto px-6 space-y-8">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#635BFF] to-[#00D4B2] flex items-center justify-center mx-auto text-3xl shadow-lg shadow-[#635BFF]/20">
                🌸
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                Your future self will thank you for starting today.
              </h2>
              <p className="text-sm md:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
                No judgment. No complex dashboards. Just a peaceful space to reflect, understand, and grow.
              </p>
              <button
                onClick={() => openAuth('signup')}
                className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl font-semibold text-base bg-[#635BFF] hover:bg-[#5249FF] text-white shadow-lg shadow-[#635BFF]/20 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </footer>

          {/* Reusable Auth Modal */}
          {showAuthModal && (
            <Auth
              isModal={true}
              initialMode={authModalMode}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}
    </div>
  )
}
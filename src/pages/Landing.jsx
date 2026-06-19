import { useState, useEffect } from 'react'
import { Heart, Sparkles, BookOpen, Search, HelpCircle, TrendingUp, Mail, Gamepad2, CheckCircle2, ArrowRight, Brain, Compass, MessageSquare, Shield, Activity, X } from 'lucide-react'
import Auth from './Auth.jsx'

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('signup') // 'login' | 'signup'
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState('companion')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openAuth = (mode) => {
    setAuthModalMode(mode)
    setShowAuthModal(true)
  }

  const features = [
    {
      id: 'companion',
      icon: Heart,
      color: '#7F77DD',
      title: 'AI Companion',
      tagline: 'A supportive friend, not a robotic script.',
      description: 'Interact with an emotionally intelligent partner that feels like a trusted friend. MindMirror remembers your past struggles, notes what helped, and offers warm, action-oriented, personalized support without clinical jargon.',
      value: 'Reduces loneliness and turns emotional logs into a continuous, supportive conversation.'
    },
    {
      id: 'journaling',
      icon: BookOpen,
      color: '#5DCAA5',
      title: 'Smart Journaling',
      tagline: 'Write freely. Let AI handle the rest.',
      description: 'No checkboxes, rating scales, or tedious logging. Just pour your mind out. Our AI engine automatically extracts underlying themes, sentiment, triggers, and distress levels, building your profile behind the scenes.',
      value: 'Saves time, eliminates self-reporting bias, and captures thoughts in their most authentic form.'
    },
    {
      id: 'memory',
      icon: Search,
      color: '#AFA9EC',
      title: 'Semantic Memory',
      tagline: 'Context-aware search that reads between the lines.',
      description: 'Powered by vector embeddings, MindMirror identifies past entries with similar emotional undercurrents, even if they share zero keywords. If you are stressed about an exam, it finds previous exam anxieties and their solutions.',
      value: 'Connects your past resilience to your present struggle, providing instant context.'
    },
    {
      id: 'ladder',
      icon: Brain,
      color: '#FAC775',
      title: 'Thought Ladder',
      tagline: 'Climb down from anxiety to reality.',
      description: 'When you are caught in a spiral of cognitive distortion or catastrophic thinking, our Thought Ladder guides you step-by-step. Identify raw facts, analyze your assumptions, and reconstruct a realistic reframe.',
      value: 'Actively de-escalates panic and reframes thoughts using structured cognitive behavioral techniques.'
    },
    {
      id: 'analytics',
      icon: Activity,
      color: '#E24B4A',
      title: 'Emotional Analytics',
      tagline: 'See the patterns you usually miss.',
      description: 'Your growth is tracked over time. View distress trajectories, analyze your most recurring triggers, map out your primary emotional themes, and see statistical proof of which coping mechanisms are truly effective.',
      value: 'Replaces guesswork with solid data about what triggers you and what actually helps.'
    },
    {
      id: 'letters',
      icon: Mail,
      color: '#EF9F27',
      title: 'Future Letters',
      tagline: 'Advice from your calmest self.',
      description: 'Write messages of hope, reassurance, and practical wisdom to yourself when you are clear-headed. MindMirror will dynamically deliver these letters back to you when it senses you falling into similar emotional triggers.',
      value: 'Empowers you to guide yourself with letters that arrive exactly when they are needed.'
    },
    {
      id: 'games',
      icon: Gamepad2,
      color: '#5DCAA5',
      title: 'Grounding Mind Games',
      tagline: 'Interactive exercises to break panic loops.',
      description: 'Need immediate distress relief? Engage in rapid grounding games designed to break spirals of overthinking. Play Grounding Hunt, Gratitude Garden, Anxiety Monster, Thought Cloud Burst, or Thought Traffic.',
      value: 'Brings you back to the present moment through science-backed sensory and mindfulness play.'
    },
    {
      id: 'resolution',
      icon: CheckCircle2,
      color: '#7F77DD',
      title: 'Resolution Tracking',
      tagline: 'Move from open problems to closed files.',
      description: 'Audit and resolve the challenges you log. Mark old entries as resolved, add a resolution note outlining what helped you move past it, and build a personalized encyclopedia of your own coping strategies.',
      value: 'Fosters closure, builds confidence, and allows your AI companion to explain exactly how you overcame issues before.'
    }
  ]

  const steps = [
    {
      num: '01',
      title: 'Write',
      desc: 'Capture thoughts, emotions, worries, and achievements freely in your journal.'
    },
    {
      num: '02',
      title: 'Reflect',
      desc: 'Receive instant, non-judgmental analysis of sentiment, distress, triggers, and themes.'
    },
    {
      num: '03',
      title: 'Remember',
      desc: 'Let vector search recall similar past events, surfacing what worked for you then.'
    },
    {
      num: '04',
      title: 'Learn',
      desc: 'Identify recurring themes and triggers to spot patterns before they overwhelm you.'
    },
    {
      num: '05',
      title: 'Grow',
      desc: 'Use resolution tracking and structured coping history to take action and build resilience.'
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
    <div className="min-h-screen text-[#e8e6f0] selection:bg-[#7F77DD]/30 selection:text-white" style={{ background: '#0f0f13', overflowX: 'hidden' }}>
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#7F77DD]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#EF9F27]/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[600px] h-[600px] rounded-full bg-[#5DCAA5]/3 blur-[150px] pointer-events-none" />

      {/* Modern Sticky Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled ? 'backdrop-blur-md bg-[#0f0f13]/70 border-b border-white/5 py-4 shadow-lg' : 'bg-transparent py-6'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-semibold text-lg tracking-wide hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-tr from-[#7F77DD] to-[#534AB7]">
              <Heart size={16} color="white" fill="white" />
            </div>
            <span>MindMirror</span>
          </a>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => openAuth('login')} className="text-sm font-medium text-white/75 hover:text-white transition-colors px-4 py-2">
              Login
            </button>
            <button onClick={() => openAuth('signup')} className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-[#7F77DD]/10" style={{ background: '#7F77DD', color: 'white' }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 max-w-6xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#7F77DD]/20 bg-[#7F77DD]/5 text-xs font-semibold tracking-wide text-[#AFA9EC] mb-6 animate-fade-in">
          <Sparkles size={12} className="text-[#AFA9EC]" />
          <span>MEET YOUR MEMORY-AWARE EMOTIONAL COMPANION</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6 max-w-4xl mx-auto font-sans">
          Remember what hurt.<br />
          <span className="bg-gradient-to-r from-[#AFA9EC] via-[#7F77DD] to-[#FAC775] bg-clip-text text-transparent">Remember what helped.</span>
        </h1>
        
        <p className="text-lg md:text-xl font-medium text-white/80 max-w-2xl mx-auto mb-4">
          You've been here before. This time, you don't have to face it alone.
        </p>

        <p className="text-sm md:text-base text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          MindMirror is an AI-powered emotional companion that helps you reflect on your experiences, recognize recurring patterns, remember how you've overcome challenges before, and take meaningful action when life feels overwhelming.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => openAuth('signup')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base shadow-xl shadow-[#7F77DD]/15 hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ background: '#7F77DD', color: 'white' }}>
            <span>Get Started Free</span>
            <ArrowRight size={16} />
          </button>
          <a href="#features" className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-base border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-all">
            Explore Features
          </a>
        </div>

        {/* Dashboard Mockup Preview */}
        <div className="mt-16 md:mt-24 rounded-3xl p-3 border border-white/5 bg-white/[0.01] shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13] via-transparent to-transparent z-10" />
          <div className="rounded-2xl overflow-hidden bg-[#14131a] aspect-[16/9] md:aspect-[21/9] border border-white/10 flex flex-col items-center justify-center p-8 relative">
            
            {/* Visual Design Elements representing Companion & Memory */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#7F77DD]/20 blur-3xl pointer-events-none" />
            
            <div className="z-20 max-w-lg text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#7F77DD]/10 border border-[#7F77DD]/20 mx-auto flex items-center justify-center">
                <Brain size={24} className="text-[#AFA9EC]" />
              </div>
              <div className="text-xs uppercase tracking-widest text-[#AFA9EC] font-semibold">Semantic Reflection System</div>
              <p className="text-sm text-white/70 italic leading-relaxed">
                "It looks like you felt similar placements pressure on March 14th. You resolved it by breaking down topics and stepping away from your desk. Shall we try that today?"
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5DCAA5] animate-pulse" />
                <span className="text-[10px] text-white/40 tracking-wider uppercase font-semibold">Companion Listening</span>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Why MindMirror Exists */}
      <section id="about" className="py-20 md:py-28 border-t border-white/5 relative bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Column 1: Core Story */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FAC775]/20 bg-[#FAC775]/5 text-xs font-semibold text-[#FAC775]">
                <span>THE STORY BEHIND MINDMIRROR</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                Why MindMirror Was Created
              </h2>

              <p className="text-white/80 leading-relaxed text-base">
                MindMirror was inspired by the personal experiences of its creator, <strong>Vedika</strong>. Like many students and young professionals navigating high-pressure transitions, she frequently battled academic pressure, overthinking, anxiety about the future, regret, and emotional overwhelm.
              </p>

              <div className="space-y-4 text-white/60 text-sm leading-relaxed">
                <p>
                  She noticed a cycle: the exact same painful loops of self-doubt would return periodically. In the middle of those overwhelming moments, it was incredibly difficult to recall:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 list-disc marker:text-[#7F77DD]">
                  <li>What had successfully calmed her down last time</li>
                  <li>How she overcame similar roadblocks previously</li>
                  <li>What critical lessons she had already learned</li>
                </ul>
                <p>
                  Journaling apps existed, but they acted as silent vaults—you write something down, and it gets buried forever. There was no tool to bridge the gap between yesterday's solutions and today's distress.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-white/80 font-medium text-base mb-1">
                  MindMirror is the companion Vedika wished she had:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#AFA9EC] font-medium pt-2">
                  <span className="flex items-center gap-2">✓ A companion that listens</span>
                  <span className="flex items-center gap-2">✓ A companion that remembers</span>
                  <span className="flex items-center gap-2">✓ A companion that helps you learn</span>
                  <span className="flex items-center gap-2">✓ A companion that prompts action</span>
                </div>
              </div>
            </div>

            {/* Column 2: Visual Story Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl p-8 border border-white/10 glass-purple relative overflow-hidden shadow-2xl space-y-6">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#7F77DD]/10 blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Compass className="text-[#AFA9EC]" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Our Mission</h3>
                    <p className="text-xs text-white/40">From reflection to resilience</p>
                  </div>
                </div>

                <blockquote className="text-sm text-white/70 italic leading-relaxed border-l-2 border-[#7F77DD]/50 pl-4 py-1">
                  "We often spend hours overthinking issues we've already solved weeks ago. MindMirror acts as an emotional mirror, showing you that you already possess the keys to your own peace."
                </blockquote>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#7F77DD]/10 border border-[#7F77DD]/25 flex items-center justify-center text-xs text-[#AFA9EC] shrink-0 mt-0.5">1</div>
                    <p className="text-xs text-white/60 leading-relaxed"><strong>Break spirals:</strong> Stop rewriting the same worries by matching similar resolved moments instantly.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#5DCAA5]/10 border border-[#5DCAA5]/25 flex items-center justify-center text-xs text-[#5DCAA5] shrink-0 mt-0.5">2</div>
                    <p className="text-xs text-white/60 leading-relaxed"><strong>Build resilience:</strong> Build an interactive, searchable playbook of your own resolution mechanisms.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-20 md:py-28 relative">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#5DCAA5]/25 bg-[#5DCAA5]/5 text-xs font-semibold text-[#5DCAA5]">
              <span>FUNCTIONAL TOOLSET</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Stunning Features For Real Growth
            </h2>
            <p className="text-sm md:text-base text-white/50 leading-relaxed">
              Every tool in MindMirror is engineered to help you process stress, trace habits, and build a lasting relationship with your own emotional history.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: List of Tabs */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              {features.map(f => {
                const Icon = f.icon
                const isActive = activeTab === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveTab(f.id)}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl text-left transition-all ${isActive ? 'bg-white/[0.04] border border-white/10 shadow-lg' : 'hover:bg-white/[0.01] border border-transparent'}`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: isActive ? `${f.color}15` : 'rgba(255,255,255,0.03)', border: isActive ? `1px solid ${f.color}30` : '1px solid transparent' }}>
                      <Icon size={16} style={{ color: isActive ? f.color : 'rgba(232,230,240,0.45)' }} />
                    </div>
                    <div>
                      <h3 className={`text-xs font-semibold tracking-wide ${isActive ? 'text-white' : 'text-white/50'}`}>{f.title}</h3>
                      <p className="text-[10px] text-white/35 mt-0.5 line-clamp-1">{f.tagline}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Right Column: Active Tab Details */}
            <div className="lg:col-span-8">
              {features.map(f => {
                if (f.id !== activeTab) return null
                const Icon = f.icon
                return (
                  <div key={f.id} className="rounded-3xl p-8 border border-white/10 bg-white/[0.02] shadow-xl relative min-h-[380px] flex flex-col justify-between fade-up">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none" style={{ background: `${f.color}08` }} />
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${f.color}15`, border: `1px solid ${f.color}35` }}>
                          <Icon size={22} style={{ color: f.color }} />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: f.color }}>Featured module</span>
                          <h3 className="text-xl font-bold text-white mt-0.5">{f.title}</h3>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-base text-white/80 font-medium leading-normal italic">
                          "{f.tagline}"
                        </p>
                        <p className="text-sm text-white/50 leading-relaxed">
                          {f.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block mb-1">Impact & User Value</span>
                      <p className="text-xs text-white/70 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ background: f.color }} />
                        <span>{f.value}</span>
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>

          {/* Grid Layout for mobile / Quick Overview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.slice(0, 4).map(f => {
              const Icon = f.icon
              return (
                <div key={f.id} className="rounded-2xl p-5 border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all flex flex-col justify-between min-h-[200px] group">
                  <div className="space-y-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:scale-105 transition-transform">
                      <Icon size={16} style={{ color: f.color }} />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-3">{f.description}</p>
                  </div>
                  <span className="text-[10px] font-medium text-[#AFA9EC] mt-3 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab(f.id)}>
                    Learn more <ArrowRight size={10} />
                  </span>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 border-t border-white/5 bg-white/[0.01] relative">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7F77DD]/25 bg-[#7F77DD]/5 text-xs font-semibold text-[#AFA9EC]">
              <span>SIMPLE ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              How MindMirror Works
            </h2>
            <p className="text-sm md:text-base text-white/50 leading-relaxed">
              Designed to fit seamlessly into your day, MindMirror takes you from logging raw thoughts to building actionable emotional intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {steps.map((s, idx) => (
              <div key={s.num} className="rounded-2xl p-6 border border-white/5 bg-white/[0.01] flex flex-col justify-between min-h-[220px] relative">
                <div className="absolute top-4 right-4 text-2xl font-black text-white/5 select-none">{s.num}</div>
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#7F77DD]/10 border border-[#7F77DD]/20 flex items-center justify-center text-xs font-bold text-[#AFA9EC] mb-4">
                    {s.num}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ArrowRight size={14} className="text-white/10" />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* What Makes MindMirror Different */}
      <section className="py-20 md:py-28 border-t border-white/5 relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#5DCAA5]/20 bg-[#5DCAA5]/5 text-xs font-semibold text-[#5DCAA5]">
            <span>THE CORE DISTINCTION</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Most journaling apps store memories.<br />
            <span className="text-[#AFA9EC]">MindMirror understands them.</span>
          </h2>

          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Unlike static note-taking apps that act as archives, MindMirror actively processes, embeds, and structures your emotional profile.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left mt-6">
            {[
              'Discovers patterns in recurring triggers',
              'Remembers what resolved past problems',
              'Surfaces letters from your calmest self',
              'Guides you through cognitive reframes'
            ].map(item => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                <CheckCircle2 size={16} className="text-[#5DCAA5] shrink-0" />
                <span className="text-xs font-medium text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 border-t border-white/5 bg-white/[0.01] relative">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FAC775]/25 bg-[#FAC775]/5 text-xs font-semibold text-[#FAC775]">
              <span>COMMUNITY STORIES</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              What Users Experience
            </h2>
            <p className="text-sm md:text-base text-white/50 leading-relaxed">
              Hear from students and professionals who transitioned from static journaling to active emotional companions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="rounded-2xl p-6 border border-white/5 bg-white/[0.02] shadow-lg flex flex-col justify-between min-h-[220px]">
                <p className="text-xs text-white/60 leading-relaxed italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#7F77DD]/10 border border-[#7F77DD]/20 flex items-center justify-center font-bold text-xs text-[#AFA9EC]">
                    {t.author[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{t.author}</h4>
                    <p className="text-[10px] text-white/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Action CTA Section */}
      <section className="py-20 md:py-28 border-t border-white/5 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="rounded-3xl p-10 md:p-14 border border-white/10 glass-purple relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-[#7F77DD]/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-[#EF9F27]/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Ready to understand your patterns?
              </h2>
              <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
                Join MindMirror today. Log your thoughts freely, connect with past solutions, and build an encyclopedia of your own resilience.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={() => openAuth('signup')} className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm shadow-xl shadow-[#7F77DD]/20 hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ background: '#7F77DD', color: 'white' }}>
                  Create Free Account
                </button>
                <button onClick={() => openAuth('login')} className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm border border-white/10 bg-white/[0.01] hover:bg-white/[0.05] transition-all">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#0a0a0d] text-white/40 text-xs">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-white">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#7F77DD]">
                  <Heart size={12} color="white" fill="white" />
                </div>
                <span>MindMirror</span>
              </div>
              <p className="text-[11px] leading-relaxed max-w-[200px]">
                Remember what hurt. Remember what helped.
              </p>
              <p className="text-[10px]">
                Built with ❤️ by <strong className="text-white/60">Vedika</strong>
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold text-white mb-3 tracking-wider text-[10px] uppercase">Product</h5>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About Story</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-3 tracking-wider text-[10px] uppercase">Legal</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-3 tracking-wider text-[10px] uppercase">Contact</h5>
              <ul className="space-y-2">
                <li><span className="hover:text-white transition-colors cursor-pointer">support@mindmirror.app</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">vedika@mindmirror.app</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px]">
            <span>&copy; {new Date().getFullYear()} MindMirror. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Security</span>
              <span className="hover:text-white transition-colors cursor-pointer">Status</span>
            </div>
          </div>
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

    </div>
  )
}

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Heart, Sparkles, Plus, AlertCircle, Trash2, X, Loader2, 
  Wind, Coffee, BookOpen, Music, Code, Compass, Moon, 
  Waves, CloudRain, Check, RefreshCw, Feather, Smile, Sparkle,
  ArrowRight, ShieldCheck, Sun, Palette
} from 'lucide-react';
import * as api from '../lib/api';

const CATEGORIES = ['anxious', 'sad', 'overthinking', 'tired', 'lost', 'unmotivated'];

const EMOTION_DATA = {
  anxious: {
    emoji: '🌀',
    label: 'Anxious',
    tagline: 'When thoughts are racing and everything feels urgent',
    color: 'from-violet-500/10 to-indigo-500/10',
    border: 'border-indigo-500/20',
    badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    accentColor: '#818cf8',
    title: 'You don’t have to solve everything tonight.',
    message: [
      'There are assignments, coding problems, projects, internships, deadlines and a hundred little things waiting for you.',
      'But you don’t have to carry all of them at the same time.',
      'Take a breath. Put everything down for a moment.',
      'You can come back to one thing at a time.'
    ],
    actions: [
      { id: 'vibe-code', icon: Code, title: '💻 Vibe Coding', text: 'Work on one tiny UI improvement.' },
      { id: 'assignment', icon: BookOpen, title: '📚 Assignment', text: 'Read one assignment question. You don’t have to solve it yet.' },
      { id: 'tomorrow', icon: Feather, title: '📝 Tomorrow’s List', text: 'Write down the three things that actually matter tomorrow.' },
      { id: 'watch-learn', icon: Sparkles, title: '🎧 Watch & Learn', text: 'Watch one short tutorial without expecting yourself to master it.' },
    ],
    anchor: 'One problem at a time. I don’t have to solve my whole life in one sitting.'
  },
  sad: {
    emoji: '💧',
    label: 'Sad',
    tagline: 'When the weight is heavy and your heart feels quiet',
    color: 'from-blue-500/10 to-sky-500/10',
    border: 'border-sky-500/20',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    accentColor: '#38bdf8',
    title: 'You don’t have to turn every difficult day into a productive one.',
    message: [
      'It’s okay to have a day where you don’t accomplish much.',
      'You are more than your CGPA, your LeetCode streak, your projects, your internships or how much work you finished today.',
      'Let yourself have a little space.',
      'When you’re ready, come back gently — not because you have to prove anything, but because there are still small things worth doing.'
    ],
    actions: [
      { id: 'sketch', icon: Palette, title: '🎨 Sketch', text: 'Draw something without worrying about how it looks.' },
      { id: 'dance', icon: Music, title: '💃 Dance', text: 'Put on one song and move however you feel.' },
      { id: 'read', icon: BookOpen, title: '📖 Read', text: 'Read a few pages without trying to achieve anything.' },
      { id: 'mindmirror', icon: Code, title: '💻 MindMirror', text: 'Make one tiny improvement to something you’re building.' },
      { id: 'rest', icon: Coffee, title: '🌿 Rest', text: 'Stay here for a few more minutes.' },
    ],
    anchor: 'A bad day is a day, not a definition of me.'
  },
  overthinking: {
    emoji: '🌊',
    label: 'Overthinking',
    tagline: 'When your mind creates twenty branches for one thought',
    color: 'from-teal-500/10 to-emerald-500/10',
    border: 'border-teal-500/20',
    badge: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    accentColor: '#2dd4bf',
    title: 'Not every thought needs an answer tonight.',
    message: [
      'Your brain can turn one small problem into ten different scenarios.',
      'You don’t need to follow every one of them.',
      'Write the thought down. Put it somewhere outside your head.',
      'Then return to what is actually in front of you.'
    ],
    actions: [
      { id: 'brain-dump', icon: Feather, title: '📝 Brain Dump', text: 'Write down everything currently taking up space in your head.' },
      { id: 'one-thing', icon: Sparkles, title: '🎯 One Thing', text: 'Choose one thing you can actually control.' },
      { id: 'easy-coding', icon: Code, title: '💻 Easy Coding', text: 'Solve one familiar, easy problem.' },
      { id: 'one-page', icon: BookOpen, title: '📚 One Page', text: 'Read just one page of your notes.' },
      { id: 'organize', icon: Coffee, title: '🗂️ Organize', text: 'Clean up your task list and remove things that don’t matter today.' },
    ],
    anchor: 'I can think about it later. Right now, I only need the next step.'
  },
  tired: {
    emoji: '🌙',
    label: 'Tired',
    tagline: 'When your energy is low and your screen feels too bright',
    color: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/20',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    accentColor: '#fbbf24',
    title: 'You don’t have to earn rest.',
    message: [
      'You have been trying to keep up with college, coding, projects, applications and everything else.',
      'You don’t need to turn every free minute into work.',
      'Rest for a while.',
      'And when you’re ready, choose something small enough that it doesn’t feel like climbing a mountain.'
    ],
    actions: [
      { id: 'vibe-watch', icon: Code, title: '🎧 Vibe Coding', text: 'Watch a short coding video without taking notes.' },
      { id: 'organize-notes', icon: Feather, title: '📝 Organize', text: 'Clean up your notes or make tomorrow’s checklist.' },
      { id: 'easy-read', icon: BookOpen, title: '📖 Read', text: 'Read something easy for a few minutes.' },
      { id: 'tiny-code', icon: Code, title: '💻 Small Coding Task', text: 'Make one tiny change in your project.' },
      { id: 'prep-tomorrow', icon: Coffee, title: '🗓️ Prepare Tomorrow', text: 'Set up what you’ll need for tomorrow.' },
    ],
    anchor: 'Small progress still counts. Rest is part of getting there.'
  },
  lost: {
    emoji: '🧭',
    label: 'Lost',
    tagline: 'When the path ahead is blurry and options feel endless',
    color: 'from-rose-500/10 to-pink-500/10',
    border: 'border-rose-500/20',
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    accentColor: '#fb7185',
    title: 'You don’t need the entire path right now.',
    message: [
      'There will be times when you don’t know whether you should focus on DSA, projects, internships, academics, placements or something completely different.',
      'You don’t have to decide everything today.',
      'Keep moving toward the next thing that matters.'
    ],
    actions: [
      { id: 'academics', icon: BookOpen, title: '📚 Academics', text: 'Finish one small academic task.' },
      { id: 'dsa', icon: Code, title: '💻 DSA', text: 'Practice one familiar DSA pattern.' },
      { id: 'project-small', icon: Sparkles, title: '🛠️ Project', text: 'Improve one small part of something you’re building.' },
      { id: 'reset-list', icon: Feather, title: '📝 Reset', text: 'Write down what actually matters this week.' },
      { id: 'outside-tech', icon: Heart, title: '🌱 Something For You', text: 'Do something outside tech that makes you feel like yourself.' },
    ],
    anchor: 'I don’t need to know where every road leads. I only need to take the next one.'
  },
  unmotivated: {
    emoji: '🌱',
    label: 'Unmotivated',
    tagline: 'When starting feels like pushing a mountain',
    color: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/20',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    accentColor: '#34d399',
    title: 'You don’t need motivation to begin something tiny.',
    message: [
      'Don’t wait for the version of you who suddenly wants to study for five hours, solve ten problems and finish everything.',
      'Start ridiculously small.',
      'Open the laptop. Open the assignment. Read the first question. Write one line of code.',
      'Sometimes motivation comes after starting.'
    ],
    actions: [
      { id: 'open-ide', icon: Code, title: '💻 Open Your IDE', text: 'Make one tiny change.' },
      { id: 'easy-dsa', icon: Sparkles, title: '🧩 Easy DSA', text: 'Solve one easy problem you already understand.' },
      { id: 'one-topic', icon: BookOpen, title: '📚 One Topic', text: 'Study just one small concept.' },
      { id: 'assignment-q', icon: Feather, title: '📝 Assignment', text: 'Complete one question.' },
      { id: 'creative-reset', icon: Palette, title: '🎨 Reset', text: 'Sketch, dance or do something you enjoy for a few minutes before returning.' },
    ],
    anchor: 'I don’t need to feel ready. I can just begin with one tiny thing.'
  }
};

const PERMANENT_REMINDERS = [
  {
    id: 'r1',
    title: 'I am not only a student.',
    body: 'I am someone who dances, sketches, reads, learns, builds things and keeps trying.',
    icon: '✨'
  },
  {
    id: 'r2',
    title: 'I don’t have to be productive every minute.',
    body: 'Rest is not wasted time; it is how my mind reclaims its calm.',
    icon: '🌿'
  },
  {
    id: 'r3',
    title: 'One difficult semester doesn’t erase everything I’ve already done.',
    body: 'My progress is built over years, not judged by a single rough week.',
    icon: '🌱'
  },
  {
    id: 'r4',
    title: 'I don’t need to compare today’s version of me with someone else’s timeline.',
    body: 'Everyone is walking on their own path with their own seasons.',
    icon: '🧭'
  },
  {
    id: 'r5',
    title: 'When everything feels like too much, reduce the size of the task — not the value of myself.',
    body: 'Make the next step tiny. My worth remains whole.',
    icon: '🤍'
  }
];

export default function AnchorSpace() {
  const [anchors, setAnchors] = useState({});
  const [activeTab, setActiveTab] = useState('anxious');
  const [quickAccessOpen, setQuickAccessOpen] = useState(false);
  const [emergencyAnchors, setEmergencyAnchors] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'quote', content: '', tags: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  // Emotional Pause State
  const [isPausing, setIsPausing] = useState(false);
  const [pauseSeconds, setPauseSeconds] = useState(30);
  const [breathPhase, setBreathPhase] = useState('breathe-in'); // 'breathe-in' | 'hold' | 'breathe-out'
  const [pauseCompleted, setPauseCompleted] = useState(false);

  // One Small Thing generator state
  const [activeSmallThing, setActiveSmallThing] = useState(null);

  const fetchAnchors = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAnchors();
      if (data && data.success) {
        setAnchors(data.data || {});
      } else if (data && typeof data === 'object' && !data.success && data.data) {
        setAnchors(data.data);
      }
    } catch (err) {
      console.warn('Could not load remote anchors, falling back gracefully:', err.message);
      // Fail gracefully so user can always use the local Anchor sanctuary
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnchors();
  }, [fetchAnchors]);

  // Breathing timer cycle (4s in, 4s hold, 4s out)
  useEffect(() => {
    let timer;
    let cycleInterval;
    if (isPausing && pauseSeconds > 0) {
      timer = setInterval(() => {
        setPauseSeconds(prev => {
          if (prev <= 1) {
            setPauseCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Phase cycle
      cycleInterval = setInterval(() => {
        setBreathPhase(curr => {
          if (curr === 'breathe-in') return 'hold';
          if (curr === 'hold') return 'breathe-out';
          return 'breathe-in';
        });
      }, 4000);
    }
    return () => {
      clearInterval(timer);
      clearInterval(cycleInterval);
    };
  }, [isPausing, pauseSeconds]);

  const handleStartPause = () => {
    setIsPausing(true);
    setPauseSeconds(30);
    setBreathPhase('breathe-in');
    setPauseCompleted(false);
  };

  const handleStopPause = () => {
    setIsPausing(false);
  };

  const handleQuickAccess = async () => {
    try {
      setError('');
      const data = await api.getEmergencyAnchors(activeTab);
      if (data && data.success && Array.isArray(data.data)) {
        setEmergencyAnchors(data.data.slice(0, 3));
      } else {
        const localItems = anchors[activeTab] || [];
        setEmergencyAnchors(localItems.slice(0, 3));
      }
      setQuickAccessOpen(true);
    } catch (err) {
      const localItems = anchors[activeTab] || [];
      setEmergencyAnchors(localItems.slice(0, 3));
      setQuickAccessOpen(true);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newItem.content?.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api.createAnchor({
        ...newItem,
        category: activeTab,
        tags: newItem.tags ? newItem.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      setNewItem({ type: 'quote', content: '', tags: '' });
      setIsAdding(false);
      await fetchAnchors();
    } catch (err) {
      setError(err.message || 'Could not save anchor. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.deleteAnchor(id);
      setAnchors((prev) => {
        const updated = { ...prev };
        if (updated[activeTab]) {
          updated[activeTab] = updated[activeTab].filter((item) => item._id !== id);
        }
        return updated;
      });
    } catch (err) {
      setError(err.message || 'Could not delete anchor.');
    } finally {
      setDeleting(null);
    }
  };

  // Roll "One Small Thing"
  const rollSmallThing = () => {
    const currentList = EMOTION_DATA[activeTab]?.actions || [];
    const universalActions = [
      { id: 'water', icon: Coffee, title: '💧 Drink Water', text: 'Drink a slow glass of cold or warm water.' },
      { id: 'stretch', icon: Heart, title: '🧘 Shoulders Down', text: 'Drop your shoulders away from your ears and unclench your jaw.' },
      { id: 'air', icon: Wind, title: '🌤️ Window Glance', text: 'Look out of the window at the sky for thirty seconds.' },
      { id: 'music', icon: Music, title: '🎶 One Song', text: 'Play one song that brings a sense of stillness or warmth.' },
    ];
    const allCandidates = [...currentList, ...universalActions];
    const picked = allCandidates[Math.floor(Math.random() * allCandidates.length)];
    setActiveSmallThing(picked);
  };

  const currentEmotion = EMOTION_DATA[activeTab] || EMOTION_DATA.anxious;
  const currentAnchors = anchors[activeTab] || [];

  return (
    <div className="anchor-space-container max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10 text-text">
      
      {/* Error Toast */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-2xl text-xs fade-up">
          <AlertCircle size={15} className="shrink-0 text-red-400" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-200">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7F77DD] animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              My Anchor Space
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text/70 leading-relaxed max-w-xl">
            When things feel heavy, come back here. You don’t have to figure everything out right now.
          </p>
          <p className="text-[11px] text-text/45 italic">
            You can stay here for a while.
          </p>
        </div>

        <button
          onClick={handleQuickAccess}
          className="flex items-center justify-center gap-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-medium px-4 py-2.5 rounded-2xl text-xs transition-all active:scale-95 shadow-lg shadow-rose-950/20 shrink-0 self-start sm:self-auto"
        >
          <AlertCircle size={15} className="text-rose-400" />
          <span>I'm not okay right now</span>
        </button>
      </header>

      {/* 2. Emotion Selector */}
      <nav className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const catMeta = EMOTION_DATA[cat];
          const isActive = activeTab === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat);
                setActiveSmallThing(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-white/10 text-white border-white/20 shadow-md shadow-black/20'
                  : 'bg-white/[0.02] text-text/60 border-white/5 hover:border-white/10 hover:text-text'
              }`}
            >
              <span className="text-sm">{catMeta?.emoji}</span>
              <span>{catMeta?.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Personalized Emotional Content */}
      <section 
        key={activeTab} 
        className="rounded-3xl p-6 sm:p-8 border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-md shadow-xl space-y-6 fade-up"
      >
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border ${currentEmotion.badge}`}>
            {currentEmotion.emoji} For When You Feel {currentEmotion.label}
          </span>
          <span className="text-[11px] text-text/40 hidden sm:inline">• {currentEmotion.tagline}</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-text leading-snug tracking-tight">
            “{currentEmotion.title}”
          </h2>
          
          <div className="space-y-2.5 text-xs sm:text-sm text-text/75 leading-relaxed font-normal">
            {currentEmotion.message.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Emotion's Grounding Anchor Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
          <Feather size={16} className="text-[#AFA9EC] shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text/40 mb-1">Your Anchor For This Moment</p>
            <p className="text-xs sm:text-sm italic font-medium text-text/90 leading-relaxed font-serif">
              "{currentEmotion.anchor}"
            </p>
          </div>
        </div>
      </section>

      {/* 4. Emotional Pause Section ("Take a moment.") */}
      <section className="rounded-3xl p-6 sm:p-8 border border-white/10 bg-white/[0.02] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-text flex items-center gap-2">
              <Wind size={18} className="text-[#5DCAA5]" />
              Take a moment.
            </h3>
            <div className="text-xs text-text/60 leading-relaxed space-y-0.5 max-w-md">
              <p>If you need to cry, cry.</p>
              <p>If you need silence, have silence.</p>
              <p>If you need to do nothing for a few minutes, that’s okay too.</p>
            </div>
          </div>

          {!isPausing ? (
            <button
              onClick={handleStartPause}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7F77DD] hover:bg-[#6c64cf] text-white text-xs font-semibold transition-all shadow-lg shadow-[#7F77DD]/25 active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <Sparkle size={14} />
              <span>Give me a moment</span>
            </button>
          ) : (
            <button
              onClick={handleStopPause}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-text/80 text-xs font-medium border border-white/10 transition-colors"
            >
              <Check size={14} className="text-[#5DCAA5]" />
              <span>I'm ready</span>
            </button>
          )}
        </div>

        {/* Active Breathing Experience */}
        {isPausing && (
          <div className="p-8 rounded-2xl border border-white/10 bg-black/30 flex flex-col items-center justify-center text-center space-y-6 fade-up relative overflow-hidden">
            <div className="relative flex items-center justify-center">
              {/* Gentle breathing aura */}
              <div 
                className={`w-32 h-32 rounded-full border border-[#5DCAA5]/40 flex items-center justify-center transition-all duration-1000 ${
                  breathPhase === 'breathe-in' ? 'scale-125 bg-[#5DCAA5]/20 shadow-[0_0_40px_rgba(93,202,165,0.3)]' :
                  breathPhase === 'hold' ? 'scale-120 bg-[#7F77DD]/20 shadow-[0_0_40px_rgba(127,119,221,0.3)]' :
                  'scale-90 bg-white/5 shadow-none'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  {breathPhase === 'breathe-in' && 'Breathe in'}
                  {breathPhase === 'hold' && 'Hold gently'}
                  {breathPhase === 'breathe-out' && 'Breathe out'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-text/50 font-medium">
                {pauseSeconds > 0 ? `${pauseSeconds}s remaining of quiet space` : 'Take all the time you need.'}
              </p>
              <p className="text-[11px] text-text/35 italic">
                You can leave this pause whenever you feel ready.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 5. When You're Ready & 6. Low-Brain-Energy Actions */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-text">When you’re ready…</h3>
          <p className="text-xs text-text/60">
            You don’t have to jump back into everything. Just choose one tiny thing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {currentEmotion.actions.map((act) => {
            const IconComp = act.icon || Sparkles;
            return (
              <div
                key={act.id}
                className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all flex flex-col justify-between group"
              >
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-text group-hover:text-[#AFA9EC] transition-colors flex items-center gap-1.5">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-text/60 leading-relaxed">
                    “{act.text}”
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-text/40 italic">If you're ready</span>
                  <span className="text-[10px] text-[#AFA9EC] font-medium opacity-0 group-hover:opacity-100 transition-opacity">One small step →</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. "I Can Do One Small Thing" Random Generator */}
      <section className="rounded-3xl p-6 border border-white/10 bg-gradient-to-r from-[#7F77DD]/10 via-white/[0.02] to-[#5DCAA5]/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-text flex items-center gap-2">
              <Sparkles size={15} className="text-[#AFA9EC]" />
              Need a gentle nudge?
            </h4>
            <p className="text-xs text-text/60 mt-0.5">
              Let MindMirror pick just one tiny, manageable thing for right now.
            </p>
          </div>

          <button
            onClick={rollSmallThing}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-text text-xs font-semibold border border-white/10 transition-all active:scale-95 shrink-0"
          >
            <RefreshCw size={13} className={activeSmallThing ? 'text-[#5DCAA5]' : ''} />
            <span>{activeSmallThing ? 'Give me another' : 'I can do one small thing'}</span>
          </button>
        </div>

        {activeSmallThing && (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-up">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5DCAA5]">Your One Small Thing</span>
              <p className="text-xs sm:text-sm font-medium text-text leading-relaxed">
                {activeSmallThing.title} — “{activeSmallThing.text}”
              </p>
              <p className="text-[11px] text-text/50 italic">
                That’s enough for now.
              </p>
            </div>
            <button
              onClick={() => setActiveSmallThing(null)}
              className="text-[11px] text-text/40 hover:text-text/70 self-start sm:self-auto underline"
            >
              Done / Close
            </button>
          </div>
        )}
      </section>

      {/* 8. Existing Comforting Anchors ("Things that bring me back") */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-base font-bold text-text flex items-center gap-2">
              <Heart size={16} className="text-[#D4537E]" />
              Things that bring me back
            </h3>
            <p className="text-xs text-text/60 mt-0.5">
              Build this space slowly. Save the things that help you find your way back to yourself.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 text-xs text-[#AFA9EC] hover:text-white font-semibold transition-colors shrink-0 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20"
          >
            <Plus size={14} /> Save something comforting
          </button>
        </div>

        {/* Loading / Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-text/40" size={24} />
          </div>
        ) : currentAnchors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentAnchors.map((item) => (
              <div
                key={item._id}
                className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/15 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-text/60 border border-white/5">
                      {item.type}
                    </span>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-text/30 hover:text-red-400 p-1"
                      title="Delete anchor"
                    >
                      {deleting === item._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                  <p className="mt-3 text-text/80 leading-relaxed font-serif text-xs sm:text-sm whitespace-pre-wrap">
                    "{item.content}"
                  </p>
                </div>
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4 pt-2 border-t border-white/5">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="text-[9px] bg-white/5 text-text/45 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-white/[0.01] rounded-3xl border border-dashed border-white/10 space-y-3">
            <Heart className="mx-auto text-text/20" size={28} />
            <p className="text-xs text-text/50 max-w-sm mx-auto leading-relaxed">
              One day, you’ll need this space. Start building it gently — add a quote, a reminder, anything that brings you back.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#AFA9EC] hover:text-white font-medium underline"
            >
              <Plus size={13} /> Add your first anchor
            </button>
          </div>
        )}
      </section>

      {/* 9. Personal "Things I Want to Remember About Myself" */}
      <section className="space-y-4 pt-2">
        <div className="space-y-1 border-b border-white/5 pb-3">
          <h3 className="text-base font-bold text-text flex items-center gap-2">
            <Feather size={16} className="text-[#EF9F27]" />
            Things I Want to Remember About Myself
          </h3>
          <p className="text-xs text-text/60">
            Gentle truths to keep near when your thoughts get loud.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PERMANENT_REMINDERS.map((card) => (
            <div
              key={card.id}
              className="p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] flex flex-col justify-between hover:border-white/15 transition-all shadow-sm group"
            >
              <div className="space-y-2">
                <span className="text-lg">{card.icon}</span>
                <h4 className="text-xs sm:text-sm font-semibold text-text leading-snug group-hover:text-[#AFA9EC] transition-colors">
                  “{card.title}”
                </h4>
                {card.body && (
                  <p className="text-[11px] text-text/60 leading-relaxed font-normal">
                    {card.body}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Main Personal Anchor (Bottom Centerpiece) */}
      <section className="py-8 px-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-black/30 text-center space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#AFA9EC]/70">Centering Truth</span>
        <blockquote className="text-base sm:text-lg font-serif italic text-text font-medium max-w-xl mx-auto leading-relaxed">
          “I don’t have to fix everything today.<br />
          I just have to take care of the next little piece.”
        </blockquote>
        <p className="text-[11px] text-text/40 italic">
          Take all the time you need. MindMirror is here whenever you return.
        </p>
      </section>

      {/* Quick Access Modal ("I'm not okay right now") */}
      {quickAccessOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-up"
          onClick={() => setQuickAccessOpen(false)}
        >
          <div 
            className="bg-[#13121a] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQuickAccessOpen(false)}
              className="absolute top-4 right-4 text-text/40 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-2 text-rose-400">
              <Sparkles size={18} />
              <h3 className="text-base font-bold text-text">Breathe. We've got you.</h3>
            </div>
            
            <p className="text-xs text-text/60 leading-relaxed">
              Here are calming anchors saved for when you feel <strong className="text-text capitalize">{activeTab}</strong>:
            </p>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {emergencyAnchors.length > 0 ? (
                emergencyAnchors.map((item) => (
                  <div key={item._id} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400">{item.type}</span>
                    <p className="text-text/90 text-xs sm:text-sm leading-relaxed font-serif">"{item.content}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl space-y-2">
                  <p className="text-xs text-text/40 italic">No saved anchors for this category yet.</p>
                  <p className="text-xs font-serif text-text/80">“{currentEmotion.anchor}”</p>
                  <button
                    onClick={() => { setQuickAccessOpen(false); setIsAdding(true); }}
                    className="text-xs text-[#AFA9EC] hover:text-white font-medium underline mt-2 block mx-auto"
                  >
                    Add a personal anchor now →
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setQuickAccessOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-text"
              >
                Close & Stay Centered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Anchor Modal */}
      {isAdding && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-up"
          onClick={() => setIsAdding(false)}
        >
          <form 
            onSubmit={handleCreate} 
            className="bg-[#13121a] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <span>{currentEmotion.emoji}</span> Add a {currentEmotion.label} Anchor
              </h3>
              <button type="button" onClick={() => setIsAdding(false)} className="text-text/40 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-text/50 block mb-1">Type</label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                className="w-full p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-text outline-none focus:border-[#7F77DD]"
              >
                <option value="quote" className="bg-[#13121a]">Quote / Affirmation</option>
                <option value="reminder" className="bg-[#13121a]">Personal Reminder</option>
                <option value="song" className="bg-[#13121a]">Song / Track</option>
                <option value="memory" className="bg-[#13121a]">Safe Memory</option>
                <option value="person" className="bg-[#13121a]">Person / Place</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-text/50 block mb-1">Content</label>
              <textarea
                required
                rows={4}
                value={newItem.content}
                onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                placeholder="What words, memory, or gentle reminder helps you feel safe?"
                className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-xs text-text outline-none focus:border-[#7F77DD] resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-text/50 block mb-1">
                Tags <span className="text-text/30 font-normal">(comma separated)</span>
              </label>
              <input
                type="text"
                value={newItem.tags}
                onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                placeholder="exams, panic, breathe, coding"
                className="w-full p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-text outline-none focus:border-[#7F77DD]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs text-text/60 hover:text-text rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 text-xs bg-[#7F77DD] hover:bg-[#6c64cf] text-white rounded-xl font-semibold disabled:opacity-60 transition-colors shadow-lg shadow-[#7F77DD]/25"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                {saving ? 'Saving...' : 'Save Anchor'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

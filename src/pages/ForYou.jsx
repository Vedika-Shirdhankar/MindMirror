// src/pages/ForYou.jsx
import React, { useState } from 'react';
import {
  Heart,
  ArrowRight,
  Sparkles,
  CloudRain,
  Feather,
  Coffee,
  Compass,
  Smile,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import LandingNav from '../components/landing/LandingNav.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import Auth from './Auth.jsx';

export default function ForYou() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [selectedPathway, setSelectedPathway] = useState(0);

  const openAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const pathways = [
    {
      id: "overthinker",
      title: "For the Overthinker",
      headline: "When thoughts loop endlessly and refuse to sleep",
      desc: "If your brain loves to replay conversations from five years ago or forecast catastrophic worst-case scenarios, you don't need logic lectures. You need cognitive bridges that gently slow down the acceleration.",
      tools: ["The Thought Ladder for breaking catastrophic spirals", "Mind Games for resetting mental fatigue in 90s", "5-4-3-2-1 Sensory Grounding for sudden worry spikes"],
      quote: "Anxious thoughts are just weather passing across the horizon. You are the mountain.",
      color: "#466554",
    },
    {
      id: "burnt-out",
      title: "For the Burnt-Out Soul",
      headline: "When you've been strong for too long",
      desc: "You give your energy to everyone else, and by the time you're alone, you have nothing left for yourself. MindMirror demands zero checklists, has no streaks, and never judges missed days.",
      tools: ["Zero streak pressure—come and go without penalties", "Anchor Space binaural rain & campfire soundscapes", "One-tap mindful breathing pacer"],
      quote: "Rest is not a prize you earn after collapse. It is a sacred foundation.",
      color: "#6b7d5e",
    },
    {
      id: "perfectionist",
      title: "For the Self-Critic",
      headline: "When the harshest voice in the room is your own",
      desc: "You hold yourself to standards you would never impose on a loved one. MindMirror acts as a warm buffer, asking the gentle questions that allow you to speak to yourself like someone you love.",
      tools: ["Empathetic AI Companion that validates without judgment", "Letters from the Mirror summarizing your hidden strength", "Cognitive reframe prompts designed for perfectionism"],
      quote: "You do not need to be flawless to be worthy of your own peace.",
      color: "#547167",
    },
    {
      id: "seeker",
      title: "For the Mindful Seeker",
      headline: "When you want to capture the seasons of your life",
      desc: "For those who treasure personal growth, emotional self-discovery, and deep reflection. Observe your emotional tapestry as it unfolds across months and years.",
      tools: ["Life Reports synthesizing recurring themes & bandwidth", "Private video reflections to capture your expressions", "Time-capsule letters to your future self"],
      quote: "Years from now, you will thank yourself for listening so closely to who you were today.",
      color: "#415f4e",
    },
  ];

  const current = pathways[selectedPathway];

  return (
    <div className="landing-v2 for-you-page">
      <LandingNav onOpenAuth={openAuth} />

      {/* ================= HERO ================= */}
      <section className="about-hero-section">
        <div className="about-hero-content">
          <div className="landing-badge">
            <Heart size={12} fill="currentColor" />
            FOR EVERY VERSION OF YOU
          </div>

          <h1 className="about-hero-title">
            You don't have to figure<br />
            everything out all at once.
          </h1>

          <p className="about-hero-subtitle">
            Some days you crave crystal clarity. Some days you just need somewhere to put
            the heavy things you're carrying. MindMirror meets you exactly where your heart is today.
          </p>

          <div className="about-hero-actions">
            <button className="landing-hero-enter-btn" onClick={() => openAuth('signup')}>
              <span>Find your space</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="about-note-float">
          <span>Come as you are.</span>
          <span>You are safe here.</span>
          <span className="landing-note-heart">♡</span>
        </div>
      </section>

      {/* ================= PATHWAY SELECTOR ================= */}
      <section className="for-you-pathway-section">
        <div className="about-section-header">
          <span className="landing-v2-section-label">CHOOSE WHERE YOU ARE TODAY</span>
          <h2>A sanctuary adapted to your inner season</h2>
          <p>Click on the space that matches what you're navigating right now.</p>
        </div>

        <div className="for-you-tabs-grid">
          {pathways.map((p, i) => (
            <button
              key={p.id}
              className={`for-you-tab-card ${selectedPathway === i ? 'active' : ''}`}
              onClick={() => setSelectedPathway(i)}
            >
              <h3>{p.title}</h3>
              <p>{p.headline}</p>
            </button>
          ))}
        </div>

        {/* Selected Detail Showcase */}
        <div className="for-you-detail-showcase">
          <div className="for-you-detail-left">
            <span className="for-you-detail-badge">{current.title}</span>
            <h2>{current.headline}</h2>
            <p className="for-you-detail-desc">{current.desc}</p>

            <div className="for-you-detail-tools">
              <h4>Tools crafted specifically for this:</h4>
              <ul>
                {current.tools.map((t, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} className="text-[#3b5e4c]" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="landing-hero-enter-btn" onClick={() => openAuth('signup')}>
              <span>Step into this space</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="for-you-detail-right">
            <div className="for-you-quote-card">
              <span className="for-you-quote-mark">“</span>
              <p>{current.quote}</p>
              <div className="for-you-quote-footer">
                <Heart size={15} fill="#a86c6c" color="#a86c6c" />
                <span>MindMirror Compass</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= VOICES OF PEACE ================= */}
      <section className="for-you-stories-section">
        <div className="about-section-header">
          <span className="landing-v2-section-label">HEARTFELT REFLECTIONS</span>
          <h2>Words from fellow travelers</h2>
          <p>Real stories of finding calm and clarity in unhurried moments.</p>
        </div>

        <div className="for-you-stories-grid">
          <div className="for-you-story-card">
            <p>
              "I used to dread journaling because I felt guilty every time I broke a streak.
              MindMirror is the first place that felt like a quiet meadow instead of a classroom homework assignment."
            </p>
            <div className="for-you-author">— Maya, Creative Designer</div>
          </div>

          <div className="for-you-story-card">
            <p>
              "The Thought Ladder rewired how I handle panic at 3 AM. Being able to take a harsh catastrophic thought
              and gently climb down to reality in 3 minutes is genuinely life-changing."
            </p>
            <div className="for-you-author">— David, Graduate Student</div>
          </div>

          <div className="for-you-story-card">
            <p>
              "The Anchor Space soundscapes with the coffee mug aesthetic make me physically exhale whenever I open the page.
              It is my private pocket of peace."
            </p>
            <div className="for-you-author">— Elena, Healthcare Worker</div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="about-cta-section">
        <div className="about-cta-card">
          <Sparkles size={32} className="about-cta-leaf" />
          <h2>You deserve a little more space.</h2>
          <p>
            No judgment, no performance, no rush. Enter your sanctuary whenever you're ready.
          </p>
          <button className="landing-hero-enter-btn" onClick={() => openAuth('signup')}>
            <span>Enter MindMirror</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <LandingFooter />

      {authOpen && (
        <Auth
          isModal={true}
          initialMode={authMode}
          onClose={() => setAuthOpen(false)}
        />
      )}
    </div>
  );
}

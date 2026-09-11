// src/pages/About.jsx
import React, { useState } from 'react';
import {
  Heart,
  ArrowRight,
  Layers,
  MessageCircle,
  Anchor,
  BookOpen,
  Sparkles,
  Mail,
  Gamepad2,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Video,
  Feather,
} from 'lucide-react';
import LandingNav from '../components/landing/LandingNav.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import Auth from './Auth.jsx';

export default function About() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [activeLadderStep, setActiveLadderStep] = useState(2);

  const openAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const ladderSteps = [
    { num: 3, label: "Balanced Truth", text: "This is a challenging moment, but I have navigated hard days before. One step at a time.", tag: "Grounded Peace" },
    { num: 2, label: "Gentle Reframe", text: "I made a mistake, but a mistake does not define my worth or my future.", tag: "Self-Compassion" },
    { num: 1, label: "Initial Heavy Thought", text: "I messed up and I ruined everything completely.", tag: "Catastrophizing" },
  ];

  const features = [
    {
      icon: Layers,
      title: "The Thought Ladder",
      tagline: "Cognitive Reframing",
      desc: "Step out of catastrophic loops. The Thought Ladder gently guides you rung by rung from harsh self-criticism toward balanced, self-compassionate points of view.",
      highlight: "Based on evidence-backed CBT reframing principles.",
      badge: "Signature Tool",
    },
    {
      icon: MessageCircle,
      title: "Empathetic Companion",
      tagline: "Voice & Text Listening",
      desc: "A warm, judgment-free presence that listens when you don't have the energy to explain yourself to the world. Features natural voice reflection and gentle emotional mirroring.",
      highlight: "No toxic positivity. Just deep, validating presence.",
      badge: "Real-Time Voice",
    },
    {
      icon: Anchor,
      title: "Anchor Space",
      tagline: "Nervous System Reset",
      desc: "Immerse yourself in tranquil 3D soundscapes (rain on leaves, mountain breeze, campfire, ocean tides), box breathing guides, and 5-4-3-2-1 tactile grounding.",
      highlight: "Brings you back to safety when thoughts feel overwhelming.",
      badge: "Sensory Calm",
    },
    {
      icon: Sparkles,
      title: "Life Report & Patterns",
      tagline: "Emotional Synthesis",
      desc: "See the tapestry of your inner seasons. MindMirror identifies recurring themes, emotional bandwidth rhythms, and cognitive habits across weeks and months.",
      highlight: "Clarity over confusion. Understand your natural cycles.",
      badge: "Deep Insights",
    },
    {
      icon: BookOpen,
      title: "Journal & Video Reflections",
      tagline: "Multi-Modal Self-Expression",
      desc: "Write freely, record short intimate video check-ins, or tag emotions. Watch your expressions soften as you witness your own personal evolution over time.",
      highlight: "Private video check-ins let you talk to yourself like a friend.",
      badge: "Private Archive",
    },
    {
      icon: Mail,
      title: "Letters From The Mirror",
      tagline: "Time Capsules & Encouragement",
      desc: "Write letters to your future self for milestones, or receive personalized compassionate letters synthesized from your reflections to remind you of your strength.",
      highlight: "Connect with the person you were, and the person you are becoming.",
      badge: "Emotional Time Travel",
    },
    {
      icon: Gamepad2,
      title: "Mind Games",
      tagline: "Playful Decompression",
      desc: "Low-stimulus calming psychological mini-games designed to interrupt acute anxiety loops and restore focus and cognitive ease in under 90 seconds.",
      highlight: "A gentle alternative to doom-scrolling when restless.",
      badge: "Mindful Play",
    },
    {
      icon: ShieldCheck,
      title: "Private & Local First",
      tagline: "Your Words Stay Yours",
      desc: "Your innermost reflections are sacred. We never sell your personal words, show ads, or monetize your emotional vulnerabilities. Client-side security first.",
      highlight: "Safe, confidential, and completely yours.",
      badge: "Zero Compromises",
    },
  ];

  return (
    <div className="landing-v2 about-page-wrapper">
      <LandingNav onOpenAuth={openAuth} />

      {/* ================= HERO ================= */}
      <section className="about-hero-section">
        <div className="about-hero-content">
          <div className="landing-badge">
            <Heart size={12} fill="currentColor" />
            THE STORY & HEART OF MINDMIRROR
          </div>

          <h1 className="about-hero-title">
            A quiet sanctuary to see yourself<br />
            with clarity and kindness.
          </h1>

          <p className="about-hero-subtitle">
            When life feels heavy, modern culture tells us to either hustle harder or scroll until numb.
            MindMirror was born out of a simple, radical belief: your thoughts don't need to be suppressed or perfected.
            They just need a gentle place to land.
          </p>

          <div className="about-hero-actions">
            <button className="landing-hero-enter-btn" onClick={() => openAuth('signup')}>
              <span>Enter your sanctuary</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Handwritten note */}
        <div className="about-note-float">
          <span>You don't have to carry</span>
          <span>everything alone.</span>
          <span className="landing-note-heart">♡</span>
        </div>
      </section>

      {/* ================= CORE PHILOSOPHY ================= */}
      <section className="about-philosophy-section">
        <div className="about-section-header">
          <span className="landing-v2-section-label">OUR PHILOSOPHY</span>
          <h2>Three gentle pillars we live by</h2>
          <p>MindMirror is deliberately designed differently from productivity apps and streak-obsessed trackers.</p>
        </div>

        <div className="about-pillars-grid">
          <div className="about-pillar-card">
            <div className="about-pillar-number">01</div>
            <h3>No Streaks. No Guilt.</h3>
            <p>
              Healing is not a daily chore you can fail at. Take days, weeks, or months off.
              When you return, MindMirror welcomes you with open arms without red notifications or broken streaks.
            </p>
          </div>

          <div className="about-pillar-card">
            <div className="about-pillar-number">02</div>
            <h3>Compassion Over Correction</h3>
            <p>
              You are not a problem to be solved. We don't preach toxic positivity or give unsolicited advice.
              We provide a gentle mirror that lets you observe your own feelings with patience and grace.
            </p>
          </div>

          <div className="about-pillar-card">
            <div className="about-pillar-number">03</div>
            <h3>Sacred Privacy</h3>
            <p>
              Your thoughts are your most vulnerable possessions. We never harvest your journal entries for ads or public feeds.
              Your space is truly your private harbor.
            </p>
          </div>
        </div>
      </section>

      {/* ================= COMPLETE FEATURE SHOWCASE ================= */}
      <section className="about-features-section">
        <div className="about-section-header">
          <span className="landing-v2-section-label">WHAT'S INSIDE</span>
          <h2>Every tool crafted with heart</h2>
          <p>
            Explore the comprehensive suite of mindful tools available inside your private MindMirror space.
          </p>
        </div>

        <div className="about-features-grid">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="about-feature-card">
                <div className="about-feature-top">
                  <div className="about-feature-icon-wrap">
                    <Icon size={22} />
                  </div>
                  <span className="about-feature-badge">{item.badge}</span>
                </div>
                <span className="about-feature-tagline">{item.tagline}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className="about-feature-highlight">
                  <CheckCircle2 size={14} />
                  <span>{item.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= INTERACTIVE THOUGHT LADDER DEMO ================= */}
      <section className="about-interactive-ladder-section">
        <div className="about-ladder-wrapper">
          <div className="about-ladder-text">
            <span className="landing-v2-section-label">INTERACTIVE PREVIEW</span>
            <h2>How the Thought Ladder shifts your mind</h2>
            <p>
              When an anxious thought grips you, trying to jump straight to "everything is great" feels fake.
              The Thought Ladder lets you climb one realistic, comforting rung at a time.
            </p>
            <div className="about-ladder-guide">
              <span>Click a rung to see the reframe:</span>
            </div>
          </div>

          <div className="about-ladder-display">
            {ladderSteps.map((s, i) => (
              <div
                key={s.num}
                className={`about-ladder-rung ${activeLadderStep === i ? 'active' : ''}`}
                onClick={() => setActiveLadderStep(i)}
              >
                <div className="about-rung-badge">Rung {s.num} · {s.label}</div>
                <div className="about-rung-text">"{s.text}"</div>
                <span className="about-rung-tag">{s.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section className="about-cta-section">
        <div className="about-cta-card">
          <Feather size={32} className="about-cta-leaf" />
          <h2>Your quiet harbor is ready for you.</h2>
          <p>
            Take a deep breath. Close your other tabs. Step into a space created just for your mind.
          </p>
          <button className="landing-hero-enter-btn" onClick={() => openAuth('signup')}>
            <span>Start your private journey</span>
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

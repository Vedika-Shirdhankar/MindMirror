// src/pages/HowItWorks.jsx
import React, { useState } from 'react';
import {
  PenLine,
  MessageCircle,
  Layers,
  Anchor,
  ArrowRight,
  Sparkles,
  Check,
  Volume2,
  Heart,
  Video,
  Smile,
  Shield,
  Clock,
} from 'lucide-react';
import LandingNav from '../components/landing/LandingNav.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import Auth from './Auth.jsx';

export default function HowItWorks() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [activeStage, setActiveStage] = useState(0);

  const openAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const stages = [
    {
      num: "01",
      title: "Express Freely",
      subtitle: "Give your thoughts a safe place to land",
      icon: PenLine,
      details: [
        "Freeform or guided journaling with zero pressure",
        "Voice notes with automatic emotional sentiment detection",
        "Private video reflections to talk through what you feel",
        "Emotion tags and warmth ratings to track your inner weather",
      ],
      sample: {
        tag: "Stage 1: In the Journal",
        quote: "I've been feeling so depleted all week, like no matter how much I sleep, my mind won't rest.",
        note: "Written without judgment or self-censorship."
      }
    },
    {
      num: "02",
      title: "Listen & Mirror",
      subtitle: "Experience understanding without unsolicited advice",
      icon: MessageCircle,
      details: [
        "Conversational Empathetic Companion (Voice & Text)",
        "Deep emotional validation that listens before answering",
        "Gently names underlying feelings like unspoken grief or burnout",
        "Available 24/7 as an unconditional sounding board",
      ],
      sample: {
        tag: "Stage 2: The Companion Mirrors",
        quote: "It sounds like you're carrying the exhaustion of trying to be strong for everyone else. What would it feel like to put that weight down for just tonight?",
        note: "Gentle validation that helps untangle the knot."
      }
    },
    {
      num: "03",
      title: "Reframe with Kindness",
      subtitle: "Climb out of anxious spirals with the Thought Ladder",
      icon: Layers,
      details: [
        "Step-by-step cognitive reframing adapted from CBT",
        "Detects cognitive distortions like catastrophizing and mind reading",
        "Guides you up rungs from panic to realistic comfort",
        "Preserves your breakthroughs to revisit when doubt returns",
      ],
      sample: {
        tag: "Stage 3: The Thought Ladder",
        quote: "From 'I failed at this job' ➔ 'This project was difficult, but I have learned where my limits are, and that is wisdom.'",
        note: "A realistic bridge from panic to peace."
      }
    },
    {
      num: "04",
      title: "Anchor & Bloom",
      subtitle: "Reset your nervous system and see your growth",
      icon: Anchor,
      details: [
        "Anchor Space binaural soundscapes (Forest Rain, Deep Ocean, Campfire)",
        "Interactive Box Breathing (4-4-4-4) and 5-4-3-2-1 Sensory Grounding",
        "Weekly Life Reports synthesizing recurring themes & bandwidth",
        "Time-capsule letters to your future self and from the Mirror",
      ],
      sample: {
        tag: "Stage 4: In Anchor Space",
        quote: "Binaural Rain & Leaves playing · Inhale 4s · Hold 4s · Exhale 4s · Mind settling into stillness.",
        note: "Your body learns that it is safe once again."
      }
    }
  ];

  return (
    <div className="landing-v2 how-it-works-page">
      <LandingNav onOpenAuth={openAuth} />

      {/* ================= HERO ================= */}
      <section className="about-hero-section">
        <div className="about-hero-content">
          <div className="landing-badge">
            <Sparkles size={12} />
            THE FOUR STAGES OF GENTLE REFLECTION
          </div>

          <h1 className="about-hero-title">
            How MindMirror guides<br />
            your emotional journey.
          </h1>

          <p className="about-hero-subtitle">
            Healing and self-understanding aren't chaotic mysteries. MindMirror breaks reflection down
            into four natural, pressure-free phases designed to meet your nervous system with compassion.
          </p>

          <div className="about-hero-actions">
            <button className="landing-hero-enter-btn" onClick={() => openAuth('signup')}>
              <span>Try it yourself</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="about-note-float">
          <span>Small steps,</span>
          <span>gentle rhythm.</span>
          <span className="landing-note-heart">♡</span>
        </div>
      </section>

      {/* ================= STAGE TABS & CARDS ================= */}
      <section className="how-stages-section">
        <div className="how-stages-nav">
          {stages.map((st, i) => (
            <button
              key={st.num}
              className={`how-stage-tab ${activeStage === i ? 'active' : ''}`}
              onClick={() => setActiveStage(i)}
            >
              <span className="how-tab-num">{st.num}</span>
              <span className="how-tab-title">{st.title}</span>
            </button>
          ))}
        </div>

        <div className="how-stage-detail-card">
          <div className="how-card-left">
            <div className="how-card-badge">
              <span>STAGE {stages[activeStage].num}</span>
            </div>
            <h2>{stages[activeStage].title}</h2>
            <p className="how-card-subtitle">{stages[activeStage].subtitle}</p>

            <ul className="how-card-list">
              {stages[activeStage].details.map((d, idx) => (
                <li key={idx}>
                  <Check size={16} className="text-[#3b5e4c]" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>

            <button className="how-stage-cta" onClick={() => openAuth('signup')}>
              Experience Stage {stages[activeStage].num}
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="how-card-right">
            <div className="how-sample-box">
              <span className="how-sample-tag">{stages[activeStage].sample.tag}</span>
              <p className="how-sample-quote">"{stages[activeStage].sample.quote}"</p>
              <span className="how-sample-note">{stages[activeStage].sample.note}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMPLETE DAILY ROUTINE ================= */}
      <section className="how-routine-section">
        <div className="about-section-header">
          <span className="landing-v2-section-label">A TYPICAL 5-MINUTE CHECK-IN</span>
          <h2>Gentle, simple, and effortless</h2>
          <p>You don't need an hour. Even a few moments inside MindMirror can alter the trajectory of your day.</p>
        </div>

        <div className="how-timeline-grid">
          <div className="how-timeline-item">
            <div className="how-timeline-time">Minute 1</div>
            <h3>Check In</h3>
            <p>Select an emotion tag and type or voice-record what's occupying your head right now.</p>
          </div>
          <div className="how-timeline-item">
            <div className="how-timeline-time">Minute 2-3</div>
            <h3>Mirror & Reframe</h3>
            <p>Read your Companion's warm perspective or step onto the Thought Ladder to rebalance harsh self-talk.</p>
          </div>
          <div className="how-timeline-item">
            <div className="how-timeline-time">Minute 4-5</div>
            <h3>Anchor & Exhale</h3>
            <p>Take three deep box breaths with nature soundscapes, then return to your day with a calm center.</p>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="about-cta-section">
        <div className="about-cta-card">
          <Heart size={32} className="about-cta-leaf" />
          <h2>Ready to experience a kinder mind?</h2>
          <p>
            No credit card. No complex setup. Just your private space waiting for you.
          </p>
          <button className="landing-hero-enter-btn" onClick={() => openAuth('signup')}>
            <span>Begin your journey</span>
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

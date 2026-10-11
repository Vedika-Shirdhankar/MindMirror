// src/pages/Landing.jsx
import { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Leaf,
  PenLine,
  Brain,
  Sparkles,
  ShieldCheck,
  Compass,
  Anchor,
  Moon,
  Feather,
} from "lucide-react";
import Auth from "./Auth.jsx";
import WhyMindMirror from "./WhyMindMirror.jsx";
import HeroCanvas from "../components/landing/HeroCanvas.jsx";
import CoffeeSteam from "../components/landing/CoffeeSteam.jsx";
import BreathingPacer from "../components/landing/BreathingPacer.jsx";
import AmbientAudio from "../components/landing/AmbientAudio.jsx";
import ReflectionWidget from "../components/landing/ReflectionWidget.jsx";
import LandingNav from "../components/landing/LandingNav.jsx";
import LandingFooter from "../components/landing/LandingFooter.jsx";
import "../styles/landing-extra.css";

export default function Landing({ autoOpenAuth = false }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const mousePosRef = useRef({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const openAuth = (mode = "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (autoOpenAuth) {
      setAuthMode("login");
      setAuthOpen(true);
    }
  }, [autoOpenAuth]);

  // Subtle 3D mouse parallax on hero
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePosRef.current = { x, y };

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const offsetX = (x - centerX) / centerX;
    const offsetY = (y - centerY) / centerY;

    setParallaxOffset({
      x: offsetX * 7,
      y: offsetY * 5,
    });
  };

  const handleMouseLeave = () => {
    setParallaxOffset({ x: 0, y: 0 });
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (aboutOpen) {
    return (
      <WhyMindMirror
        onGetStarted={() => {
          setAboutOpen(false);
          openAuth("signup");
        }}
      />
    );
  }

  return (
    <div className="landing-v2">

      <LandingNav onOpenAuth={openAuth} />

      {/* ================= HERO ================= */}
      <section
        ref={heroRef}
        className="landing-v2-hero"
        id="landing-home"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Real artwork background with subtle parallax */}
        <div
          className="landing-hero-bg-layer"
          style={{
            transform: `translate3d(${-parallaxOffset.x * 0.4}px, ${-parallaxOffset.y * 0.4}px, 0) scale(1.02)`,
          }}
        />

        {/* Dynamic Sunlight God-Rays & Horizon Glow */}
        <div className="landing-sun-glow-layer" aria-hidden="true">
          <div className="landing-sun-core" />
          <div className="landing-sun-rays" />
          <div className="landing-sun-halo" />
        </div>

        {/* Lake Water Shimmer Effect */}
        <div className="landing-water-shimmer-layer" aria-hidden="true">
          <span className="shimmer-ripple r1" />
          <span className="shimmer-ripple r2" />
          <span className="shimmer-ripple r3" />
          <span className="shimmer-sparkle s1" />
          <span className="shimmer-sparkle s2" />
          <span className="shimmer-sparkle s3" />
        </div>

        {/* Animated Coffee Mug Steam */}
        <CoffeeSteam />

        {/* Drifting Leaves & Pollen Canvas Particle Engine */}
        <HeroCanvas mousePos={mousePosRef} />

        {/* Note 1: Upper Left near the tree */}
        <div
          className="landing-note-left"
          style={{
            transform: `translate3d(${parallaxOffset.x * 0.6}px, ${parallaxOffset.y * 0.6}px, 0) rotate(-6deg)`,
          }}
        >
          <span>it's okay</span>
          <span>to take a</span>
          <span>break</span>
          <span className="landing-note-heart">♡</span>
        </div>

        {/* Center Hero Typography */}
        <div
          className="landing-hero-center-content"
          style={{
            transform: `translate3d(${parallaxOffset.x * 0.3}px, ${parallaxOffset.y * 0.3}px, 0)`,
          }}
        >
          <h1 className="landing-hero-title">
            Some thoughts are easier to understand when you see them from a different perspective.
          </h1>

          <p className="landing-hero-subtitle">
            Write or speak an entry. MindMirror spots the patterns, remembers
            what helped you before, and steps in if you're struggling.
          </p>

          <div className="landing-hero-btn-wrap">
            <button
              className="landing-hero-enter-btn"
              onClick={() => openAuth("signup")}
            >
              <span>Enter MindMirror</span>
              <ArrowRight size={17} className="landing-btn-arrow" />
              <div className="landing-btn-shine" />
            </button>
          </div>

          <div className="landing-hero-tagline-wrap">
            <div className="landing-hero-divider">
              <span className="line" />
              <Leaf size={14} className="leaf-icon" />
              <span className="line" />
            </div>
            <p className="landing-hero-tagline">
              A safe space for every version of you.
            </p>
          </div>
        </div>

        {/* Note 2: Lower Right above the wildflowers */}
        <div
          className="landing-note-right"
          style={{
            transform: `translate3d(${parallaxOffset.x * 0.7}px, ${parallaxOffset.y * 0.7}px, 0) rotate(5deg)`,
          }}
        >
          <span>A kinder</span>
          <span>mind.</span>
          <span>A brighter you.</span>
          <span className="landing-note-heart">♡</span>
        </div>

        {/* Bottom Bar: Scroll Indicator + Breathing Pacer */}
        <div className="landing-hero-bottom-bar">
          <button
            className="landing-scroll-explore"
            onClick={() => scrollToSection('landing-how')}
          >
            <span className="landing-scroll-circle">
              <ChevronDown size={16} />
            </span>
            <span>SCROLL TO EXPLORE</span>
          </button>

          <div className="landing-bottom-right-items">
            <BreathingPacer />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="landing-v2-section landing-v2-how" id="landing-how">
        <div className="landing-v2-heading">
          <h2>What happens after you write an entry.</h2>
          <p>
            Four steps, in order. Each one says what you get, and how it works
            underneath.
          </p>
        </div>

        <div className="landing-v2-cards">
          <article className="landing-v2-card">
            <span className="landing-v2-card-number">1</span>
            <div className="landing-v2-card-icon"><PenLine size={22} /></div>
            <h3>Write or speak.</h3>
            <p>Type your entry, or say it out loud and it is turned into text.</p>
            <p className="landing-v2-card-tech">
              Sent to a JWT-protected API. Journal text is encrypted with
              AES-256-GCM before it is stored.
            </p>
          </article>

          <article className="landing-v2-card">
            <span className="landing-v2-card-number">2</span>
            <div className="landing-v2-card-icon"><Brain size={22} /></div>
            <h3>See the pattern.</h3>
            <p>
              Get a short reflection on your mood, what triggered it, and any
              thinking traps in the entry.
            </p>
            <p className="landing-v2-card-tech">
              A fine-tuned DistilBERT model classifies 7 language patterns.
              Gemini writes the analysis.
            </p>
          </article>

          <article className="landing-v2-card">
            <span className="landing-v2-card-number">3</span>
            <div className="landing-v2-card-icon"><Anchor size={22} /></div>
            <h3>Recall what helped.</h3>
            <p>
              When you feel the same way again, the companion brings up what you
              wrote before and what worked.
            </p>
            <p className="landing-v2-card-tech">
              Every entry becomes a 768-dimension embedding. Vector search finds
              similar past entries and passes them to Gemini (RAG).
            </p>
          </article>

          <article className="landing-v2-card">
            <span className="landing-v2-card-number">4</span>
            <div className="landing-v2-card-icon"><Compass size={22} /></div>
            <h3>Try another angle.</h3>
            <p>
              Walk a heavy thought down the Thought Ladder, or open your Anchor
              space of quotes and notes you saved.
            </p>
            <p className="landing-v2-card-tech">
              A CBT-style exercise. Anchor items are suggested from the
              emotional state detected in your entry.
            </p>
          </article>
        </div>
      </section>

      {/* ================= INTERACTIVE REFLECTION EXPERIENCE ================= */}
      <section className="landing-v2-reflection-section">
        <ReflectionWidget onGetStarted={() => openAuth("signup")} />
      </section>

      {/* ================= SAFETY ================= */}
      <section className="landing-v2-safety" id="landing-safety">
        <div className="landing-v2-safety-inner">
          <div className="landing-v2-safety-head">
            <ShieldCheck size={26} />
            <h2>If an entry sounds like a crisis, the screen changes.</h2>
            <p>
              Two separate checks run on every entry. If either one fires,
              MindMirror switches to a support screen with free helplines, plus
              a message you wrote to your future self when you were feeling okay.
            </p>
          </div>

          <div className="landing-v2-safety-checks">
            <div className="landing-v2-safety-check">
              <h3>Pattern model</h3>
              <p>
                Flags suicidal language when its confidence is 50% or higher.
              </p>
            </div>
            <div className="landing-v2-safety-check">
              <h3>Gemini review</h3>
              <p>
                Rates the entry's risk as none, low, moderate or high. Moderate
                and high both trigger support.
              </p>
            </div>
          </div>

          <p className="landing-v2-safety-note">
            These are signals from language patterns, not a diagnosis, and
            MindMirror is not a substitute for professional care.
          </p>
        </div>
      </section>

      {/* ================= FOR YOU ================= */}
      <section className="landing-v2-for-you" id="landing-for-you">
        <div className="landing-v2-for-you-inner">
          <div className="landing-for-you-title-col">
            <span className="landing-v2-section-label">FOR EVERY VERSION OF YOU</span>
            <h2>
              You don't have to<br />
              figure everything out<br />
              all at once.
            </h2>
            <div className="landing-safety-pill">
              <ShieldCheck size={16} />
              <span>Private by design. Your entries are encrypted before they are stored.</span>
            </div>
          </div>

          <div className="landing-v2-for-you-copy">
            <p>
              Some days you crave clarity. Some days you just need somewhere to put
              everything you've been carrying on your shoulders.
            </p>
            <p>
              MindMirror is crafted to meet you exactly where you are today —
              without pressure, streaks, or judgment.
            </p>
            <button
              className="landing-for-you-cta"
              onClick={() => openAuth("signup")}
            >
              Enter your space
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />

      {/* ================= AUTH MODAL ================= */}
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
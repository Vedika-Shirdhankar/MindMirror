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
            Some thoughts are easier to<br />
            understand when you see them<br />
            from a different perspective.
          </h1>

          <p className="landing-hero-subtitle">
            Journal. Reflect. Understand. Grow.
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
          <span className="landing-v2-section-label">THE JOURNEY WITHIN</span>
          <h2>Your mind deserves a little more space.</h2>
          <p>
            MindMirror gives you a quiet harbor to slow down, gently untangle what you're carrying,
            and reconnect with yourself through kind, thoughtful reflection.
          </p>
        </div>

        <div className="landing-v2-cards">
          <article className="landing-v2-card">
            <span className="landing-v2-card-number">01</span>
            <div className="landing-v2-card-icon">
              <PenLine size={22} />
            </div>
            <h3>Put it into words.</h3>
            <p>
              Write freely. Let the thoughts that have been sitting inside your head
              finally have a gentle, unjudged place to go.
            </p>
          </article>

          <article className="landing-v2-card">
            <span className="landing-v2-card-number">02</span>
            <div className="landing-v2-card-icon">
              <Brain size={22} />
            </div>
            <h3>Understand yourself.</h3>
            <p>
              Discover emotional rhythms, recurring themes, and patterns that help you
              meet yourself with clarity instead of frustration.
            </p>
          </article>

          <article className="landing-v2-card">
            <span className="landing-v2-card-number">03</span>
            <div className="landing-v2-card-icon">
              <Compass size={22} />
            </div>
            <h3>Shift your perspective.</h3>
            <p>
              Gently step onto the Thought Ladder. Transform heavy, looping worries
              into compassionate, balanced points of view.
            </p>
          </article>

          <article className="landing-v2-card">
            <span className="landing-v2-card-number">04</span>
            <div className="landing-v2-card-icon">
              <Sparkles size={22} />
            </div>
            <h3>Grow gently.</h3>
            <p>
              Turn daily reflections into small, achievable steps that help you
              move forward with peace, at your own rhythm.
            </p>
          </article>
        </div>
      </section>

      {/* ================= INTERACTIVE REFLECTION EXPERIENCE ================= */}
      <section className="landing-v2-reflection-section">
        <ReflectionWidget onGetStarted={() => openAuth("signup")} />
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
              <span>Private by design. Your reflections stay yours.</span>
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

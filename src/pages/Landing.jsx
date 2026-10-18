// src/pages/Landing.jsx
import { useEffect, useState, useRef } from "react";
import Auth from "./Auth.jsx";
import NatureSoundPlayer from "../components/landing/NatureSoundPlayer.jsx";
import "../styles/landing-soft.css";

const REFLECTIONS = {
  scattered: {
    title: "When your mind is carrying too much at once",
    body: "You don’t need to organise everything right now. Giving your thoughts a place to land can be enough for today. Start with one sentence, and let the rest wait.",
    question: "What is one small thing you can set down for the next ten minutes?",
  },
  critical: {
    title: "When your inner voice feels a little too loud",
    body: "You deserve the same patience you would offer someone you care about. One difficult moment does not define your ability, your worth, or how far you have come.",
    question: "What would you say to a friend who was speaking about themselves this way?",
  },
  peace: {
    title: "When you need a quieter moment",
    body: "You do not have to make the whole day peaceful. A small pause counts too. Let your shoulders soften, take a breath, and give yourself permission to be here.",
    question: "What is one small thing that helps you feel grounded?",
  },
  growth: {
    title: "When you are ready for a small new beginning",
    body: "Growth does not have to arrive as a big promise. It can be a tiny choice you make with care, repeated when you can. Small steps are still movement.",
    question: "What is one kind intention you would like to carry into tomorrow?",
  },
  lonely: {
    title: "When everything feels a little distant",
    body: "Feeling alone can make the world seem quieter than it is. You do not need to solve that feeling all at once. A small connection, even with yourself, is a place to begin.",
    question: "Is there someone safe you could send a simple hello to today?",
  },
};

const LEAF_SYMBOLS = ["🍃", "🍂", "🍃", "🍁", "🍃", "🍂", "🍃"];

export default function Landing({ autoOpenAuth = false }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMood, setActiveMood] = useState("scattered");
  const [leaves, setLeaves] = useState([]);
  const homeRef = useRef(null);

  const openAuth = (mode = "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  useEffect(() => {
    if (autoOpenAuth) {
      setAuthMode("login");
      setAuthOpen(true);
    }
  }, [autoOpenAuth]);

  // Floating delicate leaves generator for hero section
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const generated = Array.from({ length: 7 }).map((_, i) => ({
      id: i,
      symbol: LEAF_SYMBOLS[i % LEAF_SYMBOLS.length],
      left: `${Math.random() * 95}%`,
      size: `${15 + Math.random() * 12}px`,
      duration: `${19 + Math.random() * 17}s`,
      delay: `${-Math.random() * 28}s`,
      sway: `${-65 + Math.random() * 130}px`,
      opacity: `${0.22 + Math.random() * 0.22}`,
    }));
    setLeaves(generated);
  }, []);

  // Intersection observer for .reveal elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll(".landing-soft .reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const currentReflection = REFLECTIONS[activeMood] || REFLECTIONS.scattered;

  return (
    <div className="landing-soft">
      {/* ================= HEADER ================= */}
      <header>
        <div className="wrap nav">
          <a
            className="brand"
            href="#home"
            onClick={(e) => scrollToSection(e, "home")}
            aria-label="MindMirror home"
          >
            <span className="brand-mark">🌿</span>
            <span>
              <span className="brand-name">MindMirror</span>
              <span className="brand-tag">a little space for all of you ♡</span>
            </span>
          </a>

          <nav
            className={`nav-links ${menuOpen ? "open" : ""}`}
            id="navLinks"
            aria-label="Main navigation"
          >
            <a href="#home" onClick={(e) => scrollToSection(e, "home")}>Home</a>
            <a href="#how" onClick={(e) => scrollToSection(e, "how")}>How it works</a>
            <a href="#features" onClick={(e) => scrollToSection(e, "features")}>Features</a>
            <a href="#reflect" onClick={(e) => scrollToSection(e, "reflect")}>For you</a>
            <a href="#safety" onClick={(e) => scrollToSection(e, "safety")}>Your safety</a>
            <a href="#privacy" onClick={(e) => scrollToSection(e, "privacy")}>Privacy</a>
          </nav>

          <div className="nav-actions">
            <a
              className="btn btn-light"
              href="#reflect"
              onClick={(e) => scrollToSection(e, "reflect")}
            >
              Take a breath
            </a>
            <button
              className="btn"
              onClick={() => openAuth("login")}
            >
              Sign in <span className="arrow">↗</span>
            </button>
            <button
              className="menu-toggle"
              id="menuToggle"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "×" : "☰"}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ================= HERO ================= */}
        <section className="hero" id="home" ref={homeRef}>
          {/* Floating leaves container */}
          <div className="floating-leaves" aria-hidden="true">
            {leaves.map((leaf) => (
              <span
                key={leaf.id}
                className="floating-leaf"
                style={{
                  "--leaf-left": leaf.left,
                  "--leaf-size": leaf.size,
                  "--leaf-duration": leaf.duration,
                  "--leaf-delay": leaf.delay,
                  "--leaf-sway": leaf.sway,
                  "--leaf-opacity": leaf.opacity,
                }}
              >
                {leaf.symbol}
              </span>
            ))}
          </div>

          <div className="wrap hero-inner">
            <div className="hero-copy reveal">
              <span className="hero-kicker">a softer mind, a brighter you ✿</span>
              <h1>
                Some thoughts feel lighter when you <em>see them differently.</em>
              </h1>
              <p>
                Write what’s on your mind. MindMirror helps you notice patterns, remember
                what has helped before, and find a gentler perspective — one entry at a time.
              </p>
              <button
                className="btn"
                onClick={() => openAuth("signup")}
              >
                Enter your journal <span className="arrow">→</span>
              </button>
              <span className="hero-note hand">No perfect words needed. Just begin. ♡</span>
            </div>

            <div className="hero-art reveal" aria-label="A journal page with a sample reflection">
              <div className="journal-stack">
                <div className="journal-shadow"></div>
                <article className="journal-page">
                  <div className="page-date">Sunday, October 18 ☀</div>
                  <h3>A little note to myself…</h3>
                  <p>
                    Today felt like a lot. I kept replaying every little thing, wondering if I
                    could have done it <span>differently.</span> Maybe I can let today be enough.
                  </p>
                  <div className="page-footer">
                    <span>my private pages</span>
                    <span>♡ &nbsp; 01</span>
                  </div>
                </article>
                <div className="floating-note">
                  You are allowed to take it one little step at a time.
                </div>
                <div className="polaroid">
                  <div className="polaroid-img"></div>
                  <p>collect little moments ♡</p>
                </div>
              </div>
            </div>
          </div>

          <a
            className="hero-scroll"
            href="#how"
            onClick={(e) => scrollToSection(e, "how")}
          >
            A little further
          </a>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="how" id="how">
          <div className="wrap">
            <div className="section-heading reveal">
              <span className="hand">the little things add up ✦</span>
              <h2>What happens after you write?</h2>
              <p>
                Four thoughtful steps turn a journal entry into a moment of understanding.
                Quietly, gently, and at your pace.
              </p>
            </div>
            <div className="steps">
              <article className="step reveal">
                <div className="step-top">
                  <span className="step-num">01</span>
                  <span className="step-icon">✍️</span>
                </div>
                <h3>Write or speak.</h3>
                <p>Put your thoughts into words, exactly as they come. Type an entry or speak freely.</p>
                <div className="step-detail">
                  <b>under the surface</b>Your journal is protected before it is stored, with secure sign-in and encrypted entry storage.
                </div>
              </article>

              <article className="step reveal">
                <div className="step-top">
                  <span className="step-num">02</span>
                  <span className="step-icon">☁️</span>
                </div>
                <h3>Notice the pattern.</h3>
                <p>See a gentle reflection on your mood, possible triggers, and recurring thought patterns.</p>
                <div className="step-detail">
                  <b>under the surface</b>A fine-tuned language model identifies patterns; Gemini helps shape the reflection.
                </div>
              </article>

              <article className="step reveal">
                <div className="step-top">
                  <span className="step-num">03</span>
                  <span className="step-icon">♡</span>
                </div>
                <h3>Remember what helped.</h3>
                <p>When a familiar feeling returns, revisit the small things that supported you before.</p>
                <div className="step-detail">
                  <b>under the surface</b>Semantic search finds relevant moments from earlier entries to add helpful context.
                </div>
              </article>

              <article className="step reveal">
                <div className="step-top">
                  <span className="step-num">04</span>
                  <span className="step-icon">🌱</span>
                </div>
                <h3>Try another angle.</h3>
                <p>Explore a guided thought exercise, revisit your anchors, or simply pause and reflect.</p>
                <div className="step-detail">
                  <b>under the surface</b>CBT-inspired exercises and personal reminders offer another way to look at a thought.
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ================= FEATURE SHOWCASE ================= */}
        <section className="feature-showcase" id="features">
          <div className="wrap">
            <div className="section-heading reveal">
              <span className="hand">little tools for the days in between ♡</span>
              <h2>A closer look at your little corner.</h2>
              <p>
                Not another list of things to keep up with. Just thoughtful spaces that help
                you notice, remember and make sense of your days.
              </p>
            </div>

            <div className="feature-grid">
              <article className="feature-card feature-dump reveal">
                <div className="feature-copy">
                  <span className="feature-label">01 · LET IT OUT</span>
                  <h3>Mind Dump</h3>
                  <p>
                    For the thoughts that arrive all at once. Put them somewhere safe before you try
                    to make sense of them.
                  </p>
                  <span className="feature-hand">No editing. No perfect sentences.</span>
                </div>
                <div className="mini-paper dump-paper" aria-label="Illustrative journal entry preview">
                  <div className="mini-paper-top">
                    <span>✎ today's page</span>
                    <span>•••</span>
                  </div>
                  <div className="fake-writing">I have so many little things on my mind today...</div>
                  <div className="fake-writing short">Maybe I can take them one at a time.</div>
                  <div className="paper-bottom">
                    <span>just let it out ♡</span>
                    <span>↗</span>
                  </div>
                </div>
              </article>

              <article className="feature-card feature-calendar reveal">
                <div className="feature-copy">
                  <span className="feature-label">02 · NOTICE YOUR RHYTHMS</span>
                  <h3>Mood Calendar</h3>
                  <p>
                    See your month at a glance and gently notice how different days have felt. No
                    streaks, no pressure.
                  </p>
                  <span className="feature-hand">Every day gets to be what it was.</span>
                </div>
                <div className="mini-calendar" aria-label="Illustrative mood calendar preview">
                  <div className="calendar-head">
                    <span>October notes</span>
                    <span>✦ 2026</span>
                  </div>
                  <div className="calendar-days">
                    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                  </div>
                  <div className="calendar-dates">
                    <span className="empty"></span>
                    <span className="empty"></span>
                    <span className="empty"></span>
                    <span>1</span>
                    <span className="mood-soft">2</span>
                    <span>3</span>
                    <span className="mood-warm">4</span>
                    <span>5</span>
                    <span className="mood-sage">6</span>
                    <span>7</span>
                    <span className="mood-warm">8</span>
                    <span>9</span>
                    <span className="mood-soft">10</span>
                    <span>11</span>
                    <span className="mood-sage">12</span>
                    <span>13</span>
                    <span className="mood-soft">14</span>
                    <span>15</span>
                    <span className="mood-warm">16</span>
                    <span>17</span>
                    <span className="mood-sage">18</span>
                  </div>
                  <div className="calendar-legend">
                    <span><i className="legend-sage"></i> settled</span>
                    <span><i className="legend-warm"></i> tender</span>
                    <span><i className="legend-soft"></i> reflective</span>
                  </div>
                </div>
              </article>

              <article className="feature-card feature-memory reveal">
                <div className="feature-copy">
                  <span className="feature-label">03 · KEEP WHAT MATTERS</span>
                  <h3>Memory Map</h3>
                  <p>
                    Find threads between moments and revisit entries that may offer context when a
                    familiar feeling returns.
                  </p>
                  <span className="feature-hand">Your story, gently connected.</span>
                </div>
                <div className="memory-map" aria-label="Illustrative memory map preview">
                  <div className="memory-line"></div>
                  <div className="memory-node node-one">
                    <b>✿</b>
                    <span><strong>A small win</strong><small>something that felt good</small></span>
                  </div>
                  <div className="memory-node node-two">
                    <b>♡</b>
                    <span><strong>A familiar feeling</strong><small>a thought that returned</small></span>
                  </div>
                  <div className="memory-node node-three">
                    <b>☀</b>
                    <span><strong>What helped</strong><small>a reminder worth keeping</small></span>
                  </div>
                </div>
              </article>
            </div>
            <p className="feature-disclaimer">These previews are illustrative glimpses of the experience.</p>
          </div>
        </section>

        {/* ================= REFLECTION SECTION ================= */}
        <section className="reflection" id="reflect">
          <div className="wrap">
            <div className="section-heading reveal">
              <span className="eyebrow">a moment with your mind</span>
              <h2>What is your heart carrying today?</h2>
              <p>
                Choose what feels closest. There is no right answer — just a little space to
                check in with yourself.
              </p>
            </div>
            <div
              className="mood-chips reveal"
              id="moodChips"
              role="group"
              aria-label="Choose how you are feeling"
            >
              {[
                { id: "scattered", label: "My thoughts feel scattered" },
                { id: "critical", label: "I’m being hard on myself" },
                { id: "peace", label: "I need a moment of peace" },
                { id: "growth", label: "Ready for a little growth" },
                { id: "lonely", label: "Feeling a little alone" },
              ].map((item) => (
                <button
                  key={item.id}
                  className="mood-chip"
                  data-mood={item.id}
                  aria-pressed={activeMood === item.id}
                  onClick={() => setActiveMood(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <article className="reflection-card reveal" aria-live="polite">
              <div className="reflection-title">
                <span className="reflection-heart">♥</span>
                <div>
                  <h3 id="reflectionTitle">{currentReflection.title}</h3>
                  <small>MindMirror reflection</small>
                </div>
              </div>
              <p id="reflectionBody">{currentReflection.body}</p>
              <div className="question">
                <span>A gentle question for you</span>
                <p id="reflectionQuestion">“{currentReflection.question}”</p>
              </div>
              <div className="reflection-action">
                <button
                  className="btn"
                  onClick={() => openAuth("signup")}
                >
                  Explore your own reflections <span className="arrow">→</span>
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* ================= SAFETY / CARE SECTION ================= */}
        <section className="safety" id="safety">
          <div className="wrap care-layout">
            <div className="care-intro reveal">
              <span className="care-kicker">
                <span className="care-kicker-icon">♡</span> care comes first
              </span>
              <p className="care-overline">A little more care, when it matters most</p>
              <h2>
                Your words deserve to be met with <em>care.</em>
              </h2>
              <p className="care-lead">
                If an entry suggests you might be going through something serious, MindMirror
                gently changes the experience — making room for support instead of an ordinary
                reflection.
              </p>
              <div className="care-handnote">
                You don't have to navigate a difficult moment alone. <span>✳</span>
              </div>
            </div>

            <div className="care-flow">
              <article className="care-step reveal">
                <div className="care-step-rail">
                  <span className="care-step-number">01</span>
                  <span className="care-step-symbol">⌕</span>
                </div>
                <div className="care-step-content">
                  <span className="care-label">FIRST LAYER · LANGUAGE PATTERNS</span>
                  <h3>We pay attention to the words.</h3>
                  <p>
                    A language-pattern model looks for expressions that may signal distress and flags
                    entries that need a closer review.
                  </p>
                </div>
              </article>

              <div className="care-connector" aria-hidden="true">
                <span>↓</span>
              </div>

              <article className="care-step reveal">
                <div className="care-step-rail">
                  <span className="care-step-number">02</span>
                  <span className="care-step-symbol">✧</span>
                </div>
                <div className="care-step-content">
                  <span className="care-label">SECOND LAYER · ADDITIONAL REVIEW</span>
                  <h3>We take a second look.</h3>
                  <p>
                    A separate risk review considers the entry for additional signals. If its
                    threshold is reached, MindMirror moves from reflection to a dedicated support
                    experience.
                  </p>
                </div>
              </article>

              <div className="care-outcome reveal">
                <span className="care-outcome-icon">☼</span>
                <div>
                  <strong>A different kind of response.</strong>
                  <p>
                    When extra support may be needed, the next step is not another journal prompt.
                    It is a clearer path toward support resources.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="wrap care-footnote">
            <span>✦</span> These checks look for language patterns; they do not diagnose or replace
            professional care. MindMirror is not an emergency service.
          </div>
        </section>

        {/* ================= PRIVACY SECTION ================= */}
        <section className="privacy" id="privacy">
          <div className="wrap privacy-grid">
            <div className="privacy-copy reveal">
              <span className="eyebrow">for every version of you</span>
              <h2>You don’t have to figure everything out all at once.</h2>
              <p>
                Some days you want clarity. Some days you just need somewhere to put it all.
                MindMirror is a space to show up as you are — without pressure, streaks, or judgment.
              </p>
              <div className="privacy-badge">
                ♧ &nbsp; Private by design. Your entries are encrypted before they are stored.
              </div>
              <div className="privacy-note">
                <span>✦ A note on AI</span>
                <p>
                  MindMirror’s reflections are designed to support self-reflection. They are not
                  diagnoses or a substitute for professional mental-health care.
                </p>
              </div>
              <button
                className="btn"
                onClick={() => openAuth("signup")}
              >
                Enter your space <span className="arrow">→</span>
              </button>
            </div>
            <div className="memory-shelf reveal">
              <div className="shelf-title">little reminders for the journey ✦</div>
              <div className="book"><span>🍃</span> HEAL <span>✦</span></div>
              <div className="book"><span>📖</span> REFLECT <span>✦</span></div>
              <div className="book"><span>☀</span> GROW <span>✦</span></div>
              <div className="book"><span>🌸</span> BE YOU <span>✦</span></div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer>
        <div className="wrap footer-inner">
          <div className="footer-brand">
            🌿 MindMirror <span>a gentle sanctuary for every version of you.</span>
          </div>
          <nav className="footer-links">
            <a href="#home" onClick={(e) => scrollToSection(e, "home")}>Home</a>
            <a href="#how" onClick={(e) => scrollToSection(e, "how")}>How it works</a>
            <a href="#reflect" onClick={(e) => scrollToSection(e, "reflect")}>For you</a>
            <a href="#privacy" onClick={(e) => scrollToSection(e, "privacy")}>Privacy</a>
          </nav>
          <div className="copyright">© 2026 MindMirror · Made with care ♡</div>
        </div>
      </footer>

      {/* ================= NATURE SOUNDS ================= */}
      <NatureSoundPlayer />

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
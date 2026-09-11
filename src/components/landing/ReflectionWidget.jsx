// src/components/landing/ReflectionWidget.jsx
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

export default function ReflectionWidget({ onGetStarted }) {
  const [selectedPrompt, setSelectedPrompt] = useState(0);

  const reflections = [
    {
      label: "My thoughts feel scattered",
      title: "When the mind is carrying too much at once",
      insight: "You don't need to organize everything right now. Simply giving your thoughts a safe place to land allows your nervous system to rest.",
      prompt: "What is one small thing you can let go of for the next ten minutes?",
    },
    {
      label: "I'm being too critical of myself",
      title: "Speaking to yourself with gentleness",
      insight: "The voice of criticism often stems from tired exhaustion, not reality. You are doing your best with what you have today.",
      prompt: "How would you speak to a dear friend who carried the same worry today?",
    },
    {
      label: "Longing for a moment of peace",
      title: "Your quiet harbor awaits",
      insight: "Peace is not something you have to earn or chase. It is already here in this single breath you are taking right now.",
      prompt: "Notice the weight of your hands resting gently. You are safe here.",
    },
    {
      label: "Ready to plant a seed of growth",
      title: "Small steps shape beautiful journeys",
      insight: "True growth rarely happens in giant leaps; it blossoms quietly through small, loving moments of self-honesty.",
      prompt: "What is one gentle intention you wish to keep in your heart tomorrow?",
    },
  ];

  const current = reflections[selectedPrompt];

  return (
    <div className="landing-reflection-widget">
      <div className="landing-reflection-header">
        <span className="landing-badge">
          <Sparkles size={13} />
          EXPERIENCE THE MIRROR
        </span>
        <h3>What is your heart carrying today?</h3>
        <p>Select what resonates, and see how a gentle shift in perspective brings calm.</p>
      </div>

      {/* Chips */}
      <div className="landing-reflection-chips">
        {reflections.map((r, i) => (
          <button
            key={i}
            className={`landing-chip ${selectedPrompt === i ? 'active' : ''}`}
            onClick={() => setSelectedPrompt(i)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="landing-reflection-card">
        <div className="landing-reflection-card-top">
          <div className="landing-reflection-heart">
            <Heart size={16} fill="#749182" color="#749182" />
          </div>
          <div>
            <h4>{current.title}</h4>
            <span className="landing-reflection-subtitle">MindMirror Reflection</span>
          </div>
        </div>

        <p className="landing-reflection-body">{current.insight}</p>

        <div className="landing-reflection-prompt-box">
          <span className="landing-prompt-label">A gentle question for you:</span>
          <p className="landing-prompt-text">{current.prompt}</p>
        </div>

        <div className="landing-reflection-footer">
          <button className="landing-reflection-cta" onClick={onGetStarted}>
            Explore your own private reflections
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

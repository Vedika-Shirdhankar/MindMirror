// src/components/landing/BreathingPacer.jsx
import React, { useState, useEffect } from 'react';

export default function BreathingPacer() {
  const [activeStep, setActiveStep] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale, Hold, Exhale
  const [countdown, setCountdown] = useState(4);

  const steps = ['Pause', 'Reflect', 'Heal', 'Grow'];

  useEffect(() => {
    if (isBreathing) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isBreathing]);

  // 4-4-4-4 Box Breathing cycle
  useEffect(() => {
    if (!isBreathing) return;
    let timer;

    if (breathPhase === 'Inhale') {
      setCountdown(4);
      timer = setTimeout(() => {
        setBreathPhase('Hold');
      }, 4000);
    } else if (breathPhase === 'Hold') {
      setCountdown(4);
      timer = setTimeout(() => {
        setBreathPhase('Exhale');
      }, 4000);
    } else if (breathPhase === 'Exhale') {
      setCountdown(4);
      timer = setTimeout(() => {
        setBreathPhase('Inhale');
      }, 4000);
    }

    return () => clearTimeout(timer);
  }, [isBreathing, breathPhase]);

  return (
    <div className="landing-pacer-wrap">
      {isBreathing ? (
        <div
          className="landing-breath-active"
          onClick={() => setIsBreathing(false)}
          title="Click to minimize"
        >
          <div className={`landing-breath-orb ${breathPhase.toLowerCase()}`}>
            <span className="landing-breath-label">{breathPhase}</span>
          </div>
          <span className="landing-breath-stop">✕ close</span>
        </div>
      ) : (
        <div
          className="landing-pacer-list"
          onClick={() => {
            setIsBreathing(true);
            setBreathPhase('Inhale');
          }}
          title="Click to take a mindful breath"
        >
          {steps.map((step, idx) => (
            <span
              key={step}
              className={`landing-pacer-item ${activeStep === idx ? 'active' : ''}`}
            >
              {step}
            </span>
          ))}
          <span className="landing-pacer-hint">🍃 breathe</span>
        </div>
      )}
    </div>
  );
}

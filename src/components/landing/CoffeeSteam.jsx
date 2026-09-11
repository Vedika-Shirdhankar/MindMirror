// src/components/landing/CoffeeSteam.jsx
import React from 'react';

export default function CoffeeSteam() {
  return (
    <div className="landing-steam-container" aria-hidden="true">
      <svg viewBox="0 0 100 160" className="landing-steam-svg">
        <path
          className="steam-wisp wisp-1"
          d="M45,150 Q30,110 50,75 T48,10"
          fill="none"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          className="steam-wisp wisp-2"
          d="M52,150 Q65,115 46,80 T54,15"
          fill="none"
          stroke="rgba(255, 255, 255, 0.38)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          className="steam-wisp wisp-3"
          d="M48,150 Q38,125 58,95 T46,30"
          fill="none"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

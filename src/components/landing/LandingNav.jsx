// src/components/landing/LandingNav.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import AmbientAudio from './AmbientAudio.jsx';

export default function LandingNav({ onOpenAuth }) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/how-it-works', label: 'How it works' },
    { to: '/for-you', label: 'For You' },
  ];

  return (
    <header className={`landing-v2-nav ${scrolled ? 'landing-v2-nav-scrolled' : ''}`}>
      <Link to="/" className="landing-v2-logo">
        <span className="landing-v2-logo-icon">
          <Leaf size={17} strokeWidth={1.7} />
        </span>
        <span className="landing-v2-logo-text">MindMirror</span>
      </Link>

      <nav className="landing-v2-links">
        {navLinks.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={isActive ? 'landing-v2-active' : ''}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="landing-v2-nav-actions">
        <AmbientAudio />
        <button
          className="landing-v2-signin"
          onClick={() => onOpenAuth('login')}
        >
          Sign In
        </button>
      </div>
    </header>
  );
}

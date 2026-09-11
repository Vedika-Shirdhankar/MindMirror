// src/components/landing/LandingFooter.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="landing-v2-footer">
      <div className="landing-v2-footer-brand">
        <span>
          <Leaf size={16} />
        </span>
        MindMirror
      </div>
      <p className="landing-footer-tag">A gentle sanctuary for every version of you.</p>
      <div className="landing-footer-links">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span className="opacity-30">·</span>
        <Link to="/about" className="hover:text-white transition-colors">About</Link>
        <span className="opacity-30">·</span>
        <Link to="/how-it-works" className="hover:text-white transition-colors">How it works</Link>
        <span className="opacity-30">·</span>
        <Link to="/for-you" className="hover:text-white transition-colors">For You</Link>
      </div>
      <span className="landing-v2-footer-copy">
        © 2026 MindMirror · Private, Local & Kind
      </span>
    </footer>
  );
}

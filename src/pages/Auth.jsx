// pages/Auth.jsx
import { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/AuthContext.jsx';

export default function Auth({ isModal = false, onClose = null, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        if (password.length < 8) throw new Error('Password must be at least 8 characters.');
        await signup(name.trim(), email.trim(), password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const formContent = (
    <div className={`w-full max-w-sm ${isModal ? '' : 'fade-up'}`}>
      {/* Logo mark */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(139,130,236,0.25) 0%, rgba(100,216,180,0.15) 100%)',
              border: '1px solid rgba(139,130,236,0.35)',
              boxShadow: '0 0 40px rgba(139,130,236,0.2)',
            }}>
            <Heart size={26} style={{ color: '#AFA9EC' }} fill="#AFA9EC" />
          </div>
          {/* ambient glow */}
          <div className="absolute inset-0 rounded-2xl blur-[20px] -z-10 scale-125"
            style={{ background: 'rgba(139,130,236,0.2)' }} />
        </div>

        <h1 className="text-2xl font-bold text-center mb-1" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          MindMirror
        </h1>
        <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
          {mode === 'login'
            ? 'Welcome back. Your space is waiting. 🌿'
            : 'Begin your journey inward. ✨'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-surface-border)',
              color: 'var(--color-text)',
            }}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-surface-border)',
            color: 'var(--color-text)',
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-surface-border)',
            color: 'var(--color-text)',
          }}
        />

        {error && (
          <div className="rounded-xl px-3 py-2.5 text-xs"
            style={{ background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', color: '#f09595' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 mt-1 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #7F77DD 0%, #5DCAA5 100%)',
            color: 'white',
            boxShadow: '0 6px 24px rgba(127,119,221,0.35)',
          }}
        >
          {loading
            ? '✦ Please wait…'
            : mode === 'login'
              ? 'Enter your space'
              : 'Start my journey'}
        </button>
      </form>

      <button
        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
        className="w-full text-center text-xs mt-5 transition-opacity hover:opacity-70"
        style={{ color: '#AFA9EC' }}
      >
        {mode === 'login'
          ? "New here? Create a free account →"
          : 'Already have an account? Log in →'}
      </button>

      {mode === 'signup' && (
        <p className="text-center text-xs mt-4" style={{ color: 'var(--color-text-faint)' }}>
          🔒 Private & secure — your journal stays yours.
        </p>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md p-8 rounded-3xl fade-up"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid rgba(139,130,236,0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              style={{ color: 'var(--color-text-faint)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--color-bg)' }}>
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: 'rgba(139,130,236,0.12)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-[100px]"
          style={{ background: 'rgba(100,216,180,0.08)' }} />
      </div>
      <div className="relative z-10">
        {formContent}
      </div>
    </div>
  );
}
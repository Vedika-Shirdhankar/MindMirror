// pages/Auth.jsx
import { useState } from 'react';
import { Heart } from 'lucide-react';
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
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(127,119,221,0.2)', border: '1px solid rgba(127,119,221,0.3)' }}>
        <Heart size={24} color="#AFA9EC" fill="#AFA9EC" />
      </div>
      <h1 className="text-2xl font-semibold text-center mb-1" style={{ color: '#e8e6f0' }}>MindMirror</h1>
      <p className="text-sm text-center mb-7" style={{ color: 'rgba(232,230,240,0.5)' }}>
        {mode === 'login' ? 'Welcome back' : 'Begin your journey'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e6f0' }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e6f0' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e6f0' }}
        />

        {error && (
          <p className="text-xs px-1" style={{ color: '#f09595' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-40 mt-1"
          style={{ background: '#7F77DD', color: 'white' }}
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>

      <button
        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
        className="w-full text-center text-xs mt-5 transition-opacity hover:opacity-70"
        style={{ color: '#AFA9EC' }}
      >
        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
      </button>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
        <div className="relative w-full max-w-md p-8 rounded-3xl glass-purple border border-white/10 shadow-2xl fade-up" onClick={e => e.stopPropagation()}>
          {onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0f0f13' }}>
      {formContent}
    </div>
  );
}
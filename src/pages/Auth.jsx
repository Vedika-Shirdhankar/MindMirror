// pages/Auth.jsx
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../lib/AuthContext.jsx';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0f0f13' }}>
      <div className="max-w-sm w-full fade-up">
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
    </div>
  );
}
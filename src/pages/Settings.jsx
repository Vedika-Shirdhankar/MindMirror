import { useState, useEffect } from 'react'
import { clearAllData } from '../lib/store.js'
import * as api from '../lib/api.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { User, Trash2, Shield, CheckCircle, Brain, Settings as SettingsIcon, Heart, Lock } from 'lucide-react'

export default function Settings() {
  const { user, setUser } = useAuth()
  const [nameInput, setNameInput] = useState(user?.name || '')
  const [nameSaved, setNameSaved] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setNameInput(user.name || '')
    }
  }, [user])

  async function saveName() {
    if (!nameInput.trim()) return
    setError('')
    try {
      const updatedUser = await api.updateProfile(nameInput.trim())
      setUser(updatedUser)
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2000)
    } catch (e) {
      setError(e.message || 'Failed to update profile name.')
    }
  }

  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); return }
    clearAllData()
    api.logout()
    localStorage.removeItem('mm_onboarded')
    window.location.reload()
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8">

      {/* ── Hero Header ─────────────────────────────────── */}
      <div className="relative mb-8 overflow-hidden rounded-3xl p-7"
        style={{
          background: 'linear-gradient(135deg, rgba(139,130,236,0.1) 0%, rgba(100,216,180,0.07) 100%)',
          border: '1px solid rgba(139,130,236,0.2)',
        }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
          style={{ background: 'rgba(139,130,236,0.2)' }} />

        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139,130,236,0.2)', border: '1px solid rgba(139,130,236,0.3)' }}>
            <SettingsIcon size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              Settings &amp; Account
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Your data, your control — always.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs mb-4 px-1" style={{ color: '#f09595' }}>{error}</p>
      )}

      {/* ── Profile ──────────────────────────────────────── */}
      <section className="rounded-2xl p-5 mb-4"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139,130,236,0.15)' }}>
            <User size={13} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Profile</h2>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-4 p-3 rounded-xl"
          style={{ background: 'var(--color-surface)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: 'rgba(139,130,236,0.2)', color: 'var(--color-primary)' }}>
            {user?.name ? user.name[0].toUpperCase() : 'M'}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{user?.name || 'Anonymous'}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{user?.email || ''}</p>
          </div>
        </div>

        <label className="text-xs block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
          Display name
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-surface-border)',
              color: 'var(--color-text)',
            }}
            placeholder="Your name..."
          />
          <button
            onClick={saveName}
            className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all hover:opacity-80 active:scale-95"
            style={{
              background: nameSaved ? 'rgba(93,202,165,0.2)' : 'rgba(139,130,236,0.2)',
              color: nameSaved ? '#5DCAA5' : 'var(--color-primary)',
              border: `1px solid ${nameSaved ? 'rgba(93,202,165,0.3)' : 'rgba(139,130,236,0.3)'}`,
            }}
          >
            {nameSaved ? <><CheckCircle size={13} /> Saved</> : 'Save'}
          </button>
        </div>
      </section>

      {/* ── AI Configuration ─────────────────────────────── */}
      <section className="rounded-2xl p-5 mb-4"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139,130,236,0.15)' }}>
            <Brain size={13} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>AI Configuration</h2>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          MindMirror's reflections, companion chat, patterns, and Thought Ladder are all powered by{' '}
          <span style={{ color: 'var(--color-primary)' }}>Google Gemini 2.5 Flash</span> — configured
          securely on the server. No client-side API key is required.
        </p>
      </section>

      {/* ── Privacy ──────────────────────────────────────── */}
      <section className="rounded-2xl p-5 mb-4"
        style={{ background: 'rgba(93,202,165,0.05)', border: '1px solid rgba(93,202,165,0.18)' }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(93,202,165,0.15)' }}>
            <Shield size={13} style={{ color: '#5DCAA5' }} />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: '#5DCAA5' }}>Privacy &amp; Security</h2>
        </div>
        <ul className="space-y-2.5">
          {[
            'All journal entries, chat history, and letters are saved securely in your private MongoDB database.',
            'Passwords are hashed and never stored in plain text (bcrypt).',
            'Only your journal context is sent to Google\'s Gemini API to generate insights — no identifying details.',
            'No personal names or contact information leave your device unencrypted.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}>
              <span style={{ color: '#5DCAA5', flexShrink: 0, marginTop: '1px' }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Danger Zone ──────────────────────────────────── */}
      <section className="rounded-2xl p-5"
        style={{ background: 'rgba(226,75,74,0.04)', border: '1px solid rgba(226,75,74,0.15)' }}>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(226,75,74,0.12)' }}>
            <Trash2 size={13} color="#f09595" />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: '#f09595' }}>Reset &amp; Sign Out</h2>
        </div>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--color-text-faint)' }}>
          This signs you out and resets local session data. Your database entries remain safe and can be accessed after logging back in.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-95"
            style={{
              background: confirmClear ? 'rgba(226,75,74,0.2)' : 'rgba(255,255,255,0.05)',
              color: confirmClear ? '#f09595' : 'rgba(232,230,240,0.45)',
              border: `1px solid ${confirmClear ? 'rgba(226,75,74,0.35)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            {confirmClear ? '⚠ Click again to confirm' : 'Log out & Reset session'}
          </button>
          {confirmClear && (
            <button
              onClick={() => setConfirmClear(false)}
              className="px-4 py-2 rounded-xl text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-faint)' }}
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      {/* ── Footer Note ──────────────────────────────────── */}
      <div className="mt-8 flex items-center justify-center gap-1.5">
        <Heart size={11} style={{ color: 'var(--color-text-faint)' }} />
        <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
          MindMirror — built with care, for you.
        </p>
      </div>
    </div>
  )
}

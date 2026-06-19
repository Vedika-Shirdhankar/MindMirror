import { useState, useEffect } from 'react'
import { clearAllData } from '../lib/store.js'
import * as api from '../lib/api.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { User, Trash2, Shield, CheckCircle, Brain } from 'lucide-react'

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
      <div className="mb-8">
        <h1 className="text-xl font-semibold" style={{ color: '#e8e6f0' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(232,230,240,0.45)' }}>Your data, your control</p>
      </div>

      {error && <p className="text-xs mb-4" style={{ color: '#f09595' }}>{error}</p>}

      {/* Profile */}
      <section className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mb-4">
          <User size={14} color="#AFA9EC" />
          <h2 className="text-sm font-medium" style={{ color: '#e8e6f0' }}>Profile</h2>
        </div>
        <label className="text-xs block mb-1" style={{ color: 'rgba(232,230,240,0.45)' }}>Name</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e6f0' }}
          />
          <button onClick={saveName} className="px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-opacity hover:opacity-80" style={{ background: nameSaved ? 'rgba(29,158,117,0.2)' : 'rgba(127,119,221,0.2)', color: nameSaved ? '#5DCAA5' : '#AFA9EC' }}>
            {nameSaved ? <><CheckCircle size={12} /> Saved</> : 'Save'}
          </button>
        </div>
      </section>

      {/* API Key Status */}
      <section className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Brain size={14} color="#AFA9EC" />
          <h2 className="text-sm font-medium" style={{ color: '#e8e6f0' }}>AI Configuration</h2>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,230,240,0.5)' }}>
          MindMirror features (Journal reflections, AI Companion chat, Patterns, and Thought Ladder) are powered by **Google Gemini 2.5 Flash**, configured securely on the server. No client-side API key is required.
        </p>
      </section>

      {/* Privacy */}
      <section className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={14} color="#5DCAA5" />
          <h2 className="text-sm font-medium" style={{ color: '#e8e6f0' }}>Privacy</h2>
        </div>
        <ul className="text-xs space-y-2 leading-relaxed" style={{ color: 'rgba(232,230,240,0.5)' }}>
          <li>✓ All journal entries, chat history, and letters are saved securely in your MongoDB database</li>
          <li>✓ Password hashing protects your account credentials via bcrypt</li>
          <li>✓ Only your journal entries and conversation context are processed by Google's Gemini API to generate insights</li>
          <li>✓ No personal details or names are sent to external services</li>
        </ul>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl p-5" style={{ background: 'rgba(226,75,74,0.05)', border: '1px solid rgba(226,75,74,0.12)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Trash2 size={14} color="#f09595" />
          <h2 className="text-sm font-medium" style={{ color: '#f09595' }}>Clear all data</h2>
        </div>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(232,230,240,0.4)' }}>
          This permanently signs you out and triggers local data reset. Database contents can be managed via your user account.
        </p>
        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{ background: confirmClear ? 'rgba(226,75,74,0.2)' : 'rgba(255,255,255,0.05)', color: confirmClear ? '#f09595' : 'rgba(232,230,240,0.4)', border: `1px solid ${confirmClear ? 'rgba(226,75,74,0.3)' : 'rgba(255,255,255,0.1)'}` }}
        >
          {confirmClear ? 'Click again to confirm reset' : 'Log out & Reset local data'}
        </button>
        {confirmClear && (
          <button onClick={() => setConfirmClear(false)} className="ml-2 px-4 py-2 rounded-lg text-sm transition-opacity hover:opacity-70" style={{ color: 'rgba(232,230,240,0.35)' }}>
            Cancel
          </button>
        )}
      </section>
    </div>
  )
}

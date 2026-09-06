import { useState, useEffect } from 'react'
import { clearAllData } from '../lib/store.js'
import * as api from '../lib/api.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { User, Trash2, Shield, CheckCircle, Brain, Settings as SettingsIcon, Heart, Lock, Download, KeyRound, Loader2, AlertTriangle, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Settings() {
  const { user, setUser } = useAuth()
  const { t } = useTranslation()
  const { language, setLanguage, supportedLanguages } = useLanguage()
  const [languageSaved, setLanguageSaved] = useState(false)
  const [nameInput, setNameInput] = useState(user?.name || '')
  const [avatarInput, setAvatarInput] = useState(user?.avatar || '')
  const [nameSaved, setNameSaved] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [error, setError] = useState('')

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  // Export data
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  // Delete account
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      setNameInput(user.name || '')
      setAvatarInput(user.avatar || '')
    }
  }, [user])

  async function saveProfile() {
    if (!nameInput.trim()) return
    setError('')
    try {
      const updatedUser = await api.updateProfile(nameInput.trim(), avatarInput.trim())
      setUser(updatedUser)
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2000)
    } catch (e) {
      setError(e.message || 'Failed to update profile name.')
    }
  }

  async function savePassword() {
    setPasswordError('')
    if (!currentPassword || !newPassword) {
      setPasswordError('Enter your current and new password.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    setPasswordSaving(true)
    try {
      await api.changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setPasswordSaved(true)
      setTimeout(() => setPasswordSaved(false), 2500)
    } catch (e) {
      setPasswordError(e.message || 'Failed to update password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleExport() {
    setExportError('')
    setExporting(true)
    try {
      await api.exportUserData()
    } catch (e) {
      setExportError(e.message || 'Failed to export data.')
    } finally {
      setExporting(false)
    }
  }

  async function handleDeleteAccount() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleteError('')
    if (!deletePassword) {
      setDeleteError('Enter your password to confirm.')
      return
    }
    setDeleting(true)
    try {
      await api.deleteAccount(deletePassword)
      clearAllData()
      api.logout()
      localStorage.removeItem('mm_onboarded')
      window.location.reload()
    } catch (e) {
      setDeleteError(e.message || 'Failed to delete account.')
      setDeleting(false)
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
              {t('settings.title')}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {t('settings.subtitle')}
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
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{t('settings.profile')}</h2>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-4 p-3 rounded-xl"
          style={{ background: 'var(--color-surface)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden"
            style={{ background: 'rgba(139,130,236,0.2)', color: 'var(--color-primary)' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name ? user.name[0].toUpperCase() : 'M'
            )}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{user?.name || 'Anonymous'}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{user?.email || ''}</p>
          </div>
        </div>

        <div className="space-y-3 mb-3">
          <div>
            <label className="text-xs block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              {t('settings.displayName')}
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveProfile()}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-surface-border)',
                color: 'var(--color-text)',
              }}
              placeholder={t('settings.namePlaceholder')}
            />
          </div>
          
          <div>
            <label className="text-xs block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Profile Photo URL
            </label>
            <input
              type="text"
              value={avatarInput}
              onChange={e => setAvatarInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveProfile()}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-surface-border)',
                color: 'var(--color-text)',
              }}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>

        <button
          onClick={saveProfile}
          className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all hover:opacity-80 active:scale-95"
          style={{
            background: nameSaved ? 'rgba(93,202,165,0.2)' : 'rgba(139,130,236,0.2)',
            color: nameSaved ? '#5DCAA5' : 'var(--color-primary)',
            border: `1px solid ${nameSaved ? 'rgba(93,202,165,0.3)' : 'rgba(139,130,236,0.3)'}`,
          }}
        >
          {nameSaved ? <><CheckCircle size={13} /> Saved</> : 'Save'}
        </button>
      </section>

      {/* ── Password ─────────────────────────────────────── */}
      <section className="rounded-2xl p-5 mb-4"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139,130,236,0.15)' }}>
            <KeyRound size={13} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{t('settings.password')}</h2>
        </div>

        <div className="space-y-2.5">
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)', color: 'var(--color-text)' }}
            placeholder={t('settings.currentPassword')}
          />
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && savePassword()}
            autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)', color: 'var(--color-text)' }}
            placeholder={t('settings.newPassword')}
          />
        </div>

        {passwordError && (
          <p className="text-xs mt-2.5" style={{ color: '#f09595' }}>{passwordError}</p>
        )}

        <button
          onClick={savePassword}
          disabled={passwordSaving}
          className="mt-3 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all hover:opacity-80 active:scale-95 disabled:opacity-60"
          style={{
            background: passwordSaved ? 'rgba(93,202,165,0.2)' : 'rgba(139,130,236,0.2)',
            color: passwordSaved ? '#5DCAA5' : 'var(--color-primary)',
            border: `1px solid ${passwordSaved ? 'rgba(93,202,165,0.3)' : 'rgba(139,130,236,0.3)'}`,
          }}
        >
          {passwordSaving ? <><Loader2 size={13} className="animate-spin" /> {t('settings.updatingPassword')}</>
            : passwordSaved ? <><CheckCircle size={13} /> {t('settings.passwordUpdated')}</>
            : t('settings.updatePassword')}
        </button>
      </section>

      {/* ── Language ─────────────────────────────────────── */}
      <section className="rounded-2xl p-5 mb-4"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139,130,236,0.15)' }}>
            <Globe size={13} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{t('settings.language')}</h2>
        </div>
        <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {t('settings.languageDesc')}
        </p>
        <div className="flex gap-2 items-center flex-wrap">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setLanguageSaved(true)
                setTimeout(() => setLanguageSaved(false), 2000)
              }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all border`}
              style={{
                background: language === lang.code ? 'rgba(139,130,236,0.15)' : 'var(--color-surface)',
                color: language === lang.code ? 'var(--color-primary)' : 'var(--color-text)',
                borderColor: language === lang.code ? 'var(--color-primary)' : 'var(--color-surface-border)',
              }}
            >
              {lang.label} {lang.native}
            </button>
          ))}
        </div>
        {languageSaved && (
          <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: '#5DCAA5' }}>
            <CheckCircle size={13} /> {t('settings.languageSaved')}
          </p>
        )}
      </section>

      {/* ── AI Configuration ─────────────────────────────── */}
      <section className="rounded-2xl p-5 mb-4"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139,130,236,0.15)' }}>
            <Brain size={13} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{t('settings.aiConfig')}</h2>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {t('settings.aiConfigDesc')}
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
          <h2 className="text-sm font-semibold" style={{ color: '#5DCAA5' }}>{t('settings.privacy')}</h2>
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

      {/* ── Your Data ────────────────────────────────────── */}
      <section className="rounded-2xl p-5 mb-4"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139,130,236,0.15)' }}>
            <Download size={13} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{t('settings.exportData')}</h2>
        </div>
        <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {t('settings.exportDesc')}
        </p>
        {exportError && (
          <p className="text-xs mb-2.5" style={{ color: '#f09595' }}>{exportError}</p>
        )}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all hover:opacity-80 active:scale-95 disabled:opacity-60"
          style={{ background: 'rgba(139,130,236,0.2)', color: 'var(--color-primary)', border: '1px solid rgba(139,130,236,0.3)' }}
        >
          {exporting ? <><Loader2 size={13} className="animate-spin" /> Preparing export…</> : <><Download size={13} /> Download my data</>}
        </button>
      </section>

      {/* ── Session ──────────────────────────────────────── */}
      <section className="rounded-2xl p-5 mb-4"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)' }}>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139,130,236,0.15)' }}>
            <Lock size={13} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{t('settings.session')}</h2>
        </div>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--color-text-faint)' }}>
          {t('settings.sessionDesc')}
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

      {/* ── Danger Zone ──────────────────────────────────── */}
      <section className="rounded-2xl p-5"
        style={{ background: 'rgba(226,75,74,0.04)', border: '1px solid rgba(226,75,74,0.15)' }}>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(226,75,74,0.12)' }}>
            <Trash2 size={13} color="#f09595" />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: '#f09595' }}>{t('settings.deleteAccount')}</h2>
        </div>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--color-text-faint)' }}>
          {t('settings.deleteAccountDesc')}
        </p>

        {confirmDelete && (
          <div className="mb-3 p-3 rounded-xl flex items-start gap-2"
            style={{ background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)' }}>
            <AlertTriangle size={14} color="#f09595" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div className="flex-1">
              <p className="text-xs mb-2" style={{ color: '#f09595' }}>
                {t('settings.enterPasswordToDelete')}
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(226,75,74,0.25)', color: 'var(--color-text)' }}
                placeholder={t('settings.passwordPlaceholder')}
              />
              {deleteError && <p className="text-xs mt-1.5" style={{ color: '#f09595' }}>{deleteError}</p>}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-95 disabled:opacity-60 flex items-center gap-1.5"
            style={{
              background: confirmDelete ? 'rgba(226,75,74,0.2)' : 'rgba(255,255,255,0.05)',
              color: confirmDelete ? '#f09595' : 'rgba(232,230,240,0.45)',
              border: `1px solid ${confirmDelete ? 'rgba(226,75,74,0.35)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            {deleting
              ? <><Loader2 size={13} className="animate-spin" /> Deleting…</>
              : confirmDelete ? '⚠ Permanently delete my account' : 'Delete account'}
          </button>
          {confirmDelete && (
            <button
              onClick={() => { setConfirmDelete(false); setDeletePassword(''); setDeleteError('') }}
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
          {t('settings.footer')}
        </p>
      </div>
    </div>
  )
}
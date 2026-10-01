import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import { AlertCircle, CheckCircle, ExternalLink, HelpCircle, X } from 'lucide-react'

export default function GoogleSignInButton({ mode = 'login', onError }) {
  const { googleLogin } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const googleBtnRef = useRef(null)

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) return

    // Dynamically load Google Identity Services SDK
    const scriptId = 'google-gsi-client'
    let script = document.getElementById(scriptId)

    const initGoogleBtn = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: '100%',
        })
      } catch (err) {
        console.warn('Google Sign-In initialization error:', err)
      }
    }

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGoogleBtn
      document.head.appendChild(script)
    } else if (window.google?.accounts?.id) {
      initGoogleBtn()
    }
  }, [clientId, mode])

  async function handleGoogleResponse(response) {
    if (!response?.credential) {
      onError?.('No credential returned from Google.')
      return
    }

    setLoading(true)
    try {
      const result = await googleLogin(response.credential)
      if (result?.isNewUser || !result?.user?.supportPreferences?.onboardingCompleted) {
        navigate('/onboarding')
      } else {
        navigate('/')
      }
    } catch (err) {
      onError?.(err.message || 'Google authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  // Fallback / manual click handler when client ID is missing or custom button clicked
  function handleClick() {
    if (!clientId) {
      setShowConfigModal(true)
      return
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap is dismissed, user can still use the standard rendered button
        }
      })
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Container for official Google Rendered Button if Client ID is configured */}
      {clientId ? (
        <div className="w-full relative flex justify-center">
          <div ref={googleBtnRef} className="w-full flex justify-center" />
          {loading && (
            <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-xs text-text">
              Verifying Google Account…
            </div>
          )}
        </div>
      ) : (
        /* Styled Calm Google Button when VITE_GOOGLE_CLIENT_ID is not yet filled in .env */
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl border border-surface-border bg-surface hover:bg-surface-hover transition-all flex items-center justify-center gap-3 text-sm font-medium text-text group active:scale-[0.99]"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
        </button>
      )}

      {/* Google Setup Guide Modal (shown if Client ID is not yet placed in .env) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-surface-border flex flex-col gap-4 text-left"
            style={{ background: 'var(--color-bg, #0f0f13)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text">Google Sign-In Setup</h3>
                  <p className="text-xs text-text-muted">Step-by-step instructions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-faint hover:text-text hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs text-text-muted flex flex-col gap-2.5 leading-relaxed bg-surface/50 p-4 rounded-2xl border border-surface-border">
              <p>
                To enable live Google Sign-In / Sign-Up with your Google Account:
              </p>
              <ol className="list-decimal pl-4 flex flex-col gap-1.5 text-text">
                <li>
                  Open{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Google Cloud Console <ExternalLink size={10} />
                  </a>
                </li>
                <li>Create an <strong>OAuth 2.0 Web Client ID</strong>.</li>
                <li>Add authorized JavaScript origin: <code className="px-1.5 py-0.5 rounded bg-black/40 text-primary">http://localhost:5173</code></li>
                <li>
                  Add your Client ID to your root <code className="px-1.5 py-0.5 rounded bg-black/40">.env</code>:
                  <div className="mt-1 p-2 rounded bg-black/60 font-mono text-[11px] text-accent select-all">
                    VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
                  </div>
                </li>
                <li>
                  And to <code className="px-1.5 py-0.5 rounded bg-black/40">backend/backend/.env</code>:
                  <div className="mt-1 p-2 rounded bg-black/60 font-mono text-[11px] text-accent select-all">
                    GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
                  </div>
                </li>
              </ol>
            </div>

            <button
              type="button"
              onClick={() => setShowConfigModal(false)}
              className="w-full py-2.5 rounded-xl font-medium text-xs bg-surface hover:bg-surface-hover border border-surface-border text-text transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

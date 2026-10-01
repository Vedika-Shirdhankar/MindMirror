import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Heart, Sun, Feather, Shield, ArrowRight, ArrowLeft, Check, Compass, EyeOff, Video } from 'lucide-react'
import * as api from '../lib/api.js'
import { useAuth } from '../lib/AuthContext.jsx'
import FutureSelfRecorder from '../components/FutureSelfRecorder.jsx'

const SOURCES_OF_HOPE_OPTIONS = [
  'Family',
  'Friends',
  'Future goals',
  'Career',
  'Travel',
  'Nature',
  'Music',
  'Art',
  'Animals / Pets',
  'Relationships',
  'Personal achievements',
  'Spirituality / Faith',
  'Hobbies',
  'Other',
]

const WHAT_HELPS_OPTIONS = [
  'Talking to someone',
  'Spending time alone',
  'Music',
  'Going outside',
  'Nature',
  'Meditation',
  'Prayer',
  'Exercise',
  'Writing / Journaling',
  'Looking at photos / memories',
  'Watching something comforting',
  'Talking to friends / family',
  'Other',
]

export default function Onboarding({ onFinish = null }) {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1 to 5
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Beliefs
  const [spiritualPreference, setSpiritualPreference] = useState(
    user?.supportPreferences?.spiritualPreference || ''
  )
  const [spiritualitySupport, setSpiritualitySupport] = useState(
    user?.supportPreferences?.spiritualitySupport || ''
  )
  const [spiritualContentInclusion, setSpiritualContentInclusion] = useState(
    user?.supportPreferences?.spiritualContentInclusion || 'no'
  )

  // Step 2: Sources of Hope
  const [sourcesOfHope, setSourcesOfHope] = useState(
    user?.supportPreferences?.sourcesOfHope || []
  )
  const [customSourcesOfHope, setCustomSourcesOfHope] = useState(
    user?.supportPreferences?.customSourcesOfHope || ''
  )

  // Step 3: What Helps Me
  const [copingPreferences, setCopingPreferences] = useState(
    user?.supportPreferences?.copingPreferences || []
  )
  const [customCopingPreferences, setCustomCopingPreferences] = useState(
    user?.supportPreferences?.customCopingPreferences || ''
  )

  // Step 4: Personal Values
  const [personalValues, setPersonalValues] = useState(
    user?.supportPreferences?.personalValues || ''
  )

  // Step 5: Future Self Message record flow
  const [showRecorder, setShowRecorder] = useState(false)

  function toggleArrayItem(arr, setArr, item) {
    if (arr.includes(item)) {
      setArr(arr.filter(i => i !== item))
    } else {
      setArr([...arr, item])
    }
  }

  async function savePreferencesAndAdvance(isFinal = false, status = null) {
    setError('')
    setSaving(true)
    try {
      const payload = {
        spiritualPreference,
        spiritualitySupport,
        spiritualContentInclusion,
        sourcesOfHope,
        customSourcesOfHope,
        copingPreferences,
        customCopingPreferences,
        personalValues,
        ...(status && { futureSelfMessageStatus: status }),
        ...(isFinal && { onboardingCompleted: true }),
      }

      const updatedPrefs = await api.updateSupportPreferences(payload)
      if (user) {
        setUser({ ...user, supportPreferences: updatedPrefs })
      }

      if (isFinal) {
        if (onFinish) onFinish()
        else navigate('/')
      } else {
        setStep(prev => Math.min(prev + 1, 5))
      }
    } catch (err) {
      setError(err.message || 'Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCompleteLater() {
    await savePreferencesAndAdvance(true, 'remind_later')
  }

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col justify-center items-center" style={{ background: 'var(--color-bg, #0f0f13)' }}>
      <div className="max-w-xl w-full mx-auto">
        {/* Top Branding & Progress */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <Sparkles size={13} />
            <span>Personalized Care Setup</span>
          </div>
          <h1 className="text-2xl font-bold text-text mb-1.5">
            Help MindMirror Understand You
          </h1>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Your answers help MindMirror provide compassionate, boundary-respecting support tailored to what truly matters to you.
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-8 bg-primary'
                    : step > s
                    ? 'w-4 bg-accent'
                    : 'w-4 bg-surface-border'
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-text-faint mt-2">
            Step {step} of 5 &bull; {
              step === 1 ? 'About You & Beliefs' :
              step === 2 ? 'Sources of Hope' :
              step === 3 ? 'What Helps Me' :
              step === 4 ? 'Personal Values' : 'Future-Self Message'
            }
          </p>
        </div>

        {/* Main Card */}
        <div
          className="rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden transition-all"
          style={{
            background: 'var(--color-surface, #18181f)',
            border: '1px solid var(--color-surface-border, rgba(255,255,255,0.08))',
          }}
        >
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STEP 1: BELIEFS & SPIRITUAL BOUNDARIES                             */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold text-text mb-1 flex items-center gap-2">
                  <Compass size={18} className="text-primary" /> Beliefs & Spiritual Support
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  MindMirror never assumes religious beliefs or offers unrequested faith advice. These optional preferences set clear boundaries for your reflections.
                </p>
              </div>

              {/* Question 1 */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-medium text-text">
                  Do you believe in God or a higher power? (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'yes', label: 'Yes' },
                    { val: 'no', label: 'No' },
                    { val: 'not_sure', label: 'Not sure' },
                    { val: 'prefer_not_to_say', label: 'Prefer not to say' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSpiritualPreference(opt.val)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                        spiritualPreference === opt.val
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-surface-border bg-surface text-text-muted hover:border-text-faint'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-medium text-text">
                  Does spirituality or faith help you when you're struggling?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'yes', label: 'Yes' },
                    { val: 'sometimes', label: 'Sometimes' },
                    { val: 'no', label: 'No' },
                    { val: 'prefer_not_to_say', label: 'Prefer not to say' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSpiritualitySupport(opt.val)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                        spiritualitySupport === opt.val
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-surface-border bg-surface text-text-muted hover:border-text-faint'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-medium text-text">
                  Would you like spiritual or faith-based content to be included in your personalized support?
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { val: 'yes', label: 'Yes, include spiritual perspectives when relevant' },
                    { val: 'no', label: 'No, do not include spiritual content' },
                    { val: 'only_when_asked', label: 'Only when I explicitly ask in my journal/chat' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSpiritualContentInclusion(opt.val)}
                      className={`py-2.5 px-3.5 rounded-xl text-xs font-medium border text-left transition-all ${
                        spiritualContentInclusion === opt.val
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-surface-border bg-surface text-text-muted hover:border-text-faint'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STEP 2: SOURCES OF HOPE                                            */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-text mb-1 flex items-center gap-2">
                  <Sun size={18} className="text-accent" /> Sources of Hope
                </h2>
                <p className="text-xs text-text-muted">
                  What gives you hope or makes life meaningful to you? Select all that apply.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {SOURCES_OF_HOPE_OPTIONS.map((item) => {
                  const isSelected = sourcesOfHope.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem(sourcesOfHope, setSourcesOfHope, item)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-accent bg-accent/15 text-accent font-semibold shadow-sm'
                          : 'border-surface-border bg-surface text-text-muted hover:border-text-faint'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      {item}
                    </button>
                  )
                })}
              </div>

              {sourcesOfHope.includes('Other') && (
                <div className="mt-1">
                  <input
                    type="text"
                    value={customSourcesOfHope}
                    onChange={(e) => setCustomSourcesOfHope(e.target.value)}
                    placeholder="Tell us what else gives you meaning or hope…"
                    className="w-full p-3 rounded-xl bg-surface border border-surface-border text-text text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STEP 3: WHAT HELPS ME                                              */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-text mb-1 flex items-center gap-2">
                  <Heart size={18} className="text-pink-400" /> What Helps Me
                </h2>
                <p className="text-xs text-text-muted">
                  What usually helps you feel better when you're having a difficult day?
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {WHAT_HELPS_OPTIONS.map((item) => {
                  const isSelected = copingPreferences.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem(copingPreferences, setCopingPreferences, item)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-pink-400 bg-pink-400/15 text-pink-300 font-semibold shadow-sm'
                          : 'border-surface-border bg-surface text-text-muted hover:border-text-faint'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      {item}
                    </button>
                  )
                })}
              </div>

              {copingPreferences.includes('Other') && (
                <div className="mt-1">
                  <input
                    type="text"
                    value={customCopingPreferences}
                    onChange={(e) => setCustomCopingPreferences(e.target.value)}
                    placeholder="Other activities that help you feel grounded…"
                    className="w-full p-3 rounded-xl bg-surface border border-surface-border text-text text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STEP 4: PERSONAL VALUES                                            */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-text mb-1 flex items-center gap-2">
                  <Feather size={18} className="text-primary" /> Personal Values & Anchor
                </h2>
                <p className="text-xs text-text-muted">
                  What are some things you want your future self to remember on difficult days?
                </p>
              </div>

              <div>
                <textarea
                  rows={4}
                  value={personalValues}
                  onChange={(e) => setPersonalValues(e.target.value)}
                  placeholder="Things you care about, people you love, places you want to visit, dreams you have, or anything you would want to remember on a difficult day…"
                  className="w-full p-4 rounded-2xl bg-surface border border-surface-border text-text text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed placeholder:text-text-faint"
                />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STEP 5: PERSONAL FUTURE-SELF MESSAGE                               */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {step === 5 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-text mb-1 flex items-center gap-2">
                  <Video size={18} className="text-primary" /> Create a Message to Your Future Self
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  Sometimes a difficult moment can make the future feel very small. You can create a personal message now, while you're feeling okay, for your future self to revisit during difficult moments.
                </p>
              </div>

              {!showRecorder ? (
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/15 text-center flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Video size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text mb-1">
                      Record or Write Your Grounding Message
                    </h3>
                    <p className="text-xs text-text-muted max-w-sm mx-auto">
                      Speak freely about the people you love, what makes life worth living, or reminders to give yourself time.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={() => setShowRecorder(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-semibold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Video size={14} /> Record Now
                    </button>
                    <button
                      type="button"
                      onClick={handleCompleteLater}
                      className="w-full py-2.5 px-4 rounded-xl border border-surface-border text-text-muted text-xs font-medium hover:bg-surface-border/20 active:scale-95 transition-all"
                    >
                      I'll Do This Later
                    </button>
                  </div>
                </div>
              ) : (
                <FutureSelfRecorder
                  onComplete={() => savePreferencesAndAdvance(true, 'recorded')}
                  onSkip={handleCompleteLater}
                />
              )}
            </div>
          )}

          {/* Navigation Bottom Controls */}
          {!(step === 5 && showRecorder) && (
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-surface-border/40">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  disabled={saving}
                  className="py-2 px-3.5 rounded-xl text-xs font-medium text-text-muted flex items-center gap-1.5 hover:text-text transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => savePreferencesAndAdvance(step === 5)}
                  disabled={saving}
                  className="py-2.5 px-5 rounded-xl bg-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    'Saving…'
                  ) : step === 5 ? (
                    <>
                      Complete Setup <Check size={14} />
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

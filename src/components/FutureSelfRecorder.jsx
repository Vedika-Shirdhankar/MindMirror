import { useState, useRef, useEffect } from 'react'
import { Video, Mic, Type, Play, Square, RefreshCw, Check, AlertCircle, Sparkles, Volume2, Shield } from 'lucide-react'
import * as api from '../lib/api.js'

const PROMPT_IDEAS = [
  "What do you want your future self to remember?",
  "Who are the people you care about?",
  "What places do you still want to see?",
  "What experiences are you looking forward to?",
  "What makes life meaningful to you?",
  "What would you tell yourself on a difficult day?",
]

export default function FutureSelfRecorder({ onComplete, onSkip, existingMessage = null }) {
  const [activeTab, setActiveTab] = useState('video') // 'video' | 'audio' | 'text'
  const [promptIndex, setPromptIndex] = useState(0)
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [permissionDenied, setPermissionDenied] = useState(false)

  // Text message state
  const [textInput, setTextInput] = useState(existingMessage?.text || '')

  const videoPreviewRef = useRef(null)
  const playbackRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => {
    return () => {
      stopMediaTracks()
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function stopMediaTracks() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
  }

  async function startRecording(type = activeTab) {
    setError('')
    setPermissionDenied(false)
    setRecordedBlob(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    chunksRef.current = []

    try {
      const constraints = {
        audio: true,
        video: type === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      mediaStreamRef.current = stream

      if (type === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.play()
      }

      // Check supported MIME type
      let mimeType = 'video/webm'
      if (type === 'audio') {
        mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      } else {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mimeType = 'video/webm;codecs=vp9'
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4'
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setRecordedBlob(blob)
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        stopMediaTracks()
      }

      recorder.start(500)
      setIsRecording(true)
      setRecordingTime(0)

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 300) { // 5 min max
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error('Recording initialization error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true)
        setError('Camera/Microphone access was denied. You can record audio only or write a text message instead.')
      } else {
        setError(`Unable to start ${type} recording: ${err.message}`)
      }
    }
  }

  function stopRecording() {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  function handleReset() {
    stopMediaTracks()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setRecordedBlob(null)
    setRecordingTime(0)
    setError('')
  }

  async function handleSave() {
    setError('')
    setIsUploading(true)

    try {
      if (activeTab === 'text') {
        if (!textInput.trim()) {
          setError('Please write a short message before saving.')
          setIsUploading(false)
          return
        }
        await api.saveFutureSelfTextMessage({
          text: textInput.trim(),
          promptUsed: PROMPT_IDEAS[promptIndex],
        })
      } else {
        if (!recordedBlob) {
          setError('Please record a message first.')
          setIsUploading(false)
          return
        }
        const formData = new FormData()
        const filename = activeTab === 'video' ? 'future-self-video.webm' : 'future-self-audio.webm'
        formData.append('media', recordedBlob, filename)
        formData.append('promptUsed', PROMPT_IDEAS[promptIndex])
        formData.append('durationSeconds', recordingTime)
        formData.append('messageType', activeTab)

        await api.uploadFutureSelfMedia(formData)
      }

      if (onComplete) onComplete()
    } catch (err) {
      setError(err.message || 'Failed to save message. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Mode selection tabs */}
      <div className="flex items-center justify-center p-1 rounded-xl bg-surface-border/20 max-w-sm mx-auto w-full">
        <button
          type="button"
          onClick={() => { handleReset(); setActiveTab('video') }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'video'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text'
          }`}
        >
          <Video size={14} /> Record Video
        </button>
        <button
          type="button"
          onClick={() => { handleReset(); setActiveTab('audio') }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'audio'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text'
          }`}
        >
          <Mic size={14} /> Voice Audio
        </button>
        <button
          type="button"
          onClick={() => { handleReset(); setActiveTab('text') }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'text'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text'
          }`}
        >
          <Type size={14} /> Written Text
        </button>
      </div>

      {/* Thought Starter Prompt Box */}
      <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 text-center relative">
        <div className="flex items-center justify-center gap-1.5 mb-1 text-[11px] font-semibold text-primary uppercase tracking-wider">
          <Sparkles size={12} /> Suggested Thought Anchor
        </div>
        <p className="text-sm font-medium text-text px-6">
          "{PROMPT_IDEAS[promptIndex]}"
        </p>
        <div className="flex justify-center gap-1.5 mt-2">
          {PROMPT_IDEAS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPromptIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                promptIndex === idx ? 'bg-primary w-4' : 'bg-primary/25 hover:bg-primary/50'
              }`}
              title={`Prompt ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── VIDEO MODE ── */}
      {activeTab === 'video' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full aspect-video max-w-md bg-black/80 rounded-2xl overflow-hidden relative shadow-inner border border-white/10 flex items-center justify-center">
            {!isRecording && !previewUrl && (
              <div className="text-center p-6 text-white/60">
                <Video size={36} className="mx-auto mb-2 text-primary/70" />
                <p className="text-xs">Camera preview will start when you tap Record.</p>
                <p className="text-[11px] text-white/40 mt-1">Speak naturally. Take your time.</p>
              </div>
            )}

            {/* Live Video Preview while recording */}
            <video
              ref={videoPreviewRef}
              muted
              playsInline
              className={`w-full h-full object-cover ${isRecording ? 'block' : 'hidden'}`}
            />

            {/* Playback review of recorded video */}
            {previewUrl && (
              <video
                ref={playbackRef}
                src={previewUrl}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            {isRecording && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-500/80 text-white text-[11px] font-mono flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                REC {formatTime(recordingTime)}
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="flex items-center gap-3">
            {!isRecording && !previewUrl && (
              <button
                type="button"
                onClick={() => startRecording('video')}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
              >
                <Video size={15} /> Start Recording
              </button>
            )}

            {isRecording && (
              <button
                type="button"
                onClick={stopRecording}
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-red-500/20 hover:opacity-90 active:scale-95 transition-all animate-bounce"
              >
                <Square size={15} /> Stop Recording
              </button>
            )}

            {previewUrl && (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isUploading}
                  className="px-4 py-2.5 rounded-xl border border-surface-border text-text-muted text-xs font-medium flex items-center gap-1.5 hover:bg-surface-border/20 transition-all"
                >
                  <RefreshCw size={13} /> Retake
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-accent text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-accent/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  {isUploading ? (
                    'Saving…'
                  ) : (
                    <>
                      <Check size={14} /> Keep This Message
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── AUDIO MODE ── */}
      {activeTab === 'audio' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-full max-w-md p-8 rounded-2xl bg-surface border border-surface-border text-center flex flex-col items-center justify-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${
              isRecording
                ? 'bg-red-500/20 text-red-400 animate-pulse scale-110'
                : 'bg-primary/10 text-primary'
            }`}>
              <Mic size={28} />
            </div>

            {isRecording ? (
              <div>
                <p className="text-xs font-medium text-red-400 mb-1">Recording your voice…</p>
                <p className="text-2xl font-mono font-bold text-text">{formatTime(recordingTime)}</p>
              </div>
            ) : previewUrl ? (
              <div className="w-full">
                <p className="text-xs font-medium text-text-muted mb-3">Recorded voice reflection ({formatTime(recordingTime)})</p>
                <audio src={previewUrl} controls className="w-full" />
              </div>
            ) : (
              <div>
                <p className="text-xs text-text-muted">Tap below to record an audio-only message.</p>
                <p className="text-[11px] text-text-faint mt-1">Stored securely and accessible only by you.</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isRecording && !previewUrl && (
              <button
                type="button"
                onClick={() => startRecording('audio')}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
              >
                <Mic size={15} /> Record Voice
              </button>
            )}

            {isRecording && (
              <button
                type="button"
                onClick={stopRecording}
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-red-500/20 hover:opacity-90 active:scale-95 transition-all"
              >
                <Square size={15} /> Stop Recording
              </button>
            )}

            {previewUrl && (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isUploading}
                  className="px-4 py-2.5 rounded-xl border border-surface-border text-text-muted text-xs font-medium flex items-center gap-1.5 hover:bg-surface-border/20 transition-all"
                >
                  <RefreshCw size={13} /> Retake
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-accent text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-accent/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  {isUploading ? (
                    'Saving…'
                  ) : (
                    <>
                      <Check size={14} /> Keep This Voice Message
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TEXT MODE ── */}
      {activeTab === 'text' && (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <textarea
              rows={5}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Write a message to yourself when feeling okay: things you care about, people you love, dreams you have, or what you'd tell yourself on a hard day…"
              className="w-full p-4 rounded-2xl bg-surface border border-surface-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed placeholder:text-text-faint"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isUploading || !textInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                'Saving…'
              ) : (
                <>
                  <Check size={14} /> Save Written Message
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Privacy disclaimer */}
      <div className="p-3 rounded-xl bg-surface/60 border border-surface-border/40 text-[11px] text-text-faint flex items-start gap-2">
        <Shield size={14} className="text-primary/70 shrink-0 mt-0.5" />
        <div>
          <strong className="text-text-muted font-medium">Strictly Private & Encrypted:</strong> This personal message is linked exclusively to your authenticated account. It is surfaced as a grounding anchor during difficult moments and is never shared publicly.
        </div>
      </div>

      {/* Skip / Do this later control */}
      {onSkip && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-text-faint hover:text-text-muted underline decoration-dotted transition-colors"
          >
            I'll Do This Later (Skip for now)
          </button>
        </div>
      )}
    </div>
  )
}

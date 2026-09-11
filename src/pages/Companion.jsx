import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react'
import { Send, AlertTriangle, Play, X, Heart, Sparkles, Mic, Volume2, Loader2 } from 'lucide-react'
import * as api from '../lib/api.js'
import { useVoiceTranscription, useTextToSpeech } from '../lib/useVoice.js'
import { format } from 'date-fns'

function CrisisBanner({ support }) {
  if (!support) return null
  return (
    <div className="rounded-2xl p-4 mb-3 fade-up bg-red-500/10 border border-red-500/30 text-red-300">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={15} className="text-red-400" />
        <p className="text-sm font-semibold">{support.message}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {support.resources.map(r => (
          <div key={r.name} className="text-xs px-3 py-1.5 rounded-xl bg-white/10 text-white/90 font-medium">
            <strong>{r.name}:</strong> {r.contact}
          </div>
        ))}
      </div>
    </div>
  )
}

function Message({ msg, onPlayVideo, reflectingLabel, onSpeak }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3.5 items-start fade-up ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-accent to-emerald-400 text-white'
            : 'bg-gradient-to-tr from-primary to-indigo-500 text-white'
        }`}
      >
        {isUser ? 'Me' : <Heart size={14} fill="white" />}
      </div>
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-5 py-3.5 text-sm leading-relaxed ${
            isUser
              ? 'chat-bubble-user text-white rounded-3xl rounded-tr-sm'
              : 'chat-bubble-ai text-text rounded-3xl rounded-tl-sm shadow-sm'
          }`}
        >
          {msg.streaming && !msg.content ? (
            <span className="flex items-center gap-1.5 text-text/50">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
              <span className="text-xs font-medium">{msg.streamingStatus || reflectingLabel}</span>
            </span>
          ) : (
            <>
              {msg.content}
              {msg.streaming && <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-current opacity-60 animate-pulse" />}
            </>
          )}
        </div>

        {msg.createdAt && (
          <div className="flex items-center gap-2 mt-1.5 px-2">
            <p className="text-[11px] opacity-40 text-text font-medium">
              {format(new Date(msg.createdAt), 'h:mm a')}
            </p>
            {!isUser && msg.content && !msg.streaming && (
              <button onClick={() => onSpeak(msg.content)} className="opacity-40 hover:opacity-100 transition-opacity" title="Read aloud">
                <Volume2 size={11} />
              </button>
            )}
          </div>
        )}

        {!isUser && msg.recommendedVideos?.length > 0 && !msg.pastSelfRecommendation && (
          <div className="mt-3 w-full max-w-sm rounded-2xl p-4 bg-white/5 border border-white/10 shadow-lg">
            <p className="text-xs font-semibold mb-2.5 flex items-center gap-1.5 text-primary">
              <span>🎥</span> Your Past Self Left Advice For You
            </p>
            <div className="flex flex-col gap-2">
              {msg.recommendedVideos.map(video => (
                <div
                  key={video._id}
                  className="flex gap-3 rounded-xl overflow-hidden border border-white/10 bg-black/20 hover:border-white/20 transition-all p-2 items-center group relative cursor-pointer"
                  onClick={() => onPlayVideo(video)}
                >
                  <div className="relative w-20 aspect-video bg-black/40 rounded-lg overflow-hidden flex-shrink-0">
                    <video src={video.videoUrl} className="w-full h-full object-cover" preload="metadata" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <Play size={10} fill="white" color="white" className="ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-text truncate group-hover:text-primary transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-[10px] text-text/40 mt-0.5">
                      {format(new Date(video.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isUser && msg.pastSelfRecommendation && (
          <div className="mt-3 w-full max-w-md rounded-2xl p-4 bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/25 shadow-xl fade-up">
            <p className="text-xs font-bold mb-3 flex items-center gap-1.5 text-primary uppercase tracking-wider">
              <span>🧠</span> Memory Reconnection
            </p>
            <div className="flex gap-3 items-start group">
              <div
                className="relative w-28 aspect-video bg-black/40 rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
                onClick={() => onPlayVideo(msg.pastSelfRecommendation)}
              >
                <video src={msg.pastSelfRecommendation.videoUrl} className="w-full h-full object-cover" preload="metadata" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play size={12} fill="white" color="white" className="ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-text leading-tight mb-1">{msg.pastSelfRecommendation.title}</h4>
                <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-2">
                  {format(new Date(msg.pastSelfRecommendation.date), 'MMM d, yyyy')}
                </p>

                <div className="bg-black/25 rounded-xl p-2.5 border border-white/5 relative">
                  <p className="text-xs text-text/80 italic leading-relaxed pl-2 relative z-10">
                    "{msg.pastSelfRecommendation.transcriptSnippet}"
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
              <p className="text-[10px] text-text/50 font-medium">{msg.pastSelfRecommendation.reason}</p>
              <button
                onClick={() => onPlayVideo(msg.pastSelfRecommendation)}
                className="text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all bg-primary text-white hover:opacity-90 flex items-center gap-1.5 shadow-md shadow-primary/20"
              >
                Watch Reflection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Companion() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [support, setSupport] = useState(null)
  const [playingVideo, setPlayingVideo] = useState(null)
  const bottomRef = useRef(null)

  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceTranscription()
  const { speak, stop: stopSpeaking } = useTextToSpeech()

  useEffect(() => { loadHistory() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function loadHistory() {
    try {
      const history = await api.getChatHistory()
      setMessages(
        history.length
          ? history
          : [
              {
                role: 'assistant',
                content: "Welcome back. I'm right here with you. Take a deep breath — how are you feeling today?",
                createdAt: new Date(),
              },
            ]
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingHistory(false)
    }
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setError('')
    setSupport(null)
    stopSpeaking()

    const userMsg = { role: 'user', content: text, createdAt: new Date() }
    // Placeholder assistant message that fills in as tokens stream in
    const assistantMsg = { role: 'assistant', content: '', streaming: true, createdAt: new Date() }
    setMessages(prev => [...prev, userMsg, assistantMsg])
    setLoading(true)

    try {
      const { reply, recommendedVideos, pastSelfRecommendation, support: supportData } = await api.streamChatMessage(text, (_piece, fullSoFar) => {
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { ...next[next.length - 1], content: fullSoFar }
          return next
        })
      }, (status) => {
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { ...next[next.length - 1], streamingStatus: status }
          return next
        })
      })

      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = {
          ...next[next.length - 1],
          content: reply || next[next.length - 1].content,
          streaming: false,
          recommendedVideos,
          pastSelfRecommendation,
        }
        return next
      })
      if (supportData) setSupport(supportData)
    } catch (e) {
      setMessages(prev => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last?.streaming) {
          next[next.length - 1] = {
            ...last,
            content: last.content || "I’m here with you. The reflection service is taking a short pause. Your message is safe, and you can try again in a little while.",
            streaming: false,
          }
        }
        return next
      })
      setError('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="companion-sanctuary flex flex-col h-screen max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="py-5 border-b border-white/10 bg-surface/40 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between rounded-b-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20">
            <Heart size={18} fill="white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-text">Someone who remembers what helped before</h1>
            <p className="text-xs text-text/50 font-normal">A safe, non-judgmental space to talk and reflect</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-accent/15 text-accent border border-accent/30">
          <Sparkles size={13} />
          Memory-Aware
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-5">
        {loadingHistory ? (
          <p className="text-sm text-text/40 text-center py-10">Preparing your space…</p>
        ) : (
          messages.map((msg, i) => <Message key={i} msg={msg} onPlayVideo={setPlayingVideo} reflectingLabel={t('companion.reflecting')} onSpeak={speak} />)
        )}

        {/* Typing indicator is now rendered inline inside the streaming placeholder message above */}

        {error && (
          <div className="text-xs p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Crisis Banner */}
      <CrisisBanner support={support} />

      {/* Quick Prompts */}
      <div className="pb-3">
        <div className="flex gap-2 flex-wrap">
          {["I'm feeling anxious today", "I need to vent about work", "Help me reframe this thought", "How have I grown over time?"].map(p => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className="text-xs px-3.5 py-2 rounded-xl border border-white/10 text-text/70 bg-surface hover:bg-white/10 hover:text-text transition-all font-medium"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="pb-6 pt-2">
        <div className="flex gap-2 items-end p-2 rounded-3xl bg-surface border border-white/10 shadow-xl backdrop-blur-lg">
          <button
            onMouseDown={startRecording}
            onMouseUp={() => stopRecording((text) => setInput(prev => prev + (prev ? ' ' : '') + text))}
            onTouchStart={startRecording}
            onTouchEnd={() => stopRecording((text) => setInput(prev => prev + (prev ? ' ' : '') + text))}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-text/50 hover:bg-white/10'}`}
          >
            {isTranscribing ? <Loader2 className="animate-spin" size={18} /> : <Mic size={18} />}
          </button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            disabled={isRecording || isTranscribing}
            placeholder={isRecording ? "Listening..." : isTranscribing ? "Transcribing..." : "Talk about anything on your mind. I'm here…"}
            rows={1}
            className="flex-1 px-2 py-3 rounded-2xl text-sm outline-none resize-none bg-transparent text-text placeholder-text/30"
            style={{ maxHeight: '120px', lineHeight: 1.5 }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading || isRecording || isTranscribing}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Playback Modal */}
      {playingVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setPlayingVideo(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto fade-up"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-bold pr-8 text-text">{playingVideo.title}</h3>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 relative">
              <video src={playingVideo.videoUrl} controls autoPlay className="w-full h-full" />
            </div>

            {playingVideo.note && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-text/40 mb-1">Reflection Note</p>
                <p className="text-xs leading-relaxed text-text/80 whitespace-pre-wrap">{playingVideo.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

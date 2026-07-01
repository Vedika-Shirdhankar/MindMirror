import { useState, useRef, useEffect } from 'react'
import { Send, AlertTriangle, Play, X } from 'lucide-react'
import * as api from '../lib/api.js'
import { format } from 'date-fns'

function CrisisBanner({ support }) {
  if (!support) return null
  return (
    <div className="rounded-xl p-4 mb-3 fade-up" style={{ background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)' }}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={14} color="#f09595" />
        <p className="text-sm font-medium" style={{ color: '#f09595' }}>{support.message}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {support.resources.map(r => (
          <div key={r.name} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(232,230,240,0.8)' }}>
            <strong>{r.name}:</strong> {r.contact}
          </div>
        ))}
      </div>
    </div>
  )
}

function Message({ msg, onPlayVideo }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 items-start fade-up ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium"
        style={{
          background: isUser ? 'rgba(29,158,117,0.2)' : 'rgba(127,119,221,0.2)',
          color: isUser ? '#5DCAA5' : '#AFA9EC',
          border: `1px solid ${isUser ? 'rgba(29,158,117,0.3)' : 'rgba(127,119,221,0.3)'}`,
        }}>
        {isUser ? 'Me' : 'M'}
      </div>
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed`}
          style={{
            color: isUser ? 'white' : '#e8e6f0',
            background: isUser ? 'linear-gradient(135deg, #7F77DD, #534AB7)' : 'rgba(255,255,255,0.05)',
            border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
          }}>
          {msg.content}
        </div>
        {msg.createdAt && (
          <p className="text-xs mt-1.5 opacity-30 px-1" style={{ color: '#e8e6f0' }}>{format(new Date(msg.createdAt), 'h:mm a')}</p>
        )}
        
        {!isUser && msg.recommendedVideos?.length > 0 && !msg.pastSelfRecommendation && (
          <div className="mt-3 w-full max-w-sm rounded-xl p-3 bg-white/[0.02] border border-white/5">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1 text-[#AFA9EC]">
              <span>🎥</span> Your Past Self Has Something To Say
            </p>
            <div className="flex flex-col gap-2">
              {msg.recommendedVideos.map(video => (
                <div key={video._id} className="flex gap-3 rounded-lg overflow-hidden border border-white/5 bg-black/20 hover:border-white/10 transition-all p-2 items-center group relative">
                  <div className="relative w-20 aspect-video bg-black/40 rounded overflow-hidden cursor-pointer flex-shrink-0" onClick={() => onPlayVideo(video)}>
                    <video src={video.videoUrl} className="w-full h-full object-cover" preload="metadata" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-[#7F77DD] flex items-center justify-center shadow-lg">
                        <Play size={10} fill="white" color="white" className="ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-white/90 truncate group-hover:text-[#AFA9EC] transition-colors">{video.title}</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">{format(new Date(video.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isUser && msg.pastSelfRecommendation && (
          <div className="mt-3 w-full max-w-md rounded-xl p-4 bg-gradient-to-br from-[#7F77DD]/10 to-[#5DCAA5]/5 border border-[#7F77DD]/20 shadow-lg fade-up">
            <p className="text-xs font-bold mb-3 flex items-center gap-1.5 text-[#AFA9EC] uppercase tracking-wider">
              <span>🧠</span> Ask Past Self
            </p>
            <div className="flex gap-3 items-start group">
              <div className="relative w-28 aspect-video bg-black/40 rounded-lg overflow-hidden cursor-pointer flex-shrink-0" onClick={() => onPlayVideo(msg.pastSelfRecommendation)}>
                <video src={msg.pastSelfRecommendation.videoUrl} className="w-full h-full object-cover" preload="metadata" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#7F77DD] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play size={12} fill="white" color="white" className="ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white/90 leading-tight mb-1">{msg.pastSelfRecommendation.title}</h4>
                <p className="text-[10px] text-[#AFA9EC] font-medium uppercase tracking-wider mb-2">{format(new Date(msg.pastSelfRecommendation.date), 'MMM d, yyyy')}</p>
                
                <div className="bg-black/30 rounded-md p-2 border border-white/5 relative">
                  <span className="text-3xl text-white/10 absolute -top-2 left-1">"</span>
                  <p className="text-xs text-white/70 italic leading-relaxed pl-3 relative z-10">"{msg.pastSelfRecommendation.transcriptSnippet}"</p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <p className="text-[10px] text-white/50">{msg.pastSelfRecommendation.reason}</p>
              <button 
                onClick={() => onPlayVideo(msg.pastSelfRecommendation)}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors bg-[#7F77DD]/20 hover:bg-[#7F77DD]/40 text-[#AFA9EC] flex items-center gap-1.5"
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
  const [messages, setMessages] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [support, setSupport] = useState(null)
  const [playingVideo, setPlayingVideo] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => { loadHistory() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function loadHistory() {
    try {
      const history = await api.getChatHistory()
      setMessages(history.length ? history : [{ role: 'assistant', content: "Hello. I'm here and I'm listening. How are you feeling right now?", createdAt: new Date() }])
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

    const userMsg = { role: 'user', content: text, createdAt: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const { reply, recommendedVideos, pastSelfRecommendation, support: supportData } = await api.sendChatMessage(text)
      setMessages(prev => [...prev, { role: 'assistant', content: reply, createdAt: new Date(), recommendedVideos, pastSelfRecommendation }])
      if (supportData) setSupport(supportData)
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <h1 className="font-semibold text-base" style={{ color: '#e8e6f0' }}>Companion</h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(232,230,240,0.45)' }}>I remember your journey</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        {loadingHistory ? (
          <p className="text-sm" style={{ color: 'rgba(232,230,240,0.4)' }}>Loading conversation…</p>
        ) : (
          messages.map((msg, i) => <Message key={i} msg={msg} onPlayVideo={setPlayingVideo} />)
        )}
        {loading && (
          <div className="flex gap-3 items-start fade-up">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium" style={{ background: 'rgba(127,119,221,0.2)', color: '#AFA9EC', border: '1px solid rgba(127,119,221,0.3)' }}>M</div>
            <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 18px 18px 18px' }}>
              <span className="thinking text-sm" style={{ color: '#AFA9EC' }}>thinking…</span>
            </div>
          </div>
        )}
        {error && (
          <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.2)', color: '#f09595' }}>{error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-6">
        <CrisisBanner support={support} />
      </div>

      <div className="px-6 pb-2">
        <div className="flex gap-2 flex-wrap">
          {["I'm feeling anxious", "I need to vent", "Help me reframe this", "How have I grown?"].map(p => (
            <button key={p} onClick={() => setInput(p)} className="text-xs px-3 py-1.5 rounded-full border transition-opacity hover:opacity-80" style={{ borderColor: 'rgba(127,119,221,0.3)', color: '#AFA9EC', background: 'rgba(127,119,221,0.07)' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Tell me what's on your mind…"
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e6f0', maxHeight: '120px', lineHeight: 1.5 }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
          />
          <button onClick={send} disabled={!input.trim() || loading} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80 disabled:opacity-30" style={{ background: '#7F77DD' }}>
            <Send size={15} color="white" />
          </button>
        </div>
      </div>

      {/* Playback Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPlayingVideo(null)}
        >
          <div className="relative w-full max-w-2xl bg-[#13121a] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto fade-up"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setPlayingVideo(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10">
              <X size={18} />
            </button>
            <h3 className="text-sm font-semibold pr-8 text-white">{playingVideo.title}</h3>
            
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/5 relative">
              <video src={playingVideo.videoUrl} controls autoPlay className="w-full h-full" />
            </div>

            {playingVideo.note && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mt-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1">Reflection Note</p>
                <p className="text-xs leading-relaxed text-white/70 whitespace-pre-wrap">{playingVideo.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
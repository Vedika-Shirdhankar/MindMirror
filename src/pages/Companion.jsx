import { useState, useRef, useEffect } from 'react'
import { Send, AlertTriangle } from 'lucide-react'
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

function Message({ msg }) {
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
      const { reply, support: supportData } = await api.sendChatMessage(text)
      setMessages(prev => [...prev, { role: 'assistant', content: reply, createdAt: new Date() }])
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
          messages.map((msg, i) => <Message key={i} msg={msg} />)
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
    </div>
  )
}
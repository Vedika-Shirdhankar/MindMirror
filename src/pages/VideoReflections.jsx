import { useState, useEffect, useRef } from 'react'
import { Video, Upload, Trash2, Play, Square, Circle, RotateCcw, Camera, Loader, X, Calendar, Film, RefreshCw, AlertCircle, Brain, MessageSquare } from 'lucide-react'
import * as api from '../lib/api.js'
import { format } from 'date-fns'

export default function VideoReflections() {
  const [reflections, setReflections] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [uploadMode, setUploadMode] = useState(null) // 'file' | 'record' | null
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Recording states
  const [recording, setRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [mediaStream, setMediaStream] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const videoPreviewRef = useRef(null)
  
  // Playback modal state
  const [playingVideo, setPlayingVideo] = useState(null)

  useEffect(() => {
    loadReflections()
  }, [])

  // Timer effect for camera recording
  useEffect(() => {
    let interval
    if (recording) {
      setRecordingTime(0)
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [recording])

  async function loadReflections() {
    setLoading(true)
    setError('')
    try {
      const data = await api.getVideoReflections()
      setReflections(data)
    } catch (err) {
      setError(err.message || 'Failed to load video reflections.')
    } finally {
      setLoading(false)
    }
  }

  // Camera initialization
  async function startCamera() {
    setError('')
    setRecordedBlob(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })
      setMediaStream(stream)
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
      }
    } catch (err) {
      setError('Unable to access camera or microphone. Please check permissions.')
    }
  }

  function stopCamera() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      setMediaStream(null)
    }
  }

  function handleStartRecording() {
    if (!mediaStream) return
    chunksRef.current = []
    
    // Choose appropriate mimeType (fallback for browser support)
    let options = { mimeType: 'video/webm;codecs=vp9,opus' }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8,opus' }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' }
      }
    }

    try {
      const recorder = new MediaRecorder(mediaStream, options)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
      }

      recorder.start(10) // slice of 10ms chunks
      setRecording(true)
    } catch (err) {
      setError('Recording failed: ' + err.message)
    }
  }

  function handleStopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  function handleCancelForm() {
    stopCamera()
    setUploadMode(null)
    setTitle('')
    setNote('')
    setFile(null)
    setRecordedBlob(null)
    setError('')
  }

  async function handleSaveReflection(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please add a title for your reflection.')
      return
    }

    if (uploadMode === 'file' && !file) {
      setError('Please select a video file.')
      return
    }

    if (uploadMode === 'record' && !recordedBlob) {
      setError('Please record a video reflection.')
      return
    }

    setSubmitting(true)
    setError('')

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('note', note.trim())

    if (uploadMode === 'file') {
      formData.append('video', file)
    } else {
      formData.append('video', recordedBlob, 'recorded-reflection.webm')
    }

    try {
      const newRef = await api.uploadVideoReflection(formData)
      setReflections(prev => [newRef, ...prev])
      handleCancelForm()
    } catch (err) {
      setError(err.message || 'Failed to save reflection.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this reflection?')) return
    try {
      await api.deleteVideoReflection(id)
      setReflections(prev => prev.filter(r => r._id !== id))
      if (playingVideo?._id === id) setPlayingVideo(null)
    } catch (err) {
      setError(err.message || 'Failed to delete reflection.')
    }
  }

  async function handleRetry(id) {
    try {
      // Optimistically set to processing
      setReflections(prev => prev.map(r => r._id === id ? { ...r, processingStatus: 'processing' } : r))
      await api.retryVideoAnalysis(id)
    } catch (err) {
      setError(err.message || 'Failed to retry analysis.')
      // Revert optimism if failed
      loadReflections()
    }
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#e8e6f0' }}>Video Reflections</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(232,230,240,0.45)' }}>
            {reflections.length} saved {reflections.length === 1 ? 'reflection' : 'reflections'}
          </p>
        </div>

        {!uploadMode && (
          <div className="flex gap-2">
            <button
              onClick={() => { setUploadMode('record'); startCamera(); }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#e8e6f0' }}
            >
              <Camera size={14} className="text-[#AFA9EC]" />
              Record Video
            </button>
            <button
              onClick={() => setUploadMode('file')}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: '#7F77DD', color: 'white' }}
            >
              <Upload size={14} />
              Upload Reflection
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)', color: '#f09595' }}>
          {error}
        </div>
      )}

      {/* Creation forms */}
      {uploadMode && (
        <div className="rounded-2xl p-6 mb-8 fade-up" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-5 border-b pb-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="text-base font-semibold" style={{ color: '#e8e6f0' }}>
              {uploadMode === 'file' ? 'Upload Video Reflection' : 'Record Video Reflection'}
            </h2>
            <button onClick={handleCancelForm} className="text-white/40 hover:text-white p-1 rounded-lg">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSaveReflection} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Media input column */}
              <div className="md:col-span-6 flex flex-col justify-center">
                {uploadMode === 'file' ? (
                  <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:border-[#7F77DD]/50 min-h-[260px] bg-black/10"
                    style={{ borderColor: file ? '#7F77DD' : 'rgba(255,255,255,0.1)' }}
                  >
                    <input
                      type="file"
                      id="video-upload"
                      accept="video/*"
                      onChange={e => {
                        setFile(e.target.files[0])
                        setError('')
                      }}
                      className="hidden"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-3 w-full h-full">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#AFA9EC]">
                        <Film size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {file ? file.name : 'Select video file'}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          {file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'MP4, MOV, WebM, or MKV'}
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden relative border bg-black/40 min-h-[260px] flex flex-col justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    
                    {/* Video preview or playback element */}
                    {!recordedBlob ? (
                      <video
                        ref={videoPreviewRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover aspect-video"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(recordedBlob)}
                        controls
                        className="w-full h-full object-cover aspect-video"
                      />
                    )}

                    {/* Camera Control overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-between p-4 pointer-events-none">
                      <div className="flex justify-between items-center w-full">
                        {recording && (
                          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-600/90 text-[10px] font-bold text-white uppercase animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>Rec {formatTime(recordingTime)}</span>
                          </div>
                        )}
                        {recordedBlob && (
                          <div className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-[10px] font-bold text-white uppercase">
                            Recorded
                          </div>
                        )}
                      </div>

                      <div className="flex justify-center gap-3 w-full pointer-events-auto mt-auto pt-4">
                        {!recordedBlob ? (
                          !recording ? (
                            <button
                              type="button"
                              onClick={handleStartRecording}
                              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                            >
                              <Circle size={12} fill="white" />
                              Start Record
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleStopRecording}
                              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-gray-100 text-black transition-colors"
                            >
                              <Square size={12} fill="black" />
                              Stop Record
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setRecordedBlob(null); startCamera(); }}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
                            style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e8e6f0' }}
                          >
                            <RotateCcw size={12} />
                            Retake Video
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Text input column */}
              <div className="md:col-span-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-1.5">Reflection Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => { setTitle(e.target.value); setError(''); }}
                    placeholder="e.g. Spiral about future exams"
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                    style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.08)', color: '#e8e6f0' }}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-1.5">Optional Reflection Note</label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Reflect on why you logged this, what triggered it, or how you feel as you record this..."
                    rows={6}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none leading-relaxed border"
                    style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.08)', color: '#e8e6f0' }}
                  />
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <button
                type="button"
                onClick={handleCancelForm}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm border transition-opacity hover:opacity-70 disabled:opacity-40"
                style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(232,230,240,0.5)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: '#7F77DD', color: 'white' }}
              >
                {submitting ? (
                  <><Loader size={13} className="animate-spin" /> Saving Reflection...</>
                ) : (
                  'Save Reflection'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gallery List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-[#7F77DD]" size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reflections.map(r => (
            <div key={r._id} className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all flex flex-col group shadow-lg">
              
              {/* Media Thumbnail */}
              <div className="relative aspect-video rounded-t-2xl overflow-hidden bg-black/40 border-b border-white/5 cursor-pointer"
                onClick={() => {
                  if (r.processingStatus === 'processing') return;
                  setPlayingVideo(r);
                }}
              >
                <video src={r.videoUrl} className="w-full h-full object-cover" preload="metadata" />
                
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {r.processingStatus === 'processing' ? (
                     <div className="flex flex-col items-center gap-2">
                       <Loader size={24} className="animate-spin text-[#7F77DD]" />
                       <span className="text-xs font-semibold text-white">Analyzing...</span>
                     </div>
                  ) : r.processingStatus === 'failed' ? (
                     <div className="w-12 h-12 rounded-full bg-red-500/80 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                       <AlertCircle size={18} fill="white" color="white" />
                     </div>
                  ) : (
                     <div className="w-12 h-12 rounded-full bg-[#7F77DD] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                       <Play size={18} fill="white" color="white" className="ml-0.5" />
                     </div>
                  )}
                </div>
                
                <div className="absolute bottom-3 right-3 flex gap-2">
                  {r.processingStatus === 'failed' && (
                    <div className="bg-red-500/80 backdrop-blur-sm text-[10px] px-2.5 py-1 rounded-md text-white flex items-center gap-1 font-semibold uppercase tracking-wider">
                      <AlertCircle size={10} /> AI Failed
                    </div>
                  )}
                  {r.processingStatus === 'processing' && (
                    <div className="bg-orange-500/80 backdrop-blur-sm text-[10px] px-2.5 py-1 rounded-md text-white flex items-center gap-1 font-semibold uppercase tracking-wider">
                      <RefreshCw size={10} className="animate-spin" /> Processing
                    </div>
                  )}
                  {(!r.processingStatus || r.processingStatus === 'completed') && (
                    <div className="bg-black/60 backdrop-blur-sm text-[10px] px-2.5 py-1 rounded-md text-white/70 flex items-center gap-1 font-semibold uppercase tracking-wider">
                      <Film size={10} /> Video
                    </div>
                  )}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <Calendar size={11} />
                    <span>{format(new Date(r.createdAt), 'MMMM d, yyyy')}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-[#AFA9EC] transition-colors">{r.title}</h3>
                  {r.note && (
                    <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{r.note}</p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-auto">
                  {r.processingStatus === 'failed' ? (
                    <button
                      onClick={() => handleRetry(r._id)}
                      className="text-xs font-semibold flex items-center gap-1.5 text-white bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg"
                    >
                      <RefreshCw size={12} /> Retry AI Analysis
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="text-white/30 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-white/5 ml-auto"
                    title="Delete reflection"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

            </div>
          ))}
          
          {reflections.length === 0 && (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-white/30">
                <Video size={20} />
              </div>
              <h3 className="text-sm font-semibold text-white">No video reflections yet</h3>
              <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
                Record or upload your first personal video reflection. Capture your thoughts and play them back when you need them.
              </p>
            </div>
          )}
        </div>
      )}

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

            {/* AI Insights and Transcript */}
            {playingVideo.processingStatus === 'completed' && (
              <div className="space-y-4 mt-2">
                
                {/* AI Summary and Insight */}
                <div className="bg-[#7F77DD]/10 border border-[#7F77DD]/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#7F77DD]/20 flex items-center justify-center shrink-0">
                      <Brain size={16} className="text-[#AFA9EC]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#e8e6f0] font-medium leading-relaxed">{playingVideo.summary}</p>
                      {playingVideo.aiGeneratedInsights && (
                        <p className="text-xs text-[#AFA9EC] mt-2 italic">"{playingVideo.aiGeneratedInsights}"</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metadata Tags */}
                <div className="flex flex-wrap gap-2">
                  {playingVideo.themes?.map(theme => (
                    <span key={theme} className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-white/70">
                      {theme.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {playingVideo.mood_score && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-[#7F77DD]/20 bg-[#7F77DD]/10 text-[#AFA9EC]">
                      Distress: {playingVideo.mood_score}/10
                    </span>
                  )}
                </div>

                {/* Transcript */}
                {playingVideo.transcript && (
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={14} className="text-white/40" />
                      <p className="text-[10px] uppercase font-bold tracking-wider text-white/40">Transcript</p>
                    </div>
                    <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      <p className="text-xs leading-relaxed text-white/60 whitespace-pre-wrap">{playingVideo.transcript}</p>
                    </div>
                  </div>
                )}
                
              </div>
            )}
            
            {playingVideo.processingStatus === 'failed' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col items-center justify-center py-6 text-center">
                <AlertCircle size={24} className="text-red-400 mb-2" />
                <p className="text-sm font-semibold text-red-200">AI Analysis Failed</p>
                <p className="text-xs text-red-400 mt-1 max-w-sm mb-4">We couldn't process the transcript and insights for this video. The video itself is safe.</p>
                <button
                  onClick={() => {
                    handleRetry(playingVideo._id);
                    setPlayingVideo(null);
                  }}
                  className="text-xs font-semibold flex items-center gap-1.5 text-white bg-red-500/20 hover:bg-red-500/30 transition-colors px-4 py-2 rounded-lg"
                >
                  <RefreshCw size={12} /> Retry Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

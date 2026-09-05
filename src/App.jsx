import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Companion from './pages/Companion.jsx'
import Timeline from './pages/Timeline.jsx'
import Patterns from './pages/Patterns.jsx'
import Growth from './pages/Growth.jsx'
import Journal from './pages/Journal.jsx'
import ThoughtLadder from './pages/ThoughtLadder.jsx'
import FutureLetters from './pages/FutureLetters.jsx'
import Settings from './pages/Settings.jsx'
import Analytics from './pages/Analytics.jsx'
import MindGames from './pages/MindGames.jsx'
import Landing from './pages/Landing.jsx'
import VideoReflections from './pages/VideoReflections.jsx'
import LetterFromMirror from './pages/LetterFromMirror.jsx'
import LifeReport from './pages/LifeReport.jsx'
import Appearance from './pages/Appearance.jsx'
import WhyMindMirror from './pages/WhyMindMirror.jsx'
import AnchorSpace from './pages/AnchorSpace.jsx' // <-- 1. IMPORT ADDED
import { AuthProvider, useAuth } from './lib/AuthContext.jsx'

function ProtectedShell() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f13' }}>
        <p className="text-sm" style={{ color: 'rgba(232,230,240,0.4)' }}>Loading…</p>
      </div>
    )
  }

  if (!user) return <Landing autoOpenAuth={location.pathname !== '/'} />

  return (
    <Layout user={user}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/companion" element={<Companion />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/anchor" element={<AnchorSpace />} /> {/* <-- 2. ROUTE ADDED */}
        <Route path="/videos" element={<VideoReflections />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/patterns" element={<Patterns />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/mind-games" element={<MindGames />} />
        <Route path="/thought-ladder" element={<ThoughtLadder />} />
        <Route path="/letters" element={<FutureLetters />} />
        <Route path="/letter-from-mirror" element={<LetterFromMirror />} />
        <Route path="/life-report" element={<LifeReport />} />
        <Route path="/appearance" element={<Appearance />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/why" element={<WhyMindMirror onGetStarted={() => window.location.href = '/companion'} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedShell />
    </AuthProvider>
  )
}
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
import About from './pages/About.jsx'
import HowItWorks from './pages/HowItWorks.jsx'
import ForYou from './pages/ForYou.jsx'
import VideoReflections from './pages/VideoReflections.jsx'
import LetterFromMirror from './pages/LetterFromMirror.jsx'
import LifeReport from './pages/LifeReport.jsx'
import Appearance from './pages/Appearance.jsx'
import AnchorSpace from './pages/AnchorSpace.jsx'
import Auth from './pages/Auth.jsx'
import { AuthProvider, useAuth } from './lib/AuthContext.jsx'

function ProtectedShell() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fcf9f4' }}>
        <p className="text-sm font-medium" style={{ color: '#4a6556' }}>Connecting to your space…</p>
      </div>
    )
  }

  // Unauthenticated routes: Landing, About, How It Works, For You, Login, Signup
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/for-you" element={<ForYou />} />
        <Route path="/login" element={<Auth isModal={false} initialMode="login" />} />
        <Route path="/signup" element={<Auth isModal={false} initialMode="signup" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // Authenticated: redirect /login and /signup back to dashboard
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return <Navigate to="/" replace />
  }

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
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/for-you" element={<ForYou />} />
        <Route path="/why" element={<About />} />
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
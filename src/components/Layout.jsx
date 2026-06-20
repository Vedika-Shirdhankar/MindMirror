import { NavLink } from 'react-router-dom'
import {
  MessageCircle, BookOpen, Clock, BarChart2, TrendingUp,
  Layers, Mail, Settings, Heart, Lock, LogOut, PieChart, Gamepad2, Video, Scroll
} from 'lucide-react'
import { useAuth } from '../lib/AuthContext.jsx'

const navItems = [
  { to: '/companion',          icon: MessageCircle, label: 'Companion' },
  { to: '/journal',            icon: BookOpen,      label: 'Journal' },
  { to: '/letter-from-mirror', icon: Scroll,        label: 'Letter From MindMirror' },
  { to: '/videos',             icon: Video,         label: 'Video Reflections' },
  { to: '/timeline',           icon: Clock,         label: 'Timeline' },
  { to: '/patterns',           icon: BarChart2,     label: 'Patterns' },
  { to: '/growth',             icon: TrendingUp,    label: 'Growth' },
  { to: '/analytics',          icon: PieChart,      label: 'Analytics' },
  { to: '/mind-games',         icon: Gamepad2,      label: 'Mind Games' },
  { to: '/thought-ladder',     icon: Layers,        label: 'Thought Ladder' },
  { to: '/letters',            icon: Mail,          label: 'Future Letters' },
]

export default function Layout({ children, user }) {
  const { logout } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f0f13' }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col py-5 px-3 border-r overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#13121a' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-7">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#7F77DD' }}>
            <Heart size={14} color="white" fill="white" />
          </div>
          <span className="font-semibold text-sm" style={{ color: '#e8e6f0' }}>MindMirror</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive ? 'font-medium' : 'opacity-60 hover:opacity-90 hover:bg-white/5'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? '#AFA9EC' : '#e8e6f0',
                background: isActive ? 'rgba(127,119,221,0.12)' : undefined,
              })}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-0.5 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <NavLink to="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm opacity-60 hover:opacity-90 hover:bg-white/5 transition-all" style={{ color: '#e8e6f0' }}>
            <Settings size={15} />
            Settings
          </NavLink>
          <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm opacity-60 hover:opacity-90 hover:bg-white/5 transition-all text-left" style={{ color: '#e8e6f0' }}>
            <LogOut size={15} />
            Log out
          </button>
          <div className="flex items-center gap-2.5 px-3 py-2 text-xs opacity-40" style={{ color: '#e8e6f0' }}>
            <Lock size={12} />
            Data stored in MongoDB
          </div>
        </div>

        {/* User */}
        <div className="mt-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs font-medium" style={{ color: '#AFA9EC' }}>{user?.name || 'You'}</p>
          <p className="text-xs opacity-40 truncate" style={{ color: '#e8e6f0' }}>{user?.email || 'Your journey'}</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
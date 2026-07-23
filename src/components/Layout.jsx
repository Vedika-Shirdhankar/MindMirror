import { NavLink } from 'react-router-dom'
import {
  MessageCircle, BookOpen, Clock, BarChart2, TrendingUp,
  Layers, Mail, Settings, Heart, Lock, LogOut, PieChart, Gamepad2, Video, Scroll, Sparkles, Palette, Sun
} from 'lucide-react'
import { useAuth } from '../lib/AuthContext.jsx'

const navItems = [
  { to: '/companion',          icon: MessageCircle, label: 'Companion', tagline: 'Remembers what helped' },
  { to: '/journal',            icon: BookOpen,      label: 'Journal', tagline: 'Your quiet space' },
  { to: '/life-report',        icon: Sparkles,      label: 'Life Report', tagline: 'See how far you\'ve come' },
  { to: '/letter-from-mirror', icon: Scroll,        label: 'Letter from Mirror', tagline: 'Personal insights' },
  { to: '/videos',             icon: Video,         label: 'Video Memories', tagline: 'Advice from past self' },
  { to: '/timeline',           icon: Clock,         label: 'Timeline', tagline: 'Your emotional path' },
  { to: '/patterns',           icon: BarChart2,     label: 'Patterns', tagline: 'Notice your mind\'s clues' },
  { to: '/growth',             icon: TrendingUp,    label: 'Growth Story', tagline: 'Milestones & progress' },
  { to: '/mind-games',         icon: Gamepad2,      label: 'Mind Games', tagline: '2-minute reset exercises' },
  { to: '/thought-ladder',     icon: Layers,        label: 'Thought Ladder', tagline: 'Untangle one thought' },
  { to: '/letters',            icon: Mail,          label: 'Future Letters', tagline: 'Envelope through time' },
  { to: '/analytics',          icon: PieChart,      label: 'Insights', tagline: 'Self-awareness data' },
]

export default function Layout({ children, user }) {
  const { logout } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Soft warm background ambient aura */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[140px] animate-breathe" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[120px] animate-glow" />
      </div>

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col py-6 px-4 border-r z-10 bg-surface/80 backdrop-blur-xl border-white/5 shadow-xl">
        {/* Warm Logo Header */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-primary to-accent shadow-md shadow-primary/20">
            <Heart size={16} color="white" fill="white" />
          </div>
          <div>
            <span className="font-bold text-base text-text tracking-tight block">MindMirror</span>
            <span className="text-[11px] text-text/50 font-medium block -mt-0.5">Your safe, quiet space</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1">
          {navItems.map(({ to, icon: Icon, label, tagline }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'font-semibold bg-primary/15 text-primary border border-primary/25 shadow-md shadow-primary/5'
                    : 'text-text/70 hover:text-text hover:bg-white/5'
                }`
              }
            >
              <Icon size={16} className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
              <div className="min-w-0">
                <div className="truncate leading-tight">{label}</div>
                <div className="text-[10px] text-text/40 font-normal truncate mt-0.5">{tagline}</div>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-white/5">
          <NavLink
            to="/appearance"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive ? 'bg-primary/15 text-primary' : 'text-text/60 hover:text-text hover:bg-white/5'
              }`
            }
          >
            <Palette size={15} />
            Personalize Space
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive ? 'bg-primary/15 text-primary' : 'text-text/60 hover:text-text hover:bg-white/5'
              }`
            }
          >
            <Settings size={15} />
            Settings & Account
          </NavLink>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-text/60 hover:text-text hover:bg-white/5 transition-all text-left"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>

        {/* User Card */}
        <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-xs text-primary">
            {user?.name ? user.name[0].toUpperCase() : 'M'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-text truncate">{user?.name || 'Welcome'}</p>
            <p className="text-[10px] text-text/50 truncate">Warmth & progress</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  )
}
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, BookOpen, Clock, BarChart2, TrendingUp,
  Layers, Mail, Settings, Heart, Lock, LogOut, PieChart, Gamepad2, Video, Scroll, Sparkles, Palette, Sun, Home,
  Anchor, Leaf, Search, Bell
} from 'lucide-react'
import { useAuth } from '../lib/AuthContext.jsx'
import { useTranslation } from 'react-i18next'
import AmbientScene from './AmbientScene.jsx'

export default function Layout({ children, user }) {
  const { logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [notification, setNotification] = useState(false)

  const navItems = [
    { to: '/',                 icon: Home,          label: t('nav.dashboard'), tagline: t('nav.dashboardTagline') },
    { to: '/companion',          icon: MessageCircle, label: t('nav.companion'), tagline: t('nav.companionTagline') },
    { to: '/journal',            icon: BookOpen,      label: t('nav.journal'), tagline: t('nav.journalTagline') },
    { to: '/anchor',             icon: Anchor,        label: t('nav.anchor'), tagline: t('nav.anchorTagline') }, 
    { to: '/life-report',        icon: Sparkles,      label: t('nav.lifeReport'), tagline: t('nav.lifeReportTagline') },
    { to: '/letter-from-mirror', icon: Scroll,        label: t('nav.letterFromMirror'), tagline: t('nav.letterFromMirrorTagline') },
    { to: '/videos',             icon: Video,         label: t('nav.videos'), tagline: t('nav.videosTagline') },
    { to: '/timeline',           icon: Clock,         label: t('nav.timeline'), tagline: t('nav.timelineTagline') },
    { to: '/patterns',           icon: BarChart2,     label: t('nav.patterns'), tagline: t('nav.patternsTagline') },
    { to: '/growth',             icon: TrendingUp,    label: t('nav.growth'), tagline: t('nav.growthTagline') },
    { to: '/mind-games',         icon: Gamepad2,      label: t('nav.mindGames'), tagline: t('nav.mindGamesTagline') },
    { to: '/thought-ladder',     icon: Layers,        label: t('nav.thoughtLadder'), tagline: t('nav.thoughtLadderTagline') },
    { to: '/letters',            icon: Mail,          label: t('nav.futureLetters'), tagline: t('nav.futureLettersTagline') },
    { to: '/analytics',          icon: PieChart,      label: t('nav.analytics'), tagline: t('nav.analyticsTagline') },
  ]

  return (
    <div className="app-shell flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <AmbientScene />

      {/* Sidebar */}
      <aside className="app-sidebar w-64 flex-shrink-0 flex flex-col py-6 px-4 border-r z-10 bg-white/55 backdrop-blur-xl border-black/5 shadow-[8px_0_30px_rgba(36,59,58,0.04)]">
        {/* Warm Logo Header */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-primary shadow-md shadow-primary/20">
            <Heart size={16} color="white" fill="white" />
          </div>
          <div>
            <span className="font-bold text-base text-text tracking-tight block">{t('app.name')}</span>
            <span className="text-[11px] text-text/50 font-medium block -mt-0.5">A kinder you, always.</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1">
          {navItems.map(({ to, icon: Icon, label, tagline }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'font-semibold bg-primary/15 text-primary border border-primary/25 shadow-md shadow-primary/5'
                    : 'text-text/70 hover:text-text hover:bg-primary/5'
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
        <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-black/5">
          <NavLink
            to="/appearance"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive ? 'bg-primary/10 text-primary' : 'text-text/60 hover:text-text hover:bg-primary/5'
              }`
            }
          >
            <Palette size={15} />
            {t('nav.personalizeSpace')}
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive ? 'bg-primary/10 text-primary' : 'text-text/60 hover:text-text hover:bg-primary/5'
              }`
            }
          >
            <Settings size={15} />
            {t('nav.settingsAccount')}
          </NavLink>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-text/60 hover:text-text hover:bg-primary/5 transition-all text-left"
          >
            <LogOut size={15} />
            {t('nav.logOut')}
          </button>
        </div>

        {/* User Card */}
        <div className="mt-4 p-3 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-xs text-primary">
            {user?.name ? user.name[0].toUpperCase() : 'M'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-text truncate">{user?.name || 'Welcome'}</p>
            <p className="text-[10px] text-text/50 truncate">{t('app.warmthProgress')}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <header className="app-topbar flex items-center justify-between px-6 lg:px-10 py-4">
          <button onClick={() => navigate('/journal')} className="app-search hidden sm:flex items-center gap-2 rounded-full px-4 py-2.5 w-72 text-left" aria-label="Search reflections in your journal">
            <Search size={14} className="text-text/40" />
            <span className="text-xs text-text/40">Search your thoughts, feelings, moments...</span>
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative">
              <button onClick={() => setNotification(open => !open)} className="icon-button" aria-label="Toggle notifications" aria-expanded={notification}><Bell size={16} /></button>
              {notification && <div role="status" className="absolute right-0 top-9 w-56 rounded-xl border border-white/10 bg-[var(--color-surface)] p-3 text-xs text-text/70 shadow-xl">You’re all caught up. New reflections and letters will appear here.</div>}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">{user?.name?.[0]?.toUpperCase() || 'M'}</div>
              <span className="hidden md:block text-xs font-medium text-text/70">Hi, {user?.name?.split(' ')[0] || 'there'}</span>
            </div>
          </div>
        </header>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="page-transition"
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -5, filter: 'blur(3px)' }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}>
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

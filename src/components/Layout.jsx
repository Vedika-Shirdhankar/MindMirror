import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, BookOpen, Clock, BarChart2, TrendingUp,
  Layers, Mail, Settings, Heart, Lock, LogOut, PieChart, Gamepad2, Video, Scroll, Sparkles, Palette, Sun, Home,
  Anchor, Leaf, Search, Bell
} from 'lucide-react'
import { useAuth } from '../lib/AuthContext.jsx'
import { useTranslation } from 'react-i18next'
import AmbientScene from './AmbientScene.jsx'
import SearchPalette from './SearchPalette.jsx'

export default function Layout({ children, user }) {
  const { logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [notification, setNotification] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  const QUOTES = [
    "You are capable of amazing things.",
    "Every day is a fresh start.",
    "Take a deep breath. You're doing great.",
    "Your potential is endless.",
    "Progress, not perfection.",
    "You are stronger than you think."
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

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
            <span className="text-[11px] text-text/50 font-medium block -mt-0.5">{t('app.tagline')}</span>
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
        <div className="mt-4 p-3 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigate('/settings')}>
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-xs text-primary overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name ? user.name[0].toUpperCase() : 'M'
            )}
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
          <button onClick={() => setSearchOpen(true)} className="app-search group hidden sm:flex items-center justify-between rounded-full px-4 py-2 w-72 text-left transition-all duration-300 hover:bg-white/90 hover:shadow-md hover:border-primary/30" aria-label="Search reflections in your journal">
            <div className="flex items-center gap-2.5">
              <Search size={15} className="text-text/40 group-hover:text-primary transition-colors duration-300" />
              <span className="text-xs text-text/40 group-hover:text-text/70 transition-colors duration-300">{t('journal.searchPlaceholder')}</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/5 border border-black/5 text-[10px] text-text/40 font-medium font-sans group-hover:bg-primary/5 group-hover:text-primary/70 group-hover:border-primary/10 transition-colors duration-300">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative">
              <button onClick={() => setNotification(open => !open)} className="icon-button" aria-label="Toggle notifications" aria-expanded={notification}><Bell size={16} /></button>
              <AnimatePresence>
                {notification && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-11 w-64 rounded-2xl border border-primary/20 bg-white/90 backdrop-blur-xl p-4 text-xs text-text/80 shadow-2xl z-50"
                  >
                    <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                      <Sparkles size={14} />
                      A gentle reminder
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={quoteIndex}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        transition={{ duration: 0.4 }}
                        className="italic text-text/70 leading-relaxed"
                      >
                        "{QUOTES[quoteIndex]}"
                      </motion.p>
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => navigate('/settings')} className="flex items-center gap-2 hover:bg-black/5 p-1.5 pr-3 rounded-full transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold overflow-hidden border border-primary/20">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || 'M'
                )}
              </div>
              <span className="hidden md:block text-xs font-medium text-text/80">Hi, {user?.name?.split(' ')[0] || 'there'}</span>
            </button>
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
      <SearchPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}>
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

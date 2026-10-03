import { Cloud, Leaf, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

/**
 * A lightweight, CSS-driven atmosphere shared by the private product surfaces.
 * It deliberately uses a handful of vector elements rather than large images or
 * canvas effects so the environment remains calm and inexpensive to render.
 */
export default function AmbientScene({ variant = 'meadow' }) {
  const { preferences } = useTheme()
  const environment = preferences?.theme || variant
  return (
    <div className={`ambient-scene ambient-scene--${environment} fixed inset-0 pointer-events-none z-0 opacity-20 overflow-hidden select-none`} aria-hidden="true">
      <div className="ambient-scene__sun" />
      <div className="ambient-scene__ray ambient-scene__ray--one" />
      <div className="ambient-scene__ray ambient-scene__ray--two" />
      <Cloud className="ambient-cloud ambient-cloud--one absolute top-12 left-10 text-primary/30" size={64} strokeWidth={1} />
      <Cloud className="ambient-cloud ambient-cloud--two absolute top-28 right-16 text-primary/20" size={48} strokeWidth={1} />
      <Sun className="ambient-sun-icon absolute top-8 right-10 text-amber-400/30" size={34} strokeWidth={1.3} />
      <Leaf className="ambient-leaf ambient-leaf--one absolute bottom-16 left-8 text-emerald-500/20" size={30} strokeWidth={1.5} />
      <Leaf className="ambient-leaf ambient-leaf--two absolute bottom-32 right-12 text-emerald-500/20" size={24} strokeWidth={1.5} />
      <Leaf className="ambient-leaf ambient-leaf--three absolute top-1/2 left-4 text-emerald-500/15" size={28} strokeWidth={1.25} />
    </div>
  )
}

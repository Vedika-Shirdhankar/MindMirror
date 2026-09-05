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
    <div className={`ambient-scene ambient-scene--${environment}`} aria-hidden="true">
      <div className="ambient-scene__sun" />
      <div className="ambient-scene__ray ambient-scene__ray--one" />
      <div className="ambient-scene__ray ambient-scene__ray--two" />
      <Cloud className="ambient-cloud ambient-cloud--one" size={88} strokeWidth={1} />
      <Cloud className="ambient-cloud ambient-cloud--two" size={58} strokeWidth={1} />
      <Sun className="ambient-sun-icon" size={34} strokeWidth={1.3} />
      <Leaf className="ambient-leaf ambient-leaf--one" size={30} strokeWidth={1.5} />
      <Leaf className="ambient-leaf ambient-leaf--two" size={20} strokeWidth={1.5} />
      <Leaf className="ambient-leaf ambient-leaf--three" size={38} strokeWidth={1.25} />
      <Leaf className="ambient-leaf ambient-leaf--four" size={17} strokeWidth={1.5} />
      <span className="ambient-particle ambient-particle--one" />
      <span className="ambient-particle ambient-particle--two" />
      <span className="ambient-particle ambient-particle--three" />
    </div>
  )
}

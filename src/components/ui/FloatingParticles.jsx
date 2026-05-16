import { useMemo } from 'react'
import { motion } from 'framer-motion'

const PARTICLE_TYPES = ['✦', '✧', '◦', '·', '⋆', '˚', '°']

export default function FloatingParticles({ count = 18, className = '' }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      symbol: PARTICLE_TYPES[i % PARTICLE_TYPES.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.6 + Math.random() * 0.8,
      duration: 5 + Math.random() * 8,
      delay: Math.random() * 6,
      opacity: 0.15 + Math.random() * 0.35,
    })),
    [count]
  )

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute select-none text-pink-300"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}rem`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -16, -8, -20, 0],
            x: [0, 4, -4, 2, 0],
            rotate: [0, 8, -4, 6, 0],
            opacity: [p.opacity, p.opacity * 1.4, p.opacity, p.opacity * 1.2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {p.symbol}
        </motion.span>
      ))}
    </div>
  )
}

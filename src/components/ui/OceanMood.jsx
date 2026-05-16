import { motion } from 'framer-motion'
import { useMemo } from 'react'

function getMood(pendingCount) {
  if (pendingCount <= 3) return 'calm'
  if (pendingCount <= 6) return 'cloudy'
  return 'storm'
}

const moodConfig = {
  calm: {
    label: 'Mar en calma',
    sky: 'from-sky-200 via-blue-100 to-marea-sky',
    sea: 'from-marea-ocean via-marea-mid to-sky-400',
    emoji: '🌊',
    msg: 'Todo fluye con suavidad hoy.',
  },
  cloudy: {
    label: 'Brisa suave',
    sky: 'from-slate-300 via-blue-200 to-sky-200',
    sea: 'from-slate-600 via-marea-ocean to-marea-mid',
    emoji: '🌧',
    msg: 'Bastante en el horizonte, pero avanzas.',
  },
  storm: {
    label: 'Tormenta elegante',
    sky: 'from-slate-700 via-slate-500 to-slate-400',
    sea: 'from-slate-900 via-slate-700 to-marea-ocean',
    emoji: '⛈',
    msg: 'Mucho por delante. Respira. Tú puedes.',
  },
}

function RainDrop({ x, delay, duration }) {
  return (
    <motion.div
      className="absolute top-0 w-px rounded-full bg-sky-300/60"
      style={{ left: `${x}%`, height: '18px' }}
      animate={{ y: ['0%', '120%'], opacity: [0, 0.8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    />
  )
}

function KoiFish({ y, delay }) {
  return (
    <motion.div
      className="absolute text-lg"
      style={{ top: `${y}%` }}
      animate={{ x: ['5%', '90%', '5%'], scaleX: [1, 1, -1, -1, 1] }}
      transition={{ duration: 14, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      🐟
    </motion.div>
  )
}

export default function OceanMood({ pendingCount = 0, className = '' }) {
  const mood = getMood(pendingCount)
  const cfg = moodConfig[mood]

  const rainDrops = useMemo(
    () =>
      mood !== 'calm'
        ? Array.from({ length: mood === 'storm' ? 22 : 10 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 1.5,
            duration: 0.8 + Math.random() * 0.6,
          }))
        : [],
    [mood]
  )

  const kois = useMemo(
    () =>
      Array.from({ length: mood === 'calm' ? 3 : 1 }, (_, i) => ({
        id: i,
        y: 55 + i * 15,
        delay: i * 4,
      })),
    [mood]
  )

  const waves = [0, 1, 2]

  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`} style={{ height: 180 }}>
      {/* Sky */}
      <div className={`absolute inset-0 bg-gradient-to-b ${cfg.sky}`} />

      {/* Rain */}
      {rainDrops.map((d) => (
        <RainDrop key={d.id} x={d.x} delay={d.delay} duration={d.duration} />
      ))}

      {/* Sea */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${cfg.sea}`} style={{ height: '55%', borderRadius: '60% 60% 0 0 / 30% 30% 0 0' }} />

      {/* Waves */}
      {waves.map((i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 left-0 right-0 border-t-2 border-white/20"
          style={{ bottom: `${20 + i * 12}%`, borderRadius: '60% 60% 0 0 / 30% 30% 0 0' }}
          animate={{ x: [0, i % 2 === 0 ? -15 : 15, 0] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Koi fish */}
      {kois.map((k) => (
        <KoiFish key={k.id} y={k.y} delay={k.delay} />
      ))}

      {/* Overlay text */}
      <div className="absolute inset-0 flex items-end p-4">
        <div>
          <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">{cfg.emoji} {cfg.label}</p>
          <p className="text-sm text-white/90 font-medium">{cfg.msg}</p>
        </div>
      </div>
    </div>
  )
}

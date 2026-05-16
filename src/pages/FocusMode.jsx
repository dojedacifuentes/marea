import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import useAppStore from '../store/useAppStore'

const POMODORO = 25 * 60
const SHORT_BREAK = 5 * 60
const LONG_BREAK = 15 * 60

const FRASES = [
  'La disciplina es el puente entre las metas y el logro.',
  'Un pequeño paso hacia adelante cada día construye el camino.',
  'El derecho se estudia con paciencia y con amor.',
  'Tu esfuerzo hoy es tu argumento de mañana.',
  'Cada página leída es territorio ganado.',
  'La constancia es la abogada de los sueños.',
  'Trabajar con propósito es la forma más alta de descanso.',
  'El saber jurídico se forja en la perseverancia silenciosa.',
  'Hoy estudias; mañana argumentas con autoridad.',
  'La excelencia no es un acto, es un hábito.',
]

// ── Audio engine imperativo — sin React state ────────────────────────
class AudioEngine {
  constructor() {
    this.ctx = null
    this.activeNodes = []
  }

  _getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  stopAll() {
    this.activeNodes.forEach(n => {
      try { n.stop?.() } catch {}
      try { n.disconnect?.() } catch {}
    })
    this.activeNodes = []
  }

  startRain() {
    this.stopAll()
    const ctx = this._getCtx()

    const bufferSize = ctx.sampleRate * 3
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 700

    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 180

    const gain = ctx.createGain()
    gain.gain.value = 0.06

    src.connect(lp)
    lp.connect(hp)
    hp.connect(gain)
    gain.connect(ctx.destination)
    src.start()

    this.activeNodes = [src, lp, hp, gain]
  }

  startWaves() {
    this.stopAll()
    const ctx = this._getCtx()

    // Tono base: frecuencia grave de océano
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 80

    // Segundo tono para riqueza
    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = 120

    // LFO que modula el volumen (vaivén de ola)
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.12   // 1 ola cada ~8 segundos

    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.025   // profundidad del vaivén

    const masterGain = ctx.createGain()
    masterGain.gain.value = 0.04

    // LFO → gain del master (sube y baja el volumen)
    lfo.connect(lfoGain)
    lfoGain.connect(masterGain.gain)

    osc.connect(masterGain)
    osc2.connect(masterGain)
    masterGain.connect(ctx.destination)

    lfo.start()
    osc.start()
    osc2.start()

    this.activeNodes = [osc, osc2, lfo, lfoGain, masterGain]
  }
}

// Instancia singleton fuera del componente para que no se recree con renders
const engine = new AudioEngine()

// ────────────────────────────────────────────────────────────────────

function WaveBackground({ mood }) {
  const colors = {
    focus: 'rgba(12, 74, 110, 0.3)',
    break: 'rgba(249, 168, 212, 0.3)',
    longbreak: 'rgba(139, 92, 246, 0.3)',
  }
  const color = colors[mood] || colors.focus

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[0, 1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 rounded-full opacity-25"
          style={{ bottom: `${-20 + i * 15}%`, height: '40%', backgroundColor: color }}
          animate={{
            translateX: i % 2 === 0 ? [0, -30, 0] : [0, 30, 0],
            scaleY: [1, 1.08, 0.95, 1],
          }}
          transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export default function FocusMode() {
  const { addFocusSession } = useAppStore()
  const [mode, setMode] = useState('focus')
  const [timeLeft, setTimeLeft] = useState(POMODORO)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [sound, setSound] = useState('none')   // empieza mudo; usuario activa
  const [frase, setFrase] = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)])
  const [showTask, setShowTask] = useState('')
  const intervalRef = useRef(null)

  const totalTime = mode === 'focus' ? POMODORO : mode === 'break' ? SHORT_BREAK : LONG_BREAK

  // ── Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setRunning(false)
            if (mode === 'focus') {
              setSessions(s => s + 1)
              addFocusSession({ mode: 'focus', duration: POMODORO, completedAt: new Date().toISOString() })
            }
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, mode])

  // ── Audio — se dispara cuando cambia sound (independiente del timer) ─
  useEffect(() => {
    if (sound === 'rain') {
      engine.startRain()
    } else if (sound === 'waves') {
      engine.startWaves()
    } else {
      engine.stopAll()
    }
    // Cleanup al desmontar
    return () => engine.stopAll()
  }, [sound])

  // ── Cambiar modo ─────────────────────────────────────────────────
  const switchMode = (m) => {
    setMode(m)
    setTimeLeft(m === 'focus' ? POMODORO : m === 'break' ? SHORT_BREAK : LONG_BREAK)
    setRunning(false)
    setFrase(FRASES[Math.floor(Math.random() * FRASES.length)])
  }

  const reset = () => {
    setTimeLeft(totalTime)
    setRunning(false)
  }

  const toggleRun = () => setRunning(r => !r)

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')
  const progress = 1 - timeLeft / totalTime

  const bgGradients = {
    focus: 'from-marea-ocean via-marea-deep to-slate-900',
    break: 'from-pink-400 via-purple-400 to-pink-600',
    longbreak: 'from-violet-600 via-purple-600 to-indigo-800',
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradients[mode]} relative overflow-hidden flex flex-col items-center justify-center p-8`}>
      <WaveBackground mood={mode} />

      {/* Partículas */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-white/20 text-lg select-none pointer-events-none"
          style={{ left: `${(i * 8.3) % 100}%`, top: `${(i * 13.7) % 90}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4 + i * 0.7, delay: i * 0.4, repeat: Infinity }}
        >
          {['✦', '◦', '·', '⋆', '˚'][i % 5]}
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg w-full">

        {/* Tabs de modo */}
        <div className="flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-1 gap-1">
          {[['focus', '🎯 Focus'], ['break', '☕ Pausa'], ['longbreak', '🌙 Descanso']].map(([m, l]) => (
            <button key={m} onClick={() => switchMode(m)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all text-white ${mode === m ? 'bg-white/20' : 'hover:bg-white/10 opacity-70'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Timer circular */}
        <div className="relative">
          <svg width={240} height={240} className="-rotate-90">
            <circle cx={120} cy={120} r={108} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
            <motion.circle
              cx={120} cy={120} r={108}
              fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 108}
              animate={{ strokeDashoffset: 2 * Math.PI * 108 * (1 - progress) }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-6xl font-bold text-white tabular-nums">{mm}:{ss}</span>
            <span className="text-white/60 text-sm mt-1">
              {mode === 'focus' ? 'enfocada' : mode === 'break' ? 'pausa corta' : 'descanso largo'}
            </span>
            {sessions > 0 && <span className="text-white/40 text-xs mt-1">🍅 {sessions} pomodoros</span>}
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-4">
          <button onClick={reset} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <RotateCcw size={20} />
          </button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={toggleRun}
            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors border border-white/30 shadow-xl"
          >
            {running ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </motion.button>
          <button onClick={() => switchMode(mode === 'focus' ? 'break' : 'focus')} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <SkipForward size={20} />
          </button>
        </div>

        {/* Sonidos — activar primero para cumplir política de autoplay */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/40 text-xs">Sonido ambiente</p>
          <div className="flex gap-2">
            {[['rain', '🌧 Lluvia'], ['waves', '🌊 Olas'], ['none', '🔕 Silencio']].map(([s, l]) => (
              <button key={s}
                onClick={() => setSound(s)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${sound === s ? 'bg-white/25 text-white ring-1 ring-white/40' : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
                {l}
              </button>
            ))}
          </div>
          {sound !== 'none' && (
            <p className="text-white/40 text-xs animate-pulse">♪ sonido activo</p>
          )}
        </div>

        {/* Tarea actual */}
        <input
          value={showTask}
          onChange={e => setShowTask(e.target.value)}
          placeholder="¿En qué estás trabajando ahora?"
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-white placeholder:text-white/40 text-sm text-center focus:outline-none focus:border-white/40 transition-colors"
        />

        {/* Frase */}
        <AnimatePresence mode="wait">
          <motion.p
            key={frase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-white/50 text-sm text-center italic max-w-sm leading-relaxed"
          >
            "{frase}"
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Timer, Coffee } from 'lucide-react'
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

function useAudioEngine(enabled) {
  const ctxRef = useRef(null)
  const nodesRef = useRef([])

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return ctxRef.current
  }, [])

  const startRain = useCallback(() => {
    if (!enabled) return
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()

    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 600

    const highpass = ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = 200

    const gain = ctx.createGain()
    gain.gain.value = 0.04

    source.connect(lowpass)
    lowpass.connect(highpass)
    highpass.connect(gain)
    gain.connect(ctx.destination)
    source.start()

    nodesRef.current.push(source, gain)
    return () => { try { source.stop(); gain.disconnect() } catch {} }
  }, [enabled, getCtx])

  const startWaves = useCallback(() => {
    if (!enabled) return
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()

    const oscillator = ctx.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.value = 85

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.1

    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 25

    const gainNode = ctx.createGain()
    gainNode.gain.value = 0.03

    lfo.connect(lfoGain)
    lfoGain.connect(oscillator.frequency)
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    lfo.start()
    oscillator.start()

    nodesRef.current.push(oscillator, lfo)
    return () => { try { oscillator.stop(); lfo.stop() } catch {} }
  }, [enabled, getCtx])

  const stopAll = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.() } catch {} })
    nodesRef.current = []
  }, [])

  return { startRain, startWaves, stopAll }
}

function WaveBackground({ mood }) {
  const waves = [0, 1, 2, 3]
  const colors = {
    focus: 'rgba(12, 74, 110, 0.3)',
    break: 'rgba(249, 168, 212, 0.3)',
    longbreak: 'rgba(139, 92, 246, 0.3)',
  }
  const color = colors[mood] || colors.focus

  return (
    <div className="absolute inset-0 overflow-hidden">
      {waves.map(i => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 rounded-full opacity-30"
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
  const [mode, setMode] = useState('focus') // focus | break | longbreak
  const [timeLeft, setTimeLeft] = useState(POMODORO)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [sound, setSound] = useState('rain') // rain | waves | none
  const [frase, setFrase] = useState(FRASES[0])
  const [showTask, setShowTask] = useState('')
  const intervalRef = useRef(null)
  const stopAudioRef = useRef(null)
  const { startRain, startWaves, stopAll } = useAudioEngine(sound !== 'none')

  const totalTime = mode === 'focus' ? POMODORO : mode === 'break' ? SHORT_BREAK : LONG_BREAK

  useEffect(() => {
    setFrase(FRASES[Math.floor(Math.random() * FRASES.length)])
  }, [mode])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setRunning(false)
            clearInterval(intervalRef.current)
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

  useEffect(() => {
    if (running && sound !== 'none') {
      if (stopAudioRef.current) { stopAll(); stopAudioRef.current = null }
      if (sound === 'rain') stopAudioRef.current = startRain()
      else if (sound === 'waves') stopAudioRef.current = startWaves()
    } else {
      stopAll()
      stopAudioRef.current = null
    }
    return () => { stopAll() }
  }, [running, sound])

  const switchMode = (m) => {
    setMode(m)
    setTimeLeft(m === 'focus' ? POMODORO : m === 'break' ? SHORT_BREAK : LONG_BREAK)
    setRunning(false)
  }

  const reset = () => { setTimeLeft(totalTime); setRunning(false) }

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

      {/* Particles */}
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
        {/* Mode tabs */}
        <div className="flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-1 gap-1">
          {[['focus', '🎯 Focus'], ['break', '☕ Pausa'], ['longbreak', '🌙 Descanso']].map(([m, l]) => (
            <button key={m} onClick={() => switchMode(m)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all text-white ${mode === m ? 'bg-white/20' : 'hover:bg-white/10 opacity-70'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className="relative">
          <svg width={240} height={240} className="-rotate-90">
            <circle cx={120} cy={120} r={108} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
            <motion.circle
              cx={120} cy={120} r={108}
              fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 108}
              strokeDashoffset={2 * Math.PI * 108 * (1 - progress)}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-6xl font-bold text-white tabular-nums">{mm}:{ss}</span>
            <span className="text-white/60 text-sm mt-1 capitalize">{mode === 'focus' ? 'enfocada' : mode === 'break' ? 'pausa corta' : 'descanso'}</span>
            {sessions > 0 && <span className="text-white/40 text-xs mt-1">🍅 {sessions} pomodoros</span>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={reset} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <RotateCcw size={20} />
          </button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setRunning(!running)}
            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors border border-white/30 shadow-xl"
          >
            {running ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </motion.button>
          <button onClick={() => switchMode(mode === 'focus' ? 'break' : 'focus')} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <SkipForward size={20} />
          </button>
        </div>

        {/* Sound controls */}
        <div className="flex gap-2">
          {[['rain', '🌧 Lluvia'], ['waves', '🌊 Olas'], ['none', '🔕 Silencio']].map(([s, l]) => (
            <button key={s} onClick={() => setSound(s)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${sound === s ? 'bg-white/25 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Task input */}
        <input
          value={showTask}
          onChange={e => setShowTask(e.target.value)}
          placeholder="¿En qué estás trabajando ahora?"
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-white placeholder:text-white/40 text-sm text-center focus:outline-none focus:border-white/40 transition-colors"
        />

        {/* Frase motivacional */}
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

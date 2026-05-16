import { motion } from 'framer-motion'
import { Trophy, Star, Zap, Target, BookOpen, Brain } from 'lucide-react'
import useAppStore from '../store/useAppStore'

const ALL_STICKERS = [
  { id: 'koi', emoji: '🐟', nombre: 'Koi Dorado', descripcion: 'Completa 5 tareas', requisito: 5, tipo: 'tareas' },
  { id: 'estrella', emoji: '⭐', nombre: 'Estrella Jurídica', descripcion: 'Completa 10 tareas', requisito: 10, tipo: 'tareas' },
  { id: 'luna', emoji: '🌙', nombre: 'Luna de Plata', descripcion: 'Completa 15 tareas', requisito: 15, tipo: 'tareas' },
  { id: 'sakura', emoji: '🌸', nombre: 'Flor Sakura', descripcion: 'Estudia 10 flashcards', requisito: 10, tipo: 'flashcards' },
  { id: 'gatito', emoji: '🐱', nombre: 'Gatito Studioso', descripcion: 'Estudia 20 flashcards', requisito: 20, tipo: 'flashcards' },
  { id: 'concha', emoji: '🐚', nombre: 'Concha Marina', descripcion: 'Completa 20 tareas', requisito: 20, tipo: 'tareas' },
  { id: 'nube', emoji: '☁️', nombre: 'Nubecita Rosa', descripcion: 'Estudia 30 flashcards', requisito: 30, tipo: 'flashcards' },
  { id: 'ola', emoji: '🌊', nombre: 'Ola Perfecta', descripcion: 'Completa 25 tareas', requisito: 25, tipo: 'tareas' },
  { id: 'pez', emoji: '🐠', nombre: 'Pez Tropical', descripcion: 'Completa 30 tareas', requisito: 30, tipo: 'tareas' },
  { id: 'corazon', emoji: '💝', nombre: 'Corazón de Derecho', descripcion: 'Completa 50 tareas', requisito: 50, tipo: 'tareas' },
]

const NIVELES = [
  { min: 0, max: 99, nombre: 'Estudiante', emoji: '📚', color: 'from-slate-400 to-slate-500' },
  { min: 100, max: 299, nombre: 'Practicante', emoji: '⚖️', color: 'from-sky-400 to-sky-500' },
  { min: 300, max: 599, nombre: 'Abogada Junior', emoji: '🏛️', color: 'from-violet-400 to-violet-500' },
  { min: 600, max: 999, nombre: 'Abogada', emoji: '🎓', color: 'from-pink-400 to-pink-500' },
  { min: 1000, max: Infinity, nombre: 'Abogada Magistra', emoji: '✨', color: 'from-amber-400 to-orange-400' },
]

function getNivel(puntos) {
  return NIVELES.find(n => puntos >= n.min && puntos <= n.max) || NIVELES[0]
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } } }

export default function Recompensas() {
  const { recompensas, tareas, flashcards } = useAppStore()
  const { stickers, puntos, racha, tareasCompletadas, flashcardsEstudiadas } = recompensas

  const nivel = getNivel(puntos)
  const nextNivel = NIVELES[NIVELES.indexOf(nivel) + 1]
  const progressToNext = nextNivel ? (puntos - nivel.min) / (nextNivel.min - nivel.min) : 1

  const stats = [
    { icon: Target, label: 'Tareas completadas', value: tareasCompletadas, color: 'bg-pink-100 text-pink-700' },
    { icon: Brain, label: 'Flashcards estudiadas', value: flashcardsEstudiadas, color: 'bg-violet-100 text-violet-700' },
    { icon: Zap, label: 'Días de racha', value: racha, color: 'bg-amber-100 text-amber-700' },
    { icon: Star, label: 'Stickers desbloqueados', value: stickers.length, color: 'bg-sky-100 text-sky-700' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-marea-ocean">Recompensas</h1>
        <p className="text-slate-500 text-sm mt-1">Tu progreso y colección de logros</p>
      </div>

      {/* Nivel card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${nivel.color} rounded-3xl p-6 text-white mb-6 relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute text-white text-3xl" style={{ left: `${i * 13}%`, top: `${(i * 17) % 80}%`, opacity: 0.3 }}>✦</div>
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{nivel.emoji}</span>
            <div>
              <p className="text-sm font-medium opacity-80">Nivel actual</p>
              <p className="font-display text-2xl font-bold">{nivel.nombre}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm opacity-80">Puntos totales</p>
              <p className="font-display text-3xl font-bold">{puntos}</p>
            </div>
          </div>

          {nextNivel && (
            <div>
              <div className="flex justify-between text-xs opacity-80 mb-1.5">
                <span>Hacia: {nextNivel.nombre}</span>
                <span>{puntos}/{nextNivel.min} pts</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/70 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 text-center"
          >
            <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} />
            </div>
            <p className="font-display text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Sticker collection */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl font-semibold text-marea-ocean mb-5">Colección de stickers</h2>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-4 sm:grid-cols-5 gap-4"
        >
          {ALL_STICKERS.map(s => {
            const unlocked = stickers.includes(s.id)
            return (
              <motion.div
                key={s.id}
                variants={item}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${unlocked ? 'glass-card-pink' : 'bg-slate-50 opacity-40'}`}
              >
                <motion.span
                  className="text-3xl"
                  animate={unlocked ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {unlocked ? s.emoji : '🔒'}
                </motion.span>
                <p className="text-xs font-medium text-slate-700 text-center leading-tight">{s.nombre}</p>
                <p className="text-xs text-slate-400 text-center leading-tight">{s.descripcion}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Tips */}
      <div className="mt-6 glass-card p-5">
        <h3 className="font-display text-lg font-semibold text-marea-ocean mb-3">¿Cómo ganar puntos?</h3>
        <div className="space-y-2">
          {[
            ['✅', 'Completar tareas', '+10 puntos'],
            ['🧠', 'Estudiar flashcards', '+5 puntos'],
            ['🎯', 'Completar sesión Focus', '+15 puntos'],
            ['📅', 'Marcar interrogación realizada', '+20 puntos'],
          ].map(([emoji, label, pts]) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-pink-50 last:border-0">
              <div className="flex items-center gap-2">
                <span>{emoji}</span>
                <span className="text-sm text-slate-600">{label}</span>
              </div>
              <span className="text-sm font-bold text-pink-500">{pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import { format, isToday, isTomorrow, parseISO, isAfter, isBefore, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckSquare, Users, BookOpen, GraduationCap, Zap, TrendingUp, Clock } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import OceanMood from '../components/ui/OceanMood'
import Badge from '../components/ui/Badge'
import RemindersWidget from '../components/ui/RemindersWidget'
import { useNavigate } from 'react-router-dom'

const greetings = [
  'Buenos días', 'Buenas tardes', 'Buenas noches',
]
function getGreeting() {
  const h = new Date().getHours()
  if (h < 13) return greetings[0]
  if (h < 20) return greetings[1]
  return greetings[2]
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 24 } },
}

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2, boxShadow: '0 16px 48px rgba(12,74,110,0.10)' }}
      onClick={onClick}
      className="glass-card p-5 cursor-pointer group"
    >
      <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center mb-3`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-display font-bold text-marea-ocean">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </motion.div>
  )
}

function TaskRow({ tarea, alumnoNombre }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-pink-50 last:border-0">
      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
        tarea.prioridad === 'alta' ? 'bg-red-400' : tarea.prioridad === 'media' ? 'bg-orange-400' : 'bg-green-400'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{tarea.titulo}</p>
        {tarea.fechaLimite && (
          <p className="text-xs text-slate-400 mt-0.5">
            {isToday(parseISO(tarea.fechaLimite)) ? 'Hoy' : isTomorrow(parseISO(tarea.fechaLimite)) ? 'Mañana' : format(parseISO(tarea.fechaLimite), 'd MMM', { locale: es })}
          </p>
        )}
      </div>
      <Badge variant="gray" className="flex-shrink-0">{tarea.categoria}</Badge>
    </div>
  )
}

export default function Dashboard() {
  const { config, tareas, interrogaciones, alumnos, lecturas, recompensas } = useAppStore()
  const navigate = useNavigate()
  const today = new Date()

  const tareasHoy = tareas.filter(t => !t.completada && t.fechaLimite && isToday(parseISO(t.fechaLimite)))
  const tareasPendientes = tareas.filter(t => !t.completada)
  const proxIntgs = interrogaciones
    .filter(i => i.estado === 'pendiente' && isAfter(parseISO(i.fecha), today))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 3)
  const lecturasActivas = lecturas.filter(l => l.estado === 'leyendo')
  const tareasCompletadasHoy = tareas.filter(t => t.completada).length
  const totalTareas = tareas.length
  const progreso = totalTareas ? Math.round((tareasCompletadasHoy / totalTareas) * 100) : 0

  const nombre = config.userName || 'Valentina'
  const fechaHoy = format(today, "EEEE d 'de' MMMM", { locale: es })

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <p className="text-sm text-slate-400 font-medium capitalize mb-1">{fechaHoy}</p>
        <h1 className="font-display text-4xl font-bold text-marea-ocean">
          {getGreeting()}, <span className="text-gradient-pink">{nombre}</span> ✦
        </h1>
        <p className="text-slate-500 mt-2 text-base">
          {tareasHoy.length === 0
            ? 'No tienes tareas urgentes para hoy. Un buen día para avanzar en lo importante.'
            : `Tienes ${tareasHoy.length} tarea${tareasHoy.length > 1 ? 's' : ''} para hoy. ¡Tú puedes!`}
        </p>
      </motion.div>

      {/* Reminders full widget */}
      <RemindersWidget className="mb-6" />

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={CheckSquare} label="Pendientes" value={tareasPendientes.length} color="bg-gradient-to-br from-pink-400 to-pink-500" onClick={() => navigate('/tareas')} />
          <StatCard icon={Users} label="Interrogaciones" value={proxIntgs.length} color="bg-gradient-to-br from-marea-ocean to-marea-mid" onClick={() => navigate('/interrogaciones')} />
          <StatCard icon={BookOpen} label="Leyendo" value={lecturasActivas.length} color="bg-gradient-to-br from-violet-400 to-violet-500" onClick={() => navigate('/magister')} />
          <StatCard icon={Zap} label="Puntos" value={recompensas.puntos} color="bg-gradient-to-br from-amber-400 to-orange-400" onClick={() => navigate('/recompensas')} />
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Ocean Mood + Progreso */}
          <motion.div variants={item} className="md:col-span-1 space-y-4">
            <OceanMood pendingCount={tareasPendientes.length} className="w-full" />

            {/* Racha */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp size={16} className="text-pink-500" />
                <span className="text-sm font-semibold text-slate-700">Progreso semanal</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">Tareas completadas</span>
                <span className="text-xs font-bold text-marea-ocean">{progreso}%</span>
              </div>
              <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progreso}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-sm font-bold text-slate-700">{recompensas.racha} días</p>
                  <p className="text-xs text-slate-400">racha activa</p>
                </div>
              </div>
            </div>

            {/* Stickers ganados */}
            <div className="glass-card p-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">✨ Tu colección</p>
              <div className="flex flex-wrap gap-2">
                {recompensas.stickers.map((s, i) => (
                  <motion.span
                    key={s}
                    className="text-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.06, type: 'spring' }}
                  >
                    {s === 'koi' ? '🐟' : s === 'estrella' ? '⭐' : s === 'luna' ? '🌙' : s === 'sakura' ? '🌸' : s === 'gatito' ? '🐱' : s === 'concha' ? '🐚' : s === 'nube' ? '☁️' : '✨'}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tareas hoy + próximas */}
          <motion.div variants={item} className="md:col-span-2 space-y-4">

            {/* Tareas de hoy */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-marea-ocean">Tareas de hoy</h2>
                <button onClick={() => navigate('/tareas')} className="text-xs text-pink-500 hover:text-pink-600 font-medium">Ver todas →</button>
              </div>
              {tareasHoy.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-3xl">🌊</span>
                  <p className="text-sm text-slate-400 mt-2">Sin tareas urgentes para hoy</p>
                </div>
              ) : (
                tareasHoy.map(t => <TaskRow key={t.id} tarea={t} />)
              )}

              {/* Próximas tareas */}
              {tareasPendientes.filter(t => t.fechaLimite && !isToday(parseISO(t.fechaLimite))).slice(0, 3).map(t => (
                <TaskRow key={t.id} tarea={t} />
              ))}
            </div>

            {/* Próximas interrogaciones */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-marea-ocean">Próximas interrogaciones</h2>
                <button onClick={() => navigate('/interrogaciones')} className="text-xs text-pink-500 hover:text-pink-600 font-medium">Ver agenda →</button>
              </div>
              {proxIntgs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Sin interrogaciones próximas 🌸</p>
              ) : (
                <div className="space-y-3">
                  {proxIntgs.map(int => {
                    const alumno = alumnos.find(a => a.id === int.alumnoId)
                    return (
                      <div key={int.id} className="flex items-center gap-3 p-3 bg-pink-50/60 rounded-2xl">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center text-sm font-bold text-pink-700">
                          {alumno?.nombre?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{alumno?.nombre || 'Alumno desconocido'}</p>
                          <p className="text-xs text-slate-400">{alumno?.ramo} · {int.hora}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-marea-ocean">
                            {isToday(parseISO(int.fecha)) ? 'Hoy' : isTomorrow(parseISO(int.fecha)) ? 'Mañana' : format(parseISO(int.fecha), 'd MMM', { locale: es })}
                          </p>
                          <Badge type="estado">{int.estado}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Lecturas activas */}
            {lecturasActivas.length > 0 && (
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold text-marea-ocean">Leyendo ahora</h2>
                  <button onClick={() => navigate('/magister')} className="text-xs text-pink-500 hover:text-pink-600 font-medium">Ver magíster →</button>
                </div>
                <div className="space-y-3">
                  {lecturasActivas.slice(0, 2).map(l => {
                    const pct = l.paginas ? Math.round((l.paginasLeidas / l.paginas) * 100) : 0
                    return (
                      <div key={l.id} className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-200 to-violet-300 flex items-center justify-center text-sm">📚</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{l.titulo}</p>
                          <p className="text-xs text-slate-400">{l.autor}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1.5 bg-violet-100 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-violet-600 font-medium">{pct}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

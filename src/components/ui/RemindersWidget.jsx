import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO, isToday, isTomorrow, isPast, isAfter, isBefore, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertTriangle, Clock, BookOpen, Calendar, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'

const PRIORIDAD_ORDER = { urgente: 0, alta: 1, media: 2, baja: 3 }

function buildReminders(tareas, interrogaciones, timeline, lecturas) {
  const reminders = []
  const hoy = new Date()
  const en48h = addDays(hoy, 2)
  const en7d = addDays(hoy, 7)

  // Tareas vencidas (pasadas y no completadas)
  const vencidas = tareas.filter(t => !t.completada && t.fechaLimite && isPast(parseISO(t.fechaLimite)) && !isToday(parseISO(t.fechaLimite)))
  if (vencidas.length > 0) {
    reminders.push({ id: 'vencidas', tipo: 'urgente', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 border-red-200', msg: `${vencidas.length} tarea${vencidas.length > 1 ? 's' : ''} vencida${vencidas.length > 1 ? 's' : ''} sin completar`, link: '/tareas' })
  }

  // Tareas urgentes de hoy
  const urgentesHoy = tareas.filter(t => !t.completada && t.prioridad === 'urgente')
  if (urgentesHoy.length > 0) {
    reminders.push({ id: 'urgentes', tipo: 'urgente', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', msg: `${urgentesHoy.length} tarea${urgentesHoy.length > 1 ? 's' : ''} con prioridad urgente`, link: '/tareas' })
  }

  // Tareas que vencen hoy
  const hoyTareas = tareas.filter(t => !t.completada && t.fechaLimite && isToday(parseISO(t.fechaLimite)))
  if (hoyTareas.length > 0) {
    reminders.push({ id: 'hoy-tareas', tipo: 'alta', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200', msg: `${hoyTareas.length} tarea${hoyTareas.length > 1 ? 's' : ''} vence${hoyTareas.length === 1 ? '' : 'n'} hoy`, link: '/tareas' })
  }

  // Interrogaciones en las próximas 48h
  const intProximas = interrogaciones.filter(i => {
    if (i.estado !== 'pendiente' || !i.fecha) return false
    const d = parseISO(i.fecha)
    return isAfter(d, new Date(hoy.getTime() - 60000)) && isBefore(d, en48h)
  })
  intProximas.forEach(i => {
    let cuándo = isToday(parseISO(i.fecha)) ? 'hoy' : 'mañana'
    reminders.push({ id: `int-${i.id}`, tipo: 'alta', icon: Calendar, color: 'text-sky-500', bg: 'bg-sky-50 border-sky-200', msg: `Interrogación ${cuándo} a las ${i.hora}`, link: '/interrogaciones' })
  })

  // Timeline próximos 7 días
  const tlProximo = timeline.filter(t => !t.completado && t.fecha && isAfter(parseISO(t.fecha), hoy) && isBefore(parseISO(t.fecha), en7d))
  tlProximo.slice(0, 2).forEach(t => {
    let fechaLabel
    try { fechaLabel = format(parseISO(t.fecha), "d 'de' MMMM", { locale: es }) } catch { fechaLabel = t.fecha }
    reminders.push({ id: `tl-${t.id}`, tipo: 'media', icon: BookOpen, color: 'text-violet-500', bg: 'bg-violet-50 border-violet-200', msg: `Magíster: "${t.titulo}" — ${fechaLabel}`, link: '/magister' })
  })

  // Lecturas alta prioridad sin empezar
  const lecturasPendientes = lecturas.filter(l => l.prioridad === 'alta' && l.estado === 'pendiente')
  if (lecturasPendientes.length > 0) {
    reminders.push({ id: 'lecturas', tipo: 'baja', icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-50/60 border-violet-100', msg: `${lecturasPendientes.length} lectura${lecturasPendientes.length > 1 ? 's' : ''} de alta prioridad sin empezar`, link: '/magister' })
  }

  return reminders.sort((a, b) => (PRIORIDAD_ORDER[a.tipo] ?? 4) - (PRIORIDAD_ORDER[b.tipo] ?? 4))
}

const tipoBadge = {
  urgente: 'bg-red-100 text-red-700 border border-red-200',
  alta: 'bg-orange-100 text-orange-700 border border-orange-200',
  media: 'bg-violet-100 text-violet-700 border border-violet-200',
  baja: 'bg-slate-100 text-slate-500 border border-slate-200',
}

export default function RemindersWidget({ compact = false }) {
  const { tareas, interrogaciones, timeline, lecturas } = useAppStore()
  const navigate = useNavigate()

  const reminders = useMemo(
    () => buildReminders(tareas, interrogaciones, timeline, lecturas),
    [tareas, interrogaciones, timeline, lecturas]
  )

  if (reminders.length === 0) return null

  if (compact) {
    // Banner superior compacto (máx 2 urgentes)
    const urgentes = reminders.filter(r => r.tipo === 'urgente').slice(0, 2)
    if (urgentes.length === 0) return null
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-6 py-2 bg-red-50 border-b border-red-200"
      >
        <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
        <div className="flex gap-3 flex-wrap">
          {urgentes.map(r => (
            <button key={r.id} onClick={() => navigate(r.link)} className="text-xs font-medium text-red-600 hover:text-red-700 underline underline-offset-2">
              {r.msg}
            </button>
          ))}
        </div>
      </motion.div>
    )
  }

  // Widget completo para el Dashboard
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center">
          <AlertTriangle size={15} className="text-white" />
        </div>
        <h2 className="font-display text-lg font-semibold text-marea-ocean">Importante hoy</h2>
        <span className="ml-auto text-xs bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium">
          {reminders.length}
        </span>
      </div>

      <div className="space-y-2">
        {reminders.map((r, i) => {
          const Icon = r.icon
          const isUrgente = r.tipo === 'urgente'
          return (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(r.link)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all hover:brightness-95 ${r.bg} ${isUrgente ? 'ring-1 ring-red-300' : ''}`}
            >
              {isUrgente && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  <Icon size={15} className={r.color} />
                </motion.div>
              )}
              {!isUrgente && <Icon size={15} className={`flex-shrink-0 ${r.color}`} />}
              <span className="text-sm text-slate-700 flex-1">{r.msg}</span>
              <span className={`tag text-xs flex-shrink-0 ${tipoBadge[r.tipo]}`}>{r.tipo}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, isToday, isPast, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Check, Trash2, Edit2, Filter, Circle, CheckCircle2 } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'

const PRIORIDADES = ['alta', 'media', 'baja']
const CATEGORIAS = ['trabajo', 'magister', 'interrogaciones', 'personal', 'otro']

const catColors = {
  trabajo: 'bg-sky-100 text-sky-700 border-sky-200',
  magister: 'bg-violet-100 text-violet-700 border-violet-200',
  interrogaciones: 'bg-pink-100 text-pink-700 border-pink-200',
  personal: 'bg-amber-100 text-amber-700 border-amber-200',
  otro: 'bg-slate-100 text-slate-600 border-slate-200',
}

function fechaLabel(fechaStr) {
  if (!fechaStr) return null
  const d = parseISO(fechaStr)
  if (isToday(d)) return { label: 'Hoy', cls: 'text-orange-500 font-semibold' }
  if (isTomorrow(d)) return { label: 'Mañana', cls: 'text-amber-500' }
  if (isPast(d)) return { label: format(d, 'd MMM', { locale: es }), cls: 'text-red-500' }
  return { label: format(d, 'd MMM', { locale: es }), cls: 'text-slate-400' }
}

const emptyTarea = { titulo: '', descripcion: '', prioridad: 'media', categoria: 'trabajo', fechaLimite: '' }

export default function Tareas() {
  const { tareas, addTarea, updateTarea, deleteTarea } = useAppStore()
  const [filter, setFilter] = useState('todo')
  const [catFilter, setCatFilter] = useState('todas')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editTarea, setEditTarea] = useState(null)
  const [form, setForm] = useState(emptyTarea)

  const openModal = (t = null) => {
    setEditTarea(t)
    setForm(t ? { ...t } : emptyTarea)
    setModal(true)
  }

  const save = () => {
    if (!form.titulo.trim()) return
    if (editTarea) updateTarea(editTarea.id, form)
    else addTarea(form)
    setModal(false)
  }

  const toggle = (id, completada) => updateTarea(id, { completada: !completada })

  const filtered = tareas.filter(t => {
    if (filter === 'pendientes' && t.completada) return false
    if (filter === 'completadas' && !t.completada) return false
    if (catFilter !== 'todas' && t.categoria !== catFilter) return false
    if (search && !t.titulo.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    const p = { alta: 0, media: 1, baja: 2 }
    if (a.completada !== b.completada) return a.completada ? 1 : -1
    return (p[a.prioridad] ?? 1) - (p[b.prioridad] ?? 1)
  })

  const pendientes = tareas.filter(t => !t.completada).length
  const completadas = tareas.filter(t => t.completada).length

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-marea-ocean">Tareas</h1>
          <p className="text-slate-500 text-sm mt-1">
            <span className="font-semibold text-pink-600">{pendientes}</span> pendientes · <span className="font-semibold text-emerald-600">{completadas}</span> completadas
          </p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2 text-sm self-start md:self-auto">
          <Plus size={16} /> Nueva tarea
        </button>
      </div>

      {/* Progress bar */}
      {tareas.length > 0 && (
        <div className="glass-card p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Progreso general</span>
            <span className="text-sm font-bold text-marea-ocean">{Math.round((completadas / tareas.length) * 100)}%</span>
          </div>
          <div className="h-2.5 bg-pink-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completadas / tareas.length) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex bg-white/60 border border-pink-100 rounded-2xl p-1 gap-1">
          {[['todo', 'Todas'], ['pendientes', 'Pendientes'], ['completadas', 'Completadas']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === v ? 'bg-pink-500 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['todas', ...CATEGORIAS].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all capitalize border ${catFilter === c ? 'bg-marea-ocean text-white border-marea-ocean' : 'bg-white/60 border-pink-100 text-slate-500'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <motion.div className="space-y-2" layout>
        <AnimatePresence>
          {filtered.map(t => {
            const fecha = fechaLabel(t.fechaLimite)
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                className={`glass-card p-4 flex items-start gap-3 group transition-all ${t.completada ? 'opacity-60' : ''}`}
              >
                <button onClick={() => toggle(t.id, t.completada)} className="mt-0.5 flex-shrink-0 text-pink-400 hover:text-pink-500 transition-colors">
                  {t.completada
                    ? <CheckCircle2 size={20} className="text-emerald-500" />
                    : <Circle size={20} />
                  }
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm leading-snug ${t.completada ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {t.titulo}
                  </p>
                  {t.descripcion && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.descripcion}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-lg border ${catColors[t.categoria] || catColors.otro} capitalize`}>
                      {t.categoria}
                    </span>
                    {t.prioridad === 'alta' && <span className="text-xs text-red-500 font-semibold">↑ Alta</span>}
                    {fecha && <span className={`text-xs ${fecha.cls}`}>{fecha.label}</span>}
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => openModal(t)} className="p-1.5 rounded-xl hover:bg-pink-50 text-slate-400 hover:text-pink-500 transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => deleteTarea(t.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl">✅</span>
            <p className="text-slate-400 mt-3 text-sm">Sin tareas en esta vista</p>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editTarea ? 'Editar tarea' : 'Nueva tarea'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Título *</label>
            <input className="input-field" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="¿Qué tienes que hacer?" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Descripción</label>
            <textarea className="input-field resize-none" rows={2} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Detalles opcionales…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Prioridad</label>
              <select className="input-field" value={form.prioridad} onChange={e => setForm({...form, prioridad: e.target.value})}>
                {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Categoría</label>
              <select className="input-field" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Fecha límite</label>
              <input type="date" className="input-field" value={form.fechaLimite} onChange={e => setForm({...form, fechaLimite: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={save} className="btn-primary flex-1">Guardar</button>
            <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

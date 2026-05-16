import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, isAfter, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Search, Edit2, Trash2, Sparkles, User, Calendar, MapPin, ChevronDown, X, Check } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import { generarPreguntasAleatorias, ramosDisponibles } from '../data/preguntas'

const ESTADOS = ['pendiente', 'realizada', 'reprogramada', 'ausente']
const MODALIDADES = ['presencial', 'online', 'híbrida']
const DESEMPEÑOS = ['excelente', 'bueno', 'regular', 'insuficiente']

const estadoColors = {
  pendiente: 'from-amber-400 to-orange-400',
  realizada: 'from-emerald-400 to-green-500',
  reprogramada: 'from-sky-400 to-blue-500',
  ausente: 'from-red-400 to-red-500',
}

function AlumnoCard({ alumno, interrogaciones, onEdit, onDelete, onNuevaInt }) {
  const intAlumno = interrogaciones.filter(i => i.alumnoId === alumno.id)
  const proxima = intAlumno.filter(i => i.estado === 'pendiente').sort((a, b) => a.fecha.localeCompare(b.fecha))[0]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3 }}
      className="glass-card p-5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center text-white font-display font-bold text-lg shadow-petal">
            {alumno.nombre.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">{alumno.nombre}</p>
            <p className="text-xs text-slate-400">{alumno.universidad} · {alumno.año}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(alumno)} className="p-1.5 rounded-xl hover:bg-pink-50 text-slate-400 hover:text-pink-500 transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(alumno.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="lavender">{alumno.ramo}</Badge>
          <Badge variant={alumno.modalidad === 'online' ? 'ocean' : 'pink'}>{alumno.modalidad}</Badge>
        </div>
        {alumno.desempeño && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Desempeño:</span>
            <Badge type="estado">{alumno.desempeño === 'excelente' ? 'completado' : alumno.desempeño === 'bueno' ? 'realizada' : alumno.desempeño === 'regular' ? 'reprogramada' : 'ausente'}</Badge>
          </div>
        )}
      </div>

      {proxima && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 mb-3">
          <p className="text-xs font-medium text-amber-700">
            📅 Próxima: {format(parseISO(proxima.fecha), "d 'de' MMMM", { locale: es })} · {proxima.hora}
          </p>
        </div>
      )}

      {alumno.observaciones && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{alumno.observaciones}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onNuevaInt(alumno)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-medium transition-colors"
        >
          <Plus size={12} /> Nueva interrogación
        </button>
        <div className="flex items-center justify-center px-2.5 py-2 rounded-xl bg-slate-50 text-xs text-slate-500">
          {intAlumno.length} total
        </div>
      </div>
    </motion.div>
  )
}

function InterrogacionRow({ int, alumno, onEdit, onDelete, onGenerarPreguntas }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div layout className="glass-card overflow-hidden">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-pink-50/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${estadoColors[int.estado] || 'from-gray-300 to-gray-400'}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{alumno?.nombre || 'Alumno'}</p>
          <p className="text-xs text-slate-400">{format(parseISO(int.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })} · {int.hora}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="lavender" className="hidden md:inline-flex">{alumno?.ramo}</Badge>
          <Badge type="estado">{int.estado}</Badge>
          {int.calificacion && (
            <span className="text-sm font-bold text-emerald-600">{int.calificacion}</span>
          )}
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 border-t border-pink-50"
          >
            <div className="pt-3 grid md:grid-cols-2 gap-3">
              {int.temas?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">Temas evaluados</p>
                  <div className="flex flex-wrap gap-1">
                    {int.temas.map(t => <Badge key={t} variant="lavender">{t}</Badge>)}
                  </div>
                </div>
              )}
              {int.sala && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Lugar</p>
                  <p className="text-sm text-slate-600 flex items-center gap-1"><MapPin size={12} className="text-pink-400" />{int.sala}</p>
                </div>
              )}
              {int.observaciones && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Observaciones</p>
                  <p className="text-sm text-slate-600">{int.observaciones}</p>
                </div>
              )}
              {int.preguntas?.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Preguntas generadas</p>
                  <ul className="space-y-1">
                    {int.preguntas.map((p, i) => (
                      <li key={i} className="text-sm text-slate-600 flex gap-2">
                        <span className="text-pink-400 font-bold">{i + 1}.</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); onGenerarPreguntas(int, alumno?.ramo) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-600 text-xs font-medium transition-colors"
              >
                <Sparkles size={12} /> Generar preguntas
              </button>
              <button onClick={(e) => { e.stopPropagation(); onEdit(int) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-medium transition-colors">
                <Edit2 size={12} /> Editar
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(int.id) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-xs font-medium transition-colors">
                <Trash2 size={12} /> Eliminar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const emptyAlumno = { nombre: '', rut: '', ramo: 'Derecho Civil', universidad: 'PUCV', carrera: 'Derecho', año: '1°', email: '', modalidad: 'presencial', observaciones: '', desempeño: 'bueno', estado: 'pendiente' }
const emptyInt = { alumnoId: '', fecha: new Date().toISOString().slice(0, 10), hora: '10:00', duracion: 45, temas: [], modalidad: 'presencial', sala: '', estado: 'pendiente', calificacion: '', observaciones: '', preguntas: [] }

export default function Interrogaciones() {
  const { alumnos, interrogaciones, addAlumno, updateAlumno, deleteAlumno, addInterrogacion, updateInterrogacion, deleteInterrogacion } = useAppStore()

  const [view, setView] = useState('alumnos') // alumnos | agenda
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')

  const [modalAlumno, setModalAlumno] = useState(false)
  const [modalInt, setModalInt] = useState(false)
  const [editAlumno, setEditAlumno] = useState(null)
  const [editInt, setEditInt] = useState(null)
  const [formAlumno, setFormAlumno] = useState(emptyAlumno)
  const [formInt, setFormInt] = useState(emptyInt)
  const [temasInput, setTemasInput] = useState('')

  const openAlumno = (a = null) => {
    setEditAlumno(a)
    setFormAlumno(a ? { ...a } : emptyAlumno)
    setModalAlumno(true)
  }

  const openInt = (i = null, alumno = null) => {
    setEditInt(i)
    const base = i ? { ...i, calificacion: i.calificacion || '' } : { ...emptyInt, alumnoId: alumno?.id || '' }
    setFormInt(base)
    setTemasInput(base.temas?.join(', ') || '')
    setModalInt(true)
  }

  const saveAlumno = () => {
    if (!formAlumno.nombre.trim()) return
    if (editAlumno) updateAlumno(editAlumno.id, formAlumno)
    else addAlumno(formAlumno)
    setModalAlumno(false)
  }

  const saveInt = () => {
    if (!formInt.alumnoId || !formInt.fecha) return
    const temas = temasInput.split(',').map(s => s.trim()).filter(Boolean)
    const data = { ...formInt, temas, calificacion: formInt.calificacion ? parseFloat(formInt.calificacion) : null }
    if (editInt) updateInterrogacion(editInt.id, data)
    else addInterrogacion(data)
    setModalInt(false)
  }

  const handleGenerarPreguntas = (int, ramo) => {
    const preguntas = generarPreguntasAleatorias(ramo || 'Derecho Administrativo', 5)
    updateInterrogacion(int.id, { preguntas })
  }

  const filteredAlumnos = alumnos.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.ramo.toLowerCase().includes(search.toLowerCase())
  )

  const filteredInts = interrogaciones
    .filter(i => filterEstado === 'todos' || i.estado === filterEstado)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-marea-ocean">Interrogaciones</h1>
          <p className="text-slate-500 text-sm mt-1">{alumnos.length} alumnos · {interrogaciones.length} sesiones registradas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openAlumno()} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Nuevo alumno
          </button>
          <button onClick={() => openInt()} className="btn-ghost flex items-center gap-2 text-sm">
            <Calendar size={16} /> Agendar
          </button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex bg-white/60 border border-pink-100 rounded-2xl p-1 gap-1">
          {['alumnos', 'agenda'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${view === v ? 'bg-pink-500 text-white shadow-petal' : 'text-slate-500 hover:text-slate-700'}`}>
              {v}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar alumno o ramo…" className="input-field pl-9 py-2 text-sm" />
        </div>

        {view === 'agenda' && (
          <div className="flex gap-1.5 flex-wrap">
            {['todos', ...ESTADOS].map(e => (
              <button key={e} onClick={() => setFilterEstado(e)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all capitalize ${filterEstado === e ? 'bg-pink-500 text-white' : 'bg-white/60 border border-pink-100 text-slate-500'}`}>
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'alumnos' ? (
          <motion.div key="alumnos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlumnos.map(a => (
              <AlumnoCard key={a.id} alumno={a} interrogaciones={interrogaciones}
                onEdit={openAlumno} onDelete={deleteAlumno} onNuevaInt={(al) => openInt(null, al)} />
            ))}
            {filteredAlumnos.length === 0 && (
              <div className="col-span-full text-center py-16">
                <span className="text-5xl">👩‍🎓</span>
                <p className="text-slate-400 mt-3">No hay alumnos registrados</p>
                <button onClick={() => openAlumno()} className="btn-primary mt-4 text-sm">Agregar primer alumno</button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="agenda" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3">
            {filteredInts.map(i => (
              <InterrogacionRow key={i.id} int={i} alumno={alumnos.find(a => a.id === i.alumnoId)}
                onEdit={openInt} onDelete={deleteInterrogacion} onGenerarPreguntas={handleGenerarPreguntas} />
            ))}
            {filteredInts.length === 0 && (
              <div className="text-center py-16">
                <span className="text-5xl">📅</span>
                <p className="text-slate-400 mt-3">Sin interrogaciones agendadas</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Alumno */}
      <Modal open={modalAlumno} onClose={() => setModalAlumno(false)} title={editAlumno ? 'Editar alumno' : 'Nuevo alumno'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre completo *</label>
              <input className="input-field" value={formAlumno.nombre} onChange={e => setFormAlumno({...formAlumno, nombre: e.target.value})} placeholder="Nombre y apellidos" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">RUT</label>
              <input className="input-field" value={formAlumno.rut} onChange={e => setFormAlumno({...formAlumno, rut: e.target.value})} placeholder="12.345.678-9" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Ramo</label>
              <select className="input-field" value={formAlumno.ramo} onChange={e => setFormAlumno({...formAlumno, ramo: e.target.value})}>
                {ramosDisponibles.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Universidad</label>
              <input className="input-field" value={formAlumno.universidad} onChange={e => setFormAlumno({...formAlumno, universidad: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Año</label>
              <select className="input-field" value={formAlumno.año} onChange={e => setFormAlumno({...formAlumno, año: e.target.value})}>
                {['1°','2°','3°','4°','5°'].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Modalidad</label>
              <select className="input-field" value={formAlumno.modalidad} onChange={e => setFormAlumno({...formAlumno, modalidad: e.target.value})}>
                {MODALIDADES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Desempeño</label>
              <select className="input-field" value={formAlumno.desempeño} onChange={e => setFormAlumno({...formAlumno, desempeño: e.target.value})}>
                {DESEMPEÑOS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Observaciones</label>
              <textarea className="input-field resize-none" rows={3} value={formAlumno.observaciones} onChange={e => setFormAlumno({...formAlumno, observaciones: e.target.value})} placeholder="Notas sobre el alumno…" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={saveAlumno} className="btn-primary flex-1">Guardar</button>
            <button onClick={() => setModalAlumno(false)} className="btn-ghost flex-1">Cancelar</button>
          </div>
        </div>
      </Modal>

      {/* Modal Interrogación */}
      <Modal open={modalInt} onClose={() => setModalInt(false)} title={editInt ? 'Editar interrogación' : 'Agendar interrogación'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Alumno *</label>
              <select className="input-field" value={formInt.alumnoId} onChange={e => setFormInt({...formInt, alumnoId: e.target.value})}>
                <option value="">Seleccionar alumno…</option>
                {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre} — {a.ramo}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Fecha *</label>
              <input type="date" className="input-field" value={formInt.fecha} onChange={e => setFormInt({...formInt, fecha: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Hora</label>
              <input type="time" className="input-field" value={formInt.hora} onChange={e => setFormInt({...formInt, hora: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Estado</label>
              <select className="input-field" value={formInt.estado} onChange={e => setFormInt({...formInt, estado: e.target.value})}>
                {ESTADOS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Calificación</label>
              <input type="number" min="1" max="7" step="0.1" className="input-field" value={formInt.calificacion} onChange={e => setFormInt({...formInt, calificacion: e.target.value})} placeholder="1.0 — 7.0" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Modalidad</label>
              <select className="input-field" value={formInt.modalidad} onChange={e => setFormInt({...formInt, modalidad: e.target.value})}>
                {MODALIDADES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Lugar / Sala</label>
              <input className="input-field" value={formInt.sala} onChange={e => setFormInt({...formInt, sala: e.target.value})} placeholder="Sala 302 / Zoom" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Temas (separar con coma)</label>
              <input className="input-field" value={temasInput} onChange={e => setTemasInput(e.target.value)} placeholder="Responsabilidad contractual, Actos jurídicos" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Observaciones</label>
              <textarea className="input-field resize-none" rows={2} value={formInt.observaciones} onChange={e => setFormInt({...formInt, observaciones: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={saveInt} className="btn-primary flex-1">Guardar</button>
            <button onClick={() => setModalInt(false)} className="btn-ghost flex-1">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, BookOpen, Lightbulb, Calendar, Users, Edit2, Trash2, ChevronDown } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'

const TABS = [
  { id: 'lecturas', label: 'Lecturas', icon: BookOpen },
  { id: 'investigacion', label: 'Investigación', icon: Lightbulb },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'autores', label: 'Autores', icon: Users },
]

const estadoLecturaColor = { pendiente: 'from-gray-300 to-gray-400', leyendo: 'from-blue-400 to-blue-500', completado: 'from-emerald-400 to-green-500' }
const tipoTimeline = { entrega: { color: 'bg-pink-100 text-pink-700 border-pink-200', icon: '📄' }, seminario: { color: 'bg-sky-100 text-sky-700 border-sky-200', icon: '🎤' }, exposicion: { color: 'bg-violet-100 text-violet-700 border-violet-200', icon: '🎓' } }

const emptyLectura = { titulo: '', autor: '', tipo: 'libro', año: '', paginas: '', paginasLeidas: 0, estado: 'pendiente', prioridad: 'media', tags: [], notas: '' }
const emptyTimeline = { titulo: '', fecha: '', tipo: 'entrega', descripcion: '', completado: false }
const emptyAutor = { nombre: '', nacionalidad: '', especialidad: '', conceptosClave: [], obras: [], relevancia: 'media', notas: '' }

export default function Magister() {
  const { lecturas, addLectura, updateLectura, deleteLectura, timeline, addTimeline, updateTimeline, deleteTimeline, autores, addAutor, updateAutor, deleteAutor } = useAppStore()
  const [tab, setTab] = useState('lecturas')
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({})
  const [tagsInput, setTagsInput] = useState('')
  const [conceptosInput, setConceptosInput] = useState('')
  const [obrasInput, setObrasInput] = useState('')

  const openModal = (type, item = null) => {
    setEditItem(item ? { ...item, _type: type } : { _type: type })
    if (type === 'lecturas') setForm(item ? { ...item } : emptyLectura)
    if (type === 'timeline') setForm(item ? { ...item } : emptyTimeline)
    if (type === 'autores') {
      setForm(item ? { ...item } : emptyAutor)
      setConceptosInput(item?.conceptosClave?.join(', ') || '')
      setObrasInput(item?.obras?.join('\n') || '')
    }
    setTagsInput(item?.tags?.join(', ') || '')
    setModal(true)
  }

  const save = () => {
    const type = editItem?._type
    const id = editItem?.id
    if (type === 'lecturas') {
      const data = { ...form, paginas: parseInt(form.paginas) || 0, paginasLeidas: parseInt(form.paginasLeidas) || 0, tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean) }
      if (id) updateLectura(id, data); else addLectura(data)
    }
    if (type === 'timeline') {
      if (id) updateTimeline(id, form); else addTimeline(form)
    }
    if (type === 'autores') {
      const data = { ...form, conceptosClave: conceptosInput.split(',').map(s => s.trim()).filter(Boolean), obras: obrasInput.split('\n').map(s => s.trim()).filter(Boolean) }
      if (id) updateAutor(id, data); else addAutor(data)
    }
    setModal(false)
  }

  const sortedTimeline = [...timeline].sort((a, b) => a.fecha.localeCompare(b.fecha))
  const pendientesTimeline = sortedTimeline.filter(t => !t.completado)
  const completadosTimeline = sortedTimeline.filter(t => t.completado)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-marea-ocean">Magíster</h1>
          <p className="text-slate-500 text-sm mt-1">{lecturas.filter(l => l.estado === 'leyendo').length} lecturas activas · {timeline.filter(t => !t.completado).length} entregas pendientes</p>
        </div>
        <button onClick={() => openModal(tab)} className="btn-primary flex items-center gap-2 text-sm self-start">
          <Plus size={16} /> Agregar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/60 border border-pink-100 rounded-2xl p-1 gap-1 mb-6 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === id ? 'bg-pink-500 text-white shadow-petal' : 'text-slate-500 hover:text-slate-700'}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* LECTURAS */}
        {tab === 'lecturas' && (
          <motion.div key="lecturas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lecturas.map(l => {
                const pct = l.paginas ? Math.round((l.paginasLeidas / l.paginas) * 100) : 0
                return (
                  <motion.div key={l.id} layout whileHover={{ y: -2 }} className="glass-card p-5 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-1.5 h-12 rounded-full bg-gradient-to-b ${estadoLecturaColor[l.estado]}`} />
                      <div className="flex-1 ml-3">
                        <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{l.titulo}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{l.autor} · {l.año}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal('lecturas', l)} className="p-1 rounded-lg hover:bg-pink-50 text-slate-400 hover:text-pink-500"><Edit2 size={12} /></button>
                        <button onClick={() => deleteLectura(l.id)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap mb-3">
                      <Badge variant={l.estado === 'completado' ? 'sage' : l.estado === 'leyendo' ? 'ocean' : 'gray'}>{l.estado}</Badge>
                      <Badge variant="gray">{l.tipo}</Badge>
                      {l.prioridad === 'alta' && <Badge variant="coral">alta prioridad</Badge>}
                    </div>

                    {l.paginas > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-slate-400">{l.paginasLeidas}/{l.paginas} págs.</span>
                          <span className="text-xs font-bold text-marea-ocean">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-400 to-blue-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}

                    {l.notas && <p className="text-xs text-slate-400 line-clamp-2 italic">"{l.notas}"</p>}

                    {l.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {l.tags.slice(0, 3).map(t => <span key={t} className="text-xs text-violet-500 bg-violet-50 px-2 py-0.5 rounded-lg">#{t}</span>)}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* INVESTIGACIÓN */}
        {tab === 'investigacion' && (
          <motion.div key="investigacion" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-6">
              <h2 className="font-display text-xl font-semibold text-marea-ocean mb-4">Investigación activa</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-pink-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-pink-600 uppercase tracking-wide mb-2">🎯 Hipótesis</p>
                  <p className="text-sm text-slate-700">La ausencia de un estatuto general de la potestad sancionatoria administrativa en Chile genera incertidumbre jurídica que vulnera el principio de legalidad y proporcionalidad.</p>
                </div>
                <div className="bg-violet-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-2">📌 Problema</p>
                  <p className="text-sm text-slate-700">Chile carece de una regulación sistematizada de la potestad sancionatoria de la Administración del Estado, a diferencia de España con la Ley 40/2015.</p>
                </div>
                <div className="bg-sky-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-sky-600 uppercase tracking-wide mb-2">🔬 Metodología</p>
                  <p className="text-sm text-slate-700">Análisis dogmático-jurídico. Derecho comparado (España). Revisión de jurisprudencia Contraloría, TC y Corte Suprema. Análisis de legislación sectorial.</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">💡 Ideas en desarrollo</p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>· Propuesta de bases de un estatuto general</li>
                    <li>· Análisis del principio de proporcionalidad en SCS</li>
                    <li>· Jurisprudencia del TC en materia sancionatoria</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TIMELINE */}
        {tab === 'timeline' && (
          <motion.div key="timeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="space-y-4">
              {pendientesTimeline.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">Próximas entregas</p>
                  <div className="space-y-3">
                    {pendientesTimeline.map((t, i) => {
                      const cfg = tipoTimeline[t.tipo] || tipoTimeline.entrega
                      return (
                        <motion.div key={t.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="glass-card p-4 flex items-start gap-4 group">
                          <div className="flex flex-col items-center">
                            <span className="text-2xl">{cfg.icon}</span>
                            <div className="w-px flex-1 bg-pink-200 mt-2 min-h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-slate-800 text-sm">{t.titulo}</p>
                              <span className={`tag text-xs border ${cfg.color} flex-shrink-0`}>{t.tipo}</span>
                            </div>
                            {t.fecha && <p className="text-xs font-medium text-marea-ocean mt-1">{format(parseISO(t.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>}
                            {t.descripcion && <p className="text-xs text-slate-400 mt-1">{t.descripcion}</p>}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => updateTimeline(t.id, { completado: true })} className="p-1.5 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-emerald-500"><Plus size={13} /></button>
                            <button onClick={() => openModal('timeline', t)} className="p-1.5 rounded-xl hover:bg-pink-50 text-slate-400 hover:text-pink-500"><Edit2 size={13} /></button>
                            <button onClick={() => deleteTimeline(t.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
              {completadosTimeline.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Completados</p>
                  {completadosTimeline.map(t => (
                    <div key={t.id} className="glass-card p-4 flex items-center gap-3 opacity-60 mb-2">
                      <span className="text-emerald-500">✓</span>
                      <p className="text-sm text-slate-500 line-through">{t.titulo}</p>
                      {t.fecha && <span className="text-xs text-slate-400 ml-auto">{format(parseISO(t.fecha), "d MMM", { locale: es })}</span>}
                    </div>
                  ))}
                </div>
              )}
              {timeline.length === 0 && (
                <div className="text-center py-16">
                  <span className="text-5xl">📅</span>
                  <p className="text-slate-400 mt-3">Sin eventos en el timeline</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AUTORES */}
        {tab === 'autores' && (
          <motion.div key="autores" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {autores.map(a => (
                <motion.div key={a.id} layout whileHover={{ y: -2 }} className="glass-card p-5 group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-marea-ocean to-marea-mid flex items-center justify-center text-white font-bold">
                      {a.nombre.charAt(0)}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal('autores', a)} className="p-1 rounded-lg hover:bg-pink-50 text-slate-400 hover:text-pink-500"><Edit2 size={12} /></button>
                      <button onClick={() => deleteAutor(a.id)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm mt-2">{a.nombre}</p>
                  <p className="text-xs text-slate-400">{a.nacionalidad}</p>
                  <p className="text-xs text-violet-600 font-medium mt-1">{a.especialidad}</p>
                  {a.conceptosClave?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {a.conceptosClave.slice(0, 3).map(c => (
                        <span key={c} className="text-xs bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-lg">{c}</span>
                      ))}
                    </div>
                  )}
                  {a.notas && <p className="text-xs text-slate-400 mt-2 italic line-clamp-2">"{a.notas}"</p>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={
        editItem?._type === 'lecturas' ? (editItem?.id ? 'Editar lectura' : 'Nueva lectura')
        : editItem?._type === 'timeline' ? (editItem?.id ? 'Editar evento' : 'Nuevo evento')
        : editItem?._type === 'autores' ? (editItem?.id ? 'Editar autor' : 'Nuevo autor') : 'Nuevo'
      } size="md">
        {editItem?._type === 'lecturas' && (
          <div className="space-y-3">
            <input className="input-field" value={form.titulo || ''} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Título *" />
            <input className="input-field" value={form.autor || ''} onChange={e => setForm({...form, autor: e.target.value})} placeholder="Autor" />
            <div className="grid grid-cols-3 gap-2">
              <select className="input-field" value={form.tipo || 'libro'} onChange={e => setForm({...form, tipo: e.target.value})}>
                {['libro','paper','jurisprudencia','artículo'].map(t => <option key={t}>{t}</option>)}
              </select>
              <input className="input-field" value={form.año || ''} onChange={e => setForm({...form, año: e.target.value})} placeholder="Año" />
              <select className="input-field" value={form.estado || 'pendiente'} onChange={e => setForm({...form, estado: e.target.value})}>
                {['pendiente','leyendo','completado'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" className="input-field" value={form.paginas || ''} onChange={e => setForm({...form, paginas: e.target.value})} placeholder="Total págs." />
              <input type="number" className="input-field" value={form.paginasLeidas || 0} onChange={e => setForm({...form, paginasLeidas: e.target.value})} placeholder="Leídas" />
            </div>
            <input className="input-field" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Tags (separar con coma)" />
            <textarea className="input-field resize-none" rows={2} value={form.notas || ''} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Notas rápidas…" />
            <div className="flex gap-2">
              <button onClick={save} className="btn-primary flex-1">Guardar</button>
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
            </div>
          </div>
        )}
        {editItem?._type === 'timeline' && (
          <div className="space-y-3">
            <input className="input-field" value={form.titulo || ''} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Título del evento *" />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="input-field" value={form.fecha || ''} onChange={e => setForm({...form, fecha: e.target.value})} />
              <select className="input-field" value={form.tipo || 'entrega'} onChange={e => setForm({...form, tipo: e.target.value})}>
                {['entrega','seminario','exposicion'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <textarea className="input-field resize-none" rows={2} value={form.descripcion || ''} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Descripción…" />
            <div className="flex gap-2">
              <button onClick={save} className="btn-primary flex-1">Guardar</button>
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
            </div>
          </div>
        )}
        {editItem?._type === 'autores' && (
          <div className="space-y-3">
            <input className="input-field" value={form.nombre || ''} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre *" />
            <div className="grid grid-cols-2 gap-2">
              <input className="input-field" value={form.nacionalidad || ''} onChange={e => setForm({...form, nacionalidad: e.target.value})} placeholder="Nacionalidad" />
              <select className="input-field" value={form.relevancia || 'media'} onChange={e => setForm({...form, relevancia: e.target.value})}>
                {['alta','media','baja'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <input className="input-field" value={form.especialidad || ''} onChange={e => setForm({...form, especialidad: e.target.value})} placeholder="Especialidad" />
            <input className="input-field" value={conceptosInput} onChange={e => setConceptosInput(e.target.value)} placeholder="Conceptos clave (separar con coma)" />
            <textarea className="input-field resize-none" rows={2} value={obrasInput} onChange={e => setObrasInput(e.target.value)} placeholder="Obras principales (una por línea)" />
            <textarea className="input-field resize-none" rows={2} value={form.notas || ''} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Notas…" />
            <div className="flex gap-2">
              <button onClick={save} className="btn-primary flex-1">Guardar</button>
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

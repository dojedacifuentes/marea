import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Search, Star, Trash2, X, Hash } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Modal from '../components/ui/Modal'

const NOTE_COLORS = [
  { id: 'pink', bg: 'bg-pink-50', border: 'border-pink-200', title: 'text-pink-700', dot: 'bg-pink-400' },
  { id: 'blue', bg: 'bg-sky-50', border: 'border-sky-200', title: 'text-sky-700', dot: 'bg-sky-400' },
  { id: 'lavender', bg: 'bg-violet-50', border: 'border-violet-200', title: 'text-violet-700', dot: 'bg-violet-400' },
  { id: 'coral', bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-600', dot: 'bg-red-400' },
  { id: 'sage', bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'text-emerald-700', dot: 'bg-emerald-400' },
  { id: 'gold', bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-700', dot: 'bg-amber-400' },
]

const getColorCfg = (colorId) => NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0]

const emptyNota = { titulo: '', contenido: '', color: 'pink', etiquetas: [], favorita: false }

function NotaCard({ nota, onEdit, onDelete, onToggleFav }) {
  const cfg = getColorCfg(nota.color)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(12,74,110,0.1)' }}
      onClick={() => onEdit(nota)}
      className={`${cfg.bg} border ${cfg.border} rounded-3xl p-5 cursor-pointer group relative transition-all`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className={`font-display font-semibold text-sm leading-snug ${cfg.title} flex-1 pr-2`}>{nota.titulo}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); onToggleFav(nota.id, nota.favorita) }}
            className={`p-1 rounded-lg transition-colors ${nota.favorita ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}>
            <Star size={13} className={nota.favorita ? 'fill-amber-400' : ''} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(nota.id) }}
            className="p-1 rounded-lg text-slate-300 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed whitespace-pre-line">{nota.contenido}</p>

      {nota.etiquetas?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {nota.etiquetas.map(e => (
            <span key={e} className="text-xs text-slate-400 flex items-center gap-0.5">
              <Hash size={9} />{e}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-300 mt-2">
        {nota.updatedAt ? format(parseISO(nota.updatedAt), "d MMM", { locale: es }) : ''}
      </p>

      {nota.favorita && (
        <div className="absolute top-3 right-3">
          <Star size={12} className="text-amber-400 fill-amber-400" />
        </div>
      )}
    </motion.div>
  )
}

export default function Notas() {
  const { notas, addNota, updateNota, deleteNota } = useAppStore()
  const [search, setSearch] = useState('')
  const [colorFilter, setColorFilter] = useState('todas')
  const [soloFav, setSoloFav] = useState(false)
  const [modal, setModal] = useState(false)
  const [editNota, setEditNota] = useState(null)
  const [form, setForm] = useState(emptyNota)
  const [etiqInput, setEtiqInput] = useState('')

  const openModal = (nota = null) => {
    setEditNota(nota)
    setForm(nota ? { ...nota } : emptyNota)
    setEtiqInput(nota?.etiquetas?.join(', ') || '')
    setModal(true)
  }

  const save = () => {
    if (!form.titulo.trim() && !form.contenido.trim()) return
    const data = { ...form, etiquetas: etiqInput.split(',').map(s => s.trim()).filter(Boolean) }
    if (editNota) updateNota(editNota.id, data)
    else addNota(data)
    setModal(false)
  }

  const toggleFav = (id, current) => updateNota(id, { favorita: !current })

  const filtered = notas.filter(n => {
    if (soloFav && !n.favorita) return false
    if (colorFilter !== 'todas' && n.color !== colorFilter) return false
    if (search && !n.titulo.toLowerCase().includes(search.toLowerCase()) && !n.contenido.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-marea-ocean">Notas</h1>
          <p className="text-slate-500 text-sm mt-1">{notas.length} notas · {notas.filter(n => n.favorita).length} favoritas</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2 text-sm self-start">
          <Plus size={16} /> Nueva nota
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…" className="input-field pl-9 py-2 text-sm w-48" />
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setSoloFav(!soloFav)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${soloFav ? 'bg-amber-400 text-white border-amber-400' : 'bg-white/60 border-pink-100 text-slate-500'}`}>
            <Star size={11} /> Favoritas
          </button>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setColorFilter('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${colorFilter === 'todas' ? 'bg-slate-600 text-white border-slate-600' : 'bg-white/60 border-pink-100 text-slate-500'}`}>
            Todas
          </button>
          {NOTE_COLORS.map(c => (
            <button key={c.id} onClick={() => setColorFilter(c.id)}
              className={`w-7 h-7 rounded-xl border-2 transition-all ${c.dot} ${colorFilter === c.id ? 'border-slate-400 scale-110' : 'border-transparent opacity-60'}`} />
          ))}
        </div>
      </div>

      {/* Masonry grid */}
      <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        <AnimatePresence>
          {filtered.map(n => (
            <div key={n.id} className="break-inside-avoid mb-4">
              <NotaCard nota={n} onEdit={openModal} onDelete={deleteNota} onToggleFav={toggleFav} />
            </div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl">📝</span>
          <p className="text-slate-400 mt-3">Sin notas que mostrar</p>
          <button onClick={() => openModal()} className="btn-primary mt-4 text-sm">Crear primera nota</button>
        </div>
      )}

      {/* Modal editor */}
      <Modal open={modal} onClose={() => setModal(false)} title={editNota ? 'Editar nota' : 'Nueva nota'} size="lg">
        <div className="space-y-4">
          <input
            className="input-field text-base font-medium"
            value={form.titulo}
            onChange={e => setForm({...form, titulo: e.target.value})}
            placeholder="Título de la nota…"
          />

          <textarea
            className="input-field resize-none leading-relaxed"
            rows={10}
            value={form.contenido}
            onChange={e => setForm({...form, contenido: e.target.value})}
            placeholder="Escribe tu nota aquí… Puedes usar markdown básico."
          />

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-2">
              {NOTE_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setForm({...form, color: c.id})}
                  className={`w-7 h-7 rounded-xl ${c.dot} transition-all border-2 ${form.color === c.id ? 'border-slate-500 scale-115' : 'border-transparent opacity-60'}`}
                />
              ))}
            </div>
            <input
              className="input-field flex-1 text-sm"
              value={etiqInput}
              onChange={e => setEtiqInput(e.target.value)}
              placeholder="Etiquetas: tesis, ideas, clase"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.favorita} onChange={e => setForm({...form, favorita: e.target.checked})} />
            <span className="text-sm text-slate-600">Marcar como favorita</span>
          </label>

          <div className="flex gap-2 pt-1">
            <button onClick={save} className="btn-primary flex-1">Guardar nota</button>
            <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

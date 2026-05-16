import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Star, Trash2, Edit2, BookOpen, Scale, FileText, Gavel } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'

const CATEGORIAS = ['legislacion', 'concepto', 'jurisprudencia', 'doctrina', 'otro']

const catConfig = {
  legislacion: { icon: Scale, color: 'bg-sky-100 text-sky-700 border-sky-200', emoji: '⚖️' },
  concepto: { icon: BookOpen, color: 'bg-violet-100 text-violet-700 border-violet-200', emoji: '💡' },
  jurisprudencia: { icon: Gavel, color: 'bg-amber-100 text-amber-700 border-amber-200', emoji: '🔨' },
  doctrina: { icon: FileText, color: 'bg-emerald-100 text-emerald-700 border-emerald-200', emoji: '📚' },
  otro: { icon: FileText, color: 'bg-gray-100 text-gray-600 border-gray-200', emoji: '📄' },
}

const emptyEntry = { titulo: '', categoria: 'concepto', tags: [], contenido: '', favorito: false }

export default function Biblioteca() {
  const { biblioteca, addBiblioteca, updateBiblioteca, deleteBiblioteca } = useAppStore()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('todas')
  const [soloFavoritos, setSoloFavoritos] = useState(false)
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyEntry)
  const [tagsInput, setTagsInput] = useState('')

  const openModal = (item = null) => {
    setEditItem(item)
    setForm(item ? { ...item } : emptyEntry)
    setTagsInput(item?.tags?.join(', ') || '')
    setModal(true)
  }

  const save = () => {
    if (!form.titulo.trim()) return
    const data = { ...form, tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean) }
    if (editItem) updateBiblioteca(editItem.id, data)
    else addBiblioteca(data)
    setModal(false)
  }

  const filtered = biblioteca.filter(b => {
    if (catFilter !== 'todas' && b.categoria !== catFilter) return false
    if (soloFavoritos && !b.favorito) return false
    if (search && !b.titulo.toLowerCase().includes(search.toLowerCase()) && !b.contenido.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-marea-ocean">Biblioteca Jurídica</h1>
          <p className="text-slate-500 text-sm mt-1">{biblioteca.length} entradas · {biblioteca.filter(b => b.favorito).length} destacadas</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2 text-sm self-start">
          <Plus size={16} /> Nueva entrada
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…" className="input-field pl-9 py-2 text-sm w-56" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['todas', ...CATEGORIAS].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize border ${catFilter === c ? 'bg-marea-ocean text-white border-marea-ocean' : 'bg-white/60 border-pink-100 text-slate-500 hover:border-pink-200'}`}>
              {catConfig[c]?.emoji || ''} {c}
            </button>
          ))}
        </div>
        <button onClick={() => setSoloFavoritos(!soloFavoritos)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${soloFavoritos ? 'bg-amber-400 text-white border-amber-400' : 'bg-white/60 border-pink-100 text-slate-500'}`}>
          <Star size={12} /> Favoritos
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* List */}
        <div className="lg:col-span-2 space-y-2">
          <AnimatePresence>
            {filtered.map(b => {
              const cfg = catConfig[b.categoria] || catConfig.otro
              const isActive = selected?.id === b.id
              return (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  onClick={() => setSelected(b)}
                  className={`glass-card p-4 cursor-pointer group transition-all ${isActive ? 'ring-2 ring-pink-300 shadow-petal' : ''}`}
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{cfg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 leading-snug">{b.titulo}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-lg border ${cfg.color} capitalize`}>{b.categoria}</span>
                        {b.favorito && <Star size={11} className="text-amber-400 fill-amber-400" />}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); openModal(b) }} className="p-1 rounded-lg hover:bg-pink-50 text-slate-400 hover:text-pink-500">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteBiblioteca(b.id); if (selected?.id === b.id) setSelected(null) }} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl">📚</span>
              <p className="text-slate-400 text-sm mt-2">Sin entradas en esta categoría</p>
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6 sticky top-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-marea-ocean">{selected.titulo}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-lg border capitalize ${(catConfig[selected.categoria] || catConfig.otro).color}`}>{selected.categoria}</span>
                      {selected.favorito && <span className="text-xs text-amber-500 font-medium">★ Favorito</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateBiblioteca(selected.id, { favorito: !selected.favorito })}
                      className={`p-2 rounded-xl transition-colors ${selected.favorito ? 'bg-amber-50 text-amber-500' : 'hover:bg-amber-50 text-slate-400 hover:text-amber-500'}`}>
                      <Star size={16} className={selected.favorito ? 'fill-amber-400' : ''} />
                    </button>
                    <button onClick={() => openModal(selected)} className="p-2 rounded-xl hover:bg-pink-50 text-slate-400 hover:text-pink-500 transition-colors">
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>

                {selected.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selected.tags.map(t => <span key={t} className="text-xs bg-pink-50 text-pink-500 border border-pink-200 px-2.5 py-1 rounded-full">#{t}</span>)}
                  </div>
                )}

                <div className="prose-sm text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{selected.contenido}</div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-64 glass-card">
                <div className="text-center">
                  <span className="text-5xl">⚖️</span>
                  <p className="text-slate-400 mt-3 text-sm">Selecciona una entrada para ver su contenido</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Editar entrada' : 'Nueva entrada'} size="lg">
        <div className="space-y-4">
          <input className="input-field" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Título *" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Categoría</label>
              <select className="input-field" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Tags</label>
              <input className="input-field" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="ley, administrativo, procedimiento" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Contenido</label>
            <textarea className="input-field resize-none" rows={8} value={form.contenido} onChange={e => setForm({...form, contenido: e.target.value})} placeholder="Escribe el contenido de la entrada…" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.favorito} onChange={e => setForm({...form, favorito: e.target.checked})} className="rounded" />
            <span className="text-sm text-slate-600">Marcar como favorito</span>
          </label>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary flex-1">Guardar</button>
            <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Brain, RotateCcw, CheckCircle, XCircle, Trash2, Edit2, BookOpen } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import { ramosDisponibles } from '../data/preguntas'

const DIFICULTADES = ['fácil', 'media', 'difícil']

const emptyCard = { pregunta: '', respuesta: '', categoria: 'Derecho Administrativo', dificultad: 'media' }

function FlipCard({ card, onKnow, onReview }) {
  const [flipped, setFlipped] = useState(false)
  const [answered, setAnswered] = useState(false)

  const handleKnow = () => { setAnswered(true); setTimeout(() => { onKnow(); setFlipped(false); setAnswered(false) }, 300) }
  const handleReview = () => { setAnswered(true); setTimeout(() => { onReview(); setFlipped(false); setAnswered(false) }, 300) }

  return (
    <div className="perspective-1000 w-full" style={{ perspective: '1200px' }}>
      <motion.div
        className="relative w-full cursor-pointer"
        style={{ height: 300, transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        onClick={() => !answered && setFlipped(!flipped)}
      >
        {/* Front */}
        <div className="absolute inset-0 glass-card flex flex-col items-center justify-center p-8 text-center"
          style={{ backfaceVisibility: 'hidden' }}>
          <span className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-4">Pregunta</span>
          <p className="font-display text-lg font-medium text-slate-800 leading-relaxed">{card.pregunta}</p>
          <p className="text-xs text-slate-400 mt-6">Toca para revelar la respuesta</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 glass-card-pink flex flex-col items-center justify-center p-8 text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Respuesta</span>
          <p className="text-sm text-slate-700 leading-relaxed">{card.respuesta}</p>

          {flipped && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mt-6"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={handleReview} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-600 font-medium text-sm transition-colors">
                <XCircle size={16} /> Repasar
              </button>
              <button onClick={handleKnow} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-600 font-medium text-sm transition-colors">
                <CheckCircle size={16} /> Lo sé
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function Flashcards() {
  const { flashcards, addFlashcard, updateFlashcard, deleteFlashcard, estudiarFlashcard } = useAppStore()
  const [view, setView] = useState('coleccion') // coleccion | estudio
  const [catFilter, setCatFilter] = useState('todas')
  const [studyIndex, setStudyIndex] = useState(0)
  const [studyQueue, setStudyQueue] = useState([])
  const [studyDone, setStudyDone] = useState(false)
  const [modal, setModal] = useState(false)
  const [editCard, setEditCard] = useState(null)
  const [form, setForm] = useState(emptyCard)

  const categorias = [...new Set(flashcards.map(f => f.categoria))]

  const openModal = (card = null) => {
    setEditCard(card)
    setForm(card ? { ...card } : emptyCard)
    setModal(true)
  }

  const save = () => {
    if (!form.pregunta.trim() || !form.respuesta.trim()) return
    if (editCard) updateFlashcard(editCard.id, form)
    else addFlashcard(form)
    setModal(false)
  }

  const startStudy = () => {
    const queue = flashcards
      .filter(f => catFilter === 'todas' || f.categoria === catFilter)
      .filter(f => f.estado !== 'sabida')
    setStudyQueue(queue.sort(() => Math.random() - 0.5))
    setStudyIndex(0)
    setStudyDone(false)
    setView('estudio')
  }

  const handleKnow = () => {
    const card = studyQueue[studyIndex]
    estudiarFlashcard(card.id, true)
    if (studyIndex + 1 >= studyQueue.length) setStudyDone(true)
    else setStudyIndex(i => i + 1)
  }

  const handleReview = () => {
    const card = studyQueue[studyIndex]
    estudiarFlashcard(card.id, false)
    if (studyIndex + 1 >= studyQueue.length) setStudyDone(true)
    else setStudyIndex(i => i + 1)
  }

  const filtered = flashcards.filter(f => catFilter === 'todas' || f.categoria === catFilter)

  const stats = {
    total: flashcards.length,
    sabidas: flashcards.filter(f => f.estado === 'sabida').length,
    repasar: flashcards.filter(f => f.estado === 'repasar').length,
    pendientes: flashcards.filter(f => f.estado === 'pendiente').length,
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-marea-ocean">Flashcards</h1>
          <p className="text-slate-500 text-sm mt-1">{stats.total} tarjetas · {stats.sabidas} sabidas · {stats.repasar} para repasar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openModal()} className="btn-ghost flex items-center gap-2 text-sm">
            <Plus size={16} /> Nueva
          </button>
          <button onClick={startStudy} className="btn-ocean flex items-center gap-2 text-sm">
            <Brain size={16} /> Estudiar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Sabidas', count: stats.sabidas, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', pct: stats.total ? stats.sabidas / stats.total : 0 },
          { label: 'Repasar', count: stats.repasar, color: 'bg-orange-50 text-orange-700 border-orange-200', pct: stats.total ? stats.repasar / stats.total : 0 },
          { label: 'Nuevas', count: stats.pendientes, color: 'bg-sky-50 text-sky-700 border-sky-200', pct: stats.total ? stats.pendientes / stats.total : 0 },
        ].map(s => (
          <div key={s.label} className={`glass-card p-3 border ${s.color.split(' ').pop()}`}>
            <p className="text-2xl font-display font-bold text-slate-800">{s.count}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
            <div className="h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-current rounded-full opacity-40" style={{ width: `${s.pct * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        <div className="flex bg-white/60 border border-pink-100 rounded-2xl p-1 gap-1">
          {[['coleccion', 'Colección'], ['estudio', 'Modo Estudio']].map(([v, l]) => (
            <button key={v} onClick={() => v === 'estudio' ? startStudy() : setView(v)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${view === v ? 'bg-pink-500 text-white' : 'text-slate-500'}`}>
              {l}
            </button>
          ))}
        </div>
        {['todas', ...categorias].map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${catFilter === c ? 'bg-marea-ocean text-white border-marea-ocean' : 'bg-white/60 border-pink-100 text-slate-500'}`}>
            {c}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* COLECCIÓN */}
        {view === 'coleccion' && (
          <motion.div key="coleccion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3">
            {filtered.map(f => (
              <motion.div key={f.id} layout whileHover={{ x: 3 }} className="glass-card p-4 flex items-start gap-4 group">
                <div className={`w-2 h-8 rounded-full flex-shrink-0 ${f.estado === 'sabida' ? 'bg-emerald-400' : f.estado === 'repasar' ? 'bg-orange-400' : 'bg-sky-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-2">{f.pregunta}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{f.respuesta}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="lavender">{f.categoria}</Badge>
                    <Badge variant={f.dificultad === 'difícil' ? 'coral' : f.dificultad === 'media' ? 'gold' : 'sage'}>{f.dificultad}</Badge>
                    {f.vecesEstudiada > 0 && <span className="text-xs text-slate-400">{f.vecesEstudiada}× estudiada</span>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(f)} className="p-1.5 rounded-xl hover:bg-pink-50 text-slate-400 hover:text-pink-500"><Edit2 size={13} /></button>
                  <button onClick={() => deleteFlashcard(f.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <span className="text-5xl">🧠</span>
                <p className="text-slate-400 mt-3">Sin flashcards en esta categoría</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ESTUDIO */}
        {view === 'estudio' && (
          <motion.div key="estudio" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {studyDone || studyQueue.length === 0 ? (
              <div className="text-center py-16 glass-card">
                <span className="text-6xl">🎉</span>
                <h2 className="font-display text-2xl font-bold text-marea-ocean mt-4">¡Sesión completada!</h2>
                <p className="text-slate-500 mt-2">Has repasado {studyQueue.length} tarjetas</p>
                <button onClick={() => setView('coleccion')} className="btn-primary mt-6">Volver a la colección</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">{studyIndex + 1} / {studyQueue.length}</span>
                  <div className="flex-1 mx-4 h-1.5 bg-pink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-400 rounded-full transition-all" style={{ width: `${((studyIndex) / studyQueue.length) * 100}%` }} />
                  </div>
                  <button onClick={() => setView('coleccion')} className="text-xs text-slate-400 hover:text-slate-600">Salir</button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={studyIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                  >
                    <FlipCard
                      card={studyQueue[studyIndex]}
                      onKnow={handleKnow}
                      onReview={handleReview}
                    />
                  </motion.div>
                </AnimatePresence>

                <p className="text-center text-xs text-slate-400">
                  {studyQueue[studyIndex]?.categoria} · {studyQueue[studyIndex]?.dificultad}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editCard ? 'Editar flashcard' : 'Nueva flashcard'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Pregunta *</label>
            <textarea className="input-field resize-none" rows={3} value={form.pregunta} onChange={e => setForm({...form, pregunta: e.target.value})} placeholder="¿Qué quieres recordar?" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Respuesta *</label>
            <textarea className="input-field resize-none" rows={4} value={form.respuesta} onChange={e => setForm({...form, respuesta: e.target.value})} placeholder="Respuesta completa y precisa…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Categoría</label>
              <select className="input-field" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                {ramosDisponibles.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Dificultad</label>
              <select className="input-field" value={form.dificultad} onChange={e => setForm({...form, dificultad: e.target.value})}>
                {DIFICULTADES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary flex-1">Guardar</button>
            <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

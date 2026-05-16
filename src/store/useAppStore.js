import { create } from 'zustand'
import { storage } from '../utils/storage'
import {
  demoAlumnos, demoInterrogaciones, demoTareas, demoLecturas,
  demoNotas, demoBiblioteca, demoFlashcards, demoTimeline,
  demoAutores, demoRecompensas,
} from '../data/demoData'

const load = (key, demo) => storage.get(key) ?? demo

const useAppStore = create((set, get) => ({
  // ── Config ──────────────────────────────────────────────────────────
  config: load('config', { userName: 'Valentina', theme: 'petal', sidebarCollapsed: false }),
  setConfig: (updates) => {
    const next = { ...get().config, ...updates }
    set({ config: next })
    storage.set('config', next)
  },

  // ── Alumnos ──────────────────────────────────────────────────────────
  alumnos: load('alumnos', demoAlumnos),
  addAlumno: (alumno) => {
    const next = [{ id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10), ...alumno }, ...get().alumnos]
    set({ alumnos: next }); storage.set('alumnos', next)
  },
  updateAlumno: (id, updates) => {
    const next = get().alumnos.map(a => a.id === id ? { ...a, ...updates } : a)
    set({ alumnos: next }); storage.set('alumnos', next)
  },
  deleteAlumno: (id) => {
    const next = get().alumnos.filter(a => a.id !== id)
    set({ alumnos: next }); storage.set('alumnos', next)
  },

  // ── Interrogaciones ──────────────────────────────────────────────────
  interrogaciones: load('interrogaciones', demoInterrogaciones),
  addInterrogacion: (int) => {
    const next = [{ id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10), ...int }, ...get().interrogaciones]
    set({ interrogaciones: next }); storage.set('interrogaciones', next)
  },
  updateInterrogacion: (id, updates) => {
    const next = get().interrogaciones.map(i => i.id === id ? { ...i, ...updates } : i)
    set({ interrogaciones: next }); storage.set('interrogaciones', next)
  },
  deleteInterrogacion: (id) => {
    const next = get().interrogaciones.filter(i => i.id !== id)
    set({ interrogaciones: next }); storage.set('interrogaciones', next)
    // Limpiar ficha asociada
    const fichas = { ...get().fichas }
    delete fichas[id]
    set({ fichas }); storage.set('fichas', fichas)
  },

  // ── Fichas de interrogación ──────────────────────────────────────────
  fichas: load('fichas', {}),
  getFicha: (intId) => {
    return get().fichas[intId] || {
      preguntas: [], feedbackGeneral: '',
      fortalezas: '', debilidades: '', temasReforzar: '', recomendacion: '',
      resultado: ''
    }
  },
  updateFicha: (intId, updates) => {
    const fichas = { ...get().fichas, [intId]: { ...get().getFicha(intId), ...updates } }
    set({ fichas }); storage.set('fichas', fichas)
  },
  addPreguntaFicha: (intId) => {
    const ficha = get().getFicha(intId)
    const nuevaP = { id: crypto.randomUUID(), numero: ficha.preguntas.length + 1, pregunta: '', respuesta: '', evaluacion: 'no respondida', comentario: '' }
    const fichas = { ...get().fichas, [intId]: { ...ficha, preguntas: [...ficha.preguntas, nuevaP] } }
    set({ fichas }); storage.set('fichas', fichas)
  },
  updatePreguntaFicha: (intId, preguntaId, updates) => {
    const ficha = get().getFicha(intId)
    const preguntas = ficha.preguntas.map(p => p.id === preguntaId ? { ...p, ...updates } : p)
    const fichas = { ...get().fichas, [intId]: { ...ficha, preguntas } }
    set({ fichas }); storage.set('fichas', fichas)
  },
  deletePreguntaFicha: (intId, preguntaId) => {
    const ficha = get().getFicha(intId)
    const preguntas = ficha.preguntas.filter(p => p.id !== preguntaId).map((p, i) => ({ ...p, numero: i + 1 }))
    const fichas = { ...get().fichas, [intId]: { ...ficha, preguntas } }
    set({ fichas }); storage.set('fichas', fichas)
  },

  // ── Tareas ───────────────────────────────────────────────────────────
  tareas: load('tareas', demoTareas),
  addTarea: (tarea) => {
    const next = [{ id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10), completada: false, ...tarea }, ...get().tareas]
    set({ tareas: next }); storage.set('tareas', next)
    get()._checkRecompensa('tarea')
  },
  updateTarea: (id, updates) => {
    const next = get().tareas.map(t => t.id === id ? { ...t, ...updates } : t)
    set({ tareas: next }); storage.set('tareas', next)
    if (updates.completada) get()._checkRecompensa('tarea_completada')
  },
  deleteTarea: (id) => {
    const next = get().tareas.filter(t => t.id !== id)
    set({ tareas: next }); storage.set('tareas', next)
  },

  // ── Lecturas ─────────────────────────────────────────────────────────
  lecturas: load('lecturas', demoLecturas),
  addLectura: (lectura) => {
    const next = [{ id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10), paginasLeidas: 0, estado: 'pendiente', ...lectura }, ...get().lecturas]
    set({ lecturas: next }); storage.set('lecturas', next)
  },
  updateLectura: (id, updates) => {
    const next = get().lecturas.map(l => l.id === id ? { ...l, ...updates } : l)
    set({ lecturas: next }); storage.set('lecturas', next)
  },
  deleteLectura: (id) => {
    const next = get().lecturas.filter(l => l.id !== id)
    set({ lecturas: next }); storage.set('lecturas', next)
  },

  // ── Notas ────────────────────────────────────────────────────────────
  notas: load('notas', demoNotas),
  addNota: (nota) => {
    const now = new Date().toISOString().slice(0, 10)
    const next = [{ id: crypto.randomUUID(), createdAt: now, updatedAt: now, color: 'pink', etiquetas: [], favorita: false, ...nota }, ...get().notas]
    set({ notas: next }); storage.set('notas', next)
  },
  updateNota: (id, updates) => {
    const next = get().notas.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString().slice(0, 10) } : n)
    set({ notas: next }); storage.set('notas', next)
  },
  deleteNota: (id) => {
    const next = get().notas.filter(n => n.id !== id)
    set({ notas: next }); storage.set('notas', next)
  },

  // ── Biblioteca ────────────────────────────────────────────────────────
  biblioteca: load('biblioteca', demoBiblioteca),
  addBiblioteca: (entry) => {
    const next = [{ id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10), favorito: false, tags: [], ...entry }, ...get().biblioteca]
    set({ biblioteca: next }); storage.set('biblioteca', next)
  },
  updateBiblioteca: (id, updates) => {
    const next = get().biblioteca.map(b => b.id === id ? { ...b, ...updates } : b)
    set({ biblioteca: next }); storage.set('biblioteca', next)
  },
  deleteBiblioteca: (id) => {
    const next = get().biblioteca.filter(b => b.id !== id)
    set({ biblioteca: next }); storage.set('biblioteca', next)
  },

  // ── Flashcards ────────────────────────────────────────────────────────
  flashcards: load('flashcards', demoFlashcards),
  addFlashcard: (card) => {
    const next = [{ id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10), vecesEstudiada: 0, correctas: 0, estado: 'pendiente', ...card }, ...get().flashcards]
    set({ flashcards: next }); storage.set('flashcards', next)
  },
  updateFlashcard: (id, updates) => {
    const next = get().flashcards.map(f => f.id === id ? { ...f, ...updates } : f)
    set({ flashcards: next }); storage.set('flashcards', next)
  },
  deleteFlashcard: (id) => {
    const next = get().flashcards.filter(f => f.id !== id)
    set({ flashcards: next }); storage.set('flashcards', next)
  },
  estudiarFlashcard: (id, correcto) => {
    const card = get().flashcards.find(f => f.id === id)
    if (!card) return
    get().updateFlashcard(id, { vecesEstudiada: card.vecesEstudiada + 1, correctas: correcto ? card.correctas + 1 : card.correctas, estado: correcto ? 'sabida' : 'repasar' })
    get()._checkRecompensa('flashcard')
  },

  // ── Timeline ──────────────────────────────────────────────────────────
  timeline: load('timeline', demoTimeline),
  addTimeline: (item) => {
    const next = [{ id: crypto.randomUUID(), completado: false, ...item }, ...get().timeline]
    set({ timeline: next }); storage.set('timeline', next)
  },
  updateTimeline: (id, updates) => {
    const next = get().timeline.map(t => t.id === id ? { ...t, ...updates } : t)
    set({ timeline: next }); storage.set('timeline', next)
  },
  deleteTimeline: (id) => {
    const next = get().timeline.filter(t => t.id !== id)
    set({ timeline: next }); storage.set('timeline', next)
  },

  // ── Autores ───────────────────────────────────────────────────────────
  autores: load('autores', demoAutores),
  addAutor: (autor) => {
    const next = [{ id: crypto.randomUUID(), ...autor }, ...get().autores]
    set({ autores: next }); storage.set('autores', next)
  },
  updateAutor: (id, updates) => {
    const next = get().autores.map(a => a.id === id ? { ...a, ...updates } : a)
    set({ autores: next }); storage.set('autores', next)
  },
  deleteAutor: (id) => {
    const next = get().autores.filter(a => a.id !== id)
    set({ autores: next }); storage.set('autores', next)
  },

  // ── Recompensas ───────────────────────────────────────────────────────
  recompensas: load('recompensas', demoRecompensas),
  _checkRecompensa: (tipo) => {
    const r = get().recompensas
    const allStickers = ['koi', 'estrella', 'luna', 'sakura', 'gatito', 'concha', 'nube', 'ola', 'pez', 'corazon']
    let puntos = r.puntos
    let stickers = [...r.stickers]
    let tareasCompletadas = r.tareasCompletadas
    let flashcardsEstudiadas = r.flashcardsEstudiadas
    if (tipo === 'tarea_completada') {
      puntos += 10; tareasCompletadas += 1
      if (tareasCompletadas % 5 === 0) { const s = allStickers.find(s => !stickers.includes(s)); if (s) stickers.push(s) }
    }
    if (tipo === 'flashcard') {
      puntos += 5; flashcardsEstudiadas += 1
      if (flashcardsEstudiadas % 10 === 0) { const s = allStickers.find(s => !stickers.includes(s)); if (s) stickers.push(s) }
    }
    const next = { ...r, puntos, stickers, tareasCompletadas, flashcardsEstudiadas }
    set({ recompensas: next }); storage.set('recompensas', next)
  },

  // ── Focus Sessions ────────────────────────────────────────────────────
  focusSessions: load('focusSessions', []),
  addFocusSession: (session) => {
    const next = [{ id: crypto.randomUUID(), ...session }, ...get().focusSessions]
    set({ focusSessions: next }); storage.set('focusSessions', next)
  },

  // ── Reset demo ────────────────────────────────────────────────────────
  resetToDemo: () => {
    storage.clear()
    set({
      alumnos: demoAlumnos, interrogaciones: demoInterrogaciones, tareas: demoTareas,
      lecturas: demoLecturas, notas: demoNotas, biblioteca: demoBiblioteca,
      flashcards: demoFlashcards, timeline: demoTimeline, autores: demoAutores,
      recompensas: demoRecompensas, fichas: {},
    })
  },
}))

export default useAppStore

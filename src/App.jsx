import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Interrogaciones from './pages/Interrogaciones'
import Magister from './pages/Magister'
import Tareas from './pages/Tareas'
import Biblioteca from './pages/Biblioteca'
import Notas from './pages/Notas'
import Flashcards from './pages/Flashcards'
import FocusMode from './pages/FocusMode'
import Recompensas from './pages/Recompensas'
import Configuracion from './pages/Configuracion'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="interrogaciones" element={<Interrogaciones />} />
        <Route path="magister" element={<Magister />} />
        <Route path="tareas" element={<Tareas />} />
        <Route path="biblioteca" element={<Biblioteca />} />
        <Route path="notas" element={<Notas />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="focus" element={<FocusMode />} />
        <Route path="recompensas" element={<Recompensas />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>
    </Routes>
  )
}

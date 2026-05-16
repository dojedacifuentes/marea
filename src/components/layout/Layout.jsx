import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import FloatingParticles from '../ui/FloatingParticles'
import RemindersWidget from '../ui/RemindersWidget'


export default function Layout() {
  const location = useLocation()
  const isFocus = location.pathname === '/focus'

  return (
    <div className="flex h-screen bg-cozy-gradient overflow-hidden relative">
      {!isFocus && <FloatingParticles count={14} className="z-0" />}

      {!isFocus && <Sidebar />}

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* TopBar global con reloj */}
        <TopBar />

        {/* Banner de alertas urgentes (compacto) */}
        {!isFocus && <RemindersWidget compact />}

        {/* Aviso de persistencia local */}
        {!isFocus && (
          <div className="flex-shrink-0 flex items-center gap-2 px-6 py-1.5 bg-sky-50/70 border-b border-sky-100/60">
            <span className="text-xs text-sky-600">
              💾 Tus datos se guardan automáticamente en este navegador.
              Para usarlos en otro dispositivo, exporta un respaldo JSON e impórtalo allí.
            </span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

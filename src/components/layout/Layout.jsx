import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import FloatingParticles from '../ui/FloatingParticles'
import RemindersWidget from '../ui/RemindersWidget'

export default function Layout() {
  const location = useLocation()
  const isFocus = location.pathname === '/focus'
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-cozy-gradient overflow-hidden relative">
      {!isFocus && <FloatingParticles count={14} className="z-0" />}

      {/* Backdrop mobile */}
      <AnimatePresence>
        {mobileOpen && !isFocus && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {!isFocus && (
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        <TopBar onMenuClick={() => setMobileOpen(true)} />

        {!isFocus && <RemindersWidget compact />}

        {!isFocus && (
          <div className="flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-1.5 bg-sky-50/70 border-b border-sky-100/60">
            <span className="text-xs text-sky-600">
              💾 Datos guardados en este navegador. Exporta un respaldo JSON en Configuración para usar en otro dispositivo.
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

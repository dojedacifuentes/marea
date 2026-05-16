import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, GraduationCap, CheckSquare,
  BookOpen, StickyNote, Brain, Timer, Settings, Star,
  ChevronLeft, ChevronRight, Waves, X,
} from 'lucide-react'
import useAppStore from '../../store/useAppStore'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/interrogaciones', icon: Users, label: 'Interrogaciones' },
  { to: '/magister', icon: GraduationCap, label: 'Magíster' },
  { to: '/tareas', icon: CheckSquare, label: 'Tareas' },
  { to: '/biblioteca', icon: BookOpen, label: 'Biblioteca' },
  { to: '/notas', icon: StickyNote, label: 'Notas' },
  { to: '/flashcards', icon: Brain, label: 'Flashcards' },
  { to: '/focus', icon: Timer, label: 'Focus Mode' },
  { to: '/recompensas', icon: Star, label: 'Recompensas' },
  { to: '/configuracion', icon: Settings, label: 'Configuración' },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { config, setConfig } = useAppStore()
  const collapsed = config.sidebarCollapsed
  const location = useLocation()
  const isMobile = useIsMobile()

  const toggle = () => setConfig({ sidebarCollapsed: !collapsed })

  // Cerrar drawer al navegar en mobile
  useEffect(() => {
    if (isMobile) onClose?.()
  }, [location.pathname]) // eslint-disable-line

  const sidebarWidth = isMobile ? 260 : collapsed ? 72 : 232
  const sidebarX = isMobile ? (mobileOpen ? 0 : -280) : 0

  return (
    <motion.aside
      className="glass-sidebar fixed md:static inset-y-0 left-0 h-screen md:h-full flex flex-col select-none z-50"
      animate={{ width: sidebarWidth, x: sidebarX }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-pink-100/50">
        <motion.div
          className="flex-shrink-0 w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-400 to-marea-ocean flex items-center justify-center shadow-petal"
          whileHover={{ rotate: 8, scale: 1.05 }}
        >
          <Waves size={18} className="text-white" />
        </motion.div>
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="flex-1 min-w-0"
            >
              <p className="font-display text-lg font-semibold text-marea-ocean leading-none">Marea</p>
              <p className="text-[10px] text-pink-400 font-medium tracking-wide mt-0.5">workspace personal</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón cerrar — solo mobile */}
        {isMobile && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-xl hover:bg-pink-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-scroll">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to}>
              <motion.div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-150 group
                  ${isActive
                    ? 'bg-gradient-to-r from-pink-100 to-pink-50 text-pink-600 shadow-sm border border-pink-200/60'
                    : 'text-slate-500 hover:bg-pink-50/60 hover:text-slate-700'
                  }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-pink-500' : 'text-slate-400 group-hover:text-slate-600'}`}
                />
                <AnimatePresence>
                  {(!collapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium truncate"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-pink-400"
                  />
                )}
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse toggle — solo desktop */}
      {!isMobile && (
        <button
          onClick={toggle}
          className="m-3 p-2 rounded-2xl hover:bg-pink-50 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center"
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <div className="flex items-center gap-2 w-full">
              <ChevronLeft size={16} />
              <span className="text-xs font-medium">Colapsar</span>
            </div>
          )}
        </button>
      )}
    </motion.aside>
  )
}

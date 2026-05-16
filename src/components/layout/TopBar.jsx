import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 13) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function TopBar({ onMenuClick }) {
  const [now, setNow] = useState(new Date())
  const location = useLocation()

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (location.pathname === '/focus') return null

  const fecha = format(now, "EEEE d 'de' MMMM", { locale: es })
  const hora = format(now, 'HH:mm:ss')
  const saludo = getGreeting()

  return (
    <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-2.5 bg-white/50 backdrop-blur-sm border-b border-pink-100/60 z-20">
      <div className="flex items-center gap-3">
        {/* Hamburger — solo mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-xl hover:bg-pink-50 text-slate-500 hover:text-pink-500 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        {/* Saludo y fecha */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-pink-500 font-medium">{saludo}</span>
          <span className="hidden sm:inline text-pink-200">·</span>
          <span className="hidden sm:inline text-slate-500 capitalize">{fecha}</span>
        </div>
      </div>

      {/* Hora en tiempo real */}
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-sm font-semibold text-marea-ocean tabular-nums">{hora}</span>
      </div>
    </div>
  )
}

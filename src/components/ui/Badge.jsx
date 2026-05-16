const variants = {
  pink: 'bg-pink-100 text-pink-700 border border-pink-200',
  ocean: 'bg-sky-100 text-sky-700 border border-sky-200',
  lavender: 'bg-violet-100 text-violet-700 border border-violet-200',
  coral: 'bg-red-100 text-red-600 border border-red-200',
  sage: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  gold: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  gray: 'bg-slate-100 text-slate-600 border border-slate-200',
  orange: 'bg-orange-100 text-orange-700 border border-orange-200',
}

const prioridad = {
  alta: 'bg-red-50 text-red-600 border border-red-200',
  media: 'bg-orange-50 text-orange-600 border border-orange-200',
  baja: 'bg-green-50 text-green-600 border border-green-200',
}

const estado = {
  pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
  realizada: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  reprogramada: 'bg-sky-50 text-sky-700 border border-sky-200',
  ausente: 'bg-red-50 text-red-600 border border-red-200',
  leyendo: 'bg-blue-50 text-blue-700 border border-blue-200',
  completado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
}

export default function Badge({ children, variant = 'pink', type, className = '' }) {
  let cls = variants[variant] || variants.pink
  if (type === 'prioridad') cls = prioridad[children] || cls
  if (type === 'estado') cls = estado[children] || cls

  return (
    <span className={`tag font-body text-xs font-medium ${cls} ${className}`}>
      {children}
    </span>
  )
}

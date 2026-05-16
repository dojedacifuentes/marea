import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Normaliza un número chileno a formato internacional sin + ni espacios.
 * Ejemplos:
 *   +56 9 3430 1930 → 56934301930
 *   09 3430 1930   → 56934301930
 *   9 3430 1930    → 56934301930
 *   934301930      → 56934301930
 */
export function normalizeChileanPhone(phone) {
  if (!phone) return ''
  // Quitar todo excepto dígitos
  let clean = phone.replace(/[^\d]/g, '')
  // Si viene con 56 adelante (y largo correcto)
  if (clean.startsWith('56') && clean.length >= 11) return clean
  // Si viene con 0 adelante (09...)
  if (clean.startsWith('0')) clean = clean.slice(1)
  // Si le faltan el 56
  if (!clean.startsWith('56')) clean = '56' + clean
  return clean
}

export function isValidChileanPhone(phone) {
  const n = normalizeChileanPhone(phone)
  return /^569\d{8}$/.test(n)
}

export function buildWhatsAppMessage(alumno, proxInt) {
  const nombre = alumno.nombre?.split(' ')[0] || alumno.nombre
  const materia = alumno.materia || alumno.ramo || ''
  let fechaStr = ''
  let horaStr = ''

  if (proxInt?.fecha) {
    try {
      fechaStr = format(parseISO(proxInt.fecha), "d 'de' MMMM", { locale: es })
    } catch {
      fechaStr = proxInt.fecha
    }
    horaStr = proxInt.hora || ''
  }

  return `Hola ${nombre}, te escribo para recordar/confirmar tu interrogación de ${materia}, agendada para el día ${fechaStr} a las ${horaStr}.\nPor favor confirma recepción.\nSaludos,\nValentina.`
}

export function openWhatsApp(phone, message) {
  const normalized = normalizeChileanPhone(phone)
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function buildMailtoHref(alumno, proxInt) {
  const materia = alumno.materia || alumno.ramo || ''
  let fechaStr = ''
  if (proxInt?.fecha) {
    try { fechaStr = format(parseISO(proxInt.fecha), "d 'de' MMMM 'de' yyyy", { locale: es }) } catch { fechaStr = proxInt.fecha }
  }
  const subject = `Recordatorio interrogación — ${materia}`
  const body = buildWhatsAppMessage(alumno, proxInt)
  return `mailto:${alumno.correo || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

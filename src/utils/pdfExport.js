import jsPDF from 'jspdf'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// Colores Marea
const C = {
  ocean: [12, 74, 110],
  pink: [249, 168, 212],
  pinkLight: [252, 231, 243],
  lavender: [237, 233, 254],
  cream: [253, 248, 240],
  slate: [71, 85, 105],
  slateLight: [148, 163, 184],
  white: [255, 255, 255],
  emerald: [52, 211, 153],
  amber: [251, 191, 36],
  red: [248, 113, 113],
}

const evalColors = {
  'correcta': [209, 250, 229],      // green-100
  'parcialmente correcta': [254, 243, 199], // yellow-100
  'incorrecta': [254, 226, 226],    // red-100
  'no respondida': [226, 232, 240], // slate-200
}

function safeText(str) {
  if (!str) return ''
  return String(str)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
}

function splitLines(doc, text, maxW) {
  return doc.splitTextToSize(safeText(text), maxW)
}

export function exportFichaPDF(alumno, interrogacion, ficha = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = 210
  const pageH = 297
  const margin = 14
  const cW = pageW - margin * 2
  let y = 0

  // ── Helpers ───────────────────────────────────────────────────────
  const addPage = () => { doc.addPage(); y = margin }

  const checkY = (needed) => { if (y + needed > pageH - margin) addPage() }

  const hLine = (yy = y, color = C.pinkLight) => {
    doc.setDrawColor(...color)
    doc.setLineWidth(0.3)
    doc.line(margin, yy, pageW - margin, yy)
  }

  const sectionTitle = (title, yy) => {
    doc.setFillColor(...C.ocean)
    doc.roundedRect(margin, yy, cW, 7, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...C.white)
    doc.text(safeText(title).toUpperCase(), margin + 4, yy + 4.8)
    return yy + 11
  }

  // ── HEADER ────────────────────────────────────────────────────────
  // Fondo rosa claro
  doc.setFillColor(...C.pinkLight)
  doc.rect(0, 0, pageW, 42, 'F')

  // Franja océano superior
  doc.setFillColor(...C.ocean)
  doc.rect(0, 0, pageW, 5, 'F')

  // Olas decorativas (curvas simples)
  doc.setFillColor(255, 255, 255, 0.15)
  for (let i = 0; i < 5; i++) {
    doc.setFillColor(...C.pinkLight)
    doc.ellipse(20 + i * 42, 5, 22, 4, 'F')
  }

  // Título
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(...C.ocean)
  doc.text('FICHA DE INTERROGACION', pageW / 2, 17, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...C.slate)
  doc.text('Interrogadora: Valentina Munoz', pageW / 2, 24, { align: 'center' })

  const hoy = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })
  doc.text(`Generado: ${hoy}`, pageW / 2, 30, { align: 'center' })

  // Sticker decorativo
  doc.setFontSize(16)
  doc.text('✦', margin, 22)
  doc.text('✦', pageW - margin, 22, { align: 'right' })

  // Línea separadora
  doc.setDrawColor(...C.pink)
  doc.setLineWidth(0.8)
  doc.line(margin, 40, pageW - margin, 40)

  y = 48

  // ── DATOS DEL ALUMNO ─────────────────────────────────────────────
  y = sectionTitle('Datos del alumno', y)

  // Fondo crema
  doc.setFillColor(...C.cream)
  doc.roundedRect(margin, y, cW, 32, 2, 2, 'F')

  const col1x = margin + 4
  const col2x = margin + cW / 2 + 2
  const rowH = 7.5

  const dataField = (label, value, x, yy) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...C.slateLight)
    doc.text(safeText(label).toUpperCase(), x, yy)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...C.slate)
    doc.text(safeText(value || '—'), x, yy + 4)
  }

  let fechaStr = '—'
  if (interrogacion?.fecha) {
    try { fechaStr = format(parseISO(interrogacion.fecha), "d 'de' MMMM 'de' yyyy", { locale: es }) } catch { fechaStr = interrogacion.fecha }
  }

  dataField('Nombre', alumno.nombre, col1x, y + 5)
  dataField('Materia / Ramo', alumno.materia || alumno.ramo, col2x, y + 5)
  dataField('Correo', alumno.correo, col1x, y + 5 + rowH)
  dataField('Telefono', alumno.telefono, col2x, y + 5 + rowH)
  dataField('Fecha de interrogacion', fechaStr, col1x, y + 5 + rowH * 2)
  dataField('Hora', interrogacion?.hora || '—', col2x, y + 5 + rowH * 2)
  dataField('Modalidad', interrogacion?.modalidad || alumno.modalidad || '—', col1x, y + 5 + rowH * 3)
  dataField('Estado', interrogacion?.estado || alumno.estado || '—', col2x, y + 5 + rowH * 3)

  y += 36
  hLine(y)
  y += 6

  // ── PREGUNTAS ────────────────────────────────────────────────────
  const preguntas = ficha.preguntas || []
  if (preguntas.length > 0) {
    checkY(16)
    y = sectionTitle(`Preguntas realizadas (${preguntas.length})`, y)

    preguntas.forEach((p, idx) => {
      const evalColor = evalColors[p.evaluacion] || evalColors['no respondida']
      const pregLines = splitLines(doc, p.pregunta, cW - 8)
      const respLines = splitLines(doc, p.respuesta, cW - 14)
      const comLines = splitLines(doc, p.comentario, cW - 14)
      const blockH = 8 + pregLines.length * 4.5 + (respLines.length > 0 ? respLines.length * 4.2 + 6 : 0) + (comLines.length > 0 ? comLines.length * 4.2 + 5 : 0) + 6

      checkY(blockH)

      // Fondo evaluación
      doc.setFillColor(...evalColor)
      doc.roundedRect(margin, y, cW, blockH - 2, 2, 2, 'F')
      doc.setDrawColor(...C.slateLight)
      doc.setLineWidth(0.2)
      doc.roundedRect(margin, y, cW, blockH - 2, 2, 2, 'S')

      // Número y evaluación
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...C.ocean)
      doc.text(`${idx + 1}.`, margin + 3, y + 5.5)

      if (p.evaluacion) {
        doc.setFontSize(7)
        doc.setTextColor(...C.slate)
        doc.text(safeText(p.evaluacion).toUpperCase(), pageW - margin - 3, y + 5.5, { align: 'right' })
      }

      // Pregunta
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...C.ocean)
      let ly = y + 5.5
      pregLines.forEach((line, i) => {
        if (i > 0) ly += 4.5
        doc.text(safeText(line), margin + 8, ly)
      })
      ly += 5

      // Respuesta
      if (p.respuesta) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...C.slateLight)
        doc.text('RESPUESTA:', margin + 8, ly)
        ly += 4
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...C.slate)
        respLines.forEach(line => { doc.text(safeText(line), margin + 10, ly); ly += 4.2 })
        ly += 1
      }

      // Comentario
      if (p.comentario) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...C.slateLight)
        doc.text('COMENTARIO:', margin + 8, ly)
        ly += 4
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(7.5)
        doc.setTextColor(...C.slate)
        comLines.forEach(line => { doc.text(safeText(line), margin + 10, ly); ly += 4.2 })
      }

      y += blockH + 2
    })

    hLine(y)
    y += 6
  }

  // ── FEEDBACK GENERAL ─────────────────────────────────────────────
  if (ficha.feedbackGeneral) {
    checkY(20)
    y = sectionTitle('Retroalimentacion general', y)
    const lines = splitLines(doc, ficha.feedbackGeneral, cW - 8)
    const bH = lines.length * 4.5 + 8
    checkY(bH)
    doc.setFillColor(...C.lavender)
    doc.roundedRect(margin, y, cW, bH, 2, 2, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...C.slate)
    lines.forEach((line, i) => doc.text(safeText(line), margin + 4, y + 5.5 + i * 4.5))
    y += bH + 6
    hLine(y)
    y += 6
  }

  // ── OBSERVACIONES ────────────────────────────────────────────────
  const hasObs = ficha.fortalezas || ficha.debilidades || ficha.temasReforzar || ficha.recomendacion
  if (hasObs) {
    checkY(16)
    y = sectionTitle('Observaciones', y)

    const obsItems = [
      ['Fortalezas', ficha.fortalezas],
      ['Puntos debiles', ficha.debilidades],
      ['Temas a reforzar', ficha.temasReforzar],
      ['Recomendacion de estudio', ficha.recomendacion],
    ].filter(([, v]) => v)

    const halfW = cW / 2 - 3
    let obsX = margin
    let obsRowY = y
    let colH = 0

    obsItems.forEach(([label, val], i) => {
      const lines = splitLines(doc, val, halfW - 8)
      const bH = lines.length * 4.2 + 10
      if (obsX + halfW > pageW - margin + 5) { obsX = margin; obsRowY += colH + 3; colH = 0 }
      checkY(bH)
      doc.setFillColor(...C.cream)
      doc.roundedRect(obsX, obsRowY, halfW, bH, 2, 2, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(...C.slateLight)
      doc.text(safeText(label).toUpperCase(), obsX + 3, obsRowY + 4.5)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...C.slate)
      lines.forEach((line, j) => doc.text(safeText(line), obsX + 3, obsRowY + 9 + j * 4.2))
      colH = Math.max(colH, bH)
      obsX += halfW + 6
    })
    y = obsRowY + colH + 8
    hLine(y)
    y += 6
  }

  // ── RESULTADO ────────────────────────────────────────────────────
  if (ficha.resultado) {
    checkY(16)
    y = sectionTitle('Resultado orientativo', y)
    const resColors = {
      'buen desempeño': [209, 250, 229],
      'desempeño suficiente': [254, 243, 199],
      'requiere reforzar': [254, 226, 226],
      'ausente': [226, 232, 240],
      'reprogramado': [219, 234, 254],
    }
    const rc = resColors[ficha.resultado] || C.cream
    doc.setFillColor(...rc)
    doc.roundedRect(margin, y, cW, 12, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...C.ocean)
    doc.text(safeText(ficha.resultado).toUpperCase(), pageW / 2, y + 8, { align: 'center' })
    y += 18
  }

  // ── FOOTER ───────────────────────────────────────────────────────
  const footerY = pageH - 12
  doc.setFillColor(...C.ocean)
  doc.rect(0, footerY - 2, pageW, 14, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.pinkLight)
  doc.text('Generado con Marea ✦ — Workspace de Valentina Munoz', pageW / 2, footerY + 4, { align: 'center' })

  // ── GUARDAR ──────────────────────────────────────────────────────
  const nomAlumno = (alumno.nombre || 'Alumno').replace(/\s+/g, '_')
  const materia = (alumno.materia || alumno.ramo || 'Materia').replace(/\s+/g, '_')
  let fechaFile = format(new Date(), 'dd-MM')
  if (interrogacion?.fecha) {
    try { fechaFile = format(parseISO(interrogacion.fecha), 'dd-MM') } catch {}
  }
  doc.save(`Ficha_Interrogacion_${nomAlumno}_${materia}_${fechaFile}.pdf`)
}

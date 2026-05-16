export const preguntasPorRamo = {
  'Derecho Civil': [
    '¿Cuáles son los requisitos de existencia y validez del acto jurídico?',
    '¿Qué diferencia existe entre nulidad absoluta y relativa? Fundamente en el Código Civil.',
    'Explique el concepto de obligación natural y sus efectos jurídicos.',
    '¿Cuándo procede la responsabilidad extracontractual? Señale sus elementos.',
    '¿Qué es la teoría de la imprevisión y cuál es su recepción en el derecho chileno?',
    '¿En qué consiste el saneamiento por evicción y vicios redhibitorios en la compraventa?',
    '¿Cuáles son los modos de extinguir las obligaciones? Explique al menos tres.',
    '¿Qué es la acción pauliana y cuáles son sus requisitos?',
    '¿Cómo opera la representación en los actos jurídicos? Distinga entre legal y convencional.',
    'Explique las diferencias entre dolo y culpa en materia de responsabilidad civil.',
  ],
  'Derecho Procesal Civil': [
    '¿Cuáles son los presupuestos procesales para la válida constitución del juicio?',
    'Explique el recurso de apelación: concepto, resoluciones apelables, plazo y efectos.',
    '¿En qué consiste la nulidad procesal y cuáles son sus requisitos?',
    '¿Qué es la litis contestación y qué efectos produce?',
    'Explique los medios de prueba del CPC y su valor probatorio.',
    '¿Cuándo procede el recurso de casación en el fondo? Señale sus causales.',
    '¿Qué son las medidas prejudiciales y cuándo proceden?',
    'Distinga entre competencia absoluta y relativa. ¿Cómo se determina el juez competente?',
    '¿Qué es la cosa juzgada? Distinga sus aspectos formal y material.',
    'Explique el procedimiento ejecutivo: título ejecutivo, gestión preparatoria, excepciones.',
  ],
  'Derecho Administrativo': [
    '¿Cuáles son los elementos del acto administrativo y cuáles son requisitos de validez?',
    'Explique el principio de juridicidad y su consagración constitucional.',
    '¿Qué es la potestad sancionatoria de la Administración y cuáles son sus principios?',
    '¿En qué consiste el recurso de invalidación y ante qué órgano se presenta?',
    'Explique la prescripción de las acciones de nulidad de derecho público.',
    '¿Cuál es la función de la Contraloría General de la República? ¿Qué es el trámite de toma de razón?',
    '¿Qué establece la Ley 19.880 sobre los principios del procedimiento administrativo?',
    'Explique las diferencias entre la potestad disciplinaria y la sancionatoria.',
    '¿Qué es la discrecionalidad administrativa y cuáles son sus límites?',
    '¿En qué consiste el silencio administrativo positivo y negativo?',
  ],
  'Derecho Constitucional': [
    '¿Qué consagran los arts. 6° y 7° de la CPR? Explique el principio de juridicidad.',
    '¿Cuáles son las fuentes del Derecho Constitucional chileno?',
    'Explique la jerarquía normativa en Chile y la supremacía constitucional.',
    '¿Qué derechos consagra el art. 19 N°3 de la CPR?',
    '¿Cuáles son las atribuciones del Tribunal Constitucional? Señale al menos cuatro.',
    '¿Qué diferencia existe entre la inaplicabilidad y la inconstitucionalidad ante el TC?',
    'Explique el recurso de protección: concepto, requisitos, plazo y tribunal competente.',
    '¿Qué son los estados de excepción constitucional y cuáles existen en Chile?',
    '¿Cómo se reforma la Constitución Política? Señale las categorías de normas.',
    'Explique el principio de separación de poderes en la Constitución chilena.',
  ],
  'Filosofía del Derecho': [
    '¿Cuáles son las principales diferencias entre iusnaturalismo y positivismo jurídico?',
    'Explique la teoría pura del derecho de Kelsen. ¿Qué es la norma fundamental?',
    '¿Qué es el concepto de derecho para H.L.A. Hart? Explique la regla de reconocimiento.',
    '¿En qué consiste la hermenéutica jurídica de Gadamer aplicada al derecho?',
    'Explique la distinción entre reglas y principios en Dworkin.',
    '¿Qué es el derecho natural en Santo Tomás de Aquino?',
    '¿Cómo concibe Habermas la legitimidad del derecho positivo?',
    '¿Qué es el realismo jurídico escandinavo? Señale sus principales representantes.',
    'Explique la noción de justicia distributiva y conmutativa en Aristóteles.',
    '¿Qué es la interpretación jurídica? Señale los criterios clásicos de interpretación.',
  ],
}

export const generarPreguntasAleatorias = (ramo, cantidad = 5) => {
  const preguntas = preguntasPorRamo[ramo] || preguntasPorRamo['Derecho Administrativo']
  const shuffled = [...preguntas].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, cantidad)
}

export const ramosDisponibles = Object.keys(preguntasPorRamo)

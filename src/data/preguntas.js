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
    '¿Cómo opera la representación en los actos jurídicos?',
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
    'Distinga entre competencia absoluta y relativa.',
    '¿Qué es la cosa juzgada? Distinga sus aspectos formal y material.',
    'Explique el procedimiento ejecutivo: título ejecutivo, gestión preparatoria, excepciones.',
  ],
  'Derecho Procesal Penal': [
    'Explique los principios del sistema acusatorio chileno (Ley 19.696).',
    '¿Cuáles son las salidas alternativas al juicio oral? Explique cada una.',
    '¿En qué consiste la formalización de la investigación y cuáles son sus efectos?',
    '¿Qué es el juicio abreviado y cuándo procede?',
    'Explique las medidas cautelares personales en el proceso penal.',
    '¿Cuál es el rol del Ministerio Público y cuáles son sus atribuciones?',
    '¿En qué consiste el principio de inocencia y cómo opera en el proceso penal?',
    'Explique la estructura del juicio oral: etapas y características.',
    '¿Qué recursos proceden contra la sentencia definitiva en el proceso penal?',
    '¿Cuáles son los derechos del imputado desde la primera actuación del procedimiento?',
  ],
  'Derecho Constitucional': [
    '¿Qué consagran los arts. 6° y 7° de la CPR? Explique el principio de juridicidad.',
    '¿Cuáles son las fuentes del Derecho Constitucional chileno?',
    'Explique la jerarquía normativa en Chile y la supremacía constitucional.',
    '¿Qué derechos consagra el art. 19 N°3 de la CPR?',
    '¿Cuáles son las atribuciones del Tribunal Constitucional?',
    '¿Qué diferencia existe entre la inaplicabilidad y la inconstitucionalidad ante el TC?',
    'Explique el recurso de protección: concepto, requisitos, plazo y tribunal competente.',
    '¿Qué son los estados de excepción constitucional y cuáles existen en Chile?',
    '¿Cómo se reforma la Constitución Política?',
    'Explique el principio de separación de poderes en la Constitución chilena.',
  ],
  'Derecho Administrativo': [
    '¿Cuáles son los elementos del acto administrativo y cuáles son requisitos de validez?',
    'Explique el principio de juridicidad y su consagración constitucional.',
    '¿Qué es la potestad sancionatoria de la Administración y cuáles son sus principios?',
    '¿En qué consiste el recurso de invalidación y ante qué órgano se presenta?',
    'Explique la prescripción de las acciones de nulidad de derecho público.',
    '¿Cuál es la función de la Contraloría General de la República?',
    '¿Qué establece la Ley 19.880 sobre los principios del procedimiento administrativo?',
    'Explique las diferencias entre la potestad disciplinaria y la sancionatoria.',
    '¿Qué es la discrecionalidad administrativa y cuáles son sus límites?',
    '¿En qué consiste el silencio administrativo positivo y negativo?',
  ],
  'Grado de Derecho': [
    'Explique la teoría de la responsabilidad civil y sus fundamentos en el Código Civil.',
    '¿Cuáles son los principios generales del Derecho Procesal Civil chileno?',
    'Explique el sistema de fuentes del Derecho en Chile y su jerarquía.',
    '¿Qué es el acto administrativo y cuáles son sus requisitos de validez?',
    '¿Cómo opera el principio de legalidad en el ordenamiento jurídico chileno?',
    'Explique la distinción entre derecho público y privado y su relevancia práctica.',
    '¿Cuáles son los derechos fundamentales consagrados en el art. 19 CPR?',
    'Explique el recurso de protección y el recurso de amparo: similitudes y diferencias.',
    '¿Qué es la cosa juzgada y por qué es fundamental en el Estado de Derecho?',
    'Explique los modos de extinción de las obligaciones más relevantes.',
  ],
}

export const generarPreguntasAleatorias = (ramo, cantidad = 5) => {
  const preguntas = preguntasPorRamo[ramo] || preguntasPorRamo['Derecho Administrativo']
  const shuffled = [...preguntas].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(cantidad, preguntas.length))
}

export const ramosDisponibles = Object.keys(preguntasPorRamo)

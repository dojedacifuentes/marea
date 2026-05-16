# Marea ✦

> Workspace intelectual personal para Valentina Muñoz — abogada, magistranda, interrogadora académica.

Una aplicación web full-frontend, elegante y cozy, diseñada como "escritorio intelectual digital". Sin backend, sin autenticación, sin nube. Todo vive en tu navegador.

---

## Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3**
- **Framer Motion** — animaciones fluidas
- **Zustand** — estado global con persistencia en localStorage
- **React Router v6** — navegación SPA
- **Lucide React** — iconografía limpia
- **date-fns** — manejo de fechas

---

## Secciones

| Sección | Descripción |
|---|---|
| 🏠 Dashboard | Saludo, estado del mar según carga de trabajo, widgets de resumen |
| 👩‍🎓 Interrogaciones | CRUD alumnos + sesiones, generador de preguntas por ramo |
| 🎓 Magíster | Lecturas, investigación, timeline, biblioteca de autores |
| ✅ Tareas | CRUD completo con prioridad, categoría, progreso visual |
| 📚 Biblioteca | Entradas jurídicas (leyes, conceptos, jurisprudencia) |
| 📝 Notas | Libreta con colores, etiquetas, favoritas |
| 🧠 Flashcards | Estudio con flip animado, "lo sé / repasar" |
| 🎯 Focus Mode | Pomodoro inmersivo con sonidos Web Audio API |
| ⭐ Recompensas | Sistema de puntos, niveles y colección de stickers |
| ⚙️ Configuración | Nombre, exportar/importar JSON, reset demo |

---

## Instalación y uso

```bash
# 1. Ir al directorio
cd marea

# 2. Instalar dependencias
npm install

# 3. Iniciar en desarrollo
npm run dev

# 4. Build para producción
npm run build
```

La app abre en `http://localhost:5173`

---

## Deploy en Vercel

1. Push el proyecto a GitHub
2. Importar en [vercel.com](https://vercel.com)
3. Framework preset: **Vite**
4. Sin variables de entorno necesarias
5. Deploy ✓

---

## Persistencia

Todos los datos se guardan en **localStorage** con el prefijo `marea_`. Sobreviven:
- ✓ Refresh de página
- ✓ Cerrar y reabrir el navegador
- ✓ Reiniciar el dispositivo

Para transferir datos entre dispositivos: **Configuración → Exportar JSON** y luego **Importar JSON** en el otro dispositivo.

---

## Estética

- Paleta: rosa pastel · crema · azul océano · lavanda · coral
- Glassmorphism suave con tarjetas redondeadas
- Animaciones con Framer Motion
- Tipografía: Playfair Display (títulos) + Inter (body)
- Mood visual dinámico en el Dashboard según carga de trabajo

---

*"Como el mar, el conocimiento no tiene límites."* 🌊

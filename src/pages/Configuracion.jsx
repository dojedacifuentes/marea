import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Download, Upload, RefreshCw, Trash2, Save, AlertTriangle } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import { storage, downloadJSON } from '../utils/storage'

export default function Configuracion() {
  const { config, setConfig, resetToDemo } = useAppStore()
  const [nombre, setNombre] = useState(config.userName || 'Valentina')
  const [saved, setSaved] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const saveConfig = () => {
    setConfig({ userName: nombre })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const exportData = () => {
    const data = storage.exportAll()
    downloadJSON(data, `marea-backup-${new Date().toISOString().slice(0, 10)}.json`)
  }

  const importData = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        storage.importAll(data)
        window.location.reload()
      } catch {
        alert('Error al importar: archivo JSON inválido')
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    resetToDemo()
    setConfirmReset(false)
    window.location.reload()
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-marea-ocean">Configuración</h1>
        <p className="text-slate-500 text-sm mt-1">Personaliza tu workspace</p>
      </div>

      <div className="space-y-5">
        {/* Perfil */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <h2 className="font-display text-lg font-semibold text-slate-800">Perfil</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Nombre de saludo</label>
              <input
                className="input-field"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
              />
              <p className="text-xs text-slate-400 mt-1.5">Aparecerá en el saludo del Dashboard: "Hola, {nombre} ✦"</p>
            </div>

            <button
              onClick={saveConfig}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-sm transition-all ${saved ? 'bg-emerald-100 text-emerald-700' : 'btn-primary'}`}
            >
              {saved ? '✓ Guardado' : <><Save size={15} /> Guardar cambios</>}
            </button>
          </div>
        </motion.div>

        {/* Datos */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center">
              <Download size={16} className="text-white" />
            </div>
            <h2 className="font-display text-lg font-semibold text-slate-800">Datos y respaldo</h2>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-500">Todos tus datos se guardan localmente en este navegador. Puedes exportarlos para hacer respaldo o importarlos en otro dispositivo.</p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={exportData} className="btn-ocean flex items-center gap-2 text-sm">
                <Download size={15} /> Exportar JSON
              </button>

              <label className="btn-ghost flex items-center gap-2 text-sm cursor-pointer">
                <Upload size={15} /> Importar JSON
                <input type="file" accept=".json" className="hidden" onChange={importData} />
              </label>
            </div>
          </div>
        </motion.div>

        {/* Acerca de */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-4">Acerca de Marea</h2>
          <div className="space-y-2 text-sm text-slate-500">
            <p>🌊 <strong>Marea</strong> — workspace intelectual personal</p>
            <p>Versión 1.0.0</p>
            <p>Diseñada para Valentina Muñoz, abogada PUCV.</p>
            <p className="text-xs text-slate-400 mt-3 italic">
              "Como el mar, el conocimiento no tiene límites."
            </p>
          </div>

          <div className="mt-4 p-3 bg-pink-50 rounded-2xl text-xs text-pink-600">
            💾 Datos almacenados localmente en localStorage · Sin backend · Sin nube · Sin registro
          </div>
        </motion.div>

        {/* Zona peligrosa */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 border-2 border-red-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center">
              <AlertTriangle size={16} className="text-white" />
            </div>
            <h2 className="font-display text-lg font-semibold text-red-600">Zona de reinicio</h2>
          </div>

          {!confirmReset ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Restaurar todos los datos de demostración. <strong>Esto eliminará todos tus datos actuales.</strong></p>
              <button onClick={() => setConfirmReset(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm transition-colors">
                <RefreshCw size={15} /> Restaurar datos demo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-2xl text-sm text-red-700 font-medium">
                ⚠️ ¿Estás segura? Esta acción no se puede deshacer.
              </div>
              <div className="flex gap-3">
                <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors">
                  <Trash2 size={15} /> Sí, reiniciar todo
                </button>
                <button onClick={() => setConfirmReset(false)} className="btn-ghost text-sm">Cancelar</button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

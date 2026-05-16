import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

export default function SaveToast({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-2xl shadow-lg"
        >
          <Check size={15} />
          Guardado automáticamente
        </motion.div>
      )}
    </AnimatePresence>
  )
}

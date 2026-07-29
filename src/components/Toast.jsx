import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, X } from 'lucide-react'

export default function Toast({ toast, onDismiss }) {
  return (
    <div className="fixed top-24 right-4 sm:right-6 z-[100] w-[calc(100%-2rem)] sm:w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg bg-(--color-surface) ${
              toast.type === 'success' ? 'border-(--color-leaf)' : 'border-[#B5502E]'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-(--color-forest)" />
            ) : (
              <AlertTriangle size={19} className="mt-0.5 shrink-0 text-[#B5502E]" />
            )}
            <p className="flex-1 text-sm text-(--color-ink)">{toast.message}</p>
            <button
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="shrink-0 text-(--color-ink-soft) hover:text-(--color-ink) visible-focus"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
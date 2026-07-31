import { motion } from 'framer-motion'

/**
 * Reusable empty-state block: an icon, a heading, a short description, and
 * an optional action — used anywhere a list/section has zero data, instead
 * of leaving a blank area or a single bare line of text.
 */
export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex flex-col items-center text-center gap-3 rounded-2xl border border-dashed border-(--color-line) bg-(--color-bg) py-12 px-6 ${className}`}
    >
      {Icon && (
        <span className="grid place-items-center w-11 h-11 rounded-full bg-(--color-leaf-soft)/60 text-(--color-forest-deep)">
          <Icon size={20} strokeWidth={1.75} />
        </span>
      )}
      <div>
        <p className="text-sm font-medium text-(--color-ink)">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-(--color-ink-soft) max-w-sm">{description}</p>
        )}
      </div>
      {action}
    </motion.div>
  )
}
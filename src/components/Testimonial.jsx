import { motion } from 'framer-motion'

export default function Testimonial() {
  return (
    <section id="testimonial" className="py-24 px-6 bg-(--color-surface)">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="font-display text-3xl sm:text-4xl leading-snug text-(--color-forest-deep)">
          "We went from a spreadsheet updated twice a year to a live number the whole
          operations team checks weekly. Our CSRD filing took two days instead of six weeks."
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="w-11 h-11 rounded-full bg-(--color-leaf-soft) grid place-items-center font-display text-(--color-forest-deep)">
            RM
          </span>
          <div className="text-left">
            <p className="text-sm font-medium text-(--color-ink)">Renata Marsh</p>
            <p className="text-xs text-(--color-ink-soft)">Head of Sustainability, Basalt Foods</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

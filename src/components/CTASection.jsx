import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section id="cta" className="px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-6xl rounded-3xl overflow-hidden bg-(--color-forest-deep) px-8 py-16 sm:py-20 text-center"
      >
        <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-(--color-leaf)/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-(--color-gold)/15 blur-3xl" />

        <h2 className="font-display text-4xl sm:text-5xl text-white max-w-2xl mx-auto leading-tight relative">
          Start measuring what you're actually reducing.
        </h2>
        <p className="mt-5 text-(--color-leaf-soft) max-w-md mx-auto relative">
          Set up your first integration in under fifteen minutes. No credit card required.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4 relative">
          <a
            href="#"
            className="group inline-flex items-center gap-2 bg-(--color-gold) text-(--color-forest-deep) px-7 py-3.5 rounded-full font-medium hover:bg-(--color-gold-soft) transition-colors visible-focus"
          >
            Start free trial
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#"
            className="text-sm font-medium text-white/90 underline decoration-white/40 underline-offset-4 hover:text-white visible-focus"
          >
            Talk to sales
          </a>
        </div>
      </motion.div>
    </section>
  )
}

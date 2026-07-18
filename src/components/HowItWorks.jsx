import { motion } from 'framer-motion'

const STEPS = [
  {
    n: '01',
    title: 'Connect your systems',
    desc: 'Link ERP, utility bills, fleet telematics, and supplier data through pre-built integrations — no manual CSV uploads.',
  },
  {
    n: '02',
    title: 'Measure automatically',
    desc: 'Canopy classifies activity data into Scope 1, 2, and 3 categories using current emission factors, updated as standards change.',
  },
  {
    n: '03',
    title: 'Reduce with a plan',
    desc: 'See ranked reduction opportunities by cost and impact, and assign owners directly from the dashboard.',
  },
  {
    n: '04',
    title: 'Report with confidence',
    desc: 'Export audit-ready reports whenever a regulator, investor, or customer asks — figures trace back to source data.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-(--color-surface)">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-(--color-forest)">· Process ·</span>
          <h2 className="font-display text-4xl text-(--color-forest-deep) mt-3 leading-tight">
            From first connection to filed report, in four steps.
          </h2>
        </div>

        <div className="relative grid md:grid-cols-4 gap-10 md:gap-6">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ originX: 0 }}
            className="hidden md:block absolute top-6 left-0 right-0 h-px bg-(--color-line)"
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              <span className="relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-full bg-(--color-forest) text-(--color-gold-soft) font-mono text-sm mb-5">
                {step.n}
              </span>
              <h3 className="font-display text-lg text-(--color-forest-deep)">{step.title}</h3>
              <p className="mt-2 text-[15px] text-(--color-ink-soft) leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

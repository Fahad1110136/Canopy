import { motion } from 'framer-motion'
import { Radar, GitBranch, FileCheck2, Bell } from 'lucide-react'

const FEATURES = [
  {
    icon: Radar,
    title: 'Live emissions tracking',
    desc: 'Every facility, fleet vehicle, and supplier feed rolls up into one number that updates in real time, not once a quarter.',
  },
  {
    icon: GitBranch,
    title: 'Source-level breakdown',
    desc: 'Trace any spike back to the exact site, shipment, or process that caused it, so reduction plans target the right thing.',
  },
  {
    icon: FileCheck2,
    title: 'Audit-ready reporting',
    desc: 'Generate CSRD, GHG Protocol, and CDP-aligned reports in minutes, with every figure traceable to its source data.',
  },
  {
    icon: Bell,
    title: 'Threshold alerts',
    desc: 'Set limits per site or category and get notified before a small drift becomes a quarter-end surprise.',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-(--color-forest)">Product</span>
          <h2 className="font-display text-4xl text-(--color-forest-deep) mt-3 leading-tight">
            Everything a sustainability team needs, nothing they have to chase down.
          </h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid sm:grid-cols-2 gap-5"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="bg-(--color-surface) border border-(--color-line) rounded-2xl p-7 hover:shadow-[0_20px_40px_-24px_rgba(22,36,28,0.25)] transition-shadow"
            >
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-(--color-leaf-soft)/70 text-(--color-forest-deep) mb-5">
                <f.icon size={20} strokeWidth={2} />
              </span>
              <h3 className="font-display text-xl text-(--color-forest-deep)">{f.title}</h3>
              <p className="mt-2.5 text-[15px] text-(--color-ink-soft) leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { TrendingDown, Building2, Truck, Zap } from 'lucide-react'

const ROWS = [
  { icon: Building2, label: 'Facilities', value: '18.2t', delta: '-6.4%' },
  { icon: Truck, label: 'Logistics', value: '9.7t', delta: '-11.2%' },
  { icon: Zap, label: 'Energy', value: '24.1t', delta: '-3.8%' },
]

export default function DashboardPreview() {
  const ref = useRef(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 150, damping: 18 })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 150, damping: 18 })

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }
  function handleLeave() {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <section id="dashboard" className="py-24 px-6">
      <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-mono uppercase tracking-widest text-(--color-forest)">Dashboard</span>
          <h2 className="font-display text-4xl text-(--color-forest-deep) mt-3 leading-tight">
            One screen, every emission source, always current.
          </h2>
          <p className="mt-5 text-[15px] text-(--color-ink-soft) leading-relaxed max-w-md">
            Filter by facility, category, or reporting period. Every figure links back to the
            invoice, meter reading, or shipment record that produced it — so nothing in a report
            is a guess.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="bg-(--color-surface) border border-(--color-line) rounded-2xl p-6 shadow-[0_30px_60px_-30px_rgba(22,36,28,0.3)]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-(--color-ink-soft)">Total emissions · Q2</p>
              <p className="font-display text-3xl text-(--color-forest-deep) mt-1">52.0 t CO₂e</p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-(--color-forest) bg-(--color-leaf-soft)/60 px-3 py-1.5 rounded-full">
              <TrendingDown size={15} /> -7.1%
            </span>
          </div>

          <div className="flex items-end gap-2 h-24 mb-6">
            {[62, 58, 54, 55, 48, 44, 40].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-(--color-leaf-soft)" style={{ height: `${h}%` }} />
            ))}
            <div className="flex-1 rounded-t-md bg-(--color-forest)" style={{ height: '34%' }} />
          </div>

          <div className="space-y-3">
            {ROWS.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5 border-t border-(--color-line)">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-(--color-bg) text-(--color-forest-deep)">
                    <row.icon size={15} />
                  </span>
                  <span className="text-sm text-(--color-ink)">{row.label}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-sm">
                  <span className="text-(--color-ink)">{row.value}</span>
                  <span className="text-(--color-forest)">{row.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

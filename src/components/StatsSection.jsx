import { useRef, useEffect, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'

const STATS = [
  { value: 42, suffix: '%', label: 'average emissions reduction in year one' },
  { value: 1200, suffix: '+', label: 'facilities tracked in real time' },
  { value: 6, suffix: ' wks', label: 'typical time to first verified report' },
  { value: 98, suffix: '%', label: 'of customers pass audit on first submission' },
]

function CountUp({ value, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value])

  return (
    <span ref={ref} className="font-display text-5xl text-(--color-forest-deep)">
      {display}
      {suffix}
    </span>
  )
}

export default function StatsSection() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="text-center md:text-left"
          >
            <CountUp value={stat.value} suffix={stat.suffix} />
            <p className="mt-2 text-sm text-(--color-ink-soft) leading-snug">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

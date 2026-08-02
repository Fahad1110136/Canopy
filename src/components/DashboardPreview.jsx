import { useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  TrendingDown,
  Building2,
  Truck,
  Zap,
  LayoutGrid,
  Warehouse,
  Factory,
  Ship,
  PlaneTakeoff,
  Sun,
  Plug,
} from 'lucide-react'

const OVERVIEW_ROWS = [
  { icon: Building2, label: 'Facilities', value: '18.2t', delta: '-6.4%' },
  { icon: Truck, label: 'Logistics', value: '9.7t', delta: '-11.2%' },
  { icon: Zap, label: 'Energy', value: '24.1t', delta: '-3.8%' },
]

const FACILITY_SEGMENTS = [
  { icon: Factory, label: 'Plants', value: '9.5t', share: 52 },
  { icon: Warehouse, label: 'Warehouses', value: '5.6t', share: 31 },
  { icon: Building2, label: 'Offices', value: '3.1t', share: 17 },
]

const LOGISTICS_MODES = [
  { icon: Truck, label: 'Road freight', value: '5.9t', share: 61 },
  { icon: Ship, label: 'Sea freight', value: '2.3t', share: 24 },
  { icon: PlaneTakeoff, label: 'Air freight', value: '1.5t', share: 15 },
]

const ENERGY_TREND = [46, 50, 42, 58, 52, 66, 60, 74]
const ENERGY_MIX = [
  { icon: Sun, label: 'Renewable', value: '42%' },
  { icon: Plug, label: 'Grid', value: '58%' },
]

const CARDS = [
  {
    id: 'overview',
    label: 'Overview',
    tabIcon: LayoutGrid,
    period: 'Total emissions · Q2',
    stat: '52.0 t CO₂e',
    delta: '-7.1%',
  },
  {
    id: 'facilities',
    label: 'Facilities',
    tabIcon: Building2,
    period: 'Facilities · Q2',
    stat: '18.2 t',
    delta: '-6.4%',
  },
  {
    id: 'logistics',
    label: 'Logistics',
    tabIcon: Truck,
    period: 'Logistics · Q2',
    stat: '9.7 t',
    delta: '-11.2%',
  },
  {
    id: 'energy',
    label: 'Energy',
    tabIcon: Zap,
    period: 'Energy · Q2',
    stat: '24.1 t',
    delta: '-3.8%',
  },
]

// Precompute the donut ring geometry for the facilities card.
const RING_R = 38
const RING_C = 2 * Math.PI * RING_R
let cumulative = 0
const RING_ARCS = FACILITY_SEGMENTS.map((seg) => {
  const arc = { ...seg, offset: cumulative, dash: (seg.share / 100) * RING_C }
  cumulative += (seg.share / 100) * RING_C
  return arc
})

// Precompute the sparkline path for the energy card.
const SPARK_W = 260
const SPARK_H = 70
const sparkMax = Math.max(...ENERGY_TREND)
const sparkMin = Math.min(...ENERGY_TREND)
const sparkPoints = ENERGY_TREND.map((v, i) => {
  const x = (i / (ENERGY_TREND.length - 1)) * SPARK_W
  const y = SPARK_H - ((v - sparkMin) / (sparkMax - sparkMin)) * SPARK_H
  return [x, y]
})
const sparkLine = sparkPoints.map(([x, y]) => `${x},${y}`).join(' ')
const sparkArea = `0,${SPARK_H} ${sparkLine} ${SPARK_W},${SPARK_H}`

export default function DashboardPreview() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)

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

  function goTo(next) {
    setDirection(next > active ? 1 : -1)
    setActive(next)
  }

  const card = CARDS[active]

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
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
          <span className="text-xs font-mono uppercase tracking-widest text-(--color-forest)">· Dashboard ·</span>
          <h2 className="font-display text-4xl text-(--color-forest-deep) mt-3 leading-tight">
            One screen, every emission source, always current.
          </h2>
          <p className="mt-5 text-[15px] text-(--color-ink-soft) leading-relaxed max-w-md">
            Swipe through facilities, logistics, and energy. Every figure links back to the
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
          className="relative bg-(--color-surface) border border-(--color-line) rounded-2xl p-6 shadow-[0_30px_60px_-30px_rgba(22,36,28,0.3)] overflow-hidden"
        >
          {/* Category tabs act as both navigation and swipe indicator */}
          <div className="relative flex items-center gap-1.5 mb-6">
            {CARDS.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show ${c.label} stats`}
                aria-current={i === active}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  i === active
                    ? 'bg-(--color-forest-deep) text-(--color-surface)'
                    : 'text-(--color-ink-soft) hover:bg-(--color-bg)'
                }`}
              >
                <c.tabIcon size={13} />
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative min-h-[260px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={card.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50 && active < CARDS.length - 1) goTo(active + 1)
                  else if (info.offset.x > 50 && active > 0) goTo(active - 1)
                }}
                className="cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-(--color-ink-soft)">
                      {card.period}
                    </p>
                    <p className="font-display text-3xl text-(--color-forest-deep) mt-1">{card.stat}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-(--color-forest) bg-(--color-leaf-soft)/60 px-3 py-1.5 rounded-full">
                    <TrendingDown size={15} /> {card.delta}
                  </span>
                </div>

                {card.id === 'overview' && (
                  <>
                    <div className="flex items-end gap-2 h-24 mb-6">
                      {[62, 58, 54, 55, 48, 44, 40].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-md bg-(--color-leaf-soft)" style={{ height: `${h}%` }} />
                      ))}
                      <div className="flex-1 rounded-t-md bg-(--color-forest)" style={{ height: '34%' }} />
                    </div>
                    <div className="space-y-3">
                      {OVERVIEW_ROWS.map((row) => (
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
                  </>
                )}

                {card.id === 'facilities' && (
                  <div className="flex items-center gap-6">
                    <svg width="104" height="104" viewBox="0 0 104 104" className="shrink-0 -rotate-90">
                      <circle cx="52" cy="52" r={RING_R} fill="none" stroke="var(--color-bg)" strokeWidth="12" />
                      {RING_ARCS.map((seg, i) => (
                        <circle
                          key={seg.label}
                          cx="52"
                          cy="52"
                          r={RING_R}
                          fill="none"
                          stroke={i === 0 ? 'var(--color-forest-deep)' : i === 1 ? 'var(--color-forest)' : 'var(--color-leaf-soft)'}
                          strokeWidth="12"
                          strokeDasharray={`${seg.dash} ${RING_C - seg.dash}`}
                          strokeDashoffset={-seg.offset}
                          strokeLinecap="butt"
                        />
                      ))}
                    </svg>
                    <div className="flex-1 space-y-3">
                      {FACILITY_SEGMENTS.map((seg) => (
                        <div key={seg.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="grid place-items-center w-7 h-7 rounded-lg bg-(--color-bg) text-(--color-forest-deep)">
                              <seg.icon size={13} />
                            </span>
                            <span className="text-sm text-(--color-ink)">{seg.label}</span>
                          </div>
                          <span className="font-mono text-sm text-(--color-ink-soft)">{seg.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {card.id === 'logistics' && (
                  <div className="space-y-4">
                    {LOGISTICS_MODES.map((mode) => (
                      <div key={mode.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="grid place-items-center w-7 h-7 rounded-lg bg-(--color-bg) text-(--color-forest-deep)">
                              <mode.icon size={13} />
                            </span>
                            <span className="text-sm text-(--color-ink)">{mode.label}</span>
                          </div>
                          <span className="font-mono text-sm text-(--color-ink-soft)">{mode.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-(--color-bg) overflow-hidden">
                          <div
                            className="h-full rounded-full bg-(--color-forest)"
                            style={{ width: `${mode.share}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {card.id === 'energy' && (
                  <div>
                    <svg width="100%" height={SPARK_H + 10} viewBox={`0 0 ${SPARK_W} ${SPARK_H + 10}`} className="mb-4">
                      <polygon points={sparkArea} fill="var(--color-leaf-soft)" opacity="0.5" />
                      <polyline
                        points={sparkLine}
                        fill="none"
                        stroke="var(--color-forest-deep)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex gap-3">
                      {ENERGY_MIX.map((m) => (
                        <div key={m.label} className="flex-1 flex items-center gap-2.5 rounded-lg bg-(--color-bg) px-3 py-2.5">
                          <span className="grid place-items-center w-7 h-7 rounded-lg bg-(--color-surface) text-(--color-forest-deep)">
                            <m.icon size={13} />
                          </span>
                          <div>
                            <p className="font-mono text-sm text-(--color-ink)">{m.value}</p>
                            <p className="text-xs text-(--color-ink-soft)">{m.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
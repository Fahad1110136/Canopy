import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown, Zap, Plane, Building2 } from 'lucide-react'

export default function Hero() {
  const sectionRef = useRef(null)
  const [count, setCount] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Parallax: background blobs drift slower than scroll, copy drifts up & fades
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 160])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 40])

  const targetPercent = 42

  // Industry benchmark tick position, as % coordinates around the ring (0% = top, clockwise)
  const benchmarkPercent = 25
  const benchmarkAngle = (benchmarkPercent / 100) * 2 * Math.PI - Math.PI / 2
  const benchmarkLeft = 50 + 50 * Math.cos(benchmarkAngle)
  const benchmarkTop = 50 + 50 * Math.sin(benchmarkAngle)

  // Rising "boiling gas" particle field — varied size, color, speed, and wobble
  const particles = [
    { left: '8%', bottom: '4%', size: 6, color: 'var(--color-leaf)', duration: 6, delay: 0, xDrift: 8, rise: 150 },
    { left: '17%', bottom: '10%', size: 4, color: 'var(--color-leaf)', duration: 7.4, delay: 1.1, xDrift: -10, rise: 130 },
    { left: '28%', bottom: '2%', size: 3.5, color: 'var(--color-forest)', duration: 6.6, delay: 2.4, xDrift: 6, rise: 160 },
    { left: '40%', bottom: '8%', size: 5, color: 'var(--color-gold, #b58b2e)', duration: 7.9, delay: 0.6, xDrift: -8, rise: 140 },
    { left: '52%', bottom: '3%', size: 4.5, color: 'var(--color-leaf)', duration: 6.2, delay: 3.2, xDrift: 9, rise: 155 },
    { left: '64%', bottom: '9%', size: 3, color: 'var(--color-forest)', duration: 8.3, delay: 1.8, xDrift: -6, rise: 125 },
    { left: '76%', bottom: '5%', size: 5.5, color: 'var(--color-gold, #b58b2e)', duration: 7, delay: 2.9, xDrift: 7, rise: 145 },
    { left: '86%', bottom: '11%', size: 4, color: 'var(--color-leaf)', duration: 6.8, delay: 0.3, xDrift: -9, rise: 135 },
  ]

  // Count-up animation for the headline percentage (also drives the ring fill)
  useEffect(() => {
    let startTime
    const duration = 1400
    const delay = 900

    let rafId
    const timeoutId = setTimeout(() => {
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        setCount(Math.round(progress * targetPercent))
        if (progress < 1) rafId = requestAnimationFrame(step)
      }
      rafId = requestAnimationFrame(step)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden pt-28 pb-16"
    >
      {/* Parallax background blobs */}
      <motion.div style={{ y: blobY }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 w-[26rem] h-[26rem] rounded-full bg-(--color-leaf-soft) opacity-50 blur-3xl" />
        <div className="absolute top-40 right-[-6rem] w-[22rem] h-[22rem] rounded-full bg-(--color-gold-soft) opacity-60 blur-3xl" />
      </motion.div>

      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 items-center w-full">
        <motion.div style={{ y: copyY, opacity: copyOpacity }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-(--color-forest) bg-(--color-leaf-soft)/60 px-3 py-1.5 rounded-full"
          >
            Carbon intelligence 
            <span className="w-1.5 h-1.5 rounded-full bg-(--color-leaf) animate-pulse" />
            live
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl sm:text-6xl leading-[1.05] tracking-tight text-(--color-forest-deep) mt-5"
          >
            Watch your emissions
            <br />
            shrink as your
            <br />
            company grows.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-6 text-lg text-(--color-ink-soft) max-w-md"
          >
            Canopy connects to your existing tools, measures emissions across every team,
            and turns reduction into a metric you track daily — not a report you file yearly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 bg-(--color-forest) text-white px-6 py-3.5 rounded-full font-medium hover:bg-(--color-forest-deep) transition-colors visible-focus"
            >
              Start free trial
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-(--color-ink) underline decoration-(--color-leaf) decoration-2 underline-offset-4 hover:text-(--color-forest-deep) visible-focus"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 flex items-center gap-3 font-mono text-xs text-(--color-ink-soft)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-(--color-leaf) animate-pulse" />
            No credit card · 14-day trial · Cancel anytime
          </motion.div>
        </motion.div>

        {/* Right side: radial canopy gauge */}
        <motion.div
          style={{ y: visualY }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[380px] sm:h-[460px] flex items-center justify-center"
        >
          {/* Concentric canopy-ring backdrop */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] rounded-full border border-(--color-leaf-soft)" />
            <div className="absolute w-[270px] h-[270px] sm:w-[320px] sm:h-[320px] rounded-full border border-(--color-leaf-soft)" />
          </div>

          {/* Rising "boiling gas" particle field, glowing base beneath the rings */}
          <div className="absolute inset-x-0 bottom-0 h-40 overflow-hidden pointer-events-none">
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-(--color-leaf-soft)/50 to-transparent blur-md" />
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: p.left,
                  bottom: p.bottom,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                }}
                animate={{
                  y: [0, -p.rise],
                  x: [0, p.xDrift, 0],
                  opacity: [0, 0.75, 0],
                  scale: [0.6, 1, 0.3],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Soft pulsing glow behind the ring — centered the same way as the rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-(--color-leaf-soft) blur-2xl"
              animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.06, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Category badges orbiting the gauge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ opacity: { delay: 0.9, duration: 0.5 }, y: { delay: 1.2, duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute top-2 left-0 sm:left-4 flex items-center gap-2 bg-white shadow-md rounded-xl px-3 py-2 border border-(--color-leaf-soft)"
          >
            <Zap size={14} className="text-(--color-gold, #b58b2e)" />
            <span className="text-xs font-medium text-(--color-ink)">Energy −22%</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [40, 50, 40] }}
            transition={{ opacity: { delay: 1.05, duration: 0.5 }, y: { delay: 1.4, duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute bottom-16 left-0 sm:left-2 flex items-center gap-2 bg-white shadow-md rounded-xl px-3 py-2 border border-(--color-leaf-soft)"
          >
            <Plane size={14} className="text-(--color-forest)" />
            <span className="text-xs font-medium text-(--color-ink)">Travel −15%</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, -6, 0] }}
            transition={{ opacity: { delay: 1.2, duration: 0.5 }, y: { delay: 1.6, duration: 4.5, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute bottom-2 right-0 sm:right-4 flex items-center gap-2 bg-white shadow-md rounded-xl px-3 py-2 border border-(--color-leaf-soft)"
          >
            <Building2 size={14} className="text-(--color-forest)" />
            <span className="text-xs font-medium text-(--color-ink)">Facilities −9%</span>
          </motion.div>

          {/* Main radial gauge — centered against the same box as the rings above */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              {/* Progress ring — conic-gradient, synced to the same `count` driving the number below */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(var(--color-forest) ${count * 3.6}deg, var(--color-leaf-soft) ${count * 3.6}deg 360deg)`,
                  WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 10px))',
                  mask: 'radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 10px))',
                }}
              />

              {/* Industry benchmark tick, positioned at 25% around the ring */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full shadow-sm"
                style={{
                  left: `${benchmarkLeft}%`,
                  top: `${benchmarkTop}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'var(--color-gold, #b58b2e)',
                }}
              />

              {/* Center readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <div className="flex items-center gap-1.5 bg-(--color-leaf-soft)/60 text-(--color-forest) text-[10px] font-medium px-2.5 py-1 rounded-full mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-(--color-leaf) animate-pulse" />
                  Live
                </div>
                <span className="text-4xl font-display text-(--color-forest-deep) tabular-nums">
                  −{count}%
                </span>
                <span className="text-xs text-(--color-ink-soft) mt-1">
                  emissions vs last year
                </span>
                <span className="text-[11px] font-mono text-(--color-ink-soft) mt-2">
                  1,284 tCO₂e tracked
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#trust"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 text-(--color-ink-soft) visible-focus"
        aria-label="Scroll to explore"
      >
        <span className="text-[11px] font-mono uppercase tracking-widest">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} />
        </motion.span>
      </motion.a>
    </section>
  )
}
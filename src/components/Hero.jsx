import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import TreeCanvas from '../three/TreeCanvas.jsx'
import { useScrollGrowth } from '../hooks/useScrollGrowth.js'

export default function Hero() {
  const sectionRef = useRef(null)
  const growth = useScrollGrowth(sectionRef, { start: 0, end: 700 })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Parallax: background blobs drift slower than scroll, copy drifts up & fades
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 160])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const treeY = useTransform(scrollYProgress, [0, 1], [0, 40])

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
            Carbon intelligence, live
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
            <a
              href="#cta"
              className="group inline-flex items-center gap-2 bg-(--color-forest) text-white px-6 py-3.5 rounded-full font-medium hover:bg-(--color-forest-deep) transition-colors visible-focus"
            >
              Start free trial
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </a>
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

        <motion.div
          style={{ y: treeY }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[380px] sm:h-[460px]"
        >
          <TreeCanvas growth={growth} className="absolute inset-0" />
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

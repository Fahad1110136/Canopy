import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown, Wind, Sun, Factory, AlertTriangle, RefreshCw } from 'lucide-react'
import { AQ_LOCATIONS } from '../data/airQualityLocations.js'
import { fetchAllLocations, describeError } from '../services/openMeteoAirQuality.js'

// Semicircular gauge geometry — a 270° arc, drawn via a rotated full circle
// with a dashed gap, so it reads as a speedometer rather than a closed ring.
const GAUGE_R = 80
const GAUGE_C = 2 * Math.PI * GAUGE_R
const GAUGE_SWEEP = 270
const GAUGE_TRACK = GAUGE_C * (GAUGE_SWEEP / 360)

// How often the background silently re-fetches live data (ms).
const REFRESH_INTERVAL_MS = 30000

// Each location gets a consistent identity color for its gauge line —
// separate from the AQI severity tone, which stays health-coded (green/gold/rust).
const LOCATION_COLORS = ['var(--color-forest)', 'var(--color-leaf)', 'var(--color-gold, #b58b2e)', 'var(--color-forest-deep)']
function locationColor(index) {
  return LOCATION_COLORS[index % LOCATION_COLORS.length]
}

function aqiTone(aqi) {
  if (aqi == null) return { stroke: 'var(--color-line)', text: 'text-(--color-ink-soft)', chip: 'bg-(--color-bg)' }
  if (aqi < 40) return { stroke: 'var(--color-leaf)', text: 'text-(--color-forest-deep)', chip: 'bg-(--color-leaf-soft)/60' }
  if (aqi < 80) return { stroke: 'var(--color-gold, #b58b2e)', text: 'text-(--color-forest-deep)', chip: 'bg-(--color-gold-soft)/50' }
  return { stroke: '#B5502E', text: 'text-[#B5502E]', chip: 'bg-[#B5502E]/10' }
}

export default function Hero() {
  const sectionRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Parallax: background blobs drift slower than scroll, copy drifts up & fades
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 160])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 40])

  // Live air quality — same service the Air Quality section uses
  const [locations, setLocations] = useState(() => AQ_LOCATIONS.map((l) => ({ ...l, status: 'loading' })))
  const [loading, setLoading] = useState(true)
  const [globalError, setGlobalError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    // isInitial=true → first load for this effect run (shows loading skeleton, triggered
    // by mount or manual retry). isInitial=false → silent background refresh, no skeleton flash.
    const loadData = (isInitial) => {
      if (isInitial) setLoading(true)
      setGlobalError(null)

      fetchAllLocations(AQ_LOCATIONS, { signal: controller.signal })
        .then((results) => {
          if (controller.signal.aborted) return
          setLocations(results)
          const allFailed = results.every((r) => r.status === 'error')
          if (allFailed) setGlobalError(results[0]?.error || 'UNKNOWN')
        })
        .catch(() => {
          if (controller.signal.aborted) return
          setGlobalError('UNKNOWN')
        })
        .finally(() => {
          if (controller.signal.aborted) return
          if (isInitial) setLoading(false)
        })
    }

    loadData(true)
    const intervalId = setInterval(() => loadData(false), REFRESH_INTERVAL_MS)

    return () => {
      controller.abort()
      clearInterval(intervalId)
    }
  }, [reloadToken])

  // The selected location drives the main gauge and pollutant badges
  const spotlight = locations[activeIndex]
  const spotlightOk = spotlight?.status === 'ok'
  const spotlightAqi = spotlightOk ? spotlight.data.aqi : null
  const tone = aqiTone(spotlightAqi)
  const lineColor = locationColor(activeIndex)

  // The two cleanest reporting locations right now, for the ranked mini-card
  const cleanest = useMemo(() => {
    return locations
      .filter((l) => l.status === 'ok' && l.name !== spotlight?.name)
      .sort((a, b) => a.data.aqi - b.data.aqi)
      .slice(0, 2)
  }, [locations, spotlight])

  const gaugeValue = spotlightAqi != null ? Math.min(100, Math.round(spotlightAqi)) : 0
  const progressLength = GAUGE_TRACK * (gaugeValue / 100)

  // Rising "boiling gas" particle field — tinted with the selected location's
  // identity color, paced a little faster when that location's air is worse.
  const severity = spotlightAqi != null ? Math.min(1, spotlightAqi / 100) : 0.2
  const particleColor = lineColor
  const particles = [
    { left: '8%', bottom: '4%', size: 6, duration: 6, delay: 0, xDrift: 8, rise: 150 },
    { left: '20%', bottom: '10%', size: 4, duration: 7.4, delay: 1.1, xDrift: -10, rise: 130 },
    { left: '34%', bottom: '2%', size: 3.5, duration: 6.6, delay: 2.4, xDrift: 6, rise: 160 },
    { left: '50%', bottom: '8%', size: 5, duration: 7.9, delay: 0.6, xDrift: -8, rise: 140 },
    { left: '64%', bottom: '3%', size: 4.5, duration: 6.2, delay: 3.2, xDrift: 9, rise: 155 },
    { left: '78%', bottom: '9%', size: 3, duration: 8.3, delay: 1.8, xDrift: -6, rise: 125 },
    { left: '90%', bottom: '5%', size: 5.5, duration: 7, delay: 2.9, xDrift: 7, rise: 145 },
  ].map((p) => ({ ...p, duration: p.duration * (1 - severity * 0.25) }))

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

        {/* Right side: live air-quality spotlight */}
        <motion.div
          style={{ y: visualY }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[380px] sm:h-[460px] flex items-center justify-center"
        >
          {/* Rising particle field, tinted and paced by the live reading */}
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
                  backgroundColor: particleColor,
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

          {/* Soft pulsing glow behind the gauge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-(--color-leaf-soft) blur-2xl"
              animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.06, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Pollutant badge: PM2.5 — repositioned to sit between the O3 badge (left)
              and the Cleanest Sites card (right), centered horizontally. */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [25, 35, 25] }}
            transition={{ opacity: { delay: 0.9, duration: 0.5 }, y: { delay: 1.2, duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute bottom-10 left-[15%] -translate-x-1/2 z-20 flex items-center gap-2 bg-white shadow-md rounded-xl px-3 py-2 border border-(--color-leaf-soft)"
          >
            <Wind size={14} className="text-(--color-forest)" />
            <span className="text-xs font-medium text-(--color-ink)">
              {loading ? 'PM2.5 …' : spotlightOk ? `PM2.5 ${Math.round(spotlight.data.pm2_5)} µg/m³` : 'PM2.5 —'}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ opacity: { delay: 1.05, duration: 0.5 }, y: { delay: 1.4, duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute bottom-16 left-0 sm:left-2 flex items-center gap-2 bg-white shadow-md rounded-xl px-3 py-2 border border-(--color-leaf-soft)"
          >
            <Sun size={14} className="text-(--color-gold, #b58b2e)" />
            <span className="text-xs font-medium text-(--color-ink)">
              {loading ? 'Ozone …' : spotlightOk ? `O₃ ${Math.round(spotlight.data.ozone)} µg/m³` : 'Ozone —'}
            </span>
          </motion.div>

          {/* Ranked mini-card: cleanest reporting locations right now */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, -6, 0] }}
            transition={{ opacity: { delay: 1.2, duration: 0.5 }, y: { delay: 1.6, duration: 4.5, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute bottom-2 right-0 sm:right-2 w-44 bg-white shadow-md rounded-xl px-3 py-2.5 border border-(--color-leaf-soft)"
          >
            <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
              <Factory size={11} /> Cleanest Sites
            </p>
            {loading && <div className="h-7 rounded-md bg-(--color-bg) animate-pulse" />}
            {!loading && cleanest.length === 0 && (
              <p className="text-xs text-(--color-ink-soft)">No data yet</p>
            )}
            {!loading &&
              cleanest.map((loc) => (
                <div key={loc.name} className="flex items-center justify-between text-xs text-(--color-ink) py-0.5">
                  <span className="truncate">{loc.flag} {loc.name}</span>
                  <span className="font-mono text-(--color-forest-deep)">{Math.round(loc.data.aqi)}</span>
                </div>
              ))}
          </motion.div>

          {/* Main gauge — a 270° arc rather than a closed ring, driven by live data */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
                <circle
                  cx="100"
                  cy="100"
                  r={GAUGE_R}
                  fill="none"
                  stroke="var(--color-leaf-soft)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${GAUGE_TRACK} ${GAUGE_C - GAUGE_TRACK}`}
                  transform="rotate(-225 100 100)"
                />
                {!loading && spotlightOk && (
                  <motion.circle
                    key={activeIndex}
                    cx="100"
                    cy="100"
                    r={GAUGE_R}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="14"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${GAUGE_C}` }}
                    animate={{ strokeDasharray: `${progressLength} ${GAUGE_C - progressLength}` }}
                    transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    transform="rotate(-225 100 100)"
                  />
                )}
              </svg>

              {/* Center readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                {globalError ? (
                  <button
                    onClick={() => setReloadToken((t) => t + 1)}
                    className="flex items-center gap-1.5 bg-[#B5502E]/10 text-[#B5502E] text-[10px] font-medium px-2.5 py-1 rounded-full mb-2 visible-focus"
                  >
                    <AlertTriangle size={11} /> Retry <RefreshCw size={11} />
                  </button>
                ) : (
                  <div className={`flex items-center gap-1.5 ${tone.chip} ${tone.text} text-[10px] font-medium px-2.5 py-1 rounded-full mb-2`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-(--color-leaf) animate-pulse" />
                    {loading ? 'Fetching' : 'Live'}
                  </div>
                )}

                <span className={`text-4xl font-display tabular-nums ${globalError ? 'text-(--color-ink-soft)' : 'text-(--color-forest-deep)'}`}>
                  {loading ? '—' : spotlightOk ? Math.round(spotlightAqi) : '—'}
                </span>
                <span className="text-xs text-(--color-ink-soft) mt-1">
                  EU AQI · {spotlight?.name || 'headquarters'}
                </span>
                {/* <span className="text-[11px] font-mono text-(--color-ink-soft) mt-2">
                  {globalError ? describeError(globalError) : `${AQ_LOCATIONS.length} Live Sites`}
                </span> */}
              </div>
            </div>
          </motion.div>

          {/* Location switcher — pick which site the gauge, chips, and particles reflect */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="absolute -bottom-11 left-0 right-0 flex items-center justify-center gap-1.5 overflow-x-auto px-1"
          >
            {AQ_LOCATIONS.map((loc, i) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Show live air quality for ${loc.name}`}
                aria-current={i === activeIndex}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors visible-focus ${
                  i === activeIndex
                    ? 'bg-(--color-forest-deep) text-white'
                    : 'text-(--color-ink-soft) hover:bg-(--color-bg)'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: i === activeIndex ? 'currentColor' : locationColor(i) }}
                />
                <span aria-hidden="true">{loc.flag}</span>
                {loc.name}
              </button>
            ))}
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
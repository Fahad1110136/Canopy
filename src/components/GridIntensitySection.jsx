import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, RefreshCw, AlertTriangle, Zap } from 'lucide-react'
import { GRID_ZONES } from '../data/gridZones.js'
import { fetchAllZones, describeError } from '../services/electricityMaps.js'

const API_KEY = import.meta.env.VITE_ELECTRICITYMAPS_API_KEY

function intensityColor(value) {
  console.log('API key loaded:', import.meta.env.VITE_ELECTRICITYMAPS_API_KEY ? 'yes' : 'no')
  if (value == null) return { bar: 'bg-(--color-line)', text: 'text-(--color-ink-soft)' }
  if (value < 150) return { bar: 'bg-(--color-leaf)', text: 'text-(--color-forest-deep)' }
  if (value < 400) return { bar: 'bg-(--color-gold)', text: 'text-(--color-forest-deep)' }
  return { bar: 'bg-[#B5502E]', text: 'text-[#B5502E]' }
}

export default function GridIntensitySection() {
  const [zones, setZones] = useState(() => GRID_ZONES.map((z) => ({ ...z, status: 'loading' })))
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [globalError, setGlobalError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const abortRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setGlobalError(null)

    if (!API_KEY) {
      // No key configured — don't even attempt the network call.
      setZones(GRID_ZONES.map((z) => ({ ...z, status: 'error', error: 'MISSING_API_KEY' })))
      setGlobalError('MISSING_API_KEY')
      setLoading(false)
      return
    }

    fetchAllZones(GRID_ZONES, API_KEY, { signal: controller.signal })
      .then((results) => {
        setZones(results)
        const allFailed = results.every((r) => r.status === 'error')
        if (allFailed) {
          setGlobalError(results[0]?.error || 'UNKNOWN')
        }
      })
      .catch(() => {
        setGlobalError('UNKNOWN')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [reloadToken])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return zones
    return zones.filter((z) => z.country.toLowerCase().includes(q) || z.code.toLowerCase().includes(q))
  }, [zones, query])

  return (
    <section id="grid-intensity" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <span className="text-xs font-mono uppercase tracking-widest text-(--color-forest)">
              Live data · Electricity Maps API
            </span>
            <h2 className="font-display text-4xl text-(--color-forest-deep) mt-3 leading-tight">
              What powers the grid, right now.
            </h2>
            <p className="mt-3 text-[15px] text-(--color-ink-soft) leading-relaxed">
              Canopy pulls real-time grid carbon intensity so reduction plans account for
              when — not just where — your energy comes from.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-ink-soft)" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a country or zone…"
              aria-label="Search grid zones"
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-(--color-line) bg-(--color-surface) text-sm placeholder:text-(--color-ink-soft)/70 focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
            />
          </div>
        </div>

        {globalError && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-(--color-line) bg-(--color-gold-soft)/40 p-5">
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-(--color-forest-deep)" />
            <div className="flex-1">
              <p className="text-sm font-medium text-(--color-forest-deep)">
                {globalError === 'MISSING_API_KEY'
                  ? 'No Electricity Maps API key is configured.'
                  : describeError(globalError)}
              </p>
              <p className="mt-1 text-sm text-(--color-ink-soft)">
                {globalError === 'MISSING_API_KEY' ? (
                  <>
                    Get a free key at{' '}
                    <a
                      href="https://www.electricitymaps.com/free-tier"
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-(--color-forest) underline-offset-2"
                    >
                      electricitymaps.com/free-tier
                    </a>{' '}
                    and add it to <code className="font-mono text-[13px]">.env.local</code> as{' '}
                    <code className="font-mono text-[13px]">VITE_ELECTRICITYMAPS_API_KEY</code>, then restart
                    the dev server.
                  </>
                ) : (
                  'This can happen if the key is wrong, the free tier rate limit was hit, or the network request failed.'
                )}
              </p>
            </div>
            <button
              onClick={() => setReloadToken((t) => t + 1)}
              className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-forest-deep) hover:text-(--color-forest) visible-focus"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-(--color-line) bg-(--color-surface) p-5 h-[104px]"
              />
            ))}

          {!loading &&
            filtered.map((zone) => {
              const ok = zone.status === 'ok'
              const colors = intensityColor(ok ? zone.data.carbonIntensity : null)
              return (
                <motion.div
                  key={zone.code}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-(--color-line) bg-(--color-surface) p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-(--color-ink)">
                      <span aria-hidden="true">{zone.flag}</span>
                      {zone.country}
                    </span>
                    <span className="text-[11px] font-mono text-(--color-ink-soft)">{zone.code}</span>
                  </div>

                  {ok ? (
                    <>
                      <p className={`mt-3 font-display text-2xl ${colors.text}`}>
                        {Math.round(zone.data.carbonIntensity)}
                        <span className="text-sm font-body text-(--color-ink-soft) ml-1">gCO₂/kWh</span>
                      </p>
                      <div className="mt-2.5 h-1.5 rounded-full bg-(--color-bg) overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors.bar}`}
                          style={{ width: `${Math.min(100, (zone.data.carbonIntensity / 600) * 100)}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-(--color-ink-soft)">
                      <Zap size={13} className="shrink-0" />
                      {describeError(zone.error)}
                    </p>
                  )}
                </motion.div>
              )
            })}

          {!loading && filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-(--color-ink-soft) py-8">
              No zones match "{query}".
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, RefreshCw, AlertTriangle, Wind } from 'lucide-react'
import { AQ_LOCATIONS } from '../data/airQualityLocations.js'
import { fetchAllLocations, describeError } from '../services/openMeteoAirQuality.js'

function aqiColor(aqi) {
  if (aqi == null) return { bar: 'bg-(--color-line)', text: 'text-(--color-ink-soft)' }
  if (aqi < 40) return { bar: 'bg-(--color-leaf)', text: 'text-(--color-forest-deep)' }
  if (aqi < 80) return { bar: 'bg-(--color-gold)', text: 'text-(--color-forest-deep)' }
  return { bar: 'bg-[#B5502E]', text: 'text-[#B5502E]' }
}

export default function AirQualitySection() {
  const [locations, setLocations] = useState(() => AQ_LOCATIONS.map((l) => ({ ...l, status: 'loading' })))
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [globalError, setGlobalError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setGlobalError(null)

    fetchAllLocations(AQ_LOCATIONS, { signal: controller.signal })
      .then((results) => {
        // In dev, React Strict Mode runs this effect twice on first mount and
        // aborts the first run. Ignore results from a run that was aborted —
        // otherwise the aborted run's error can overwrite the real one.
        if (controller.signal.aborted) return
        setLocations(results)
        const allFailed = results.every((r) => r.status === 'error')
        if (allFailed) {
          setGlobalError(results[0]?.error || 'UNKNOWN')
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setGlobalError('UNKNOWN')
      })
      .finally(() => {
        if (controller.signal.aborted) return
        setLoading(false)
      })

    return () => controller.abort()
  }, [reloadToken])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return locations
    return locations.filter((l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q))
  }, [locations, query])

  return (
    <section id="air-quality" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <span className="text-xs font-mono uppercase tracking-widest text-(--color-forest)">
              · Live data ·
            </span>
            <h2 className="font-display text-4xl text-(--color-forest-deep) mt-3 leading-tight">
              Air quality, wherever your teams are.
            </h2>
            <p className="mt-3 text-[15px] text-(--color-ink-soft) leading-relaxed">
              Canopy pulls live air-quality readings so facility health and emissions
              context sit side by side, not in separate reports.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-ink-soft)" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a city or country…"
              aria-label="Search locations"
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-(--color-line) bg-(--color-surface) text-sm placeholder:text-(--color-ink-soft)/70 focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
            />
          </div>
        </div>

        {globalError && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-(--color-line) bg-(--color-gold-soft)/40 p-5">
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-(--color-forest-deep)" />
            <div className="flex-1">
              <p className="text-sm font-medium text-(--color-forest-deep)">
                {describeError(globalError)}
              </p>
              <p className="mt-1 text-sm text-(--color-ink-soft)">
                This can happen if the network request failed or the service is
                temporarily unavailable. No API key is needed for this section, so
                it isn't a configuration issue on your end.
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
            filtered.map((loc) => {
              const ok = loc.status === 'ok'
              const colors = aqiColor(ok ? loc.data.aqi : null)
              return (
                <motion.div
                  key={`${loc.code}-${loc.name}`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-(--color-line) bg-(--color-surface) p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-(--color-ink)">
                      <span aria-hidden="true">{loc.flag}</span>
                      {loc.name}
                    </span>
                    <span className="text-[11px] font-mono text-(--color-ink-soft)">{loc.code}</span>
                  </div>

                  {ok ? (
                    <>
                      <p className={`mt-3 font-display text-2xl ${colors.text}`}>
                        {Math.round(loc.data.aqi)}
                        <span className="text-sm font-body text-(--color-ink-soft) ml-1">EU AQI</span>
                      </p>
                      <div className="mt-2.5 h-1.5 rounded-full bg-(--color-bg) overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors.bar}`}
                          style={{ width: `${Math.min(100, loc.data.aqi)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-(--color-ink-soft)">
                        PM2.5 {loc.data.pm2_5} µg/m³ · O₃ {loc.data.ozone} µg/m³
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-(--color-ink-soft)">
                      <Wind size={13} className="shrink-0" />
                      {describeError(loc.error)}
                    </p>
                  )}
                </motion.div>
              )
            })}

          {!loading && filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-(--color-ink-soft) py-8">
              No locations match "{query}".
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
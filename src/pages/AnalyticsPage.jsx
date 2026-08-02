import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { ArrowLeft, Building2, Flame, FileText, TrendingDown, AlertTriangle } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useFacilitiesStore } from '../store/facilitiesStore.js'
import { fetchReports, describeReportsError } from '../services/reportsApi.js'
import { FACILITY_CATEGORIES, describeApiError } from '../services/facilitiesApi.js'

const CATEGORY_COLORS = {
  Manufacturing: '#7FAE62', // leaf
  Logistics: '#E7B84B',     // gold
  Energy: '#B5502E',        // clay
  Office: '#8FA79A',        // muted sage-gray
}

function monthKey(dateStr) {
  return dateStr.slice(0, 7) // "2026-06-01" -> "2026-06"
}

function StatCard({ icon: Icon, label, value, sublabel }) {
  return (
    <div className="rounded-2xl border border-(--color-line) bg-(--color-surface) p-5">
      <div className="flex items-center gap-2 text-(--color-ink-soft)">
        <Icon size={15} />
        <span className="text-xs font-mono uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-2.5 font-display text-3xl text-(--color-forest-deep)">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-(--color-ink-soft)">{sublabel}</p>}
    </div>
  )
}

function ChartCard({ title, children, height = 300 }) {
  return (
    <div className="rounded-2xl border border-(--color-line) bg-(--color-surface) p-5">
      <h3 className="font-display text-lg text-(--color-forest-deep) mb-4">{title}</h3>
      <div style={{ width: '100%', height }}>{children}</div>
    </div>
  )
}

export default function AnalyticsPage() {
  const facilities = useFacilitiesStore((s) => s.facilities)
  const facilitiesLoading = useFacilitiesStore((s) => s.loading)
  const facilitiesError = useFacilitiesStore((s) => s.error)
  const loadFacilities = useFacilitiesStore((s) => s.load)

  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError, setReportsError] = useState(null)

  // The one interactive filter: selecting a category re-slices the bar
  // chart, the line chart, and the stat cards all at once. The pie chart
  // stays a full overview but dims every slice except the selected one, so
  // it still visibly responds to the same control.
  const [categoryFilter, setCategoryFilter] = useState('All')

  useEffect(() => {
    loadFacilities()
    fetchReports()
      .then(setReports)
      .catch((err) => setReportsError(err.message))
      .finally(() => setReportsLoading(false))
  }, [loadFacilities])

  const loading = facilitiesLoading || reportsLoading

  const filteredFacilities = useMemo(() => {
    if (categoryFilter === 'All') return facilities
    return facilities.filter((f) => f.category === categoryFilter)
  }, [facilities, categoryFilter])

  const filteredFacilityIds = useMemo(
    () => new Set(filteredFacilities.map((f) => f.id)),
    [filteredFacilities]
  )

  const filteredReports = useMemo(
    () => reports.filter((r) => filteredFacilityIds.has(r.facilityId)),
    [reports, filteredFacilityIds]
  )

  // Bar chart: monthly emissions per facility (respects the filter)
  const barData = useMemo(
    () => filteredFacilities.map((f) => ({ name: f.name, emissions: f.monthlyEmissions })),
    [filteredFacilities]
  )

  // Pie chart: category breakdown across ALL facilities (unfiltered, for
  // context) — dimmed per-slice based on the current filter selection.
  const pieData = useMemo(() => {
    const totals = {}
    facilities.forEach((f) => {
      totals[f.category] = (totals[f.category] || 0) + f.monthlyEmissions
    })
    return FACILITY_CATEGORIES.filter((c) => totals[c] > 0).map((c) => ({
      name: c,
      value: Number(totals[c].toFixed(1)),
    }))
  }, [facilities])

  // Line chart: reported emissions over time, grouped by month (respects filter)
  const lineData = useMemo(() => {
    const totals = {}
    filteredReports.forEach((r) => {
      const key = monthKey(r.reportDate)
      totals[key] = (totals[key] || 0) + r.amount
    })
    return Object.keys(totals)
      .sort()
      .map((month) => ({ month, amount: Number(totals[month].toFixed(1)) }))
  }, [filteredReports])

  const totalMonthlyEmissions = filteredFacilities.reduce((sum, f) => sum + f.monthlyEmissions, 0)
  const totalReportedEmissions = filteredReports.reduce((sum, r) => sum + r.amount, 0)

  const hasNoFacilities = !loading && facilities.length === 0
  const hasNoFilteredData = !loading && facilities.length > 0 && filteredFacilities.length === 0

  return (
    <Layout>
      <section className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-6xl">
          <Link to="/dashboard" className="inline-flex items-center gap-2 bg-(--color-forest) text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-(--color-forest-deep) transition-colors disabled:opacity-60 disabled:cursor-not-allowed visible-focus"
            
            ><ArrowLeft size={14} /> Back to dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-(--color-forest)">Analytics</span>
              <h1 className="font-display text-4xl text-(--color-forest-deep) mt-3 leading-tight">Emissions analytics</h1>
              <p className="mt-3 text-[15px] text-(--color-ink-soft) leading-relaxed max-w-lg">
                Facility emissions and reported activity, aggregated from your data.
              </p>
            </div>

            <div className="w-full sm:w-56">
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
                Filter by category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
              >
                <option value="All">All categories</option>
                {FACILITY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {(facilitiesError || reportsError) && (
            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-(--color-line) bg-(--color-gold-soft)/40 p-5">
              <AlertTriangle size={19} className="mt-0.5 shrink-0 text-(--color-forest-deep)" />
              <p className="text-sm text-(--color-forest-deep)">
                {facilitiesError ? describeApiError(facilitiesError) : describeReportsError(reportsError)}
              </p>
            </div>
          )}

          {hasNoFacilities ? (
            <EmptyState
              icon={Building2}
              title="No facilities yet"
              description="Add a facility from the dashboard to start seeing analytics here."
              action={
                <Link to="/dashboard" className="inline-flex items-center gap-2 bg-(--color-forest) text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-(--color-forest-deep) transition-colors visible-focus">
                  Go to dashboard
                </Link>
              }
            />
          ) : loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-(--color-line) bg-(--color-bg) h-[104px]" />
              ))}
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Building2} label="Facilities" value={filteredFacilities.length} sublabel={categoryFilter === 'All' ? 'across all categories' : categoryFilter} />
                <StatCard icon={Flame} label="Monthly emissions" value={`${totalMonthlyEmissions.toFixed(1)} t`} sublabel="CO₂e per month" />
                <StatCard icon={FileText} label="Reports filed" value={filteredReports.length} sublabel="in this selection" />
                <StatCard icon={TrendingDown} label="Reported total" value={`${totalReportedEmissions.toFixed(1)} t`} sublabel="CO₂e across all reports" />
              </div>

              {hasNoFilteredData ? (
                <EmptyState
                  icon={Building2}
                  title={`No facilities in "${categoryFilter}"`}
                  description='Try a different category, or choose "All categories" to see everything.'
                />
              ) : (
                <div className="grid lg:grid-cols-2 gap-5">
                  <ChartCard title={`Emissions by facility${categoryFilter !== 'All' ? ` — ${categoryFilter}` : ''}`}>
                    <ResponsiveContainer>
                      <BarChart data={barData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} interval={0} angle={-20} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: '1px solid var(--color-line)', fontSize: 13 }}
                          formatter={(value) => [`${value} t CO₂e`, 'Monthly emissions']}
                        />
                        <Bar dataKey="emissions" fill="#26432B" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Emissions by category">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="55%"
                          outerRadius="80%"
                          paddingAngle={2}
                        >
                          {pieData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={CATEGORY_COLORS[entry.name] || '#8FA79A'}
                              opacity={categoryFilter === 'All' || entry.name === categoryFilter ? 1 : 0.25}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: '1px solid var(--color-line)', fontSize: 13 }}
                          formatter={(value, name) => [`${value} t CO₂e`, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Reported emissions over time" height={280}>
                    {lineData.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-sm text-(--color-ink-soft)">No reports in this selection yet.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer>
                        <LineChart data={lineData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} />
                          <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} />
                          <Tooltip
                            contentStyle={{ borderRadius: 12, border: '1px solid var(--color-line)', fontSize: 13 }}
                            formatter={(value) => [`${value} t CO₂e`, 'Reported']}
                          />
                          <Line type="monotone" dataKey="amount" stroke="#26432B" strokeWidth={2.5} dot={{ r: 4, fill: '#26432B' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </ChartCard>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}
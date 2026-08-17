import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, AlertTriangle, ArrowLeft, FileCheck2, FileText, Building2 } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import EmptyState from '../components/EmptyState.jsx'
import FileDropzone from '../components/FileDropzone.jsx'
import { useFacilitiesStore } from '../store/facilitiesStore.js'
import { useToastStore } from '../store/toastStore.js'
import { fetchReports, submitReport, describeReportsError, REPORT_SCOPES } from '../services/reportsApi.js'
import { resolveUploadUrl } from '../services/uploadsApi.js'
import { describeApiError } from '../services/facilitiesApi.js'

const EMPTY_FORM = { facilityId: '', reportDate: '', scope: '', amount: '', reporterName: '', notes: '' }

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

export default function NewReportPage() {
  const showToast = useToastStore((s) => s.showToast)

  const facilities = useFacilitiesStore((s) => s.facilities)
  const facilitiesLoading = useFacilitiesStore((s) => s.loading)
  const facilitiesError = useFacilitiesStore((s) => s.error)
  const loadFacilities = useFacilitiesStore((s) => s.load)

  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)

  const [form, setForm] = useState(EMPTY_FORM)
  const [evidenceFile, setEvidenceFile] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadFacilities()
    fetchReports().then(setReports).catch(() => {}).finally(() => setReportsLoading(false))
  }, [loadFacilities])

  function validate() {
    const errors = {}
    if (!form.facilityId) errors.facilityId = 'Please select a facility.'
    if (!form.reportDate) errors.reportDate = 'Please select a date.'
    else if (form.reportDate > todayString()) errors.reportDate = "Report date can't be in the future."
    if (!form.scope) errors.scope = 'Please select an emission scope.'
    if (form.amount === '' || Number.isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      errors.amount = 'Enter an amount greater than 0.'
    }
    if (!form.reporterName.trim()) errors.reporterName = 'Your name is required.'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setSubmitting(true)
    try {
      const created = await submitReport(form, evidenceFile)
      setReports((prev) => [created, ...prev])
      setForm(EMPTY_FORM)
      setEvidenceFile(null)
      showToast('Report submitted successfully.', 'success')
    } catch (err) {
      showToast(describeReportsError(err.message), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const hasNoFacilities = !facilitiesLoading && !facilitiesError && facilities.length === 0

  return (
    <Layout>
      <section className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-3xl">
          <Link to="/dashboard" className="inline-flex items-center gap-2 bg-(--color-forest) text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-(--color-forest-deep) transition-colors disabled:opacity-60 disabled:cursor-not-allowed visible-focus"
            
            ><ArrowLeft size={14} /> Back to dashboard
          </Link>

          <div className="mt-2">
            <span className="text-xs font-mono uppercase tracking-widest text-(--color-forest)">New submission</span>
            <h1 className="font-display text-4xl text-(--color-forest-deep) mt-3 leading-tight">Submit an emissions report</h1>
            <p className="mt-3 text-[15px] text-(--color-ink-soft) leading-relaxed">
              File a monthly emissions report for one of your facilities.
            </p>
          </div>

          {facilitiesError && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-(--color-line) bg-(--color-gold-soft)/40 p-5">
              <AlertTriangle size={19} className="mt-0.5 shrink-0 text-(--color-forest-deep)" />
              <p className="text-sm text-(--color-forest-deep)">{describeApiError(facilitiesError)}</p>
            </div>
          )}

          {hasNoFacilities ? (
            <div className="mt-8">
              <EmptyState
                icon={Building2}
                title="You don't have any facilities yet"
                description="Add a facility from the dashboard first, then come back to file a report against it."
                action={
                  <Link to="/dashboard" className="inline-flex items-center gap-2 bg-(--color-forest) text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-(--color-forest-deep) transition-colors visible-focus">
                    Go to dashboard
                  </Link>
                }
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-8 rounded-2xl border border-(--color-line) bg-(--color-bg) p-6 space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Facility</label>
                <select
                  value={form.facilityId}
                  onChange={(e) => setForm((f) => ({ ...f, facilityId: e.target.value }))}
                  disabled={facilitiesLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus disabled:opacity-60"
                >
                  <option value="">{facilitiesLoading ? 'Loading facilities…' : 'Select a facility'}</option>
                  {facilities.map((f) => <option key={f.id} value={f.id}>{f.name} — {f.location}</option>)}
                </select>
                {fieldErrors.facilityId && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.facilityId}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Report date</label>
                  <input
                    type="date"
                    value={form.reportDate}
                    max={todayString()}
                    onChange={(e) => setForm((f) => ({ ...f, reportDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
                  />
                  {fieldErrors.reportDate && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.reportDate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Emission scope</label>
                  <select
                    value={form.scope}
                    onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
                  >
                    <option value="">Select a scope</option>
                    {REPORT_SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {fieldErrors.scope && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.scope}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Amount (t CO₂e)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="12.5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
                  />
                  {fieldErrors.amount && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.amount}</p>}
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Your name</label>
                  <input
                    type="text"
                    value={form.reporterName}
                    onChange={(e) => setForm((f) => ({ ...f, reporterName: e.target.value }))}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
                  />
                  {fieldErrors.reporterName && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.reporterName}</p>}
                </div>
              </div>

              <FileDropzone
                label="Supporting evidence (optional)"
                helpText="PNG, JPEG, WEBP, or PDF — max 5MB"
                value={evidenceFile}
                onChange={setEvidenceFile}
              />

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Anything the reviewer should know about this reading"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-(--color-forest) text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-(--color-forest-deep) transition-colors disabled:opacity-60 disabled:cursor-not-allowed visible-focus"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? 'Submitting…' : 'Submit report'}
              </button>
            </form>
          )}

          <div className="mt-12">
            <h2 className="font-display text-xl text-(--color-forest-deep) mb-4">Recent submissions</h2>
            {reportsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-(--color-line) bg-(--color-bg) h-16" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <EmptyState icon={FileText} title="No reports yet" description="Submit your first emissions report using the form above." />
            ) : (
              <ul className="space-y-3">
                {reports.slice(0, 8).map((r) => (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-(--color-line) bg-(--color-bg) px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-(--color-ink) truncate">{r.facilityName} · {r.scope} · {r.amount} t CO₂e</p>
                      <p className="text-xs text-(--color-ink-soft) mt-1 italic">
                        {r.notes?.trim() ? r.notes : 'No comments added!'}
                      </p>
                      <p className="text-xs text-(--color-ink-soft)">{r.reportDate} — submitted by {r.reporterName}</p>
                    </div>
                    {r.evidenceFile && (
                      <a
                        href={resolveUploadUrl(r.evidenceFile.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-(--color-forest-deep) hover:text-(--color-forest) visible-focus"
                      >
                        <FileCheck2 size={14} /> View evidence
                      </a>
                    )}
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </Layout>
  )
}
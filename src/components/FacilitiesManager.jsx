// import { useEffect, useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Plus, Pencil, Trash2, X, RefreshCw, AlertTriangle, Loader2, Server } from 'lucide-react'
// import {
//   fetchFacilities,
//   createFacility,
//   updateFacility,
//   deleteFacility,
//   describeApiError,
//   FACILITY_CATEGORIES,
// } from '../services/facilitiesApi.js'

// const EMPTY_FORM = { name: '', location: '', category: FACILITY_CATEGORIES[0], monthlyEmissions: '', notes: '' }

// const CATEGORY_STYLE = {
//   Manufacturing: 'bg-(--color-leaf-soft)/70 text-(--color-forest-deep)',
//   Logistics: 'bg-(--color-gold-soft) text-(--color-forest-deep)',
//   Energy: 'bg-[#F0D9CB] text-[#8A4A2A]',
//   Office: 'bg-(--color-bg) text-(--color-ink-soft) border border-(--color-line)',
// }

// export default function FacilitiesManager() {
//   const [facilities, setFacilities] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [fetchError, setFetchError] = useState(null)

//   const [form, setForm] = useState(EMPTY_FORM)
//   const [formError, setFormError] = useState(null)
//   const [submitting, setSubmitting] = useState(false)
//   const [editingId, setEditingId] = useState(null)

//   const [rowBusy, setRowBusy] = useState({}) // id -> 'updating' | 'deleting'
//   const [rowError, setRowError] = useState({}) // id -> message
//   const [confirmDeleteId, setConfirmDeleteId] = useState(null)

//   function load(signal) {
//     setLoading(true)
//     setFetchError(null)
//     fetchFacilities()
//       .then((data) => {
//         if (signal?.aborted) return
//         setFacilities(data)
//       })
//       .catch((err) => {
//         if (signal?.aborted) return
//         setFetchError(err.message)
//       })
//       .finally(() => {
//         if (signal?.aborted) return
//         setLoading(false)
//       })
//   }

//   useEffect(() => {
//     const controller = new AbortController()
//     load(controller.signal)
//     return () => controller.abort()
//   }, [])

//   function startEdit(facility) {
//     setEditingId(facility.id)
//     setForm({
//       name: facility.name,
//       location: facility.location,
//       category: facility.category,
//       monthlyEmissions: String(facility.monthlyEmissions),
//       notes: facility.notes || '',
//     })
//     setFormError(null)
//   }

//   function cancelEdit() {
//     setEditingId(null)
//     setForm(EMPTY_FORM)
//     setFormError(null)
//   }

//   async function handleSubmit(e) {
//     e.preventDefault()
//     setFormError(null)

//     if (!form.name.trim() || !form.location.trim() || form.monthlyEmissions === '') {
//       setFormError('Please fill in name, location, and monthly emissions.')
//       return
//     }
//     if (Number.isNaN(Number(form.monthlyEmissions)) || Number(form.monthlyEmissions) < 0) {
//       setFormError('Monthly emissions must be a non-negative number.')
//       return
//     }

//     setSubmitting(true)
//     const payload = {
//       name: form.name.trim(),
//       location: form.location.trim(),
//       category: form.category,
//       monthlyEmissions: Number(form.monthlyEmissions),
//       notes: form.notes.trim(),
//     }

//     try {
//       if (editingId) {
//         const updated = await updateFacility(editingId, payload)
//         setFacilities((prev) => prev.map((f) => (f.id === editingId ? updated : f)))
//         cancelEdit()
//       } else {
//         const created = await createFacility(payload)
//         setFacilities((prev) => [...prev, created])
//         setForm(EMPTY_FORM)
//       }
//     } catch (err) {
//       setFormError(describeApiError(err.message))
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   async function handleDelete(id) {
//     if (confirmDeleteId !== id) {
//       setConfirmDeleteId(id)
//       return
//     }
//     setConfirmDeleteId(null)
//     setRowBusy((prev) => ({ ...prev, [id]: 'deleting' }))
//     setRowError((prev) => ({ ...prev, [id]: null }))

//     try {
//       await deleteFacility(id)
//       setFacilities((prev) => prev.filter((f) => f.id !== id))
//       if (editingId === id) cancelEdit()
//     } catch (err) {
//       setRowError((prev) => ({ ...prev, [id]: describeApiError(err.message) }))
//     } finally {
//       setRowBusy((prev) => {
//         const next = { ...prev }
//         delete next[id]
//         return next
//       })
//     }
//   }

//   return (
//     <section id="facilities" className="py-24 px-6 bg-(--color-surface)">
//       <div className="mx-auto max-w-6xl">
//         <div className="max-w-xl mb-10">
//           <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-(--color-forest)">
//             <Server size={13} /> Energy Facilities Plants
//           </span>
//           <h2 className="font-display text-4xl text-(--color-forest-deep) mt-3 leading-tight">
//             Facilities registry
//           </h2>
//           <p className="mt-3 text-[15px] text-(--color-ink-soft) leading-relaxed">
//             Wired to a real Express API we built ourselves — add, edit, and remove facilities and it persists on.
//           </p>
//         </div>

//         {/* Create / edit form */}
//         <form
//           onSubmit={handleSubmit}
//           className="rounded-2xl border border-(--color-line) bg-(--color-bg) p-6 mb-10"
//         >
//           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div className="lg:col-span-1">
//               <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 value={form.name}
//                 onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//                 placeholder="Lahore Manufacturing Plant"
//                 className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
//                 Location
//               </label>
//               <input
//                 type="text"
//                 value={form.location}
//                 onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
//                 placeholder="Lahore, Pakistan"
//                 className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
//                 Category
//               </label>
//               <select
//                 value={form.category}
//                 onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
//                 className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
//               >
//                 {FACILITY_CATEGORIES.map((c) => (
//                   <option key={c} value={c}>{c}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
//                 Monthly emissions (t CO₂e)
//               </label>
//               <input
//                 type="number"
//                 step="0.1"
//                 min="0"
//                 value={form.monthlyEmissions}
//                 onChange={(e) => setForm((f) => ({ ...f, monthlyEmissions: e.target.value }))}
//                 placeholder="12.7"
//                 className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
//               />
//             </div>
//           </div>

//           <div className="mt-4">
//             <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
//               Notes (optional)
//             </label>
//             <input
//               type="text"
//               value={form.notes}
//               onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
//               placeholder="Primary production facility"
//               className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
//             />
//           </div>

//           {formError && (
//             <p className="mt-3 flex items-center gap-1.5 text-sm text-[#B5502E]">
//               <AlertTriangle size={14} /> {formError}
//             </p>
//           )}

//           <div className="mt-5 flex items-center gap-3">
//             <button
//               type="submit"
//               disabled={submitting}
//               className="inline-flex items-center gap-2 bg-(--color-forest) text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-(--color-forest-deep) transition-colors disabled:opacity-60 disabled:cursor-not-allowed visible-focus"
//             >
//               {submitting ? (
//                 <Loader2 size={15} className="animate-spin" />
//               ) : editingId ? (
//                 <Pencil size={15} />
//               ) : (
//                 <Plus size={15} />
//               )}
//               {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Add facility'}
//             </button>
//             {editingId && (
//               <button
//                 type="button"
//                 onClick={cancelEdit}
//                 className="inline-flex items-center gap-1.5 text-sm text-(--color-ink-soft) hover:text-(--color-ink) visible-focus"
//               >
//                 <X size={14} /> Cancel
//               </button>
//             )}
//           </div>
//         </form>

//         {/* Fetch error */}
//         {fetchError && (
//           <div className="mb-6 flex items-start gap-3 rounded-2xl border border-(--color-line) bg-(--color-gold-soft)/40 p-5">
//             <AlertTriangle size={19} className="mt-0.5 shrink-0 text-(--color-forest-deep)" />
//             <div className="flex-1">
//               <p className="text-sm font-medium text-(--color-forest-deep)">
//                 {describeApiError(fetchError)}
//               </p>
//               <p className="mt-1 text-sm text-(--color-ink-soft)">
//                 Make sure the backend is running: <code className="font-mono text-[13px]">cd server && npm run dev</code>
//               </p>
//             </div>
//             <button
//               onClick={() => load()}
//               className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-forest-deep) hover:text-(--color-forest) visible-focus"
//             >
//               <RefreshCw size={14} /> Retry
//             </button>
//           </div>
//         )}

//         {/* List */}
//         {loading ? (
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {Array.from({ length: 3 }).map((_, i) => (
//               <div key={i} className="animate-pulse rounded-2xl border border-(--color-line) bg-(--color-bg) h-[140px]" />
//             ))}
//           </div>
//         ) : facilities.length === 0 && !fetchError ? (
//           <p className="text-center text-sm text-(--color-ink-soft) py-10">
//             No facilities yet — add your first one above.
//           </p>
//         ) : (
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             <AnimatePresence>
//               {facilities.map((facility) => {
//                 const busy = rowBusy[facility.id]
//                 return (
//                   <motion.div
//                     key={facility.id}
//                     layout
//                     initial={{ opacity: 0, y: 12 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.95 }}
//                     transition={{ duration: 0.3 }}
//                     className="rounded-2xl border border-(--color-line) bg-(--color-bg) p-5"
//                   >
//                     <div className="flex items-start justify-between gap-2">
//                       <div>
//                         <p className="font-medium text-(--color-ink)">{facility.name}</p>
//                         <p className="text-xs text-(--color-ink-soft) mt-0.5">{facility.location}</p>
//                       </div>
//                       <span className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full ${CATEGORY_STYLE[facility.category] || ''}`}>
//                         {facility.category}
//                       </span>
//                     </div>

//                     <p className="mt-3 font-display text-xl text-(--color-forest-deep)">
//                       {facility.monthlyEmissions}
//                       <span className="text-xs font-body text-(--color-ink-soft) ml-1">t CO₂e / mo</span>
//                     </p>
//                     {facility.notes && (
//                       <p className="mt-1.5 text-xs text-(--color-ink-soft) leading-relaxed">{facility.notes}</p>
//                     )}

//                     {rowError[facility.id] && (
//                       <p className="mt-2 flex items-center gap-1.5 text-xs text-[#B5502E]">
//                         <AlertTriangle size={12} /> {rowError[facility.id]}
//                       </p>
//                     )}

//                     <div className="mt-4 flex items-center gap-4">
//                       <button
//                         onClick={() => startEdit(facility)}
//                         disabled={Boolean(busy)}
//                         className="inline-flex items-center gap-1.5 text-xs font-medium text-(--color-forest-deep) hover:text-(--color-forest) disabled:opacity-50 visible-focus"
//                       >
//                         <Pencil size={13} /> Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(facility.id)}
//                         disabled={Boolean(busy)}
//                         className={`inline-flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 visible-focus ${
//                           confirmDeleteId === facility.id ? 'text-[#B5502E]' : 'text-(--color-ink-soft) hover:text-[#B5502E]'
//                         }`}
//                       >
//                         {busy === 'deleting' ? (
//                           <Loader2 size={13} className="animate-spin" />
//                         ) : (
//                           <Trash2 size={13} />
//                         )}
//                         {confirmDeleteId === facility.id ? 'Click again to confirm' : 'Delete'}
//                       </button>
//                     </div>
//                   </motion.div>
//                 )
//               })}
//             </AnimatePresence>
//           </div>
//         )}
//       </div>
//     </section>
//   )
// }








import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, RefreshCw, AlertTriangle, Loader2, Server, Building2 } from 'lucide-react'
import { useFacilitiesStore } from '../store/facilitiesStore.js'
import { useToastStore } from '../store/toastStore.js'
import { describeApiError, FACILITY_CATEGORIES } from '../services/facilitiesApi.js'
import EmptyState from './EmptyState.jsx'

const EMPTY_FORM = { name: '', location: '', category: FACILITY_CATEGORIES[0], monthlyEmissions: '', notes: '' }

const CATEGORY_STYLE = {
  Manufacturing: 'bg-(--color-leaf-soft)/70 text-(--color-forest-deep)',
  Logistics: 'bg-(--color-gold-soft) text-(--color-forest-deep)',
  Energy: 'bg-[#F0D9CB] text-[#8A4A2A]',
  Office: 'bg-(--color-bg) text-(--color-ink-soft) border border-(--color-line)',
}

export default function FacilitiesManager() {
  // Shared state — this same list is also read by NewReportPage's facility
  // dropdown. Both components call load() on mount; whichever mounts first
  // does the actual fetch, the other just reads the cached result.
  const facilities = useFacilitiesStore((s) => s.facilities)
  const loading = useFacilitiesStore((s) => s.loading)
  const fetchError = useFacilitiesStore((s) => s.error)
  const load = useFacilitiesStore((s) => s.load)
  const createFacility = useFacilitiesStore((s) => s.createFacility)
  const updateFacility = useFacilitiesStore((s) => s.updateFacility)
  const deleteFacility = useFacilitiesStore((s) => s.deleteFacility)

  const showToast = useToastStore((s) => s.showToast)

  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [rowBusy, setRowBusy] = useState({})
  const [rowError, setRowError] = useState({})
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    load()
  }, [load])

  function startEdit(facility) {
    setEditingId(facility.id)
    setForm({
      name: facility.name,
      location: facility.location,
      category: facility.category,
      monthlyEmissions: String(facility.monthlyEmissions),
      notes: facility.notes || '',
    })
    setFormError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)

    if (!form.name.trim() || !form.location.trim() || form.monthlyEmissions === '') {
      setFormError('Please fill in name, location, and monthly emissions.')
      return
    }
    if (Number.isNaN(Number(form.monthlyEmissions)) || Number(form.monthlyEmissions) < 0) {
      setFormError('Monthly emissions must be a non-negative number.')
      return
    }

    setSubmitting(true)
    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      category: form.category,
      monthlyEmissions: Number(form.monthlyEmissions),
      notes: form.notes.trim(),
    }

    try {
      if (editingId) {
        await updateFacility(editingId, payload)
        showToast('Facility updated.', 'success')
        cancelEdit()
      } else {
        await createFacility(payload)
        showToast('Facility added.', 'success')
        setForm(EMPTY_FORM)
      }
    } catch (err) {
      const friendly = describeApiError(err.message)
      setFormError(friendly)
      showToast(friendly, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    setConfirmDeleteId(null)
    setRowBusy((prev) => ({ ...prev, [id]: 'deleting' }))
    setRowError((prev) => ({ ...prev, [id]: null }))

    try {
      await deleteFacility(id)
      showToast('Facility deleted.', 'success')
      if (editingId === id) cancelEdit()
    } catch (err) {
      const friendly = describeApiError(err.message)
      setRowError((prev) => ({ ...prev, [id]: friendly }))
      showToast(friendly, 'error')
    } finally {
      setRowBusy((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  return (
    <section id="facilities" className="py-24 px-6 bg-(--color-surface)">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-(--color-forest)">
            <Server size={13} /> Your own backend · Full CRUD
          </span>
          <h2 className="font-display text-4xl text-(--color-forest-deep) mt-3 leading-tight">
            Facilities registry
          </h2>
          <p className="mt-3 text-[15px] text-(--color-ink-soft) leading-relaxed">
            Unlike the rest of this page, this section is wired to a real Express API
            we built ourselves — add, edit, and remove facilities and it persists on
            the server.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-(--color-line) bg-(--color-bg) p-6 mb-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Lahore Manufacturing Plant"
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Lahore, Pakistan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
              >
                {FACILITY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Monthly emissions (t CO₂e)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.monthlyEmissions}
                onChange={(e) => setForm((f) => ({ ...f, monthlyEmissions: e.target.value }))}
                placeholder="12.7"
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Notes (optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Primary production facility"
              className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
            />
          </div>

          {formError && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-[#B5502E]">
              <AlertTriangle size={14} /> {formError}
            </p>
          )}

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-(--color-forest) text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-(--color-forest-deep) transition-colors disabled:opacity-60 disabled:cursor-not-allowed visible-focus"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : editingId ? <Pencil size={15} /> : <Plus size={15} />}
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Add facility'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-1.5 text-sm text-(--color-ink-soft) hover:text-(--color-ink) visible-focus">
                <X size={14} /> Cancel
              </button>
            )}
          </div>
        </form>

        {fetchError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-(--color-line) bg-(--color-gold-soft)/40 p-5">
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-(--color-forest-deep)" />
            <div className="flex-1">
              <p className="text-sm font-medium text-(--color-forest-deep)">{describeApiError(fetchError)}</p>
              <p className="mt-1 text-sm text-(--color-ink-soft)">
                Make sure the backend is running: <code className="font-mono text-[13px]">cd server && npm run dev</code>
              </p>
            </div>
            <button onClick={() => load(true)} className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-forest-deep) hover:text-(--color-forest) visible-focus">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-(--color-line) bg-(--color-bg) h-[140px]" />
            ))}
          </div>
        ) : facilities.length === 0 && !fetchError ? (
          <EmptyState
            icon={Building2}
            title="No facilities yet"
            description="Add your first facility using the form above to start tracking emissions."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {facilities.map((facility) => {
                const busy = rowBusy[facility.id]
                return (
                  <motion.div
                    key={facility.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl border border-(--color-line) bg-(--color-bg) p-5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-(--color-ink)">{facility.name}</p>
                        <p className="text-xs text-(--color-ink-soft) mt-0.5">{facility.location}</p>
                      </div>
                      <span className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full ${CATEGORY_STYLE[facility.category] || ''}`}>
                        {facility.category}
                      </span>
                    </div>

                    <p className="mt-3 font-display text-xl text-(--color-forest-deep)">
                      {facility.monthlyEmissions}
                      <span className="text-xs font-body text-(--color-ink-soft) ml-1">t CO₂e / mo</span>
                    </p>
                    {facility.notes && <p className="mt-1.5 text-xs text-(--color-ink-soft) leading-relaxed">{facility.notes}</p>}

                    {rowError[facility.id] && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-[#B5502E]">
                        <AlertTriangle size={12} /> {rowError[facility.id]}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-4">
                      <button onClick={() => startEdit(facility)} disabled={Boolean(busy)} className="inline-flex items-center gap-1.5 text-xs font-medium text-(--color-forest-deep) hover:text-(--color-forest) disabled:opacity-50 visible-focus">
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(facility.id)}
                        disabled={Boolean(busy)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 visible-focus ${confirmDeleteId === facility.id ? 'text-[#B5502E]' : 'text-(--color-ink-soft) hover:text-[#B5502E]'}`}
                      >
                        {busy === 'deleting' ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        {confirmDeleteId === facility.id ? 'Click again to confirm' : 'Delete'}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  )
}
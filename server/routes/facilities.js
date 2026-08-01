import { Router } from 'express'
import { getFacilitiesByCompany, getFacilityById, createFacility, updateFacility, deleteFacility } from '../store.js'
import { requireAuth } from '../middleware/requireAuth.js'
const router = Router()
export const CATEGORIES = ['Manufacturing', 'Logistics', 'Energy', 'Office']

function validateFacilityInput(body, { partial = false } = {}) {
  const errors = []
  if (!partial || body.name !== undefined) { if (!body.name || !body.name.trim()) errors.push('name is required') }
  if (!partial || body.location !== undefined) { if (!body.location || !body.location.trim()) errors.push('location is required') }
  if (!partial || body.category !== undefined) { if (!CATEGORIES.includes(body.category)) errors.push(`category must be one of: ${CATEGORIES.join(', ')}`) }
  if (!partial || body.monthlyEmissions !== undefined) {
    const n = Number(body.monthlyEmissions)
    if (body.monthlyEmissions === undefined || body.monthlyEmissions === null || Number.isNaN(n) || n < 0) errors.push('monthlyEmissions must be a non-negative number')
  }
  return errors
}

// GET /api/facilities — now requires login and only returns facilities
// belonging to the caller's own company. This used to be a public,
// unfiltered read; multi-tenancy means "public" no longer makes sense here.
router.get('/', requireAuth, (req, res) => {
  res.json(getFacilitiesByCompany(req.user.companyId))
})

router.get('/:id', requireAuth, (req, res) => {
  const f = getFacilityById(req.params.id)
  // Deliberately 404 (not 403) when the facility belongs to another
  // company — this avoids confirming to a caller that a given ID exists
  // at all outside their own company.
  if (!f || f.companyId !== req.user.companyId) return res.status(404).json({ error: 'Facility not found' })
  res.json(f)
})

router.post('/', requireAuth, (req, res) => {
  const errors = validateFacilityInput(req.body)
  if (errors.length) return res.status(400).json({ error: errors.join('; ') })
  const facility = createFacility({
    name: req.body.name.trim(),
    location: req.body.location.trim(),
    category: req.body.category,
    monthlyEmissions: Number(req.body.monthlyEmissions),
    notes: req.body.notes?.trim() || '',
    companyId: req.user.companyId,
  })
  res.status(201).json(facility)
})

router.put('/:id', requireAuth, (req, res) => {
  const existing = getFacilityById(req.params.id)
  if (!existing || existing.companyId !== req.user.companyId) return res.status(404).json({ error: 'Facility not found' })
  const errors = validateFacilityInput(req.body, { partial: true })
  if (errors.length) return res.status(400).json({ error: errors.join('; ') })
  const updates = {}
  if (req.body.name !== undefined) updates.name = req.body.name.trim()
  if (req.body.location !== undefined) updates.location = req.body.location.trim()
  if (req.body.category !== undefined) updates.category = req.body.category
  if (req.body.monthlyEmissions !== undefined) updates.monthlyEmissions = Number(req.body.monthlyEmissions)
  if (req.body.notes !== undefined) updates.notes = req.body.notes.trim()
  res.json(updateFacility(req.params.id, updates))
})

router.delete('/:id', requireAuth, (req, res) => {
  const existing = getFacilityById(req.params.id)
  if (!existing || existing.companyId !== req.user.companyId) return res.status(404).json({ error: 'Facility not found' })
  deleteFacility(req.params.id)
  res.status(204).send()
})

export default router
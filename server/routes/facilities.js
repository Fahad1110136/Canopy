import { Router } from 'express'
import {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
} from '../store.js'

const router = Router()

export const CATEGORIES = ['Manufacturing', 'Logistics', 'Energy', 'Office']

function validateFacilityInput(body, { partial = false } = {}) {
  const errors = []

  if (!partial || body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      errors.push('name is required')
    }
  }
  if (!partial || body.location !== undefined) {
    if (!body.location || typeof body.location !== 'string' || !body.location.trim()) {
      errors.push('location is required')
    }
  }
  if (!partial || body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) {
      errors.push(`category must be one of: ${CATEGORIES.join(', ')}`)
    }
  }
  if (!partial || body.monthlyEmissions !== undefined) {
    const n = Number(body.monthlyEmissions)
    if (body.monthlyEmissions === undefined || body.monthlyEmissions === null || Number.isNaN(n) || n < 0) {
      errors.push('monthlyEmissions must be a non-negative number')
    }
  }

  return errors
}

// GET /api/facilities — list all
router.get('/', (req, res) => {
  res.json(getFacilities())
})

// GET /api/facilities/:id — single facility
router.get('/:id', (req, res) => {
  const facility = getFacilityById(req.params.id)
  if (!facility) return res.status(404).json({ error: 'Facility not found' })
  res.json(facility)
})

// POST /api/facilities — create
router.post('/', (req, res) => {
  const errors = validateFacilityInput(req.body)
  if (errors.length) return res.status(400).json({ error: errors.join('; ') })

  const facility = createFacility({
    name: req.body.name.trim(),
    location: req.body.location.trim(),
    category: req.body.category,
    monthlyEmissions: Number(req.body.monthlyEmissions),
    notes: req.body.notes?.trim() || '',
  })
  res.status(201).json(facility)
})

// PUT /api/facilities/:id — update (partial updates allowed)
router.put('/:id', (req, res) => {
  const existing = getFacilityById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Facility not found' })

  const errors = validateFacilityInput(req.body, { partial: true })
  if (errors.length) return res.status(400).json({ error: errors.join('; ') })

  const updates = {}
  if (req.body.name !== undefined) updates.name = req.body.name.trim()
  if (req.body.location !== undefined) updates.location = req.body.location.trim()
  if (req.body.category !== undefined) updates.category = req.body.category
  if (req.body.monthlyEmissions !== undefined) updates.monthlyEmissions = Number(req.body.monthlyEmissions)
  if (req.body.notes !== undefined) updates.notes = req.body.notes.trim()

  const updated = updateFacility(req.params.id, updates)
  res.json(updated)
})

// DELETE /api/facilities/:id
router.delete('/:id', (req, res) => {
  const success = deleteFacility(req.params.id)
  if (!success) return res.status(404).json({ error: 'Facility not found' })
  res.status(204).send()
})

export default router
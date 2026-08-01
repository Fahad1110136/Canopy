import { Router } from 'express'
import { getReports, createReport } from '../storeReports.js'
import { getFacilityById } from '../store.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const SCOPES = ['Scope 1', 'Scope 2', 'Scope 3']

// Matches the filenames our upload storage config generates — used to
// sanity-check that evidenceFile actually points at something we stored,
// rather than trusting an arbitrary client-supplied URL.
const SAFE_FILENAME_RE = /^[0-9]+-[a-z0-9]+\.[a-z0-9]+$/i

function validate(body) {
  const errors = []

  if (!body.facilityId || !getFacilityById(body.facilityId)) {
    errors.push('A valid facility must be selected.')
  }

  if (!body.reportDate) {
    errors.push('Report date is required.')
  } else {
    const date = new Date(body.reportDate)
    if (Number.isNaN(date.getTime())) errors.push('Report date is invalid.')
    else if (date.getTime() > Date.now()) errors.push('Report date cannot be in the future.')
  }

  if (!SCOPES.includes(body.scope)) {
    errors.push(`Scope must be one of: ${SCOPES.join(', ')}.`)
  }

  const amount = Number(body.amount)
  if (body.amount === undefined || body.amount === '' || Number.isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a number greater than 0.')
  }

  if (!body.reporterName || !body.reporterName.trim()) {
    errors.push('Reporter name is required.')
  }

  if (body.evidenceFile) {
    const f = body.evidenceFile
    if (typeof f !== 'object' || !f.filename || !SAFE_FILENAME_RE.test(f.filename)) {
      errors.push('Evidence file reference is invalid.')
    }
  }

  return errors
}

const router = Router()

router.get('/', requireAuth, (req, res) => {
  res.json(getReports())
})

// POST /api/reports — now plain JSON. The evidence file, if any, was
// already uploaded separately via POST /api/uploads (see routes/uploads.js)
// before this request happens — this endpoint just links the resulting
// file reference to the report, instead of handling the upload itself.
router.post('/', requireAuth, (req, res) => {
  const errors = validate(req.body)
  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') })
  }

  const facility = getFacilityById(req.body.facilityId)
  const report = createReport({
    facilityId: req.body.facilityId,
    facilityName: facility.name,
    reportDate: req.body.reportDate,
    scope: req.body.scope,
    amount: Number(req.body.amount),
    reporterName: req.body.reporterName.trim(),
    notes: req.body.notes?.trim() || '',
    evidenceFile: req.body.evidenceFile || null,
    submittedBy: req.user.id,
  })

  res.status(201).json(report)
})

export default router
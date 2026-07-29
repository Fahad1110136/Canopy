import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { getReports, createReport } from '../storeReports.js'
import { getFacilityById } from '../store.js'
import { requireAuth } from '../middleware/requireAuth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const SCOPES = ['Scope 1', 'Scope 2', 'Scope 3']

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, safeName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new Error('INVALID_FILE_TYPE'))
    }
    cb(null, true)
  },
})

// Wraps multer's middleware so its errors come back as clean JSON instead
// of crashing or returning an HTML error page.
function uploadEvidence(req, res, next) {
  upload.single('evidence')(req, res, (err) => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Evidence file must be smaller than 5MB.' })
    }
    if (err.message === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ error: 'Evidence file must be a PNG, JPEG, WEBP image, or PDF.' })
    }
    return res.status(400).json({ error: 'Could not process the uploaded file.' })
  })
}

function validate(body) {
  const errors = []

  if (!body.facilityId || !getFacilityById(body.facilityId)) {
    errors.push('A valid facility must be selected.')
  }

  if (!body.reportDate) {
    errors.push('Report date is required.')
  } else {
    const date = new Date(body.reportDate)
    if (Number.isNaN(date.getTime())) {
      errors.push('Report date is invalid.')
    } else if (date.getTime() > Date.now()) {
      errors.push('Report date cannot be in the future.')
    }
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

  return errors
}

const router = Router()

// GET /api/reports — list all (requires login)
router.get('/', requireAuth, (req, res) => {
  res.json(getReports())
})

// POST /api/reports — create (requires login, multipart/form-data)
router.post('/', requireAuth, uploadEvidence, (req, res) => {
  const errors = validate(req.body)
  if (errors.length) {
    // Don't leave an orphaned file on disk if the rest of the form was invalid.
    if (req.file) fs.unlink(req.file.path, () => {})
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
    evidenceFile: req.file
      ? { filename: req.file.filename, originalName: req.file.originalname, url: `/uploads/${req.file.filename}` }
      : null,
    submittedBy: req.user.id,
  })

  res.status(201).json(report)
})

export default router
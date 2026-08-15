import { Router } from 'express'
import { getReports, createReport } from '../storeReports.js'
import { getFacilityById } from '../store.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const SCOPES = ['Scope 1', 'Scope 2', 'Scope 3']
const SAFE_FILENAME_RE = /^[0-9]+-[a-z0-9]+\.[a-z0-9]+$/i

async function validate(body, companyId) {
  const errors = []

  // A facility must both exist AND belong to the caller's own company —
  // otherwise someone could file a report against another company's
  // facility just by guessing/knowing its ID.
  const facility = body.facilityId ? await getFacilityById(body.facilityId) : null
  if (!facility || facility.companyId !== companyId) {
    errors.push('A valid facility must be selected.')
  }

  if (!body.reportDate) {
    errors.push('Report date is required.')
  } else {
    const date = new Date(body.reportDate)
    if (Number.isNaN(date.getTime())) errors.push('Report date is invalid.')
    else if (date.getTime() > Date.now()) errors.push('Report date cannot be in the future.')
  }

  if (!SCOPES.includes(body.scope)) errors.push(`Scope must be one of: ${SCOPES.join(', ')}.`)

  const amount = Number(body.amount)
  if (body.amount === undefined || body.amount === '' || Number.isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a number greater than 0.')
  }

  if (!body.reporterName || !body.reporterName.trim()) errors.push('Reporter name is required.')

  if (body.evidenceFile) {
    const f = body.evidenceFile
    if (typeof f !== 'object' || !f.filename || !SAFE_FILENAME_RE.test(f.filename)) {
      errors.push('Evidence file reference is invalid.')
    }
  }

  return errors
}

const router = Router()

// GET /api/reports — company-scoped, same as facilities.
router.get('/', requireAuth, async (req, res) => {
  const all = await getReports()
  res.json(all.filter((r) => r.companyId === req.user.companyId))
})

router.post('/', requireAuth, async (req, res) => {
  const errors = await validate(req.body, req.user.companyId)
  if (errors.length) return res.status(400).json({ error: errors.join(' ') })

  const facility = await getFacilityById(req.body.facilityId)
  const report = await createReport({
    facilityId: req.body.facilityId,
    facilityName: facility.name,
    companyId: req.user.companyId,
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








// import { Router } from 'express'
// import { getReports, createReport } from '../storeReports.js'
// import { getFacilityById } from '../store.js'
// import { requireAuth } from '../middleware/requireAuth.js'

// export const SCOPES = ['Scope 1', 'Scope 2', 'Scope 3']
// const SAFE_FILENAME_RE = /^[0-9]+-[a-z0-9]+\.[a-z0-9]+$/i

// function validate(body, companyId) {
//   const errors = []

//   // A facility must both exist AND belong to the caller's own company —
//   // otherwise someone could file a report against another company's
//   // facility just by guessing/knowing its ID.
//   const facility = body.facilityId ? getFacilityById(body.facilityId) : null
//   if (!facility || facility.companyId !== companyId) {
//     errors.push('A valid facility must be selected.')
//   }

//   if (!body.reportDate) {
//     errors.push('Report date is required.')
//   } else {
//     const date = new Date(body.reportDate)
//     if (Number.isNaN(date.getTime())) errors.push('Report date is invalid.')
//     else if (date.getTime() > Date.now()) errors.push('Report date cannot be in the future.')
//   }

//   if (!SCOPES.includes(body.scope)) errors.push(`Scope must be one of: ${SCOPES.join(', ')}.`)

//   const amount = Number(body.amount)
//   if (body.amount === undefined || body.amount === '' || Number.isNaN(amount) || amount <= 0) {
//     errors.push('Amount must be a number greater than 0.')
//   }

//   if (!body.reporterName || !body.reporterName.trim()) errors.push('Reporter name is required.')

//   if (body.evidenceFile) {
//     const f = body.evidenceFile
//     if (typeof f !== 'object' || !f.filename || !SAFE_FILENAME_RE.test(f.filename)) {
//       errors.push('Evidence file reference is invalid.')
//     }
//   }

//   return errors
// }

// const router = Router()

// // GET /api/reports — company-scoped, same as facilities.
// router.get('/', requireAuth, (req, res) => {
//   const all = getReports()
//   res.json(all.filter((r) => r.companyId === req.user.companyId))
// })

// router.post('/', requireAuth, (req, res) => {
//   const errors = validate(req.body, req.user.companyId)
//   if (errors.length) return res.status(400).json({ error: errors.join(' ') })

//   const facility = getFacilityById(req.body.facilityId)
//   const report = createReport({
//     facilityId: req.body.facilityId,
//     facilityName: facility.name,
//     companyId: req.user.companyId,
//     reportDate: req.body.reportDate,
//     scope: req.body.scope,
//     amount: Number(req.body.amount),
//     reporterName: req.body.reporterName.trim(),
//     notes: req.body.notes?.trim() || '',
//     evidenceFile: req.body.evidenceFile || null,
//     submittedBy: req.user.id,
//   })

//   res.status(201).json(report)
// })

// export default router
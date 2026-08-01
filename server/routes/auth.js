import { Router } from 'express'
import { findUserByEmail, findUserById, createUser, toPublicUser } from '../storeUsers.js'
import { getCompanyById, getCompanyByJoinCode, createCompany } from '../storeCompanies.js'
import { hashPassword, verifyPassword, signToken } from '../utils/auth.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateSignupInput({ name, email, password, companyMode, companyName, joinCode }) {
  const errors = []
  if (!name || !name.trim()) errors.push('Name is required.')
  if (!email || !EMAIL_RE.test(email)) errors.push('A valid email is required.')
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters.')
  if (password && !/[A-Za-z]/.test(password)) errors.push('Password must contain at least one letter.')
  if (password && !/[0-9]/.test(password)) errors.push('Password must contain at least one number.')

  if (companyMode !== 'create' && companyMode !== 'join') {
    errors.push('Please choose whether to create or join a company.')
  } else if (companyMode === 'create') {
    if (!companyName || !companyName.trim()) errors.push('Company name is required.')
  } else if (companyMode === 'join') {
    if (!joinCode || !joinCode.trim()) errors.push('A join code is required.')
  }

  return errors
}

// Attaches the user's company info to whatever gets sent back to the
// client. joinCode is only included for admins — members don't need it
// (they already used it once), and there's no reason to expose it more
// broadly than that.
function withCompany(user) {
  const company = getCompanyById(user.companyId)
  return {
    ...toPublicUser(user),
    company: company
      ? { id: company.id, name: company.name, joinCode: user.role === 'admin' ? company.joinCode : undefined }
      : null,
  }
}

router.post('/signup', async (req, res) => {
  const { name, email, password, companyMode, companyName, joinCode } = req.body || {}

  const errors = validateSignupInput({ name, email, password, companyMode, companyName, joinCode })
  if (errors.length) return res.status(400).json({ error: errors.join(' ') })

  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' })
  }

  let company
  let role
  if (companyMode === 'create') {
    company = createCompany(companyName)
    role = 'admin'
  } else {
    company = getCompanyByJoinCode(joinCode)
    if (!company) {
      return res.status(400).json({ error: 'That join code was not recognized. Double-check it with your admin.' })
    }
    role = 'member'
  }

  const passwordHash = await hashPassword(password)
  const user = createUser({ name: name.trim(), email, passwordHash, companyId: company.id, role })
  const token = signToken(user)

  res.status(201).json({ token, user: withCompany(user) })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

  const user = findUserByEmail(email)
  const invalidCredentials = () => res.status(401).json({ error: 'Invalid email or password.' })
  if (!user) return invalidCredentials()

  const passwordMatches = await verifyPassword(password, user.passwordHash)
  if (!passwordMatches) return invalidCredentials()

  const token = signToken(user)
  res.json({ token, user: withCompany(user) })
})

router.get('/me', requireAuth, (req, res) => {
  // req.user was already set by requireAuth via toPublicUser(), but we
  // re-fetch the full record here (with companyId/role intact) to attach
  // company info the same way signup/login do.
  const user = findUserById(req.user.id)
  res.json(withCompany(user))
})

router.post('/logout', (req, res) => res.json({ ok: true }))

export default router
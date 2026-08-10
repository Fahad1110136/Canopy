import crypto from 'crypto'
import { Router } from 'express'
import { findUserByEmail, findUserById, createUser, toPublicUser, findUserByVerificationToken, setVerificationToken, markUserVerified } from '../storeUsers.js'
import { getCompanyById, getCompanyByJoinCode, createCompany } from '../storeCompanies.js'
import { hashPassword, verifyPassword, signToken } from '../utils/auth.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { sendVerificationEmail } from '../utils/email.js'

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex')
}

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
  const verificationToken = generateVerificationToken()
  const verificationTokenExpiry = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS).toISOString()
  const user = createUser({
    name: name.trim(), email, passwordHash, companyId: company.id, role,
    verificationToken, verificationTokenExpiry,
  })

  try {
    await sendVerificationEmail(user, verificationToken)
  } catch (err) {
    console.error('Failed to send verification email:', err)
    // Account still exists — the resend endpoint lets them retry rather
    // than making signup itself fail because of a transient email error.
  }

  // No token/session yet — the account isn't usable until the email is
  // verified, so we don't log them in here.
  res.status(201).json({ pendingVerification: true, email: user.email })
})

router.get('/verify', (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'Missing verification token.' })

  const user = findUserByVerificationToken(token)
  if (!user) return res.status(400).json({ error: 'INVALID_TOKEN' })

  if (user.verificationTokenExpiry && new Date(user.verificationTokenExpiry) < new Date()) {
    return res.status(400).json({ error: 'TOKEN_EXPIRED' })
  }

  markUserVerified(user.id)
  const freshUser = findUserById(user.id)
  const jwt = signToken(freshUser)
  res.json({ token: jwt, user: withCompany(freshUser) })
})

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  const user = findUserByEmail(email)
  // Don't reveal whether the account exists — respond the same way either way.
  if (!user || user.verified) return res.json({ ok: true })

  const verificationToken = generateVerificationToken()
  const verificationTokenExpiry = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS).toISOString()
  setVerificationToken(user.id, verificationToken, verificationTokenExpiry)

  try {
    await sendVerificationEmail(user, verificationToken)
  } catch (err) {
    console.error('Failed to resend verification email:', err)
  }

  res.json({ ok: true })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

  const user = findUserByEmail(email)
  const invalidCredentials = () => res.status(401).json({ error: 'Invalid email or password.' })
  if (!user) return invalidCredentials()

  const passwordMatches = await verifyPassword(password, user.passwordHash)
  if (!passwordMatches) return invalidCredentials()

  if (!user.verified) {
    return res.status(403).json({ error: 'EMAIL_NOT_VERIFIED' })
  }

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
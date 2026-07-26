import { Router } from 'express'
import { findUserByEmail, createUser, toPublicUser } from '../storeUsers.js'
import { hashPassword, verifyPassword, signToken } from '../utils/auth.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateSignupInput({ name, email, password }) {
  const errors = []
  if (!name || !name.trim()) errors.push('Name is required.')
  if (!email || !EMAIL_RE.test(email)) errors.push('A valid email is required.')
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters.')
  if (password && !/[A-Za-z]/.test(password)) errors.push('Password must contain at least one letter.')
  if (password && !/[0-9]/.test(password)) errors.push('Password must contain at least one number.')
  return errors
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body || {}

  const errors = validateSignupInput({ name, email, password })
  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') })
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' })
  }

  const passwordHash = await hashPassword(password)
  const user = createUser({ name: name.trim(), email, passwordHash })
  const token = signToken(user)

  res.status(201).json({ token, user: toPublicUser(user) })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const user = findUserByEmail(email)
  // Deliberately generic message on both "no such user" and "wrong password"
  // so a login form can't be used to enumerate registered emails.
  const invalidCredentials = () => res.status(401).json({ error: 'Invalid email or password.' })

  if (!user) return invalidCredentials()

  const passwordMatches = await verifyPassword(password, user.passwordHash)
  if (!passwordMatches) return invalidCredentials()

  const token = signToken(user)
  res.json({ token, user: toPublicUser(user) })
})

// GET /api/auth/me — requires a valid token
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user)
})

// POST /api/auth/logout — JWTs are stateless, so there's nothing to
// invalidate server-side; this endpoint exists mainly for symmetry and to
// leave room for a token-blacklist/refresh-token upgrade later. The actual
// logout work (clearing the token) happens on the frontend.
router.post('/logout', (req, res) => {
  res.json({ ok: true })
})

export default router
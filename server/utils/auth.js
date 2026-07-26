import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SALT_ROUNDS = 10

// Falls back to a dev-only secret so the app still runs out of the box,
// but warns loudly — production deployments must set a real JWT_SECRET.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me'
if (!process.env.JWT_SECRET) {
  console.warn(
    '⚠️  JWT_SECRET is not set in the environment. Using an insecure development ' +
    'default. Set JWT_SECRET in server/.env before deploying this anywhere real.'
  )
}

const TOKEN_EXPIRY = '2h'

export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS)
}

export async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash)
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  })
}

/** Throws if the token is missing, malformed, or expired. */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}
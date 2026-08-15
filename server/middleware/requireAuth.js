import { verifyToken } from '../utils/auth.js'
import { findUserById, toPublicUser } from '../storeUsers.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'NO_TOKEN' })
  }

  let payload
  try {
    payload = verifyToken(token)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'INVALID_TOKEN' })
  }

  const user = await findUserById(payload.sub)
  if (!user) {
    return res.status(401).json({ error: 'INVALID_TOKEN' })
  }

  req.user = toPublicUser(user)
  next()
}
import { getToken } from '../utils/tokenStorage.js'
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    })
  } catch { throw new Error('NETWORK_ERROR') }
  let data = null
  try { data = await response.json() } catch {}
  if (!response.ok) throw new Error(data?.error || `REQUEST_FAILED_${response.status}`)
  return data
}

export function signupRequest(name, email, password, companyChoice) {
  // companyChoice: { mode: 'create', companyName } or { mode: 'join', joinCode }
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
      companyMode: companyChoice.mode,
      companyName: companyChoice.companyName,
      joinCode: companyChoice.joinCode,
    }),
  })
}
export function loginRequest(email, password) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}
export function fetchCurrentUser() {
  const token = getToken()
  return request('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
}
export function verifyEmailRequest(token) {
  return request(`/auth/verify?token=${encodeURIComponent(token)}`)
}
export function resendVerificationRequest(email) {
  return request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) })
}
export function describeAuthError(message) {
  if (message === 'NETWORK_ERROR') return "Couldn't reach the Canopy backend. Is the server running on port 4000?"
  if (message === 'EMAIL_NOT_VERIFIED') return 'Please verify your email before logging in.'
  if (message === 'INVALID_TOKEN') return 'That verification link is invalid.'
  if (message === 'TOKEN_EXPIRED') return 'That verification link has expired.'
  if (message?.startsWith('REQUEST_FAILED_')) return 'Something went wrong talking to the server.'
  return message || 'Something went wrong.'
}
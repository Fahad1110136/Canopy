import { getToken } from '../utils/tokenStorage.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    })
  } catch {
    throw new Error('NETWORK_ERROR')
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // no body
  }

  if (!response.ok) {
    throw new Error(data?.error || `REQUEST_FAILED_${response.status}`)
  }

  return data
}

export function signupRequest(name, email, password) {
  return request('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) })
}

export function loginRequest(email, password) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function fetchCurrentUser() {
  const token = getToken()
  return request('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
}

/** Turns a raw error message/code into something friendly to show a user. */
export function describeAuthError(message) {
  if (message === 'NETWORK_ERROR') {
    return "Couldn't reach the Canopy backend. Is the server running on port 4000?"
  }
  if (message?.startsWith('REQUEST_FAILED_')) {
    return 'Something went wrong talking to the server.'
  }
  return message || 'Something went wrong.'
}
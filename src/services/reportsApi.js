import { getToken } from '../utils/tokenStorage.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
export const REPORT_SCOPES = ['Scope 1', 'Scope 2', 'Scope 3']

async function request(path, options = {}) {
  const token = getToken()
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    })
  } catch { throw new Error('NETWORK_ERROR') }
  let data = null
  try { data = await response.json() } catch {}
  if (!response.ok) throw new Error(data?.error || `REQUEST_FAILED_${response.status}`)
  return data
}

export function fetchReports() { return request('/reports') }

// evidenceFile is now the metadata object already returned by a prior
// POST /api/uploads call (see FileDropzone.jsx) — not a raw File, so this
// is a plain JSON request instead of multipart/form-data.
export function submitReport(formValues, evidenceFile) {
  return request('/reports', {
    method: 'POST',
    body: JSON.stringify({ ...formValues, evidenceFile: evidenceFile || null }),
  })
}

export function describeReportsError(message) {
  if (message === 'NETWORK_ERROR') return "Couldn't reach the Canopy backend. Is the server running on port 4000?"
  if (message === 'NO_TOKEN' || message === 'INVALID_TOKEN') return 'Please log in to do that.'
  if (message === 'TOKEN_EXPIRED') return 'Your session expired — please log in again.'
  if (message?.startsWith('REQUEST_FAILED_')) return 'Something went wrong talking to the server.'
  return message || 'Something went wrong.'
}
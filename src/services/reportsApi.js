import { getToken } from '../utils/tokenStorage.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export const REPORT_SCOPES = ['Scope 1', 'Scope 2', 'Scope 3']

async function request(path, options = {}) {
  const token = getToken()

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
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

export function fetchReports() {
  return request('/reports')
}

export function submitReport(formValues, file) {
  const formData = new FormData()
  formData.append('facilityId', formValues.facilityId)
  formData.append('reportDate', formValues.reportDate)
  formData.append('scope', formValues.scope)
  formData.append('amount', formValues.amount)
  formData.append('reporterName', formValues.reporterName)
  formData.append('notes', formValues.notes || '')
  if (file) formData.append('evidence', file)

  // Deliberately not setting Content-Type here — the browser must generate
  // its own multipart boundary string, which only happens if we let fetch
  // build that header itself from the FormData body.
  return request('/reports', { method: 'POST', body: formData })
}

export function describeReportsError(message) {
  if (message === 'NETWORK_ERROR') {
    return "Couldn't reach the Canopy backend. Is the server running on port 4000?"
  }
  if (message === 'NO_TOKEN' || message === 'INVALID_TOKEN') {
    return 'Please log in to do that.'
  }
  if (message === 'TOKEN_EXPIRED') {
    return 'Your session expired — please log in again.'
  }
  if (message?.startsWith('REQUEST_FAILED_')) {
    return 'Something went wrong talking to the server.'
  }
  return message || 'Something went wrong.'
}
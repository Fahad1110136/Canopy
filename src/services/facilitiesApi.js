const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export const FACILITY_CATEGORIES = ['Manufacturing', 'Logistics', 'Energy', 'Office']

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    // Network-level failure (server down, wrong URL, CORS block, etc.)
    throw new Error('NETWORK_ERROR')
  }

  if (response.status === 204) return null

  let data = null
  try {
    data = await response.json()
  } catch {
    // No JSON body — fine for some responses
  }

  if (!response.ok) {
    throw new Error(data?.error || `REQUEST_FAILED_${response.status}`)
  }

  return data
}

export function fetchFacilities() {
  return request('/facilities')
}

export function createFacility(payload) {
  return request('/facilities', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateFacility(id, payload) {
  return request(`/facilities/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteFacility(id) {
  return request(`/facilities/${id}`, { method: 'DELETE' })
}

/** Turns a raw error message/code into something friendly to show a user. */
export function describeApiError(message) {
  if (message === 'NETWORK_ERROR') {
    return "Couldn't reach the Canopy backend. Is the server running on port 4000?"
  }
  if (message?.startsWith('REQUEST_FAILED_')) {
    return 'Something went wrong talking to the server.'
  }
  return message || 'Something went wrong.'
}
const BASE_URL = 'https://api.electricitymap.org/v3/carbon-intensity/latest'

/**
 * Fetches the latest carbon intensity (gCO2eq/kWh) for a single grid zone.
 * Throws a descriptive Error on any failure so callers can show a friendly
 * message instead of a blank screen.
 */
export async function fetchZoneIntensity(zoneCode, apiKey, { signal } = {}) {
  if (!apiKey) {
    throw new Error('MISSING_API_KEY')
  }

  const response = await fetch(`${BASE_URL}?zone=${encodeURIComponent(zoneCode)}`, {
    headers: { 'auth-token': apiKey },
    signal,
  })

  if (response.status === 401 || response.status === 403) {
    throw new Error('INVALID_API_KEY')
  }
  if (response.status === 429) {
    throw new Error('RATE_LIMITED')
  }
  if (!response.ok) {
    throw new Error(`REQUEST_FAILED_${response.status}`)
  }

  const data = await response.json()
  if (typeof data.carbonIntensity !== 'number') {
    throw new Error('NO_DATA')
  }

  return {
    zone: zoneCode,
    carbonIntensity: data.carbonIntensity,
    datetime: data.datetime,
    isEstimated: Boolean(data.isEstimated),
  }
}

/**
 * Fetches carbon intensity for every zone in the list in parallel.
 * Uses allSettled so one failing zone never blocks the rest of the list.
 */
export async function fetchAllZones(zones, apiKey, { signal } = {}) {
  const results = await Promise.allSettled(
    zones.map((z) => fetchZoneIntensity(z.code, apiKey, { signal }))
  )

  return zones.map((zone, i) => {
    const result = results[i]
    if (result.status === 'fulfilled') {
      return { ...zone, status: 'ok', data: result.value }
    }
    return { ...zone, status: 'error', error: result.reason?.message || 'UNKNOWN' }
  })
}

/** Turns an internal error code into a short, friendly message. */
export function describeError(code) {
  switch (code) {
    case 'MISSING_API_KEY':
      return 'No API key configured yet.'
    case 'INVALID_API_KEY':
      return 'That API key was rejected — double-check it.'
    case 'RATE_LIMITED':
      return 'Rate limit hit — try again in a moment.'
    case 'NO_DATA':
      return 'No data available for this zone right now.'
    default:
      return "Couldn't reach the grid data service."
  }
}
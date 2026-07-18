const BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

/**
 * Fetches current air quality for one location. Open-Meteo needs no API key
 * or account — just lat/lon — so there's no "missing key" case to handle here.
 */
export async function fetchLocationAirQuality(location, { signal } = {}) {
  const url = `${BASE_URL}?latitude=${location.lat}&longitude=${location.lon}&current=european_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone`

  const response = await fetch(url, { signal })

  if (response.status === 429) {
    throw new Error('RATE_LIMITED')
  }
  if (!response.ok) {
    throw new Error(`REQUEST_FAILED_${response.status}`)
  }

  const data = await response.json()
  if (!data.current || typeof data.current.european_aqi !== 'number') {
    throw new Error('NO_DATA')
  }

  return {
    aqi: data.current.european_aqi,
    pm2_5: data.current.pm2_5,
    pm10: data.current.pm10,
    carbonMonoxide: data.current.carbon_monoxide,
    nitrogenDioxide: data.current.nitrogen_dioxide,
    ozone: data.current.ozone,
    time: data.current.time,
  }
}

/**
 * Fetches every location in parallel. One failing location never blocks
 * the rest of the list, thanks to allSettled.
 */
export async function fetchAllLocations(locations, { signal } = {}) {
  const results = await Promise.allSettled(
    locations.map((loc) => fetchLocationAirQuality(loc, { signal }))
  )

  return locations.map((loc, i) => {
    const result = results[i]
    if (result.status === 'fulfilled') {
      return { ...loc, status: 'ok', data: result.value }
    }
    return { ...loc, status: 'error', error: result.reason?.message || 'UNKNOWN' }
  })
}

/** Turns an internal error code into a short, friendly message. */
export function describeError(code) {
  switch (code) {
    case 'RATE_LIMITED':
      return 'Rate limit hit — try again in a moment.'
    case 'NO_DATA':
      return 'No data available for this location right now.'
    default:
      return "Couldn't reach the air quality service."
  }
}
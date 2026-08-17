import { getToken } from '../utils/tokenStorage.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '')

export function resolveUploadUrl(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `${API_ORIGIN}${url}`
}

/**
 * Uploads a single file with progress reporting. Uses XMLHttpRequest
 * instead of fetch specifically because fetch's Request/Response streams
 * don't expose upload progress in browsers today — XHR's `upload.onprogress`
 * is still the only reliable cross-browser way to show a real progress bar.
 */
export function uploadFile(file, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}/uploads`)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      let data = null
      try { data = JSON.parse(xhr.responseText) } catch {}
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data)
      } else {
        reject(new Error(data?.error || `REQUEST_FAILED_${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('NETWORK_ERROR'))
    xhr.onabort = () => reject(new Error('ABORTED'))

    if (signal) {
      if (signal.aborted) { xhr.abort(); return }
      signal.addEventListener('abort', () => xhr.abort())
    }

    xhr.send(formData)
  })
}

// Cloudinary's publicId contains a slash (folder/filename), so it's sent
// as a query param rather than a route param — Express would otherwise
// split "canopy-reports/abc123" into two path segments.
export async function removeUploadedFile(publicId) {
  const token = getToken()
  const response = await fetch(`${API_BASE}/uploads?publicId=${encodeURIComponent(publicId)}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok && response.status !== 404) {
    throw new Error('REQUEST_FAILED_' + response.status)
  }
}

export function describeUploadError(message) {
  if (message === 'NETWORK_ERROR') return "Couldn't reach the Canopy backend. Is the server running?"
  if (message === 'ABORTED') return 'Upload cancelled.'
  if (message?.startsWith('REQUEST_FAILED_')) return 'Something went wrong talking to the server.'
  return message || 'Something went wrong.'
}
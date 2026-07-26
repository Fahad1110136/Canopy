// Token is stored in localStorage for simplicity in this project. Worth
// knowing: localStorage is readable by any JS running on the page, so a
// successful XSS attack could steal it. The more secure pattern for a real
// production app is an httpOnly cookie set by the server, which JS can't
// read at all — that requires the backend to set cookies and the frontend
// to send credentials with each request, which is a reasonable next upgrade
// if this project continues past the learning-project stage.
const TOKEN_KEY = 'canopy_auth_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}
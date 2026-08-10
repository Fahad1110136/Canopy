import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getToken, setToken as saveToken, clearToken } from '../utils/tokenStorage.js'
import { fetchCurrentUser, loginRequest, signupRequest, verifyEmailRequest, resendVerificationRequest } from '../services/authApi.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) { setInitializing(false); return }
    fetchCurrentUser()
      .then((u) => setUser(u))
      .catch(() => { clearToken(); setUser(null) })
      .finally(() => setInitializing(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, user: loggedInUser } = await loginRequest(email, password)
    saveToken(token)
    setUser(loggedInUser)
  }, [])

  const signup = useCallback(async (name, email, password, companyChoice) => {
    // No token comes back here — the account is unverified until they
    // click the link in their email, so we deliberately don't log them in.
    return signupRequest(name, email, password, companyChoice)
  }, [])

  const verifyEmail = useCallback(async (token) => {
    const { token: jwt, user: verifiedUser } = await verifyEmailRequest(token)
    saveToken(jwt)
    setUser(verifiedUser)
  }, [])

  const resendVerification = useCallback((email) => resendVerificationRequest(email), [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = { user, initializing, isAuthenticated: Boolean(user), login, signup, verifyEmail, resendVerification, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}
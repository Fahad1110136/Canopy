import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getToken, setToken as saveToken, clearToken } from '../utils/tokenStorage.js'
import { fetchCurrentUser, loginRequest, signupRequest } from '../services/authApi.js'

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
    const { token, user: newUser } = await signupRequest(name, email, password, companyChoice)
    saveToken(token)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = { user, initializing, isAuthenticated: Boolean(user), login, signup, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}
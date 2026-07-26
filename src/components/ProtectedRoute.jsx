import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-sm text-(--color-ink-soft)">
        Checking your session…
      </div>
    )
  }

  if (!isAuthenticated) {
    // Remember where they were headed so the login page can send them back
    // after a successful login, instead of always landing on /dashboard.
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
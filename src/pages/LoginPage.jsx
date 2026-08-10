import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, AlertTriangle, Leaf, Mail, Check } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { describeAuthError } from '../services/authApi.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const { login, resendVerification } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendState, setResendState] = useState('idle') // 'idle' | 'sending' | 'sent'

  function validate() {
    const errors = {}
    if (!email.trim()) errors.email = 'Email is required.'
    else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Password is required.'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError(null)
    setNeedsVerification(false)
    setResendState('idle')
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setSubmitting(true)
    try {
      await login(email.trim(), password)
      const redirectTo = location.state?.from && location.state.from !== '/login' ? location.state.from : '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err.message === 'EMAIL_NOT_VERIFIED') setNeedsVerification(true)
      setApiError(describeAuthError(err.message))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    setResendState('sending')
    try {
      await resendVerification(email.trim())
      setResendState('sent')
    } catch {
      setResendState('idle')
    }
  }

  return (
    <Layout>
      <section className="min-h-[85vh] flex items-center justify-center px-6 py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-8">
            <span className="grid place-items-center w-8 h-8 rounded-full bg-(--color-forest) text-white">
              <Leaf size={16} strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg text-(--color-forest-deep)">Canopy</span>
          </div>

          <h1 className="font-display text-3xl text-(--color-forest-deep)">Log in</h1>
          <p className="mt-1.5 text-sm text-(--color-ink-soft)">
            Access your facilities registry and dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.password}</p>
              )}
            </div>

            {apiError && (
              <p className="flex items-center gap-1.5 text-sm text-[#B5502E]">
                <AlertTriangle size={14} className="shrink-0" /> {apiError}
              </p>
            )}

            {needsVerification && (
              <div className="text-sm">
                {resendState === 'sent' ? (
                  <p className="flex items-center gap-1.5 text-(--color-forest)">
                    <Check size={14} /> Verification email sent — check your inbox.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendState === 'sending'}
                    className="flex items-center gap-1.5 text-(--color-forest-deep) underline visible-focus disabled:opacity-60"
                  >
                    <Mail size={14} /> {resendState === 'sending' ? 'Sending…' : 'Resend verification email'}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-(--color-forest) text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-(--color-forest-deep) transition-colors disabled:opacity-60 disabled:cursor-not-allowed visible-focus"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-(--color-ink-soft)">
            Don't have an account?{' '}
            <Link to="/signup" className="text-(--color-forest-deep) underline decoration-(--color-leaf) underline-offset-4 visible-focus">
              Sign up
            </Link>
          </p>
        </motion.div>
      </section>
    </Layout>
  )
}
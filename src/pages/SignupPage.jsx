import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, AlertTriangle, Leaf, Check, X } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { describeAuthError } from '../services/authApi.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function passwordRuleState(password) {
  return {
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /[0-9]/.test(password),
  }
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const rules = passwordRuleState(password)
  const passwordValid = rules.length && rules.letter && rules.number

  function validate() {
    const errors = {}
    if (!name.trim()) errors.name = 'Name is required.'
    if (!email.trim()) errors.email = 'Email is required.'
    else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.'
    if (!passwordValid) errors.password = 'Password does not meet the requirements below.'
    if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError(null)
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setSubmitting(true)
    try {
      await signup(name.trim(), email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setApiError(describeAuthError(err.message))
    } finally {
      setSubmitting(false)
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

          <h1 className="font-display text-3xl text-(--color-forest-deep)">Create your account</h1>
          <p className="mt-1.5 text-sm text-(--color-ink-soft)">
            Start tracking facilities and emissions in minutes.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.name}</p>}
            </div>

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
              {fieldErrors.email && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
              />
              <ul className="mt-2 space-y-1">
                {[
                  ['length', 'At least 8 characters'],
                  ['letter', 'At least one letter'],
                  ['number', 'At least one number'],
                ].map(([key, label]) => (
                  <li key={key} className={`flex items-center gap-1.5 text-xs ${rules[key] ? 'text-(--color-forest)' : 'text-(--color-ink-soft)'}`}>
                    {rules[key] ? <Check size={12} /> : <X size={12} />} {label}
                  </li>
                ))}
              </ul>
              {fieldErrors.password && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {apiError && (
              <p className="flex items-center gap-1.5 text-sm text-[#B5502E]">
                <AlertTriangle size={14} className="shrink-0" /> {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-(--color-forest) text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-(--color-forest-deep) transition-colors disabled:opacity-60 disabled:cursor-not-allowed visible-focus"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-(--color-ink-soft)">
            Already have an account?{' '}
            <Link to="/login" className="text-(--color-forest-deep) underline decoration-(--color-leaf) underline-offset-4 visible-focus">
              Log in
            </Link>
          </p>
        </motion.div>
      </section>
    </Layout>
  )
}
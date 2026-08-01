import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, AlertTriangle, Leaf, Check, X, Building2, KeyRound } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { describeAuthError } from '../services/authApi.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function passwordRuleState(password) {
  return { length: password.length >= 8, letter: /[A-Za-z]/.test(password), number: /[0-9]/.test(password) }
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyMode, setCompanyMode] = useState('create') // 'create' | 'join'
  const [companyName, setCompanyName] = useState('')
  const [joinCode, setJoinCode] = useState('')

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

    if (companyMode === 'create') {
      if (!companyName.trim()) errors.companyName = 'Company name is required.'
    } else {
      if (!joinCode.trim()) errors.joinCode = 'A join code is required.'
    }

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
      const companyChoice =
        companyMode === 'create'
          ? { mode: 'create', companyName: companyName.trim() }
          : { mode: 'join', joinCode: joinCode.trim() }
      await signup(name.trim(), email.trim(), password, companyChoice)
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
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <span className="grid place-items-center w-8 h-8 rounded-full bg-(--color-forest) text-white"><Leaf size={16} /></span>
            <span className="font-display text-lg text-(--color-forest-deep)">Canopy</span>
          </div>
          <h1 className="font-display text-3xl text-(--color-forest-deep)">Create your account</h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus" />
              {fieldErrors.name && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus" />
              {fieldErrors.email && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus" />
              <ul className="mt-2 space-y-1">
                {[['length', 'At least 8 characters'], ['letter', 'At least one letter'], ['number', 'At least one number']].map(([key, lbl]) => (
                  <li key={key} className={`flex items-center gap-1.5 text-xs ${rules[key] ? 'text-(--color-forest)' : 'text-(--color-ink-soft)'}`}>
                    {rules[key] ? <Check size={12} /> : <X size={12} />} {lbl}
                  </li>
                ))}
              </ul>
              {fieldErrors.password && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-1.5">Confirm password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus" />
              {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.confirmPassword}</p>}
            </div>

            {/* Company step */}
            <div className="pt-2 border-t border-(--color-line)">
              <label className="block text-xs font-mono uppercase tracking-widest text-(--color-ink-soft) mb-2 mt-4">
                Your company
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setCompanyMode('create')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition-colors visible-focus ${
                    companyMode === 'create'
                      ? 'bg-(--color-forest) text-white border-(--color-forest)'
                      : 'bg-(--color-surface) text-(--color-ink-soft) border-(--color-line) hover:border-(--color-leaf)'
                  }`}
                >
                  <Building2 size={14} /> Create new
                </button>
                <button
                  type="button"
                  onClick={() => setCompanyMode('join')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition-colors visible-focus ${
                    companyMode === 'join'
                      ? 'bg-(--color-forest) text-white border-(--color-forest)'
                      : 'bg-(--color-surface) text-(--color-ink-soft) border-(--color-line) hover:border-(--color-leaf)'
                  }`}
                >
                  <KeyRound size={14} /> Join existing
                </button>
              </div>

              {companyMode === 'create' ? (
                <div>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
                  />
                  <p className="mt-1.5 text-xs text-(--color-ink-soft)">
                    You'll be company's admin and get a joining code to invite teammates.
                  </p>
                  {fieldErrors.companyName && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.companyName}</p>}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DCUD99"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-line) bg-(--color-surface) text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-(--color-leaf) visible-focus"
                  />
                  <p className="mt-1.5 text-xs text-(--color-ink-soft)">
                    Ask your company's admin for the joining code.
                  </p>
                  {fieldErrors.joinCode && <p className="mt-1 text-xs text-[#B5502E]">{fieldErrors.joinCode}</p>}
                </div>
              )}
            </div>

            {apiError && <p className="flex items-center gap-1.5 text-sm text-[#B5502E]"><AlertTriangle size={14} /> {apiError}</p>}

            <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 bg-(--color-forest) text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-(--color-forest-deep) transition-colors disabled:opacity-60 disabled:cursor-not-allowed visible-focus">
              {submitting && <Loader2 size={15} className="animate-spin" />} {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-(--color-ink-soft)">Already have an account? <Link to="/login" className="text-(--color-forest-deep) underline">Log in</Link></p>
        </div>
      </section>
    </Layout>
  )
}
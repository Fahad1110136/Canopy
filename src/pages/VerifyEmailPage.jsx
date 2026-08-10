import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, CheckCircle2, AlertTriangle, Leaf, ShieldCheck } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { describeAuthError } from '../services/authApi.js'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { verifyEmail } = useAuth()
  const navigate = useNavigate()

  // 'idle' | 'verifying' | 'success' | 'error'
  // Verification only fires on the user's explicit button click below —
  // NOT automatically on page load. Auto-verifying on mount let a single
  // extra hit (an email security scanner prefetching the link, a page
  // reload, React Strict Mode's dev double-effect, etc.) silently burn
  // the one-time token before the real click ever landed, which is what
  // caused "verified" to immediately flip to "verification failed".
  // A button click is a discrete, user-initiated action that only ever
  // fires once, so this removes that whole class of bug.
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  async function handleVerify() {
    if (!token) {
      setStatus('error')
      setError('This verification link is missing its token.')
      return
    }
    setStatus('verifying')
    try {
      await verifyEmail(token)
      setStatus('success')
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
    } catch (err) {
      setStatus('error')
      setError(describeAuthError(err.message))
    }
  }

  return (
    <Layout>
      <section className="min-h-[85vh] flex items-center justify-center px-6 py-28">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="grid place-items-center w-8 h-8 rounded-full bg-(--color-forest) text-white"><Leaf size={16} /></span>
            <span className="font-display text-lg text-(--color-forest-deep)">Canopy</span>
          </div>

          {status === 'idle' && (
            <>
              <ShieldCheck size={28} className="text-(--color-forest) mx-auto mb-4" />
              <h1 className="font-display text-2xl text-(--color-forest-deep)">Confirm your email</h1>
              <p className="mt-2 text-sm text-(--color-ink-soft)">
                Click below to finish verifying your Canopy account.
              </p>
              <button
                type="button"
                onClick={handleVerify}
                className="mt-6 inline-flex items-center justify-center gap-2 bg-(--color-forest) text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-(--color-forest-deep) transition-colors visible-focus"
              >
                Verify email
              </button>
            </>
          )}

          {status === 'verifying' && (
            <>
              <Loader2 size={28} className="animate-spin text-(--color-forest) mx-auto mb-4" />
              <p className="text-sm text-(--color-ink-soft)">Verifying your email…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 size={32} className="text-(--color-forest) mx-auto mb-4" />
              <h1 className="font-display text-2xl text-(--color-forest-deep)">Email verified</h1>
              <p className="mt-2 text-sm text-(--color-ink-soft)">Taking you to your dashboard…</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertTriangle size={28} className="text-[#B5502E] mx-auto mb-4" />
              <h1 className="font-display text-2xl text-(--color-forest-deep)">Verification failed</h1>
              <p className="mt-2 text-sm text-(--color-ink-soft)">{error}</p>
              <p className="mt-2 text-sm text-(--color-ink-soft)">
                If you already verified successfully in another tab, you're all set — just log in.
              </p>
              <p className="mt-6 text-sm text-(--color-ink-soft)">
                <Link to="/login" className="text-(--color-forest-deep) underline">Back to log in</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}
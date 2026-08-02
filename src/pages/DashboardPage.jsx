import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, FileText, Copy, Check, Users2, BarChart3 } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import FacilitiesManager from '../components/FacilitiesManager.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function InviteCard({ company }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(company.joinCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can fail (older browsers, permissions) — the code
      // is still visible on screen to copy manually, so this isn't fatal.
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 mt-6">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-(--color-line) bg-(--color-leaf-soft)/25 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-(--color-forest) text-white shrink-0">
            <Users2 size={16} />
          </span>
          <div>
            <p className="text-sm text-(--color-ink)">
              Invite teammates to <strong>{company.name}</strong> with this code:
            </p>
            <p className="font-mono text-lg tracking-wider text-(--color-forest-deep)">{company.joinCode}</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-forest-deep) hover:text-(--color-forest) border border-(--color-line) rounded-full px-3.5 py-2 visible-focus"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <Layout>
      <section className="pt-32 pb-6 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-(--color-forest)">
              Signed in {user?.company?.name && <>· {user.company.name}</>}
            </span>
            <h1 className="font-display text-3xl text-(--color-forest-deep) mt-2">Welcome back, {user?.name?.split(' ')[0] || 'there'}.</h1>
            <p className="mt-1 text-sm text-(--color-ink-soft)">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link to="/dashboard/analytics" className="inline-flex items-center gap-2 text-sm font-medium text-(--color-forest-deep) border border-(--color-line) rounded-full px-4 py-2 hover:border-(--color-leaf) transition-colors visible-focus">
              <BarChart3 size={15} /> Analytics
            </Link>
            <Link to="/dashboard/reports/new" className="inline-flex items-center gap-2 text-sm font-medium bg-(--color-forest) text-white rounded-full px-4 py-2 hover:bg-(--color-forest-deep) transition-colors visible-focus">
              <FileText size={15} /> Submit report
            </Link>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 text-sm font-medium text-(--color-ink-soft) hover:text-[#B5502E] border border-(--color-line) rounded-full px-4 py-2 transition-colors visible-focus">
              <LogOut size={15} /> Log out
            </button>
          </div>
        </div>
      </section>

      {user?.role === 'admin' && user?.company?.joinCode && <InviteCard company={user.company} />}

      <FacilitiesManager />
    </Layout>
  )
}
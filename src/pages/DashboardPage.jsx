import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import FacilitiesManager from '../components/FacilitiesManager.jsx'
import { useAuth } from '../context/AuthContext.jsx'

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
              Signed in
            </span>
            <h1 className="font-display text-3xl text-(--color-forest-deep) mt-2">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}.
            </h1>
            <p className="mt-1 text-sm text-(--color-ink-soft)">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 self-start sm:self-auto text-sm font-medium text-(--color-ink-soft) hover:text-[#B5502E] border border-(--color-line) rounded-full px-4 py-2 transition-colors visible-focus"
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
      </section>

      <FacilitiesManager />
    </Layout>
  )
}
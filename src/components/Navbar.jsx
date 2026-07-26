import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { Menu, X, Leaf, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

// Section anchors always point back to "/" first so they work no matter
// which page you're currently on (login, dashboard, etc).
const SECTION_LINKS = [
  { label: 'Product', href: '/#features' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Product tour', href: '/#dashboard' },
  { label: 'Live data', href: '/#air-quality' },
  { label: 'Customers', href: '/#testimonial' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 24)
  })

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function handleLogout() {
    setOpen(false)
    logout()
    navigate('/')
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div
        className={`mx-auto max-w-6xl px-5 flex items-center justify-between rounded-2xl transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-md shadow-[0_1px_0_0_var(--color-line)] py-2.5 px-6'
            : 'py-1'
        }`}
      >
        <Link to="/" className="flex items-center gap-2 visible-focus">
          <span className="grid place-items-center w-8 h-8 rounded-full bg-(--color-forest) text-white">
            <Leaf size={16} strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg tracking-tight text-(--color-forest-deep)">Canopy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {SECTION_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-(--color-ink-soft) hover:text-(--color-forest-deep) transition-colors visible-focus"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/dashboard"
            className="text-sm text-(--color-ink-soft) hover:text-(--color-forest-deep) transition-colors visible-focus"
          >
            Facilities
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-(--color-ink-soft)">
                {user?.name?.split(' ')[0]}
              </span>
              <Link
                to="/dashboard"
                className="text-sm font-medium bg-(--color-forest) text-white px-4 py-2 rounded-full hover:bg-(--color-forest-deep) transition-colors visible-focus"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm text-(--color-ink-soft) hover:text-[#B5502E] transition-colors visible-focus"
              >
                <LogOut size={14} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-(--color-ink) hover:text-(--color-forest-deep) transition-colors visible-focus"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-(--color-forest) text-white px-4 py-2 rounded-full hover:bg-(--color-forest-deep) transition-colors visible-focus"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden visible-focus p-1.5 -mr-1.5"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="md:hidden mx-4 mt-2 bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4"
          >
            {SECTION_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base text-(--color-ink) visible-focus"
              >
                {link.label}
              </a>
            ))}
            <Link to="/dashboard" onClick={() => setOpen(false)} className="text-base text-(--color-ink) visible-focus">
              Facilities
            </Link>
            <div className="h-px bg-(--color-line) my-1" />
            {isAuthenticated ? (
              <>
                <span className="text-sm text-(--color-ink-soft)">Signed in as {user?.email}</span>
                <button onClick={handleLogout} className="inline-flex items-center gap-1.5 text-base text-(--color-ink) visible-focus">
                  <LogOut size={16} /> Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-base text-(--color-ink) visible-focus">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="text-base font-medium bg-(--color-forest) text-white px-4 py-2.5 rounded-full text-center visible-focus"
                >
                  Sign up free
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
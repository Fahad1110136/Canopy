import Navbar from './Navbar.jsx'
import ScrollProgress from './ScrollProgress.jsx'
import Footer from './Footer.jsx'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-ink)">
      <ScrollProgress />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
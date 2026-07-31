import Navbar from './Navbar.jsx'
import ScrollProgress from './ScrollProgress.jsx'
import Footer from './Footer.jsx'
import Toast from './Toast.jsx'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-ink)">
      <ScrollProgress />
      <Toast />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
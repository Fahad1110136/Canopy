// import Navbar from './components/Navbar.jsx'
// import ScrollProgress from './components/ScrollProgress.jsx'
// import Hero from './components/Hero.jsx'
// import TrustBar from './components/TrustBar.jsx'
// import StatsSection from './components/StatsSection.jsx'
// import FeaturesSection from './components/FeaturesSection.jsx'
// import HowItWorks from './components/HowItWorks.jsx'
// import DashboardPreview from './components/DashboardPreview.jsx'
// import Testimonial from './components/Testimonial.jsx'
// import CTASection from './components/CTASection.jsx'
// import Footer from './components/Footer.jsx'

// export default function App() {
//   return (
//     <div className="min-h-screen bg-(--color-bg) text-(--color-ink)">
//       <ScrollProgress />
//       <Navbar />
//       <main>
//         <Hero />
//         <TrustBar />
//         <StatsSection />
//         <FeaturesSection />
//         <HowItWorks />
//         <DashboardPreview />
//         <Testimonial />
//         <CTASection />
//       </main>
//       <Footer />
//     </div>
//   )
// }


import Navbar from './components/Navbar.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Hero from './components/Hero.jsx'
import TrustBar from './components/TrustBar.jsx'
import StatsSection from './components/StatsSection.jsx'
import FeaturesSection from './components/FeaturesSection.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import DashboardPreview from './components/DashboardPreview.jsx'
import GridIntensitySection from './components/GridIntensitySection.jsx'
import Testimonial from './components/Testimonial.jsx'
import CTASection from './components/CTASection.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-ink)">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <StatsSection />
        <FeaturesSection />
        <HowItWorks />
        <DashboardPreview />
        <GridIntensitySection />
        <Testimonial />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

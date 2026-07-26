import Layout from '../components/Layout.jsx'
import Hero from '../components/Hero.jsx'
import TrustBar from '../components/TrustBar.jsx'
import StatsSection from '../components/StatsSection.jsx'
import FeaturesSection from '../components/FeaturesSection.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import DashboardPreview from '../components/DashboardPreview.jsx'
import AirQualitySection from '../components/AirQualitySection.jsx'
import Testimonial from '../components/Testimonial.jsx'
import CTASection from '../components/CTASection.jsx'

export default function LandingPage() {
  return (
    <Layout>
      <Hero />
      <TrustBar />
      <StatsSection />
      <FeaturesSection />
      <HowItWorks />
      <DashboardPreview />
      <AirQualitySection />
      <Testimonial />
      <CTASection />
    </Layout>
  )
}
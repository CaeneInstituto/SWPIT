import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Destinations from '../components/Destinations'
import WhyUs from '../components/WhyUs'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'
import WhatsAppChat from '../components/WhatsAppChat'

export default function Home() {
  return (
    <div className="font-sans text-gray-800">
      <Navbar />
      <Hero />
      <Destinations />
      <WhyUs />
      <Testimonials />
      <Footer />
      <WhatsAppChat />
    </div>
  )
}

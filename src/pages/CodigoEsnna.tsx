import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function CodigoEsnna() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Header */}
        <div className="bg-brand-dark text-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
            <h1 className="text-4xl font-bold mb-3">Código de Conducta ESNNA</h1>
            <p className="text-white/70 text-lg">
              Protección contra la Explotación Sexual de Niños, Niñas y Adolescentes
            </p>
          </div>
        </div>

        {/* Contenido - Solo imagen */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex justify-center">
              <img 
                src="/AFICHE-ESNNA.webp" 
                alt="Código de Conducta ESNNA - Peru In Travel"
                className="w-full h-auto rounded-lg shadow-md max-w-3xl"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

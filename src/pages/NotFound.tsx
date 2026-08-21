import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero section con imagen de fondo */}
      <div
        className="flex-1 flex items-center justify-center relative"
        style={{
          backgroundImage: `url(/Autisha/DSC_0365332.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-brand-dark/75 backdrop-blur-sm" />

        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto py-32">
          {/* Número 404 grande */}
          <div className="text-[10rem] md:text-[14rem] font-extrabold leading-none text-white/10 select-none mb-0">
            404
          </div>

          {/* Ícono */}
          <div className="text-6xl -mt-8 mb-6">🗺️</div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            ¡Esta ruta se perdió en los Andes!
          </h1>

          <p className="text-white/70 text-lg mb-10 max-w-md mx-auto">
            La página que buscas no existe o fue movida. Pero no te preocupes, 
            tenemos muchos destinos increíbles esperándote.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-brand-gradient text-white font-bold px-8 py-4 rounded-full hover:opacity-90 transition-opacity shadow-lg text-base"
            >
              🏠 Volver al inicio
            </Link>
            <Link
              to="/#destinos"
              className="bg-white/10 hover:bg-white/20 border-2 border-white/50 text-white font-bold px-8 py-4 rounded-full transition-colors backdrop-blur-sm text-base"
            >
              🧭 Ver paquetes
            </Link>
            <Link
              to="/contactanos"
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg text-base"
            >
              💬 Contáctanos
            </Link>
          </div>

          {/* Links rápidos */}
          <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm text-white/50">
            <Link to="/quienes-somos" className="hover:text-white transition-colors">Quiénes somos</Link>
            <span>·</span>
            <Link to="/politica-de-privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <span>·</span>
            <Link to="/libro-reclamaciones" className="hover:text-white transition-colors">Reclamaciones</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

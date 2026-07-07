import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="max-w-md">
          {/* Illustration */}
          <div className="text-9xl font-extrabold text-brand-teal/20 leading-none mb-4">404</div>
          <div className="w-24 h-1 bg-brand-gradient mx-auto rounded-full mb-8" />

          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            ¡Ups! Página no encontrada
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Parece que esta ruta se perdió en los Andes. La página que buscas no existe o fue movida.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-brand-gradient text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-md"
            >
              Volver al inicio
            </Link>
            <Link
              to="/#destinos"
              className="border-2 border-brand-teal text-brand-teal font-bold px-8 py-3 rounded-full hover:bg-brand-teal/5 transition-colors"
            >
              Ver paquetes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ConstanciaMincetur() {
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
            <h1 className="text-4xl font-bold mb-3">Constancia MINCETUR</h1>
            <p className="text-white/70 text-lg">
              Registro y Acreditación como Agencia de Viajes y Turismo
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            
            {/* Introducción */}
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Peru In Travel - LOVI GROUP PERU E.I.R.L.</strong> está debidamente registrada 
                ante el Ministerio de Comercio Exterior y Turismo (MINCETUR), cumpliendo con todos los 
                requisitos legales para operar como agencia de viajes y turismo en el Perú.
              </p>
            </div>

            {/* Constancia (Imagen) */}
            <div className="mb-8 flex justify-center">
              <div className="bg-gray-100 rounded-lg p-4 max-w-3xl w-full">
                <img 
                  src="/constancia-mincetur-placeholder.jpg" 
                  alt="Constancia MINCETUR - Peru In Travel"
                  className="w-full h-auto rounded-lg shadow-md"
                  onError={(e) => {
                    // Fallback si la imagen no existe
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="%236b7280"%3EConstancia MINCETUR - Imagen pendiente%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
            </div>

            {/* Información de Registro */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Información de Registro</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Razón Social</p>
                  <p className="font-semibold text-gray-900">LOVI GROUP PERU E.I.R.L.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Nombre Comercial</p>
                  <p className="font-semibold text-gray-900">Peru In Travel</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">RUC</p>
                  <p className="font-semibold text-gray-900">20606474467</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Actividad</p>
                  <p className="font-semibold text-gray-900">Agencia de Viajes y Turismo</p>
                </div>
              </div>
            </div>

            {/* Nuestros Servicios Autorizados */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Servicios Autorizados</h2>
              <ul className="space-y-3">
                {[
                  'Organización y venta de paquetes turísticos',
                  'Reserva de alojamiento y transporte',
                  'Guiado turístico especializado',
                  'Servicios de asistencia al viajero',
                  'Intermediación con proveedores turísticos',
                  'Operación de tours nacionales'
                ].map((servicio, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-brand-teal font-bold text-xl shrink-0">✓</span>
                    <span className="text-gray-700">{servicio}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Marco Legal */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                📜 Marco Legal
              </h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                Nuestra operación se rige por la <strong>Ley N° 29408 - Ley General de Turismo</strong>, 
                su Reglamento aprobado por D.S. N° 003-2010-MINCETUR, y las disposiciones del 
                Ministerio de Comercio Exterior y Turismo (MINCETUR).
              </p>
            </div>

            {/* Contacto */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contacto</h3>
              <div className="text-gray-700 space-y-2">
                <p>📍 Jr. Los Nogales 345, Los Ficus, Santa Anita, Lima</p>
                <p>📞 +51 929 648 380</p>
                <p>✉️ peruintravel.pe@gmail.com</p>
                <p>🕐 Lunes a Sábado: 9:00 AM - 7:00 PM</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

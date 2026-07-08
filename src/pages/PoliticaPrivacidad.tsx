import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppChat from '../components/WhatsAppChat'

export default function PoliticaPrivacidad() {
  return (
    <div className="font-sans text-gray-800">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-brand-teal to-brand-teal-d text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Política de Privacidad
          </h1>
          <p className="text-white/80 text-lg">
            Última actualización: Julio de 2026
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-lg max-w-none">
            
            {/* Introducción */}
            <div className="bg-brand-teal/5 border-l-4 border-brand-teal rounded-r-xl p-6 mb-8">
              <p className="text-gray-700 leading-relaxed m-0">
                En <strong>Peru In Travel</strong> respetamos la privacidad de nuestros clientes y visitantes. 
                Nos comprometemos a proteger la información personal que usted nos proporciona a través de nuestro sitio web.
              </p>
            </div>

            {/* 1. Información que recopilamos */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-teal rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                  1
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  Información que recopilamos
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-3">
                Podemos recopilar la siguiente información:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal mt-1">✓</span>
                  <span>Nombres y apellidos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal mt-1">✓</span>
                  <span>Correo electrónico.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal mt-1">✓</span>
                  <span>Número de teléfono o WhatsApp.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal mt-1">✓</span>
                  <span>Nacionalidad.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal mt-1">✓</span>
                  <span>Información necesaria para gestionar reservas o cotizaciones.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal mt-1">✓</span>
                  <span>Cualquier información adicional que el usuario decida proporcionar mediante formularios de contacto.</span>
                </li>
              </ul>
            </div>

            {/* 2. Finalidad del tratamiento */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-teal rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                  2
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  Finalidad del tratamiento de datos
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-3">
                La información recopilada será utilizada para:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal mt-1">•</span>
                  <span>Responder consultas y solicitudes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal mt-1">•</span>
                  <span>Gestionar reservas y servicios turísticos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal mt-1">•</span>
                  <span>Brindar información sobre nuestros tours y promociones.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal mt-1">•</span>
                  <span>Mejorar la atención al cliente.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal mt-1">•</span>
                  <span>Cumplir con obligaciones legales aplicables.</span>
                </li>
              </ul>
            </div>

            {/* 3. Protección de la información */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-teal rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                  3
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  Protección de la información
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Implementamos medidas de seguridad técnicas y administrativas para proteger los datos personales 
                contra accesos no autorizados, pérdida, alteración o divulgación.
              </p>
            </div>

            {/* 4. Compartición de información */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-teal rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                  4
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  Compartición de información
                </h2>
              </div>
              <div className="space-y-3 text-gray-600">
                <p className="leading-relaxed">
                  <strong className="text-gray-900">Peru In Travel no vende ni comercializa la información personal de sus clientes.</strong>
                </p>
                <p className="leading-relaxed">
                  Los datos podrán compartirse únicamente con proveedores relacionados con la prestación del servicio turístico, 
                  como hoteles, operadores turísticos o empresas de transporte, cuando sea estrictamente necesario para la 
                  ejecución de la reserva.
                </p>
              </div>
            </div>

            {/* 5. Cookies */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-teal rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                  5
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  Cookies
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Nuestro sitio puede utilizar cookies para mejorar la experiencia del usuario, analizar estadísticas de 
                navegación y optimizar nuestros servicios.
              </p>
            </div>

            {/* 6. Derechos del usuario */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-teal rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                  6
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  Derechos del usuario
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                El usuario podrá solicitar en cualquier momento el acceso, actualización, rectificación o eliminación de 
                sus datos personales conforme a la legislación peruana.
              </p>
            </div>

            {/* 7. Modificaciones */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-teal rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                  7
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  Modificaciones
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Peru In Travel podrá actualizar esta Política de Privacidad cuando sea necesario. Los cambios serán 
                publicados en esta misma página.
              </p>
            </div>

            {/* 8. Contacto */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-teal rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                  8
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  Contacto
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Si tiene consultas sobre esta Política de Privacidad puede comunicarse con nosotros mediante nuestros 
                canales oficiales publicados en este sitio web.
              </p>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Información de contacto</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📍 <strong>Dirección:</strong> Jr. Los Nogales 345, Los Ficus, Santa Anita, Lima</p>
                  <p>📞 <strong>Teléfono:</strong> +51 929 648 380</p>
                  <p>✉️ <strong>Email:</strong> peruintravel.pe@gmail.com</p>
                  <p>🕐 <strong>Horario:</strong> Lun–Sáb: 9 am – 7 pm</p>
                </div>
              </div>
            </div>

          </div>

          {/* Nota final */}
          <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-xl p-6 mt-8">
            <div className="flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Nota importante</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Al utilizar nuestros servicios, usted acepta los términos descritos en esta Política de Privacidad. 
                  Le recomendamos revisar esta página periódicamente para estar informado sobre cualquier actualización.
                </p>
              </div>
            </div>
          </div>

          {/* Botón volver */}
          <div className="text-center mt-12">
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-brand-teal hover:bg-brand-teal-d text-white font-bold px-8 py-4 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppChat />
    </div>
  )
}

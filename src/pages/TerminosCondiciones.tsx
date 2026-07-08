import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppChat from '../components/WhatsAppChat'

const sections = [
  {
    num: 1,
    title: 'Uso del sitio web',
    items: [
      'El contenido del sitio tiene fines informativos y comerciales relacionados con los servicios turísticos ofrecidos por Peru In Travel.',
      'El usuario se compromete a utilizar el sitio de manera responsable y conforme a la legislación vigente.',
    ],
  },
  {
    num: 2,
    title: 'Reservas',
    items: [
      'Las solicitudes realizadas mediante el sitio web no constituyen una reserva confirmada hasta que Peru In Travel confirme la disponibilidad y envíe la correspondiente confirmación al cliente.',
    ],
  },
  {
    num: 3,
    title: 'Precios',
    items: [
      'Los precios publicados pueden modificarse sin previo aviso debido a variaciones en tarifas de proveedores, impuestos o disponibilidad.',
    ],
  },
  {
    num: 4,
    title: 'Cancelaciones y modificaciones',
    items: [
      'Las políticas de cancelación y reprogramación dependerán del servicio contratado y serán informadas al cliente antes de confirmar la reserva.',
    ],
  },
  {
    num: 5,
    title: 'Responsabilidad',
    items: [
      'Peru In Travel actúa como intermediario entre el cliente y los proveedores de servicios turísticos cuando corresponda.',
      'No será responsable por retrasos, cancelaciones, fenómenos naturales, restricciones gubernamentales u otros eventos fuera de su control.',
    ],
  },
  {
    num: 6,
    title: 'Propiedad intelectual',
    items: [
      'Todo el contenido del sitio web, incluyendo textos, fotografías, logotipos, diseños y elementos gráficos, pertenece a Peru In Travel o cuenta con las autorizaciones correspondientes.',
      'Queda prohibida su reproducción sin autorización previa.',
    ],
  },
  {
    num: 7,
    title: 'Enlaces externos',
    items: [
      'El sitio puede contener enlaces hacia páginas de terceros. Peru In Travel no se responsabiliza por el contenido o políticas de dichos sitios.',
    ],
  },
  {
    num: 8,
    title: 'Modificaciones',
    items: [
      'Peru In Travel podrá modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el sitio web.',
    ],
  },
  {
    num: 9,
    title: 'Legislación aplicable',
    items: [
      'Los presentes Términos y Condiciones se rigen por las leyes de la República del Perú. Cualquier controversia será resuelta por las autoridades competentes del país.',
    ],
  },
]

export default function TerminosCondiciones() {
  return (
    <div className="font-sans text-gray-800">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-brand-dark to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-white/70 text-lg">
            Última actualización: Julio de 2026
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">

          {/* Introducción */}
          <div className="bg-gray-50 border-l-4 border-gray-700 rounded-r-xl p-6 mb-10">
            <p className="text-gray-700 leading-relaxed m-0">
              Bienvenido al sitio web de <strong>Peru In Travel</strong>. Al acceder y utilizar este sitio, 
              el usuario acepta los presentes Términos y Condiciones.
            </p>
          </div>

          {/* Secciones */}
          <div className="space-y-8">
            {sections.map((s) => (
              <div key={s.num} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {s.num}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{s.title}</h2>
                </div>
                <ul className="space-y-3">
                  {s.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
                      <span className="text-brand-teal font-bold mt-0.5 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Nota de aceptación */}
          <div className="bg-brand-teal/10 border border-brand-teal/30 rounded-xl p-6 mt-12">
            <div className="flex gap-3">
              <span className="text-2xl shrink-0">⚠️</span>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Aceptación de términos</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Al reservar o contratar cualquier servicio con <strong>Peru In Travel</strong>, el cliente acepta 
                  expresamente haber leído, entendido y aceptado estos Términos y Condiciones en su totalidad.
                </p>
              </div>
            </div>
          </div>

          {/* Enlace a Política de privacidad */}
          <div className="mt-6 text-center text-sm text-gray-500">
            También puedes revisar nuestra{' '}
            <a href="/politica-de-privacidad" className="text-brand-teal font-semibold hover:underline">
              Política de Privacidad
            </a>
          </div>

          {/* Botón volver */}
          <div className="text-center mt-10">
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-brand-dark hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-full transition-colors"
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

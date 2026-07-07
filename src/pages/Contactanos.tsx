import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// Reemplaza este ID con el tuyo de formspree.io (es gratis)
const FORMSPREE_ID = 'xykqjvne'

export default function Contactanos() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        setStatus('success')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-brand-teal to-brand-teal-d overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Contáctanos</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Estamos aquí para ayudarte a planificar tu próxima aventura en Perú
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-brand-teal font-semibold text-sm uppercase tracking-widest">Escríbenos</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-2 text-gray-900">
              Planifica tu <span className="text-brand-teal">viaje</span>
            </h2>
            <p className="text-gray-500 mt-4">
              Cuéntanos qué tienes en mente y te enviamos una cotización personalizada sin costo.
            </p>
          </div>

          {/* Success message */}
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-8">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-green-800 mb-1">¡Mensaje enviado!</h3>
              <p className="text-green-700">Te responderemos en menos de 24 horas. ¡Gracias por contactarnos!</p>
            </div>
          )}

          {/* Error message */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center mb-8">
              <p className="text-red-700 font-medium">Hubo un error al enviar. Por favor intenta de nuevo o contáctanos por WhatsApp.</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Nombre completo</label>
                <input
                  id="name" name="name" type="text" placeholder="Tu nombre" required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Correo electrónico</label>
                <input
                  id="email" name="email" type="email" placeholder="tu@email.com" required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">Teléfono / WhatsApp</label>
              <input
                id="phone" name="phone" type="tel" placeholder="+51 999 999 999"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="destination">Destino de interés</label>
              <select
                id="destination" name="destination"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent bg-white"
              >
                <option value="">Selecciona un destino</option>
                <option>Huancaya Full Day</option>
                <option>Laguna Llaguapucro</option>
                <option>Huancaya y Laraos 2D/1N</option>
                <option>Paracas + Huacachina Full Day</option>
                <option>Paracas + Huacachina 2D/1N</option>
                <option>Lunahuaná</option>
                <option>Churín – Baños Termales</option>
                <option>Nevado Raura + Churín</option>
                <option>Lomas de Lachay</option>
                <option>Cañón de Autisha</option>
                <option>Selva Central: Oxapampa, Pozuzo y Villa Rica</option>
                <option>Ayacucho – Semana Santa</option>
                <option>Escalera al Cielo – San Mateo de Otao</option>
                <option>Playa La Mina + Yakupark Adventure</option>
                <option>Nevado Rajuntay</option>
                <option>Tour personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">Mensaje</label>
              <textarea
                id="message" name="message" rows={5}
                placeholder="Cuéntanos sobre tu viaje ideal: fechas, número de personas, preferencias especiales..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-brand-gradient text-white font-bold py-4 rounded-xl transition-opacity hover:opacity-90 text-base shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'sending' ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Enviando...
                </>
              ) : 'Enviar solicitud'}
            </button>
          </form>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Otras formas de <span className="text-brand-teal">contactarnos</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-4">Respuesta inmediata</p>
              <a href="https://wa.me/51929648380" target="_blank" rel="noopener noreferrer" className="text-brand-teal font-semibold hover:underline">
                +51 929 648 380
              </a>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-4">Respuesta en 24 horas</p>
              <a href="mailto:Peruintravel.pe@gmail.com" className="text-brand-teal font-semibold hover:underline">
                Peruintravel.pe@gmail.com
              </a>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Teléfono</h3>
              <p className="text-gray-600 mb-4">Lun–Sáb: 9am – 7pm</p>
              <a href="tel:+51929648380" className="text-brand-teal font-semibold hover:underline">
                +51 929 648 380
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

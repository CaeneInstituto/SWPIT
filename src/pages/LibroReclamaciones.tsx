import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// Formspree para recibir las reclamaciones (mismo ID que contacto)
const FORMSPREE_ID = 'xykqjvne'

export default function LibroReclamaciones() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    const data = new FormData(form)
    
    // Agregar etiqueta para identificar que es del libro de reclamaciones
    data.append('_subject', '📋 LIBRO DE RECLAMACIONES - Peru In Travel')

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

      <div className="max-w-5xl mx-auto px-4 py-20">
        
        {/* Header oficial INDECOPI con imagen */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-2xl overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6 p-8">
            <div className="flex-shrink-0">
              <img 
                src="/Libroreclamacion.jfif" 
                alt="Libro de Reclamaciones" 
                className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-lg bg-white/10 p-2"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Libro de Reclamaciones</h1>
              <p className="text-red-100 text-sm md:text-base">
                Conforme a la Ley N° 29571 - Código de Protección y Defensa del Consumidor
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-8 md:p-12">
          
          {/* Información de la empresa */}
          <div className="bg-gray-50 border-l-4 border-brand-teal p-6 rounded-r-xl mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Datos de la Empresa</h2>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <p><strong>Razón Social:</strong> Peru In Travel</p>
              <p><strong>RUC:</strong> 20606474467</p>
              <p><strong>Dirección:</strong> Lima, Perú</p>
              <p><strong>Teléfono:</strong> +51 929 648 380</p>
              <p><strong>Email:</strong> peruintravel.pe@gmail.com</p>
              <p><strong>Web:</strong> www.peruintravel.pe</p>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-yellow-900 mb-2">⚠️ Antes de presentar tu reclamo o queja:</h3>
            <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
              <li><strong>Reclamo:</strong> Disconformidad relacionada con los servicios prestados o productos adquiridos.</li>
              <li><strong>Queja:</strong> Disconformidad no relacionada directamente al servicio, sino a la atención al cliente.</li>
              <li>Todos los campos marcados con (*) son obligatorios.</li>
              <li>Recibirás una copia de tu reclamo al correo proporcionado.</li>
              <li>La empresa responderá en un plazo no mayor a 15 días hábiles.</li>
            </ul>
          </div>

          {status === 'success' ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Reclamo registrado exitosamente!</h3>
              <p className="text-gray-600 mb-4">
                Hemos recibido tu reclamo. Recibirás una respuesta en un plazo máximo de 15 días hábiles.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="bg-brand-teal hover:bg-brand-teal-d text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Enviar otro reclamo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Tipo de documento */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tipo de Solicitud *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tipo" value="Reclamo" required className="w-4 h-4 text-brand-teal" />
                    <span className="text-gray-700">Reclamo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tipo" value="Queja" required className="w-4 h-4 text-brand-teal" />
                    <span className="text-gray-700">Queja</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Datos del Consumidor</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombres y Apellidos *</label>
                    <input
                      type="text"
                      name="nombre_completo"
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Documento de Identidad *</label>
                    <input
                      type="text"
                      name="documento"
                      placeholder="DNI / CE"
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono *</label>
                    <input
                      type="tel"
                      name="telefono"
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Detalle del Reclamo o Queja</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Servicio Contratado *</label>
                    <input
                      type="text"
                      name="servicio"
                      placeholder="Ej: Tour Huancaya Full Day"
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Monto Reclamado (S/)</label>
                    <input
                      type="number"
                      name="monto"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción del Reclamo o Queja *</label>
                    <textarea
                      name="descripcion"
                      rows={5}
                      required
                      placeholder="Describe de manera clara y detallada tu reclamo o queja..."
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pedido del Consumidor *</label>
                    <textarea
                      name="pedido"
                      rows={3}
                      required
                      placeholder="Indica qué solicitas que se haga para resolver tu reclamo..."
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">📌 Importante:</p>
                <p>
                  La formulación del reclamo no impide acudir a otras vías de solución de controversias 
                  ni es requisito previo para interponer una denuncia ante el INDECOPI. 
                  El proveedor deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días hábiles.
                </p>
              </div>

              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
                  ❌ Error al enviar el reclamo. Por favor, intenta nuevamente o contáctanos directamente.
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-colors text-lg"
              >
                {status === 'sending' ? 'Enviando...' : 'Enviar Reclamo'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Al enviar este formulario, aceptas que tus datos serán procesados conforme a nuestra{' '}
                <a href="/politica-privacidad" className="text-brand-teal hover:underline">Política de Privacidad</a>.
              </p>
            </form>
          )}

        </div>

        {/* Información INDECOPI */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">🛡️ Protección al Consumidor - INDECOPI</h3>
          <p className="text-sm text-blue-800 mb-3">
            Si consideras que tu reclamo no ha sido atendido satisfactoriamente, puedes acudir al INDECOPI:
          </p>
          <div className="text-sm text-blue-800 space-y-1">
            <p>📞 <strong>Teléfono:</strong> 224-7777 (Lima) / 0800-4-4040 (Provincias - Gratuito)</p>
            <p>🌐 <strong>Web:</strong> <a href="https://www.indecopi.gob.pe" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">www.indecopi.gob.pe</a></p>
            <p>📧 <strong>Email:</strong> sacreclamo@indecopi.gob.pe</p>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}

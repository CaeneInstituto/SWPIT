import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PoliticasDevolucion() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
            Políticas de Cambio y Devolución
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Última actualización: Agosto de 2026
          </p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Cancelaciones</h2>
              <p className="mb-3">
                En <strong>Peru In Travel</strong> entendemos que pueden surgir imprevistos. 
                Por ello, establecemos las siguientes condiciones para cancelaciones:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Cancelación con más de 15 días de anticipación:</strong> Se realizará 
                  la devolución del 100% del monto pagado como reserva.
                </li>
                <li>
                  <strong>Cancelación entre 7 y 14 días antes del tour:</strong> Se devolverá 
                  el 50% del monto de reserva pagado.
                </li>
                <li>
                  <strong>Cancelación con menos de 7 días de anticipación:</strong> No procede 
                  devolución del monto de reserva.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Cambios de Fecha</h2>
              <p className="mb-3">
                El cliente podrá solicitar cambio de fecha de su tour bajo las siguientes condiciones:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Los cambios de fecha deben solicitarse con al menos <strong>48 horas de anticipación</strong>.
                </li>
                <li>
                  El cambio está sujeto a disponibilidad de cupos en la nueva fecha solicitada.
                </li>
                <li>
                  Se permite <strong>un cambio de fecha sin costo adicional</strong>. Cambios posteriores 
                  tendrán un cargo administrativo de S/ 20.00.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Reembolsos</h2>
              <p className="mb-3">
                Los reembolsos procedentes serán procesados de la siguiente manera:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Pago con tarjeta (Culqi):</strong> El reembolso se efectuará a la misma 
                  tarjeta utilizada en un plazo de 5 a 10 días hábiles.
                </li>
                <li>
                  <strong>Pago con Yape/Plin:</strong> El reembolso se realizará por transferencia 
                  bancaria en un plazo de 2 a 5 días hábiles.
                </li>
                <li>
                  <strong>Pago por transferencia bancaria:</strong> El reembolso se efectuará mediante 
                  depósito o transferencia en un plazo de 2 a 5 días hábiles.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cancelación por Parte de Peru In Travel</h2>
              <p className="mb-3">
                En caso de que <strong>Peru In Travel</strong> deba cancelar un tour por razones operativas, 
                climáticas, de fuerza mayor o por no alcanzar el mínimo de participantes, se aplicará lo siguiente:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Se ofrecerá al cliente la opción de <strong>reprogramar</strong> el tour para otra fecha 
                  sin costo adicional.
                </li>
                <li>
                  Si el cliente no desea reprogramar, se realizará la <strong>devolución del 100%</strong> del 
                  monto pagado.
                </li>
                <li>
                  La empresa se compromete a notificar al cliente con la mayor anticipación posible.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Condiciones Especiales</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Los servicios contratados que no sean utilizados por decisión del cliente no serán reembolsables.
                </li>
                <li>
                  En caso de emergencias médicas debidamente acreditadas, se evaluará el reembolso de manera particular.
                </li>
                <li>
                  No se realizarán devoluciones parciales por servicios no utilizados durante el desarrollo del tour.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Proceso para Solicitar Cambios o Devoluciones</h2>
              <p className="mb-3">
                Para solicitar un cambio de fecha, cancelación o reembolso, el cliente debe:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  Comunicarse con <strong>Peru In Travel</strong> a través de:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>WhatsApp: <a href="https://wa.me/51929648380" className="text-brand-teal font-semibold hover:underline">+51 929 648 380</a></li>
                    <li>Correo: <a href="mailto:peruintravel.pe@gmail.com" className="text-brand-teal font-semibold hover:underline">peruintravel.pe@gmail.com</a></li>
                  </ul>
                </li>
                <li>Proporcionar el código de reserva y los datos del titular.</li>
                <li>Indicar claramente el motivo de la solicitud.</li>
                <li>
                  En caso de reembolso, proporcionar los datos bancarios completos (titular, banco, número de cuenta).
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Excepciones</h2>
              <p>
                Estas políticas no aplican en situaciones de <strong>fuerza mayor</strong> como desastres naturales, 
                restricciones gubernamentales, pandemias u otros eventos fuera del control de ambas partes. 
                En estos casos, se evaluará cada situación de manera individual buscando el mejor acuerdo para ambas partes.
              </p>
            </section>

            <section className="bg-brand-teal/5 border-l-4 border-brand-teal p-6 rounded-r-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Información de Contacto</h2>
              <p className="mb-2">
                <strong>Peru In Travel</strong>
              </p>
              <p className="mb-1">
                📞 WhatsApp: <a href="https://wa.me/51929648380" className="text-brand-teal font-semibold hover:underline">+51 929 648 380</a>
              </p>
              <p className="mb-1">
                📧 Email: <a href="mailto:peruintravel.pe@gmail.com" className="text-brand-teal font-semibold hover:underline">peruintravel.pe@gmail.com</a>
              </p>
              <p>
                🌐 Web: <a href="/" className="text-brand-teal font-semibold hover:underline">www.peruintravel.pe</a>
              </p>
            </section>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

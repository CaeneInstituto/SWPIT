export default function Footer() {
  return (
    <>
      <footer className="bg-brand-dark text-white/60 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="mb-3">
                <img
                  src="/logo.png"
                  alt="Peru In Travel"
                  className="h-20 w-48 object-contain object-left brightness-0 invert"
                />
              </div>
              <p className="text-sm leading-relaxed max-w-xs text-white/50">
                Tu agencia de confianza para explorar el Perú. Experiencias auténticas, guías expertos y recuerdos para toda la vida.
              </p>
              <div className="flex gap-3 mt-5">
                {['F', 'I', 'T', 'Y'].map((s, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label={['Facebook', 'Instagram', 'Twitter', 'YouTube'][i]}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-teal flex items-center justify-center transition-colors"
                  >
                    <span className="text-xs font-bold text-white">{s}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Destinos</h4>
              <ul className="space-y-2 text-sm">
                {['Lomas de Lachay', 'Lunahuaná', 'Huancaya', 'Paracas + Huacachina', 'Nevado Rajuntay'].map((d) => (
                  <li key={d}>
                    <a href="#destinos" className="hover:text-brand-teal-l transition-colors">{d}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li>📍 Jr. Los Nogales 345, Los Ficus, Santa Anita</li>
                <li>📞 +51 929 648 380</li>
                <li>✉️ Peruintravel.pe@gmail.com</li>
                <li>🕐 Lun–Sáb: 9 am – 7 pm</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
            <p>© {new Date().getFullYear()} Peru In Travel. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Política de privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos y condiciones</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

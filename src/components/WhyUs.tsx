const features = [
  { icon: '🏆', title: 'Experiencia comprobada',   desc: 'Más de 15 años llevando viajeros a los rincones más increíbles del Perú con total seguridad.' },
  { icon: '🗺️', title: 'Guías certificados',        desc: 'Nuestros guías son locales certificados que conocen cada historia, ruta y secreto del destino.' },
  { icon: '💼', title: 'Todo incluido',             desc: 'Transporte, alojamiento, alimentación y actividades. Tú solo preocúpate de disfrutar.' },
  { icon: '📞', title: 'Soporte 24/7',              desc: 'Estamos disponibles en todo momento durante tu viaje para cualquier consulta o emergencia.' },
  { icon: '💰', title: 'Mejor precio garantizado',  desc: 'Encontramos el mismo paquete más barato y te devolvemos la diferencia. Sin preguntas.' },
  { icon: '🌿', title: 'Turismo responsable',       desc: 'Comprometidos con el medio ambiente y las comunidades locales en cada uno de nuestros tours.' },
]

export default function WhyUs() {
  return (
    <section id="por-qué-nosotros" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-brand-teal font-semibold text-sm uppercase tracking-widest">Nuestra diferencia</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-2 text-gray-900">
            ¿Por qué elegir{' '}
            <span className="text-brand-teal">Peru In Travel?</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-gray-100 hover:border-brand-teal-l hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-teal transition-colors">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 rounded-3xl bg-brand-gradient text-white p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold">¿Listo para tu próxima aventura?</h3>
            <p className="text-white/75 mt-2">Contáctanos y diseñamos el viaje perfecto para ti.</p>
          </div>
          <a
            href="/contactanos"
            className="shrink-0 bg-brand-yellow hover:bg-brand-yellow-d text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg"
          >
            Cotizar gratis
          </a>
        </div>
      </div>
    </section>
  )
}

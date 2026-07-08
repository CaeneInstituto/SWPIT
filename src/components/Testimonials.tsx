const testimonials = [
  {
    name: 'María Fernández',
    location: 'Lima',
    avatar: 'https://i.pravatar.cc/80?img=47',
    text: 'La atención fue excelente desde el primer momento. Organizaron todo nuestro viaje de manera profesional y disfrutamos de una experiencia inolvidable. Totalmente recomendados.',
    stars: 5,
  },
  {
    name: 'José Rodríguez',
    location: 'Arequipa',
    avatar: 'https://i.pravatar.cc/80?img=12',
    text: 'Muy satisfecho con el servicio. El equipo siempre estuvo pendiente de nosotros y cumplió con todo lo prometido. Sin duda volvería a viajar con Peru In Travel.',
    stars: 5,
  },
  {
    name: 'Carmen Huamán',
    location: 'Cusco',
    avatar: 'https://i.pravatar.cc/80?img=32',
    text: 'Excelente organización y atención personalizada. Todo el itinerario estuvo muy bien coordinado y nos sentimos seguros durante todo el viaje.',
    stars: 5,
  },
  {
    name: 'Luis Mendoza',
    location: 'Trujillo',
    avatar: 'https://i.pravatar.cc/80?img=68',
    text: 'Una empresa muy seria y responsable. Los tours fueron puntuales, los guías muy amables y la experiencia superó nuestras expectativas.',
    stars: 5,
  },
  {
    name: 'Andrea Salazar',
    location: 'Chiclayo',
    avatar: 'https://i.pravatar.cc/80?img=25',
    text: 'Fue una experiencia maravillosa. La comunicación fue rápida, el servicio de calidad y cada detalle estuvo perfectamente organizado. Los recomiendo al 100%.',
    stars: 5,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section id="testimonios" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-brand-teal font-semibold text-sm uppercase tracking-widest">Lo que dicen</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-2 text-gray-900">
            Viajeros <span className="text-brand-teal">satisfechos</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Miles de peruanos han confiado en nosotros para descubrir su propio país. Aquí algunas de sus historias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
              <Stars count={t.stars} />
              <p className="text-gray-600 mt-4 text-sm leading-relaxed italic flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 mt-5">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-teal-l" />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">📍 {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

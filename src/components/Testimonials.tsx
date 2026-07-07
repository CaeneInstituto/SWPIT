const testimonials = [
  {
    name: 'María González', country: '🇪🇸 España',
    avatar: 'https://i.pravatar.cc/80?img=47',
    text: 'El viaje a Machu Picchu fue absolutamente mágico. El guía conocía cada detalle histórico y los hoteles eran increíbles. Definitivamente repetiré.',
    stars: 5,
  },
  {
    name: 'James Carter', country: '🇺🇸 Estados Unidos',
    avatar: 'https://i.pravatar.cc/80?img=12',
    text: 'Best travel agency I have ever used. The Amazon tour was life-changing. Everything was perfectly organized from start to finish.',
    stars: 5,
  },
  {
    name: 'Camille Dupont', country: '🇫🇷 Francia',
    avatar: 'https://i.pravatar.cc/80?img=32',
    text: 'Le Lac Titicaca était époustouflant. L\'équipe de Peru In Travel a rendu ce voyage inoubliable. Je recommande vivement!',
    stars: 5,
  },
  {
    name: 'Lucas Oliveira', country: '🇧🇷 Brasil',
    avatar: 'https://i.pravatar.cc/80?img=68',
    text: 'Viagem incrível ao Cañón del Colca. Organização impecável, guias excelentes e preços justos. Voltarei com certeza!',
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
            Miles de viajeros de todo el mundo han confiado en nosotros. Aquí algunas de sus historias.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <Stars count={t.stars} />
              <p className="text-gray-600 mt-4 text-sm leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-3 mt-5">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-teal-l" />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.country}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

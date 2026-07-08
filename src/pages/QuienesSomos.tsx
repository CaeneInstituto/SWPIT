import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppChat from '../components/WhatsAppChat'

const features = [
  { icon: '🏆', title: 'Experiencia comprobada',       desc: 'Registrados en Mincetur desde 2022, con cientos de viajeros satisfechos que nos respaldan.' },
  { icon: '🗺️', title: 'Guías capacitados',             desc: 'Nuestros guías conocen cada ruta, historia y secreto de los destinos que visitamos.' },
  { icon: '📦', title: 'Paquetes completos',            desc: 'Full day, 2D1N y más. Transporte, guía y tours incluidos. Tú solo preocúpate de disfrutar.' },
  { icon: '📞', title: 'Asistencia antes y durante',   desc: 'Te acompañamos desde la reserva hasta el regreso. Siempre disponibles para cualquier consulta.' },
  { icon: '🌎', title: 'Costa, sierra y selva',        desc: 'Paracas, Huancaya, Selva Central, nevados y más. Cubrimos todo el Perú.' },
  { icon: '🌿', title: 'Turismo seguro y responsable', desc: 'Promovemos el respeto por el medio ambiente y las comunidades locales en cada tour.' },
]

const stats = [
  { value: '2022', label: 'Registro Mincetur' },
  { value: '5K+',  label: 'Viajeros felices'  },
  { value: '15+',  label: 'Destinos'          },
  { value: '100%', label: 'Formal y registrada' },
]

const services = [
  { icon: '🗓️', title: 'Paquetes turísticos',         desc: 'Full day, 2D1N y más, dentro de Lima y otras regiones del Perú.' },
  { icon: '🧭', title: 'Guías turísticos',             desc: 'Profesionales capacitados que hacen de cada recorrido una experiencia única.' },
  { icon: '✨', title: 'Experiencias personalizadas',  desc: 'Adaptamos los tours a tus necesidades, fechas y grupo.' },
  { icon: '🤝', title: 'Asistencia integral',          desc: 'Te acompañamos antes, durante y después de tu viaje.' },
]

const team = [
  {
    name: 'David Rivas M.',
    role: 'Fundador & Director',
    emoji: '👨‍💼',
    desc: 'Apasionado por el turismo peruano, lidera Peru In Travel con el objetivo de mostrar lo mejor del Perú a cada viajero.',
  },
  {
    name: 'Jhon Rivas M.',
    role: 'Coordinador de Operaciones',
    emoji: '🧭',
    desc: 'Garantiza que cada tour se ejecute con puntualidad, seguridad y la mejor experiencia para todos los participantes.',
  },
  {
    name: 'Equipo de Guías',
    role: 'Guías capacitados',
    emoji: '🎒',
    desc: 'Profesionales con amplio conocimiento de cada destino: historia, flora, fauna, cultura y rutas.',
  },
]

export default function QuienesSomos() {
  return (
    <div className="font-sans text-gray-800">
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative pt-32 pb-20 flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/75 via-brand-teal-d/60 to-brand-dark/85" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="inline-block bg-brand-yellow text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-5 shadow">
            Agencia registrada en Mincetur desde 2022 · RUC 20606474467
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-5 drop-shadow-lg">
            Quiénes <span className="text-brand-yellow">Somos</span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto">
            Somos <strong>Peru In Travel</strong>, una agencia de viajes y operador de turismo ubicada en <strong>Jr. Los Nogales 345, Los Ficus, Santa Anita, Lima</strong>, comprometida con brindarte experiencias auténticas e inolvidables en el Perú.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-brand-gradient py-12">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-extrabold">{s.value}</div>
              <div className="text-white/75 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quiénes somos ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-brand-teal font-semibold text-sm uppercase tracking-widest">Nuestra empresa</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-5 text-gray-900">
              Una agencia <span className="text-brand-teal">formal y de confianza</span>
            </h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <p>
                <strong>Peru In Travel</strong> es una agencia de viajes ubicada en <strong>Jr. Los Nogales 345, Los Ficus, Santa Anita, Lima</strong>, especializada en paquetes turísticos y tours dentro del Perú. Ofrecemos destinos en la costa, sierra y selva: Paracas, Huacachina, Lunahuaná, Huancaya, Selva Central y muchos más.
              </p>
              <p>
                Operamos bajo la razón social <strong>Lovi Group Perú E.I.R.L.</strong> y estamos formalmente registrados en <strong>Mincetur desde 2022</strong>, lo que garantiza que cada servicio que ofrecemos cumple con los estándares oficiales de calidad y seguridad turística del Perú.
              </p>
              <p>
                Nuestro enfoque está en las <strong>experiencias personalizadas</strong>: adaptamos cada tour a tu grupo, fechas y preferencias, con guías capacitados y asistencia completa antes, durante y después del viaje.
              </p>
            </div>

            {/* Badges legales */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-brand-teal/10 text-brand-teal text-xs font-bold px-4 py-2 rounded-full">
                📌 Jr. Los Nogales 345, Los Ficus, Santa Anita
              </div>
              <div className="flex items-center gap-2 bg-brand-teal/10 text-brand-teal text-xs font-bold px-4 py-2 rounded-full">
                🧾 RUC: 20606474467
              </div>
              <div className="flex items-center gap-2 bg-brand-teal/10 text-brand-teal text-xs font-bold px-4 py-2 rounded-full">
                🏢 Lovi Group Perú E.I.R.L.
              </div>
              <div className="flex items-center gap-2 bg-brand-yellow/15 text-brand-yellow-d text-xs font-bold px-4 py-2 rounded-full">
                ✅ Mincetur desde 2022
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80"
              alt="Paisaje peruano"
              className="rounded-3xl shadow-xl w-full object-cover h-80 md:h-96"
            />
            <div className="absolute -bottom-5 -left-5 bg-brand-yellow text-white rounded-2xl px-5 py-4 shadow-lg">
              <div className="text-3xl font-extrabold">5K+</div>
              <div className="text-xs font-semibold text-white/90">Viajeros felices</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Servicios ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-brand-teal font-semibold text-sm uppercase tracking-widest">Lo que hacemos</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 text-gray-900">
              Nuestros <span className="text-brand-teal">servicios</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{s.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Misión, Visión y Valores ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {/* Título de sección */}
          <div className="text-center mb-14">
            <span className="text-brand-teal font-semibold text-sm uppercase tracking-widest">Nuestra identidad</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-2 text-gray-900">
              Misión, Visión y <span className="text-brand-teal">Objetivos</span>
            </h2>
          </div>

          {/* Misión y Visión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Misión */}
            <div className="bg-gradient-to-br from-brand-teal/5 to-brand-teal/10 rounded-3xl p-8 border-2 border-brand-teal/20 hover:border-brand-teal/40 transition-all">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 bg-brand-teal rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  🎯
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900">Misión</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Brindar servicios turísticos de calidad, creando experiencias personalizadas que integren cultura, aventura y hospitalidad. En <strong>PERU IN TRAVEL</strong> nos comprometemos a promover el turismo responsable, la innovación en nuestras rutas y el crecimiento conjunto con nuestras comunidades aliadas.
              </p>
            </div>

            {/* Visión */}
            <div className="bg-gradient-to-br from-brand-yellow/5 to-brand-yellow/10 rounded-3xl p-8 border-2 border-brand-yellow/30 hover:border-brand-yellow/50 transition-all">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 bg-brand-yellow rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  🌟
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900">Visión</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Ser la agencia que conecta a cada viajero y turista con la esencia del Perú, creando recuerdos que trascienden y experiencias que inspiran a descubrir, amar y cuidar la riqueza cultural y natural de nuestro país.
              </p>
            </div>
          </div>

          {/* Objetivos */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-brand-dark rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                📊
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">Objetivos</h3>
            </div>

            {/* Objetivos Generales */}
            <div className="mb-10">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-brand-teal text-white rounded-lg flex items-center justify-center text-sm font-bold">G</span>
                Objetivos Generales
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200 hover:border-brand-teal/40 transition-colors">
                  <span className="text-brand-teal font-bold text-lg shrink-0">1.</span>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Consolidarse como una agencia de viajes confiable a nivel nacional, ofreciendo experiencias auténticas y personalizadas.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200 hover:border-brand-teal/40 transition-colors">
                  <span className="text-brand-teal font-bold text-lg shrink-0">2.</span>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Incrementar la satisfacción del cliente mediante un servicio cercano, eficiente y de calidad.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200 hover:border-brand-teal/40 transition-colors">
                  <span className="text-brand-teal font-bold text-lg shrink-0">3.</span>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Promover el turismo interno responsable, resaltando la cultura y naturaleza del Perú.
                  </p>
                </div>
              </div>
            </div>

            {/* Objetivos Específicos */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-brand-yellow text-white rounded-lg flex items-center justify-center text-sm font-bold">E</span>
                Objetivos Específicos
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Objetivo 1 */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-brand-yellow/50 transition-all hover:shadow-md">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="w-7 h-7 bg-brand-yellow/20 text-brand-yellow-d rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </span>
                    <h5 className="font-bold text-gray-900 text-sm">Crecimiento comercial</h5>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed ml-10">
                    Aumentar las ventas en un 20% anual mediante la ampliación de rutas y paquetes turísticos.
                  </p>
                </div>

                {/* Objetivo 2 */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-brand-yellow/50 transition-all hover:shadow-md">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="w-7 h-7 bg-brand-yellow/20 text-brand-yellow-d rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </span>
                    <h5 className="font-bold text-gray-900 text-sm">Experiencia del cliente</h5>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed ml-10">
                    Lograr un nivel de satisfacción superior al 90%, a través de atención personalizada y seguimiento post-viaje.
                  </p>
                </div>

                {/* Objetivo 3 */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-brand-yellow/50 transition-all hover:shadow-md">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="w-7 h-7 bg-brand-yellow/20 text-brand-yellow-d rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                      3
                    </span>
                    <h5 className="font-bold text-gray-900 text-sm">Expansión de destinos</h5>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed ml-10">
                    Incorporar al menos 2 nuevos destinos o rutas cada año.
                  </p>
                </div>

                {/* Objetivo 4 */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-brand-yellow/50 transition-all hover:shadow-md">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="w-7 h-7 bg-brand-yellow/20 text-brand-yellow-d rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                      4
                    </span>
                    <h5 className="font-bold text-gray-900 text-sm">Presencia digital</h5>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed ml-10">
                    Fortalecer redes sociales y canales digitales, aumentando la comunidad en un 30% anual.
                  </p>
                </div>

                {/* Objetivo 5 */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-brand-yellow/50 transition-all hover:shadow-md">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="w-7 h-7 bg-brand-yellow/20 text-brand-yellow-d rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                      5
                    </span>
                    <h5 className="font-bold text-gray-900 text-sm">Accesibilidad</h5>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed ml-10">
                    Diseñar paquetes turísticos con precios competitivos, manteniendo una excelente relación calidad-precio.
                  </p>
                </div>

                {/* Objetivo 6 */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-brand-yellow/50 transition-all hover:shadow-md">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="w-7 h-7 bg-brand-yellow/20 text-brand-yellow-d rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                      6
                    </span>
                    <h5 className="font-bold text-gray-900 text-sm">Alianzas estratégicas</h5>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed ml-10">
                    Establecer convenios con proveedores (hoteles, guías, transporte) para mejorar la experiencia del viajero.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Por qué elegirnos ── */}
      <section className="py-20 bg-gray-50">
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
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-brand-teal-l hover:shadow-lg transition-all duration-300 group"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-teal transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Equipo ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-brand-teal font-semibold text-sm uppercase tracking-widest">Las personas detrás</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-2 text-gray-900">
              Nuestro <span className="text-brand-teal">equipo</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-6xl mb-4">{member.emoji}</div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-brand-teal text-sm font-semibold mt-1 mb-3">{member.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-brand-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            ¿Listo para vivir tu próxima aventura?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Explora nuestros destinos y reserva hoy mismo. Estamos aquí para ayudarte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/#destinos"
              className="bg-white text-brand-teal font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              Ver destinos
            </Link>
            <a
              href="https://wa.me/51929648380"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contáctanos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppChat />
    </div>
  )
}

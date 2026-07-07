import { useState, useEffect, useCallback } from 'react'

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600&q=80',
    slogan: 'Recuerdos que trascienden',
    sub: 'Desde las alturas de los Andes hasta la selva amazónica, cada rincón te espera.',
  },
  {
    image: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=1600&q=80',
    slogan: 'Cascadas, lagunas y aventura',
    sub: 'Huancaya, Llaguapucro y más destinos únicos te están esperando.',
  },
  {
    image: 'https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=1600&q=80',
    slogan: 'Viaja con los mejores',
    sub: 'Agencia registrada en Mincetur. Más de 5,000 viajeros felices nos respaldan.',
  },
  {
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80',
    slogan: 'Experiencias que duran para siempre',
    sub: 'Guías expertos, transporte seguro y recuerdos que no tienen precio.',
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((index: number) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(index)
      setAnimating(false)
    }, 400)
  }, [animating])

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo])
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo])

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const slide = slides[current]

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">

      {/* Background image with fade transition */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${animating ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/70 via-brand-teal-d/50 to-brand-dark/80" />

      {/* Content */}
      <div className={`relative z-10 text-center px-4 max-w-4xl mx-auto transition-all duration-500 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <span className="inline-block bg-brand-yellow text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-6 shadow">
          Agencia de viajes oficial
        </span>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
          {slide.slogan}
        </h1>

        <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10">
          {slide.sub}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#destinos"
            className="bg-brand-gradient text-white font-bold px-8 py-4 rounded-full text-lg transition-opacity hover:opacity-90 shadow-lg"
          >
            Ver destinos
          </a>
          <a
            href="#contacto"
            className="bg-white/10 hover:bg-white/20 border border-white text-white font-bold px-8 py-4 rounded-full text-lg transition-colors backdrop-blur-sm"
          >
            Cotizar viaje
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { value: '15+', label: 'Años de experiencia' },
            { value: '5K+', label: 'Viajeros felices'    },
            { value: '50+', label: 'Destinos'            },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-brand-yellow">{s.value}</div>
              <div className="text-xs text-white/70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Siguiente"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-2.5 bg-brand-yellow'
                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20">
        <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}

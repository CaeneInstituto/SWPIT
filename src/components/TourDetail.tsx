import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import React from 'react'
import {
  MapPin, Clock, Users, Star, ChevronDown, ChevronUp,
  Calendar, Phone, User,
  Utensils, Bed, Bus, ArrowLeft, DollarSign,
  CheckCircle2, XCircle, AlertTriangle, Backpack,
  MapPinned, FileText,
} from 'lucide-react'
import { getTourById } from '../data/tours'
import type { DayItinerary, Activity, Tour } from '../data/tours'
import { formatToTime12 } from '../utils/timeFormat'
import WhatsAppChat from './WhatsAppChat'
import AddToCartButton from './AddToCartButton'

// ─── Constants ────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = '51929648380' // WhatsApp de contacto

// ─── Activity icon map ────────────────────────────────────────────────────────

const activityIconMap: Record<NonNullable<Activity['icon']>, React.ReactNode> = {
  food:      <Utensils className="w-3.5 h-3.5" />,
  sleep:     <Bed      className="w-3.5 h-3.5" />,
  transport: <Bus      className="w-3.5 h-3.5" />,
  default:   <MapPin   className="w-3.5 h-3.5" />,
}

// ─── GalleryCarousel ──────────────────────────────────────────────────────────

function GalleryCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length)
  const next = () => setCurrent((c) => (c + 1) % images.length)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Main image */}
      <div className="relative h-64 md:h-80 overflow-hidden bg-gray-100">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`Foto ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-400 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Arrows */}
        <button
          onClick={prev}
          aria-label="Anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Siguiente"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Counter badge */}
        <div className="absolute top-3 right-3 z-10 bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setCurrent(i)}
            aria-label={`Ver foto ${i + 1}`}
            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              i === current
                ? 'border-brand-teal scale-105 shadow-md'
                : 'border-transparent opacity-60 hover:opacity-90'
            }`}
          >
            <img src={src} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── AccordionDay ─────────────────────────────────────────────────────────────

function AccordionDay({ day, isOpen, onToggle }: {
  day: DayItinerary
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal text-sm font-bold shrink-0">
            {day.day}
          </span>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{day.title}</p>
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{day.summary}</p>
          </div>
        </div>
        {isOpen
          ? <ChevronUp   className="w-4 h-4 text-gray-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-4 sm:hidden">{day.summary}</p>
          <ul className="space-y-3">
            {day.activities.map((act, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-teal text-white shrink-0 mt-0.5">
                  {activityIconMap[act.icon ?? 'default']}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-brand-teal mr-2">{formatToTime12(act.time)}</span>
                  <span className="text-sm text-gray-700">{act.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── TourDetail ───────────────────────────────────────────────────────────────

export default function TourDetail() {
  const { id } = useParams<{ id: string }>()
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<'itinerary' | 'includes' | 'boarding' | 'terms'>('itinerary')
  const [openDay, setOpenDay] = useState<number | null>(0)
  const [people, setPeople] = useState('1')
  const [date, setDate] = useState('')
  const [name, setName] = useState('')

  // Cargar tour desde localStorage o datos por defecto
  React.useEffect(() => {
    console.log('========== TourDetail useEffect START ==========')
    console.log('Received ID from URL:', id)
    console.log('ID type:', typeof id)
    
    setLoading(true)
    
    if (!id) {
      console.log('❌ No ID provided to TourDetail')
      setLoading(false)
      return
    }
    
    // Buscar inmediatamente sin timeout
    let foundTour: Tour | null = null
    
    // Primero buscar en localStorage (datos modificados desde admin)
    const savedTours = localStorage.getItem('tours')
    console.log('LocalStorage "tours" key exists:', !!savedTours)
    
    if (savedTours) {
      try {
        const tourList: Tour[] = JSON.parse(savedTours)
        console.log(`Found ${tourList.length} tours in localStorage:`)
        tourList.forEach(t => {
          console.log(`  - ID: "${t.id}" | Name: "${t.name}" | Disabled: ${!!t.disabled}`)
        })
        
        foundTour = tourList.find(t => {
          const match = t.id === id && !t.disabled
          console.log(`Comparing: "${t.id}" === "${id}" && !${!!t.disabled} = ${match}`)
          return match
        }) || null
        
        if (foundTour) {
          console.log('✅ Found tour in localStorage:', foundTour.name)
        } else {
          console.log('❌ Tour not found in localStorage (either ID mismatch or disabled)')
        }
      } catch (error) {
        console.error('❌ Error parsing tours from localStorage:', error)
      }
    } else {
      console.log('No tours found in localStorage')
    }
    
    // Si no se encuentra en localStorage, buscar en datos originales
    if (!foundTour) {
      console.log('Searching in original data using getTourById...')
      foundTour = getTourById(id) || null
      if (foundTour) {
        console.log('✅ Found tour in original data:', foundTour.name)
      } else {
        console.log('❌ Tour not found in original data either')
        console.log('This ID does not exist in the tours database')
      }
    }
    
    console.log('Final result - Tour found:', !!foundTour)
    if (foundTour) {
      console.log('Will display tour:', foundTour.name)
    }
    console.log('========== TourDetail useEffect END ==========')
    
    setTour(foundTour)
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando paquete...</p>
          {id && <p className="text-xs text-gray-400 mt-2">ID: {id}</p>}
        </div>
      </div>
    )
  }

  if (!tour) {
    return <Navigate to="/" replace />
  }

  const buildWhatsAppMessage = () => {
    const lines = [
      '¡Hola! Me interesa reservar con Peru In Travel 🌿',
      `Tour: *${tour.name}*`,
      `Nombre: ${name || '(sin especificar)'}`,
      `Personas: ${people}`,
      `Fecha deseada: ${date || '(sin especificar)'}`,
      '¿Tienen disponibilidad?',
    ]
    return encodeURIComponent(lines.join('\n'))
  }

  const openWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`, '_blank')
  }

  // Build tabs dynamically based on available data
  const tabs = [
    { id: 'itinerary' as const, label: 'Itinerario' },
    { id: 'includes'  as const, label: 'Incluye / No incluye' },
    ...(tour.boardingPoints ? [{ id: 'boarding' as const, label: 'Embarque' }] : []),
    ...(tour.terms         ? [{ id: 'terms'    as const, label: 'Términos' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero banner — imagen estática */}
      <div
        className="relative h-64 md:h-80 w-full"
        style={{ backgroundImage: `url(${tour.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 to-brand-dark/80" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Volver a destinos
          </Link>
          <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
            <MapPin className="w-4 h-4 text-brand-yellow" />
            <span>{tour.location}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">{tour.name}</h1>
        </div>
      </div>

      {/* Meta bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-brand-teal" /> {tour.days}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-brand-teal" /> {tour.groupSize}
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-brand-teal" />
            <strong className="text-brand-teal">{tour.price}</strong>
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <Star className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
            <strong>{tour.rating}</strong>
            <span className="text-gray-400">({tour.reviewCount} reseñas)</span>
          </span>
        </div>
      </div>

      {/* PDF brochure bar */}
      {tour.brochure && (
        <div className="bg-red-50 border-b border-red-100">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-1h8v1H8zm0-3v-1h8v1H8zm0-3V10h5v1H8z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Información completa del paquete</span>
                <span className="text-gray-500 ml-1 hidden sm:inline">— precios, itinerario, términos y condiciones</span>
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href={tour.brochure}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver PDF
              </a>
              <a
                href={tour.brochure}
                download
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Price options */}
      {tour.priceOptions && (
        <div className="bg-brand-teal/5 border-b border-brand-teal/20">
          <div className="max-w-6xl mx-auto px-4 py-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-3">Precios por persona · Incluye transporte + tours + guiado</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {tour.priceOptions.map((opt) => (
                <div key={opt.label} className="bg-white rounded-xl border border-brand-teal/30 p-4 text-center shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">{opt.label}</p>
                  <p className="text-3xl font-extrabold text-brand-teal">{opt.price}</p>
                  {opt.note && <p className="text-xs text-gray-400 mt-1 leading-tight">{opt.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT: Tabs ── */}
          <div className="lg:col-span-2">

            {/* Tab bar */}
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 min-w-fit py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-brand-teal shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ITINERARY */}
            {activeTab === 'itinerary' && (
              <div className="space-y-3">
                {tour.departureDays && (
                  <div className="bg-brand-yellow/10 border border-brand-yellow/40 rounded-xl p-4 flex flex-wrap gap-4 items-center text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Salidas: </span>
                      {tour.departureDays.map((d) => (
                        <span key={d} className="inline-block bg-brand-yellow text-white text-xs font-bold px-2 py-0.5 rounded-full mr-1">{d}</span>
                      ))}
                    </div>
                    {tour.returnTime && (
                      <div>
                        <span className="font-semibold text-gray-700">Retorno: </span>
                        <span className="text-gray-600">{tour.returnTime}</span>
                      </div>
                    )}
                  </div>
                )}
                {tour.itinerary.map((day, i) => (
                  <AccordionDay
                    key={day.day}
                    day={day}
                    isOpen={openDay === i}
                    onToggle={() => setOpenDay(openDay === i ? null : i)}
                  />
                ))}
              </div>
            )}

            {/* INCLUDES / NOT INCLUDES */}
            {activeTab === 'includes' && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> incluye
                  </h3>
                  <ul className="space-y-2">
                    {tour.includes.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>

                {tour.notIncludes && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                      <XCircle className="w-5 h-5 text-red-400" /> no incluye
                    </h3>
                    <ul className="space-y-2">
                      {tour.notIncludes.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {tour.recommendations && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                      <Backpack className="w-5 h-5 text-brand-teal" /> recomendaciones
                    </h3>
                    <ul className="space-y-2">
                      {tour.recommendations.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-brand-teal font-bold shrink-0">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tour.notes.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                      <AlertTriangle className="w-5 h-5 text-amber-500" /> importante
                    </h3>
                    <ul className="space-y-2">
                      {tour.notes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span> {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* BOARDING POINTS */}
            {activeTab === 'boarding' && tour.boardingPoints && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-5">
                    <MapPinned className="w-5 h-5 text-brand-teal" /> Puntos de embarque
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {tour.boardingPoints.map((bp) => (
                      <div key={bp.name} className="border border-brand-teal/30 rounded-xl p-4 text-center bg-brand-teal/5">
                        <p className="font-bold text-brand-teal text-sm">{bp.name}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-snug">{bp.address}</p>
                        <p className="mt-3 inline-block bg-brand-yellow text-white text-sm font-extrabold px-3 py-1 rounded-full">{bp.time}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-4">* Llegar con 15 min de anticipación · Asientos por orden de llegada</p>
                </div>

                {tour.departureDays && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Días de salida y retorno</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tour.departureDays.map((d) => (
                        <span key={d} className="bg-brand-teal text-white text-sm font-bold px-4 py-1.5 rounded-full">{d}</span>
                      ))}
                    </div>
                    {tour.returnTime && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Retorno: </span>{tour.returnTime}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TERMS */}
            {activeTab === 'terms' && tour.terms && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-5">
                  <FileText className="w-5 h-5 text-brand-teal" /> Términos y condiciones
                </h3>
                <ol className="space-y-3">
                  {tour.terms.map((term, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {term}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* ── RIGHT: Sticky sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-brand-gradient rounded-2xl p-6 text-white shadow-xl">
              <h2 className="text-lg font-bold mb-0.5">¿Te interesa este tour?</h2>
              <p className="text-white/75 text-xs mb-5">Reserva rápida por WhatsApp · sin compromiso</p>

              {/* WhatsApp quick reserve form */}
              <div className="space-y-3">
                <div className="bg-white/10 rounded-xl px-3 py-2 text-xs text-white/90 font-medium border border-white/20">
                  📍 {tour.name}
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/15 placeholder-white/50 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/40 border border-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                    <select
                      value={people}
                      onChange={(e) => setPeople(e.target.value)}
                      className="w-full bg-white/15 text-white text-sm rounded-xl pl-9 pr-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/40 border border-white/20 appearance-none"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                        <option key={n} value={n} className="text-gray-900">
                          {n} {n === 1 ? 'persona' : 'personas'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white/15 text-white text-sm rounded-xl pl-9 pr-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/40 border border-white/20 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <button
                  onClick={openWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors shadow-md text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Reservar por WhatsApp
                </button>

                <div className="mt-3">
                  <AddToCartButton tour={tour} variant="detail" />
                </div>
              </div>

              {/* Contact info */}
              <div className="mt-5 pt-4 border-t border-white/20 space-y-1.5 text-xs text-white/70">
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  +51 929 648 380 · +51 934 166 917
                </p>
                <p>✉️ peruintravel.pe@gmail.com</p>
                <p className="text-white/50 text-center pt-1">Respuesta en menos de 24 horas</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Galería de fotos — ancho completo ── */}
      {tour.images && tour.images.length > 1 && (
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4 text-base">
            <svg className="w-5 h-5 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Galería de fotos
          </h3>
          <GalleryCarousel images={tour.images} />
        </section>
      )}

      {/* Floating WhatsApp chatbot */}
      <WhatsAppChat tourName={tour.name} />
    </div>
  )
}

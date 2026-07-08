import { useState } from 'react'
import { Link } from 'react-router-dom'
import { tours } from '../data/tours'
import AddToCartButton from './AddToCartButton'
import React from 'react'

const tagColors: Record<string, string> = {
  'Más popular': 'bg-brand-yellow text-white',
  Cultural:      'bg-brand-teal text-white',
  Aventura:      'bg-emerald-500 text-white',
  Misterio:      'bg-purple-600 text-white',
  Naturaleza:    'bg-green-600 text-white',
  Desierto:      'bg-amber-500 text-white',
  Relax:         'bg-cyan-500 text-white',
  Selva:         'bg-lime-600 text-white',
  'Semana Santa':'bg-rose-600 text-white',
  Playa:         'bg-sky-500 text-white',
  Nevado:        'bg-blue-400 text-white',
  '2D/1N':       'bg-violet-500 text-white',
}

const REGIONS = ['Todos', 'Lima', 'Ica', 'Ayacucho', 'Junín / Pasco']
const DURATIONS = ['Todos', 'Full Day', '2 Días / 1 Noche', '3 Días / 2 Noches', '4 Días / 3 Noches']

export default function Destinations() {
  const [region, setRegion] = useState('Todos')
  const [duration, setDuration] = useState('Todos')
  const [maxPrice, setMaxPrice] = useState(500)
  const [search, setSearch] = useState('')

  // Cargar tours desde localStorage si existen, sino usar los datos por defecto
  const [tourList, setTourList] = useState<typeof tours>([])

  React.useEffect(() => {
    console.log('===== Destinations Component Loading =====')
    const savedTours = localStorage.getItem('tours')
    if (savedTours) {
      try {
        const parsed = JSON.parse(savedTours)
        console.log(`Loaded ${parsed.length} tours from localStorage`)
        parsed.forEach((t: any) => {
          console.log(`  Tour: "${t.name}" with ID: "${t.id}" (disabled: ${!!t.disabled})`)
        })
        setTourList(parsed)
      } catch (error) {
        console.error('Error parsing tours from localStorage:', error)
        console.log('Falling back to original tours data')
        setTourList(tours)
      }
    } else {
      console.log('No saved tours in localStorage, using original data')
      console.log(`Original tours count: ${tours.length}`)
      tours.forEach(t => {
        console.log(`  Tour: "${t.name}" with ID: "${t.id}"`)
      })
      setTourList(tours)
    }
    console.log('===== Destinations Component Loaded =====')
  }, [])

  const filtered = tourList.filter((t) => {
    // Filtrar paquetes deshabilitados
    if (t.disabled) return false
    
    const matchRegion = region === 'Todos' || t.region === region
    
    // Lógica mejorada para filtrado por duración (case-insensitive y flexible)
    const daysLower = t.days.toLowerCase()
    let matchDuration = false
    
    if (duration === 'Todos') {
      matchDuration = true
    } else if (duration === 'Full Day') {
      matchDuration = daysLower.includes('full')
    } else if (duration === '2 Días / 1 Noche') {
      // Detectar patrones: "2 días", "2d", "2 d", o "1 noche" con "2"
      matchDuration = (
        (daysLower.includes('2') && daysLower.includes('día')) ||
        (daysLower.includes('2') && daysLower.includes('1') && daysLower.includes('noche')) ||
        daysLower.match(/2\s*d[ií]as?\s*\/?\s*1\s*noche/i) !== null
      )
    } else if (duration === '3 Días / 2 Noches') {
      matchDuration = (
        (daysLower.includes('3') && daysLower.includes('día')) ||
        (daysLower.includes('3') && daysLower.includes('2') && daysLower.includes('noche')) ||
        daysLower.match(/3\s*d[ií]as?\s*\/?\s*2\s*noches?/i) !== null
      )
    } else if (duration === '4 Días / 3 Noches') {
      matchDuration = (
        (daysLower.includes('4') && daysLower.includes('día')) ||
        (daysLower.includes('4') && daysLower.includes('3') && daysLower.includes('noche')) ||
        daysLower.match(/4\s*d[ií]as?\s*\/?\s*3\s*noches?/i) !== null
      )
    }
    
    const matchPrice = t.priceValue <= maxPrice
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase())
    return matchRegion && matchDuration && matchPrice && matchSearch
  })

  return (
    <section id="destinos" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-brand-teal font-semibold text-sm uppercase tracking-widest">Nuestros paquetes</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-2 text-gray-900">
            Destinos <span className="text-brand-teal">imperdibles</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Cada destino es una historia. Elige la tuya y nosotros nos encargamos del resto.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-10 flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar paquete o destino..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            {/* Region filter */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Región</label>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      region === r ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration filter */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Duración</label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      duration === d ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Precio máximo: <span className="text-brand-teal">S/ {maxPrice}</span>
              </label>
              <input
                type="range" min={50} max={500} step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-teal"
              />
            </div>

            {/* Reset */}
            {(region !== 'Todos' || duration !== 'Todos' || maxPrice !== 500 || search !== '') && (
              <button
                onClick={() => { setRegion('Todos'); setDuration('Todos'); setMaxPrice(500); setSearch('') }}
                className="px-4 py-2 text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-6">
          {filtered.length} {filtered.length === 1 ? 'paquete encontrado' : 'paquetes encontrados'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16">
              <p className="text-gray-400 text-lg">No se encontraron paquetes con esos filtros.</p>
              <button
                onClick={() => { setRegion('Todos'); setDuration('Todos'); setMaxPrice(500); setSearch('') }}
                className="mt-4 text-brand-teal font-semibold hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            filtered.map((d) => (
              <div
                key={d.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="relative overflow-hidden h-52 shrink-0">
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${tagColors[d.tag] ?? 'bg-gray-500 text-white'}`}>
                    {d.tag}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-auto">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{d.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <svg className="w-4 h-4 text-brand-teal shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {d.region}
                      </p>
                    </div>
                    <span className="text-brand-yellow font-bold text-sm shrink-0">{d.price}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 mb-4">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {d.days}
                    </span>
                    <Link
                      to={`/tour/${d.id}`}
                      onClick={() => console.log(`🔗 Navigating to tour ID: "${d.id}" | Name: "${d.name}"`)}
                      className="text-sm font-semibold text-brand-teal hover:text-brand-teal-d hover:underline transition-colors"
                    >
                      Ver paquete →
                    </Link>
                  </div>
                  <AddToCartButton tour={d} variant="card" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

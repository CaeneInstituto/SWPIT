import { useState } from 'react'
import { useCart, detectPersonsPerPackage, detectHasAccommodation } from '../context/CartContext'
import type { Tour, WeekDay } from '../data/tours'

// ── Función para determinar estilos por categoría de paquete ─────────────────

const getPackageStyle = (label: string) => {
  const labelUpper = label.toUpperCase()
  
  // VIP o FULL → Azul
  if (labelUpper.includes('VIP') || labelUpper.includes('FULL')) {
    return {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-400',
      labelText: 'text-blue-700 font-semibold',
      priceText: 'text-blue-600',
      noteText: 'text-blue-600/80'
    }
  }
  
  // GOLD → Dorado
  if (labelUpper.includes('GOLD')) {
    return {
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-100',
      border: 'border-amber-400',
      labelText: 'text-amber-800 font-semibold',
      priceText: 'text-amber-600',
      noteText: 'text-amber-700/80'
    }
  }
  
  // BASIC o default → Blanco
  return {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    labelText: 'text-gray-900 font-medium',
    priceText: 'text-brand-teal',
    noteText: 'text-gray-500'
  }
}

// ── Helpers de fechas disponibles ────────────────────────────────────────────

const WEEKDAY_NAMES: WeekDay[] = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

/** Devuelve true si la fecha ISO (YYYY-MM-DD) está disponible para el tour */
function isDateAvailable(dateStr: string, tour: Tour): boolean {
  const ad = tour.availableDates
  // Sin configuración → cualquier fecha futura es válida
  if (!ad || (!ad.weekDays?.length && !ad.specificDates?.length)) return true

  const d = new Date(dateStr + 'T12:00:00')
  const dayName = WEEKDAY_NAMES[d.getDay()] as WeekDay

  const matchesWeekDay = (ad.weekDays || []).includes(dayName)
  const matchesSpecific = (ad.specificDates || []).includes(dateStr)

  return matchesWeekDay || matchesSpecific
}

/** Calcula el primer mes a mostrar (mes del primer día disponible desde hoy) */
function getInitialMonth(tour: Tour): { year: number; month: number } {
  const today = new Date()
  // Buscar el próximo día disponible en los próximos 90 días
  for (let i = 1; i <= 90; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    if (isDateAvailable(iso, tour)) {
      return { year: d.getFullYear(), month: d.getMonth() }
    }
  }
  return { year: today.getFullYear(), month: today.getMonth() }
}

// ── Mini calendario custom ────────────────────────────────────────────────────

interface DatePickerProps {
  tour: Tour
  value: string
  onChange: (date: string) => void
  minDate: string
}

function TourDatePicker({ tour, value, onChange, minDate }: DatePickerProps) {
  const ad = tour.availableDates
  const hasConfig = ad && (ad.weekDays?.length || ad.specificDates?.length)

  // Si no hay configuración, usar input nativo simple
  if (!hasConfig) {
    return (
      <input
        id="travel-date"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={minDate}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
        required
      />
    )
  }

  const init = getInitialMonth(tour)
  const [viewYear, setViewYear] = useState(init.year)
  const [viewMonth, setViewMonth] = useState(init.month)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthName = new Date(viewYear, viewMonth, 1)
    .toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })

  // Primer día de la semana del mes (0=Dom)
  const firstDow = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Cabecera del mes */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b">
        <button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-600">‹</button>
        <span className="text-sm font-semibold text-gray-800 capitalize">{monthName}</span>
        <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-600">›</button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {['Do','Lu','Ma','Mi','Ju','Vi','Sá'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Celdas */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />
          const iso = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const dateObj = new Date(iso + 'T12:00:00')
          const isPast = dateObj <= today
          const available = !isPast && isDateAvailable(iso, tour)
          const isSelected = value === iso
          const isSpecific = (ad?.specificDates || []).includes(iso)

          return (
            <button
              key={idx}
              type="button"
              disabled={!available}
              onClick={() => available && onChange(iso)}
              className={`
                relative w-full aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all
                ${isSelected ? 'bg-brand-teal text-white shadow-md scale-105' : ''}
                ${!isSelected && available && !isSpecific ? 'hover:bg-teal-50 text-gray-800' : ''}
                ${!isSelected && available && isSpecific ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' : ''}
                ${!available ? 'text-gray-200 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={isSpecific ? '📅 Fecha especial' : available ? 'Disponible' : 'No disponible'}
            >
              {day}
              {isSpecific && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="flex gap-3 px-3 pb-2 pt-1 text-xs text-gray-500 border-t bg-gray-50">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-brand-teal inline-block" /> Seleccionado</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-200 inline-block" /> Fecha especial</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block" /> No disponible</span>
      </div>

      {/* Fecha seleccionada */}
      {value && (
        <div className="px-3 pb-2 text-xs text-brand-teal font-semibold">
          ✓ {new Date(value + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      )}

      {/* Info días disponibles */}
      {ad?.weekDays?.length ? (
        <div className="px-3 pb-3 text-xs text-gray-400">
          Sale los: {ad.weekDays.join(', ')}
          {ad.specificDates?.length ? ` + ${ad.specificDates.length} fecha(s) especial(es)` : ''}
        </div>
      ) : ad?.specificDates?.length ? (
        <div className="px-3 pb-3 text-xs text-gray-400">
          Solo fechas especiales configuradas
        </div>
      ) : null}
    </div>
  )
}

interface PersonPackageAssignment {
  personIndex: number
  packageOption: any
  priceValue: number
}

interface AddToCartButtonProps {
  tour: Tour
  variant?: 'card' | 'detail'
}

export default function AddToCartButton({ tour, variant = 'card' }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [showModal, setShowModal] = useState(false)
  const [totalPersons, setTotalPersons] = useState(1)
  const [personPackages, setPersonPackages] = useState<PersonPackageAssignment[]>([])
  const [travelDate, setTravelDate] = useState('')
  const [currentStep, setCurrentStep] = useState<'persons' | 'packages'>('persons')

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const initializePersonPackages = (numPersons: number) => {
    const defaultPackage = tour.priceOptions?.[0] || { label: 'Estándar', price: tour.price, note: '' }
    const assignments: PersonPackageAssignment[] = []
    
    for (let i = 0; i < numPersons; i++) {
      assignments.push({
        personIndex: i,
        packageOption: defaultPackage,
        priceValue: parseFloat(defaultPackage.price.replace(/[^\d.]/g, ''))
      })
    }
    
    setPersonPackages(assignments)
  }

  const updatePersonPackage = (personIndex: number, packageOption: any) => {
    const priceValue = parseFloat(packageOption.price.replace(/[^\d.]/g, ''))
    const label = packageOption.label.toLowerCase()
    
    // Detectar tipo de paquete
    const isCouplePacked = label.includes('pareja')
    const isGroupPackage = label.includes('a partir de 3')
    const isFixedRoom = (label.includes('triple') && !isGroupPackage) || 
                       (label.includes('cuádruple') && !isGroupPackage) || 
                       label.includes('quintuple') ||
                       (label.includes('doble') && !isCouplePacked) ||
                       label.includes('matrimonial')
    
    // Detectar cuántas personas incluye este paquete
    // Si el usuario eligió flexible, usar _flexibleChoice, sino detectar normalmente
    let personsInPackage = packageOption._flexibleChoice || detectPersonsPerPackage(packageOption.label)
    
    // Si detectPersonsPerPackage retorna -1 (flexible) pero no hay _flexibleChoice, usar 2 por defecto
    if (personsInPackage === -1) {
      personsInPackage = 2 // Default a doble si no se especificó
    }
    
    // IMPORTANTE: Limpiar solo si esta persona cambia de un tipo que afecta a otros
    setPersonPackages(prev => {
      const previousPackage = prev[personIndex]?.packageOption
      const wasGroupPackage = previousPackage && (
        previousPackage.label.toLowerCase().includes('pareja') ||
        previousPackage.label.toLowerCase().includes('triple') ||
        previousPackage.label.toLowerCase().includes('cuádruple') ||
        previousPackage.label.toLowerCase().includes('quintuple') ||
        (previousPackage.label.toLowerCase().includes('doble') && !previousPackage.label.toLowerCase().includes('pareja'))
      )
      
      // Solo limpiar el grupo anterior si esta persona tenía un paquete grupal
      let cleanedPackages = [...prev]
      if (wasGroupPackage) {
        // Limpiar solo las personas que estaban en el mismo grupo
        const prevPersonsInPackage = previousPackage._flexibleChoice || detectPersonsPerPackage(previousPackage.label)
        if (prevPersonsInPackage > 1 && prevPersonsInPackage !== -1) {
          // Calcular el rango del grupo anterior
          let groupStartIndex = personIndex
          if (prevPersonsInPackage === 2) {
            groupStartIndex = Math.floor(personIndex / 2) * 2
          } else if (prevPersonsInPackage === 3) {
            groupStartIndex = Math.floor(personIndex / 3) * 3
          } else if (prevPersonsInPackage === 4) {
            groupStartIndex = Math.floor(personIndex / 4) * 4
          } else if (prevPersonsInPackage === 5) {
            groupStartIndex = Math.floor(personIndex / 5) * 5
          }
          const groupEndIndex = groupStartIndex + prevPersonsInPackage - 1
          
          cleanedPackages = prev.map((p, idx) => {
            // Solo limpiar las personas que estaban en el mismo grupo específico
            if (p.personIndex >= groupStartIndex && 
                p.personIndex <= groupEndIndex && 
                p.packageOption?.label === previousPackage.label) {
              return { ...p, packageOption: null, priceValue: 0 }
            }
            return p
          })
        }
      }
      
      // Ahora asignar el nuevo paquete
      if (isCouplePacked) {
        // Lógica para promo de parejas
        const pairedPersonIndex = personIndex % 2 === 0 ? personIndex + 1 : personIndex - 1
        
        if (pairedPersonIndex >= totalPersons) {
          alert('La promo de parejas necesita un número par de personas. Ajusta la cantidad total.')
          return prev
        }
        
        return cleanedPackages.map(p => {
          if (p.personIndex === personIndex) {
            return { ...p, packageOption, priceValue }
          }
          if (p.personIndex === pairedPersonIndex) {
            return { ...p, packageOption, priceValue: 0 }
          }
          return p
        })
      } else if (isFixedRoom && personsInPackage > 1) {
        // Para habitaciones fijas: encuentra el grupo correcto
        let startIndex = personIndex
        
        if (personsInPackage === 3) {
          startIndex = Math.floor(personIndex / 3) * 3
        } else if (personsInPackage === 4) {
          startIndex = Math.floor(personIndex / 4) * 4
        } else if (personsInPackage === 5) {
          startIndex = Math.floor(personIndex / 5) * 5
        } else if (personsInPackage === 2) {
          startIndex = Math.floor(personIndex / 2) * 2
        }
        
        const endIndex = startIndex + personsInPackage - 1
        
        if (endIndex >= totalPersons) {
          alert(`Esta habitación es para ${personsInPackage} personas consecutivas. No hay suficientes personas disponibles en este grupo.`)
          return prev
        }
        
        return cleanedPackages.map(p => {
          if (p.personIndex >= startIndex && p.personIndex <= endIndex) {
            // Para habitaciones, verificar si cobran por persona (c/u) o total
            const isCouplePricing = label.includes('pareja') // Solo parejas cobran precio total
            
            if (isCouplePricing) {
              // Para parejas: el primero paga todo, el segundo 0
              return { 
                ...p, 
                packageOption, 
                priceValue: p.personIndex === startIndex ? priceValue : 0 
              }
            } else {
              // Para habitaciones normales (Triple, Cuádruple, etc.): cada uno paga su parte
              return { 
                ...p, 
                packageOption, 
                priceValue: priceValue // Cada persona paga el precio individual (c/u)
              }
            }
          }
          return p
        })
      } else {
        // Para paquetes individuales - solo asignar a esta persona
        return cleanedPackages.map(p => 
          p.personIndex === personIndex 
            ? { ...p, packageOption, priceValue }
            : p
        )
      }
    })
  }

  const calculateTotalPrice = () => {
    return personPackages.reduce((sum, p) => sum + p.priceValue, 0)
  }

  const handleAddToCart = () => {
    if (!travelDate) {
      alert('Por favor selecciona una fecha de partida')
      return
    }

    if (personPackages.length === 0) {
      alert('Por favor asigna paquetes a todas las personas')
      return
    }

    // Calcular precio total de todos los paquetes
    const totalPrice = personPackages.reduce((sum, p) => sum + p.priceValue, 0)
    const totalPersonsInReservation = personPackages.length
    
    // Crear descripción combinada de los paquetes
    const packageSummary = Object.entries(
      personPackages.reduce((acc, p) => {
        const key = p.packageOption.label
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([label, count]) => `${label} (${count})`).join(' + ')
    
    // Verificar si algún paquete tiene alojamiento
    const hasAccommodation = personPackages.some(p => 
      detectHasAccommodation(p.packageOption.label, tour.days)
    )

    // Agregar UN SOLO item al carrito con toda la información combinada
    addItem({
      tourId: tour.id,
      tourName: tour.name,
      tourImage: tour.image,
      priceOption: packageSummary,
      priceValue: totalPrice / totalPersonsInReservation, // Precio promedio por persona
      quantity: 1, // Siempre 1 porque es una reserva completa
      travelDate,
      personsPerPackage: totalPersonsInReservation, // Usar el total real de personas, no el detectado
      boardingPoints: tour.boardingPoints,
      hasAccommodation,
      customTotalPrice: totalPrice, // Precio total calculado
      totalPersons: totalPersonsInReservation // Total real de personas
    })

    setShowModal(false)
    setTotalPersons(1)
    setPersonPackages([])
    setTravelDate('')
    setCurrentStep('persons')
  }

  if (variant === 'card') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-brand-teal hover:bg-brand-teal-d text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Agregar al carrito
        </button>

        {showModal && (
          <DynamicCartModal
            tour={tour}
            totalPersons={totalPersons}
            setTotalPersons={setTotalPersons}
            personPackages={personPackages}
            initializePersonPackages={initializePersonPackages}
            updatePersonPackage={updatePersonPackage}
            travelDate={travelDate}
            setTravelDate={setTravelDate}
            minDate={minDate}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            calculateTotalPrice={calculateTotalPrice}
            onClose={() => {
              setShowModal(false)
              setCurrentStep('persons')
              setPersonPackages([])
              setTotalPersons(1)
              setTravelDate('')
            }}
            onAdd={handleAddToCart}
          />
        )}
      </>
    )
  }

  // variant === 'detail'
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-brand-gradient text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        Agregar al carrito
      </button>

      {showModal && (
        <DynamicCartModal
          tour={tour}
          totalPersons={totalPersons}
          setTotalPersons={setTotalPersons}
          personPackages={personPackages}
          initializePersonPackages={initializePersonPackages}
          updatePersonPackage={updatePersonPackage}
          travelDate={travelDate}
          setTravelDate={setTravelDate}
          minDate={minDate}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          calculateTotalPrice={calculateTotalPrice}
          onClose={() => {
            setShowModal(false)
            setCurrentStep('persons')
            setPersonPackages([])
            setTotalPersons(1)
            setTravelDate('')
          }}
          onAdd={handleAddToCart}
        />
      )}
    </>
  )
}

interface DynamicCartModalProps {
  tour: Tour
  totalPersons: number
  setTotalPersons: (n: number) => void
  personPackages: PersonPackageAssignment[]
  initializePersonPackages: (n: number) => void
  updatePersonPackage: (index: number, option: any) => void
  travelDate: string
  setTravelDate: (date: string) => void
  minDate: string
  currentStep: 'persons' | 'packages'
  setCurrentStep: (step: 'persons' | 'packages') => void
  calculateTotalPrice: () => number
  onClose: () => void
  onAdd: () => void
}

function DynamicCartModal({
  tour,
  totalPersons,
  setTotalPersons,
  personPackages,
  initializePersonPackages,
  updatePersonPackage,
  travelDate,
  setTravelDate,
  minDate,
  currentStep,
  setCurrentStep,
  calculateTotalPrice,
  onClose,
  onAdd,
}: DynamicCartModalProps) {

  const handlePersonsNext = () => {
    if (totalPersons < 1) {
      alert('Debes seleccionar al menos 1 persona')
      return
    }
    initializePersonPackages(totalPersons)
    setCurrentStep('packages')
  }

  const canProceedToCart = () => {
    return personPackages.length > 0 && travelDate && personPackages.length === totalPersons
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{tour.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{tour.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              currentStep === 'persons' ? 'bg-brand-teal text-white' : 'bg-gray-200'
            }`}>1</div>
            <span className="flex-1 h-0.5 bg-gray-200" />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              currentStep === 'packages' ? 'bg-brand-teal text-white' : 'bg-gray-200'
            }`}>2</div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Cantidad</span>
            <span>Paquetes</span>
          </div>
        </div>

        {/* STEP 1: Select total persons */}
        {currentStep === 'persons' && (
          <div className="space-y-4">
            
            {/* Show available packages (read-only info) */}
            {tour.priceOptions && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Paquetes disponibles:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {tour.priceOptions.map((opt) => {
                    const style = getPackageStyle(opt.label)
                    return (
                      <div 
                        key={opt.label} 
                        className={`${style.bg} rounded-lg border-2 ${style.border} p-3 text-sm shadow-sm transition-transform hover:scale-[1.02]`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`${style.labelText}`}>{opt.label}</p>
                            {opt.note && <p className={`text-xs mt-1 ${style.noteText}`}>{opt.note}</p>}
                          </div>
                          <span className={`font-bold ${style.priceText}`}>{opt.price}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  ↑ En el siguiente paso podrás asignar estos paquetes a cada persona
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                ¿Para cuántas personas es el viaje?
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTotalPersons(Math.max(1, totalPersons - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-lg transition-colors"
                >
                  −
                </button>
                <div className="text-center">
                  <div className="text-4xl font-bold text-brand-teal">{totalPersons}</div>
                  <div className="text-xs text-gray-500">
                    {totalPersons === 1 ? 'persona' : 'personas'}
                  </div>
                </div>
                <button
                  onClick={() => setTotalPersons(totalPersons + 1)}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePersonsNext}
                className="flex-1 bg-brand-gradient text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Assign packages to each person */}
        {currentStep === 'packages' && (
          <div className="space-y-6">
            
            {/* Back button */}
            <button
              onClick={() => setCurrentStep('persons')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Cambiar cantidad
            </button>

            {/* Person assignments */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Asigna un paquete a cada persona
              </label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {Array.from({ length: totalPersons }).map((_, index) => {
                  const currentPackage = personPackages[index]
                  if (!currentPackage?.packageOption) {
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Persona {index + 1}
                          </span>
                        </div>
                        
                        {tour.priceOptions && (
                          <select
                            value=""
                            onChange={(e) => {
                              const selectedOption = tour.priceOptions!.find(opt => opt.label === e.target.value)
                              if (selectedOption) {
                                const personsDetected = detectPersonsPerPackage(selectedOption.label)
                                
                                // Si es habitación flexible (mixta), preguntar al usuario
                                if (personsDetected === -1) {
                                  // Detectar qué tipos están disponibles en la etiqueta
                                  const labelLower = selectedOption.label.toLowerCase()
                                  const availableTypes = []
                                  
                                  if (labelLower.includes('individual')) availableTypes.push({ name: 'Individual', persons: 1 })
                                  if (labelLower.includes('doble') || labelLower.includes('matrimonial')) availableTypes.push({ name: 'Doble', persons: 2 })
                                  if (labelLower.includes('triple')) availableTypes.push({ name: 'Triple', persons: 3 })
                                  if (labelLower.includes('cuádruple') || labelLower.includes('cuadruple')) availableTypes.push({ name: 'Cuádruple', persons: 4 })
                                  if (labelLower.includes('quintuple') || labelLower.includes('quíntuple')) availableTypes.push({ name: 'Quintuple', persons: 5 })
                                  
                                  if (availableTypes.length >= 2) {
                                    // Crear el mensaje de opciones
                                    let message = `El paquete "${selectedOption.label}" permite múltiples tipos de habitación:\\n\\n`
                                    availableTypes.forEach((type, i) => {
                                      message += `${i + 1}. ${type.name} (${type.persons} personas)\\n`
                                    })
                                    message += `\\nElige el número de opción (1-${availableTypes.length}):`
                                    
                                    const choice = prompt(message)
                                    const choiceIndex = choice ? parseInt(choice) - 1 : -1
                                    
                                    if (choiceIndex >= 0 && choiceIndex < availableTypes.length) {
                                      const selectedType = availableTypes[choiceIndex]
                                      
                                      // Crear una opción temporal con el tipo elegido
                                      const adjustedOption = {
                                        ...selectedOption,
                                        label: selectedOption.label + ` (${selectedType.name})`,
                                        _originalLabel: selectedOption.label,
                                        _flexibleChoice: selectedType.persons
                                      }
                                      
                                      updatePersonPackage(index, adjustedOption)
                                    } else {
                                      alert('Opción inválida. Por favor intenta de nuevo.')
                                      return
                                    }
                                  } else {
                                    // Fallback por si no detecta tipos
                                    updatePersonPackage(index, selectedOption)
                                  }
                                } else {
                                  updatePersonPackage(index, selectedOption)
                                }
                              }
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                          >
                            <option value="">Selecciona un paquete</option>
                            {tour.priceOptions.map((option) => {
                              const isPareja = option.label.toLowerCase().includes('pareja')
                              const isGroup = option.label.toLowerCase().includes('a partir de 3')
                              const isIndividual = option.label.toLowerCase().includes('1 persona') || option.label.toLowerCase().includes('individual')
                              const isTriple = option.label.toLowerCase().includes('triple') && !isGroup
                              const isCuadruple = option.label.toLowerCase().includes('cuádruple') && !isGroup
                              const isQuintuple = option.label.toLowerCase().includes('quintuple')
                              const isDoble = (option.label.toLowerCase().includes('doble') || option.label.toLowerCase().includes('matrimonial')) && !isPareja
                              
                              const personsNeeded = detectPersonsPerPackage(option.label)
                              
                              // Si es paquete mixto (personsNeeded === -1), no aplicar restricciones de habitación
                              const isMixedPackage = personsNeeded === -1
                              
                              // Calcular si estamos en una posición válida para esta habitación
                              let canSelectRoom = true
                              if (!isMixedPackage) {
                                if (isTriple) {
                                  const groupStart = Math.floor(index / 3) * 3
                                  canSelectRoom = (groupStart + 3 <= totalPersons)
                                } else if (isCuadruple) {
                                  const groupStart = Math.floor(index / 4) * 4
                                  canSelectRoom = (groupStart + 4 <= totalPersons)
                                } else if (isQuintuple) {
                                  const groupStart = Math.floor(index / 5) * 5
                                  canSelectRoom = (groupStart + 5 <= totalPersons)
                                } else if (isDoble) {
                                  const groupStart = Math.floor(index / 2) * 2
                                  canSelectRoom = (groupStart + 2 <= totalPersons)
                                }
                              }
                              
                              // Lógica de disponibilidad
                              let canSelect = true
                              
                              // Para promo parejas
                              if (isPareja && (index >= totalPersons - 1) && (index % 2 !== 1)) {
                                canSelect = false
                              }
                              
                              // Para paquetes grupales "a partir de 3"
                              if (isGroup && totalPersons < 3) {
                                canSelect = false
                              }
                              
                              // Para habitaciones fijas (NO aplicar a paquetes mixtos)
                              if (!isMixedPackage && (isTriple || isCuadruple || isQuintuple || isDoble) && !canSelectRoom) {
                                canSelect = false
                              }
                              
                              if (!canSelect) {
                                return null
                              }
                              
                              // Destacar la opción recomendada
                              let optionText = `${option.label} - ${option.price}`
                              let isRecommended = false
                              
                              // Lógica de recomendación inteligente
                              if (isGroup && totalPersons >= 3) {
                                optionText += ' ⭐ RECOMENDADO'
                                isRecommended = true
                              } else if (isCuadruple && totalPersons >= 4 && totalPersons % 4 === 0) {
                                optionText += ' 🏆 ÓPTIMO'
                                isRecommended = true
                              } else if (isTriple && totalPersons === 3) {
                                optionText += ' ⭐ RECOMENDADO'
                                isRecommended = true
                              } else if (isCuadruple && totalPersons > 3) {
                                optionText += ' 🏆 MEJOR OPCIÓN'
                                isRecommended = true
                              }
                              
                              // Explicar qué incluye
                              if (isPareja) {
                                optionText += ' (precio total para 2)'
                              } else if (personsNeeded > 1 && !isGroup) {
                                optionText += ` (habitación para ${personsNeeded > 0 ? personsNeeded : 2})`
                              }
                              
                              return (
                                <option key={option.label} value={option.label} className={isRecommended ? 'font-bold' : ''}>
                                  {optionText}
                                </option>
                              )
                            })}
                          </select>
                        )}
                      </div>
                    )
                  }
                  
                  const isCouplePaired = currentPackage.packageOption.label.toLowerCase().includes('pareja')
                  const isSecondInPair = isCouplePaired && currentPackage.priceValue === 0
                  
                  // Detectar habitaciones agrupadas mejorado
                  const label = currentPackage.packageOption.label.toLowerCase()
                  const personsInRoom = currentPackage.packageOption._flexibleChoice || detectPersonsPerPackage(currentPackage.packageOption.label)
                  const displayPersonsInRoom = personsInRoom > 0 ? personsInRoom : (currentPackage.packageOption._flexibleChoice || 2) // fallback para mixtos
                  const isRoomPackage = label.includes('habitación') || 
                                       label.includes('triple') ||
                                       label.includes('cuádruple') ||
                                       label.includes('quintuple') ||
                                       (label.includes('doble') && !label.includes('pareja')) ||
                                       label.includes('matrimonial')
                  const isIncludedInRoom = isRoomPackage && currentPackage.priceValue === 0
                  
                  return (
                    <div key={index} className={`border border-gray-200 rounded-lg p-3 ${
                      isCouplePaired ? 'bg-pink-50 border-pink-200' : 
                      isRoomPackage ? 'bg-blue-50 border-blue-200' : ''
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCouplePaired ? 'bg-pink-500 text-white' : 
                          isRoomPackage ? 'bg-blue-500 text-white' : 
                          'bg-brand-teal text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Persona {index + 1}
                          {isSecondInPair && <span className="text-pink-600 ml-2">(incluida en promo parejas)</span>}
                          {isIncludedInRoom && <span className="text-blue-600 ml-2">(incluida en habitación)</span>}
                        </span>
                      </div>
                      
                      {tour.priceOptions && (
                        <select
                          value={currentPackage.packageOption.label || ''}
                          onChange={(e) => {
                            const selectedOption = tour.priceOptions!.find(opt => opt.label === e.target.value)
                            if (selectedOption) {
                              const personsDetected = detectPersonsPerPackage(selectedOption.label)
                              
                              // Si es habitación flexible (mixta), preguntar al usuario
                              if (personsDetected === -1) {
                                // Detectar qué tipos están disponibles en la etiqueta
                                const labelLower = selectedOption.label.toLowerCase()
                                const availableTypes = []
                                
                                if (labelLower.includes('individual')) availableTypes.push({ name: 'Individual', persons: 1 })
                                if (labelLower.includes('doble') || labelLower.includes('matrimonial')) availableTypes.push({ name: 'Doble', persons: 2 })
                                if (labelLower.includes('triple')) availableTypes.push({ name: 'Triple', persons: 3 })
                                if (labelLower.includes('cuádruple') || labelLower.includes('cuadruple')) availableTypes.push({ name: 'Cuádruple', persons: 4 })
                                if (labelLower.includes('quintuple') || labelLower.includes('quíntuple')) availableTypes.push({ name: 'Quintuple', persons: 5 })
                                
                                if (availableTypes.length >= 2) {
                                  // Crear el mensaje de opciones
                                  let message = `El paquete "${selectedOption.label}" permite múltiples tipos de habitación:\\n\\n`
                                  availableTypes.forEach((type, i) => {
                                    message += `${i + 1}. ${type.name} (${type.persons} personas)\\n`
                                  })
                                  message += `\\nElige el número de opción (1-${availableTypes.length}):`
                                  
                                  const choice = prompt(message)
                                  const choiceIndex = choice ? parseInt(choice) - 1 : -1
                                  
                                  if (choiceIndex >= 0 && choiceIndex < availableTypes.length) {
                                    const selectedType = availableTypes[choiceIndex]
                                    
                                    // Crear una opción temporal con el tipo elegido
                                    const adjustedOption = {
                                      ...selectedOption,
                                      label: selectedOption.label + ` (${selectedType.name})`,
                                      _originalLabel: selectedOption.label,
                                      _flexibleChoice: selectedType.persons
                                    }
                                    
                                    updatePersonPackage(index, adjustedOption)
                                  } else {
                                    alert('Opción inválida. Por favor intenta de nuevo.')
                                    return
                                  }
                                } else {
                                  // Fallback por si no detecta tipos
                                  updatePersonPackage(index, selectedOption)
                                }
                              } else {
                                updatePersonPackage(index, selectedOption)
                              }
                            }
                          }}
                          disabled={isSecondInPair || isIncludedInRoom}
                          className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent ${
                            isSecondInPair || isIncludedInRoom ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="">Selecciona un paquete</option>
                          {tour.priceOptions.map((option) => {
                            const isPareja = option.label.toLowerCase().includes('pareja')
                            const isGroup = option.label.toLowerCase().includes('a partir de 3')
                            const isIndividual = option.label.toLowerCase().includes('1 persona') || option.label.toLowerCase().includes('individual')
                            const isTriple = option.label.toLowerCase().includes('triple') && !isGroup
                            const isCuadruple = option.label.toLowerCase().includes('cuádruple') && !isGroup
                            const isQuintuple = option.label.toLowerCase().includes('quintuple')
                            const isDoble = (option.label.toLowerCase().includes('doble') || option.label.toLowerCase().includes('matrimonial')) && !isPareja
                            
                            const personsNeeded = detectPersonsPerPackage(option.label)
                            const remainingPersons = totalPersons - index
                            
                            // Si es paquete mixto (personsNeeded === -1), no aplicar restricciones de habitación
                            const isMixedPackage = personsNeeded === -1
                            
                            // Calcular si estamos en una posición válida para esta habitación
                            let canSelectRoom = true
                            if (!isMixedPackage) {
                              if (isTriple) {
                                const groupStart = Math.floor(index / 3) * 3
                                canSelectRoom = (groupStart + 3 <= totalPersons)
                              } else if (isCuadruple) {
                                const groupStart = Math.floor(index / 4) * 4
                                canSelectRoom = (groupStart + 4 <= totalPersons)
                              } else if (isQuintuple) {
                                const groupStart = Math.floor(index / 5) * 5
                                canSelectRoom = (groupStart + 5 <= totalPersons)
                              } else if (isDoble) {
                                const groupStart = Math.floor(index / 2) * 2
                                canSelectRoom = (groupStart + 2 <= totalPersons)
                              }
                            }
                            
                            // Lógica de disponibilidad
                            let canSelect = true
                            
                            // Para promo parejas
                            if (isPareja && (index >= totalPersons - 1) && (index % 2 !== 1)) {
                              canSelect = false
                            }
                            
                            // Para paquetes grupales "a partir de 3"
                            if (isGroup && totalPersons < 3) {
                              canSelect = false
                            }
                            
                            // Para habitaciones fijas (NO aplicar a paquetes mixtos)
                            if (!isMixedPackage && (isTriple || isCuadruple || isQuintuple || isDoble) && !canSelectRoom) {
                              canSelect = false
                            }
                            
                            if (!canSelect) {
                              return null
                            }
                            
                            // Destacar la opción recomendada
                            let optionText = `${option.label} - ${option.price}`
                            let isRecommended = false
                            
                            // Lógica de recomendación inteligente
                            if (isGroup && totalPersons >= 3) {
                              optionText += ' ⭐ RECOMENDADO'
                              isRecommended = true
                            } else if (isCuadruple && totalPersons >= 4 && totalPersons % 4 === 0) {
                              optionText += ' 🏆 ÓPTIMO'
                              isRecommended = true
                            } else if (isTriple && totalPersons === 3) {
                              optionText += ' ⭐ RECOMENDADO'
                              isRecommended = true
                            } else if (isCuadruple && totalPersons > 3) {
                              optionText += ' 🏆 MEJOR OPCIÓN'
                              isRecommended = true
                            }
                            
                            // Explicar qué incluye
                            if (isPareja) {
                              optionText += ' (precio total para 2)'
                            } else if (personsNeeded > 1 && !isGroup) {
                              optionText += ` (habitación para ${personsNeeded > 0 ? personsNeeded : 2})`
                            }
                            
                            return (
                              <option key={option.label} value={option.label} className={isRecommended ? 'font-bold' : ''}>
                                {optionText}
                              </option>
                            )
                          })}
                        </select>
                      )}
                      
                      {currentPackage?.priceValue > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          Costo: S/ {currentPackage.priceValue.toFixed(2)}
                          {isCouplePaired && !isSecondInPair && ' (total para 2 personas)'}
                          {isRoomPackage && !isIncludedInRoom && ` (total para ${displayPersonsInRoom} personas)`}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de partida
              </label>
              <TourDatePicker
                tour={tour}
                value={travelDate}
                onChange={setTravelDate}
                minDate={minDate}
              />
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  Total ({totalPersons} {totalPersons === 1 ? 'persona' : 'personas'})
                </span>
                <span className="text-2xl font-bold text-brand-teal">
                  S/ {calculateTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onAdd}
                disabled={!canProceedToCart()}
                className={`flex-1 font-bold py-3 rounded-xl transition-opacity ${
                  canProceedToCart()
                    ? 'bg-brand-gradient text-white hover:opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

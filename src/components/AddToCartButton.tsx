import { useState } from 'react'
import { useCart, detectPersonsPerPackage, detectHasAccommodation } from '../context/CartContext'
import type { Tour } from '../data/tours'

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
      alert('Por favor selecciona una fecha de viaje')
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
                  {tour.priceOptions.map((opt) => (
                    <div key={opt.label} className="bg-gray-50 rounded-lg border p-3 text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{opt.label}</p>
                          {opt.note && <p className="text-xs text-gray-500 mt-1">{opt.note}</p>}
                        </div>
                        <span className="font-bold text-brand-teal">{opt.price}</span>
                      </div>
                    </div>
                  ))}
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
              <label htmlFor="travel-date" className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de viaje
              </label>
              <input
                id="travel-date"
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                min={minDate}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                required
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

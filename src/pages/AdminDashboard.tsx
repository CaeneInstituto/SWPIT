import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tours, type Tour, type DayItinerary, type Activity } from '../data/tours'
import { normalizeToTime24, normalizeActivities } from '../utils/timeFormat'
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, LogOut, Save, X, 
  Package, DollarSign, MapPin, Clock, Image as ImageIcon,
  Sun, Snowflake, Leaf, Calendar as CalendarIcon, Percent, Tag
} from 'lucide-react'

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [tourList, setTourList] = useState<Tour[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSeasonManager, setShowSeasonManager] = useState(false)
  const [activeSeason, setActiveSeason] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login')
      return
    }

    // Cargar tours desde localStorage o usar los datos iniciales
    const savedTours = localStorage.getItem('tours')
    if (savedTours) {
      try {
        const parsedTours = JSON.parse(savedTours)
        // Asegurar que cada tour tenga el itinerario correctamente formateado
        const processedTours = parsedTours.map((tour: Tour) => ({
          ...tour,
          itinerary: (tour.itinerary || []).map(day => ({
            ...day,
            activities: normalizeActivities(day.activities || [])
          }))
        }))
        setTourList(processedTours)
      } catch (error) {
        console.error('Error parsing tours from localStorage:', error)
        // Si hay error, usar datos originales
        const processedOriginalTours = tours.map((tour: Tour) => ({
          ...tour,
          itinerary: (tour.itinerary || []).map(day => ({
            ...day,
            activities: normalizeActivities(day.activities || [])
          }))
        }))
        setTourList(processedOriginalTours)
      }
    } else {
      // Procesar datos originales al cargar por primera vez
      const processedOriginalTours = tours.map((tour: Tour) => ({
        ...tour,
        itinerary: (tour.itinerary || []).map(day => ({
          ...day,
          activities: normalizeActivities(day.activities || [])
        }))
      }))
      setTourList(processedOriginalTours)
    }
  }, [isAuthenticated, navigate])

  const saveTours = (newTours: Tour[]) => {
    // Normalizar todas las horas a formato 24h antes de guardar
    const normalizedTours = newTours.map(tour => ({
      ...tour,
      itinerary: (tour.itinerary || []).map(day => ({
        ...day,
        activities: normalizeActivities(day.activities || [])
      }))
    }))
    
    setTourList(normalizedTours)
    localStorage.setItem('tours', JSON.stringify(normalizedTours))
  }

  const toggleTourStatus = (tourId: string) => {
    const updatedTours = tourList.map(tour =>
      tour.id === tourId ? { ...tour, disabled: !tour.disabled } : tour
    )
    saveTours(updatedTours)
  }

  const deleteTour = (tourId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paquete?')) {
      const updatedTours = tourList.filter(tour => tour.id !== tourId)
      saveTours(updatedTours)
    }
  }

  // ─── Season Management ────────────────────────────────────────────────────

  const applySeasonFilter = (seasonName: string, discount: number) => {
    const updatedTours = tourList.map(tour => {
      const tourSeasons = tour.seasons || []
      const hasThisSeason = tourSeasons.includes(seasonName)
      
      if (hasThisSeason) {
        // Guardar precio original si no existe
        const originalPrice = tour.originalPriceValue || tour.priceValue
        const originalPriceStr = tour.originalPrice || tour.price
        
        // Calcular nuevo precio con descuento
        const discountedPrice = originalPrice * (1 - discount / 100)
        const newPriceStr = `Desde S/ ${Math.round(discountedPrice)}`
        
        return {
          ...tour,
          disabled: false, // Habilitar paquetes de temporada
          originalPrice: originalPriceStr,
          originalPriceValue: originalPrice,
          priceValue: discountedPrice,
          price: newPriceStr,
          seasonalDiscount: discount
        }
      }
      
      return tour
    })
    
    saveTours(updatedTours)
    setActiveSeason(seasonName)
    localStorage.setItem('activeSeason', seasonName)
  }

  const removeSeasonFilter = () => {
    const updatedTours = tourList.map(tour => {
      if (tour.originalPriceValue) {
        return {
          ...tour,
          priceValue: tour.originalPriceValue,
          price: tour.originalPrice || tour.price,
          seasonalDiscount: undefined,
          originalPrice: undefined,
          originalPriceValue: undefined
        }
      }
      return tour
    })
    
    saveTours(updatedTours)
    setActiveSeason(null)
    localStorage.removeItem('activeSeason')
  }

  const toggleSeasonForTour = (tourId: string, seasonName: string) => {
    const updatedTours = tourList.map(tour => {
      if (tour.id === tourId) {
        const currentSeasons = tour.seasons || []
        const hasSeason = currentSeasons.includes(seasonName)
        
        return {
          ...tour,
          seasons: hasSeason
            ? currentSeasons.filter(s => s !== seasonName)
            : [...currentSeasons, seasonName]
        }
      }
      return tour
    })
    
    saveTours(updatedTours)
  }

  // Cargar temporada activa al iniciar
  useEffect(() => {
    const savedSeason = localStorage.getItem('activeSeason')
    if (savedSeason) {
      setActiveSeason(savedSeason)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const filteredTours = tourList.filter(tour =>
    tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
            <p className="text-sm text-gray-500">Gestiona tus paquetes turísticos</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('¿Restablecer todos los paquetes a los datos originales? Esto eliminará todos los cambios guardados.')) {
                  localStorage.removeItem('tours')
                  // Forzar recarga de datos originales procesados
                  window.location.reload()
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
              title="Restablecer datos originales"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline text-sm">Restablecer</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de paquetes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{tourList.length}</p>
              </div>
              <div className="w-12 h-12 bg-brand-teal/10 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-brand-teal" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paquetes activos</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {tourList.filter(t => !t.disabled).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paquetes deshabilitados</p>
                <p className="text-3xl font-bold text-gray-400 mt-1">
                  {tourList.filter(t => t.disabled).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Season Manager */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-purple-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
                Filtros de Temporada
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Activa/desactiva paquetes y aplica descuentos según la temporada
              </p>
            </div>
            <button
              onClick={() => setShowSeasonManager(!showSeasonManager)}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-purple-200 rounded-lg text-sm font-semibold text-purple-700 transition-colors"
            >
              {showSeasonManager ? 'Ocultar' : 'Gestionar'}
            </button>
          </div>

          {activeSeason && (
            <div className="bg-white border border-purple-300 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Temporada activa: {activeSeason}</p>
                    <p className="text-xs text-gray-500">Los paquetes configurados para esta temporada están habilitados con descuentos aplicados</p>
                  </div>
                </div>
                <button
                  onClick={removeSeasonFilter}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  Desactivar
                </button>
              </div>
            </div>
          )}

          {showSeasonManager && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SeasonCard
                name="Verano"
                icon={<Sun className="w-6 h-6" />}
                color="from-yellow-400 to-orange-500"
                description="Playa, lomas verdes, full days"
                discount={10}
                isActive={activeSeason === 'Verano'}
                onApply={(discount) => applySeasonFilter('Verano', discount)}
              />
              <SeasonCard
                name="Invierno"
                icon={<Snowflake className="w-6 h-6" />}
                color="from-blue-400 to-cyan-500"
                description="Nevados, termas, aventura"
                discount={15}
                isActive={activeSeason === 'Invierno'}
                onApply={(discount) => applySeasonFilter('Invierno', discount)}
              />
              <SeasonCard
                name="Semana Santa"
                icon={<CalendarIcon className="w-6 h-6" />}
                color="from-purple-400 to-pink-500"
                description="Ayacucho, turismo religioso"
                discount={5}
                isActive={activeSeason === 'Semana Santa'}
                onApply={(discount) => applySeasonFilter('Semana Santa', discount)}
              />
              <SeasonCard
                name="Fiestas Patrias"
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 6v15H3v-2h2V3h9v1h5v15h2v2h-4V6h-3zm-4 5v7h2v-7h-2z"/></svg>}
                color="from-red-400 to-red-600"
                description="Destinos nacionales"
                discount={8}
                isActive={activeSeason === 'Fiestas Patrias'}
                onApply={(discount) => applySeasonFilter('Fiestas Patrias', discount)}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Buscar paquete por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-brand-teal hover:bg-brand-teal-d text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar paquete
            </button>
          </div>
        </div>

        {/* Tours List */}
        <div className="space-y-4">
          {filteredTours.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron paquetes</p>
            </div>
          ) : (
            filteredTours.map(tour => (
              <TourCard
                key={tour.id}
                tour={tour}
                onToggle={() => toggleTourStatus(tour.id)}
                onEdit={() => setEditingTour(tour)}
                onDelete={() => deleteTour(tour.id)}
              />
            ))
          )}
        </div>
      </main>

      {/* Modals */}
      {showAddForm && (
        <TourFormModal
          onClose={() => setShowAddForm(false)}
          onSave={(newTour) => {
            saveTours([...tourList, newTour])
            setShowAddForm(false)
          }}
        />
      )}

      {editingTour && (
        <TourFormModal
          tour={editingTour}
          onClose={() => setEditingTour(null)}
          onSave={(updatedTour) => {
            const updatedTours = tourList.map(t =>
              t.id === updatedTour.id ? updatedTour : t
            )
            saveTours(updatedTours)
            setEditingTour(null)
          }}
        />
      )}
    </div>
  )
}

// ─── Tour Card Component ──────────────────────────────────────────────────────

interface TourCardProps {
  tour: Tour
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

function TourCard({ tour, onToggle, onEdit, onDelete }: TourCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
      tour.disabled ? 'border-gray-200 opacity-60' : 'border-brand-teal/20'
    }`}>
      <div className="p-6">
        <div className="flex gap-4">
          {/* Imagen */}
          <img
            src={tour.image}
            alt={tour.name}
            className="w-24 h-24 rounded-lg object-cover shrink-0"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{tour.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {tour.location} · {tour.region}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                tour.disabled 
                  ? 'bg-gray-100 text-gray-600' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {tour.disabled ? 'Deshabilitado' : 'Activo'}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {tour.days}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {tour.price}
              </span>
              <span className="bg-brand-yellow/20 text-brand-yellow px-2 py-0.5 rounded-full font-semibold">
                {tour.tag}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onToggle}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tour.disabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tour.disabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {tour.disabled ? 'Habilitar' : 'Deshabilitar'}
              </button>

              <button
                onClick={onEdit}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>

              <button
                onClick={onDelete}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tour Form Modal ──────────────────────────────────────────────────────────

interface TourFormModalProps {
  tour?: Tour
  onClose: () => void
  onSave: (tour: Tour) => void
}

// ─── Season Card Component ────────────────────────────────────────────────────

interface SeasonCardProps {
  name: string
  icon: React.ReactNode
  color: string
  description: string
  discount: number
  isActive: boolean
  onApply: (discount: number) => void
}

function SeasonCard({ name, icon, color, description, discount, isActive, onApply }: SeasonCardProps) {
  const [customDiscount, setCustomDiscount] = useState(discount)

  return (
    <div className={`relative rounded-xl p-5 text-white overflow-hidden transition-all ${isActive ? 'ring-4 ring-purple-400 scale-105' : ''}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-90`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            {icon}
          </div>
          {isActive && (
            <div className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
              ACTIVA
            </div>
          )}
        </div>
        <h4 className="font-bold text-lg mb-1">{name}</h4>
        <p className="text-white/80 text-xs mb-4 leading-tight">{description}</p>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-3">
          <label className="block text-xs font-semibold mb-2 flex items-center gap-1">
            <Percent className="w-3 h-3" />
            Descuento
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="50"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(Number(e.target.value))}
              className="flex-1 accent-white"
            />
            <span className="text-lg font-bold w-12 text-right">{customDiscount}%</span>
          </div>
        </div>

        <button
          onClick={() => onApply(customDiscount)}
          disabled={isActive}
          className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
            isActive
              ? 'bg-white/30 cursor-not-allowed'
              : 'bg-white/90 hover:bg-white text-gray-900 hover:scale-105'
          }`}
        >
          {isActive ? 'Ya aplicado' : 'Aplicar temporada'}
        </button>
      </div>
    </div>
  )
}

// ─── Tour Form Modal ──────────────────────────────────────────────────────────

function TourFormModal({ tour, onClose, onSave }: TourFormModalProps) {
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'details' | 'itinerary' | 'media'>('basic')
  
  const [formData, setFormData] = useState<Partial<Tour>>(() => {
    if (tour) {
      // Si estamos editando, aseguramos que el itinerario tenga el formato correcto
      return {
        ...tour,
        itinerary: tour.itinerary?.map(day => ({
          ...day,
          activities: normalizeActivities(day.activities || [])
        })) || []
      }
    }
    
    // Si es nuevo paquete
    return {
      id: `tour-${Date.now()}`,
      name: '',
      location: '',
      region: 'Lima',
      price: 'S/ 0',
      priceValue: 0,
      days: '1 día',
      tag: 'Aventura',
      image: '/placeholder.jpg',
      images: [],
      brochure: '',
      rating: 5.0,
      reviewCount: 0,
      groupSize: 'Grupos pequeños',
      includes: [],
      notIncludes: [],
      notes: [],
      recommendations: [],
      itinerary: [],
      disabled: false,
    }
  })

  // Helpers para arrays
  const addToArray = (field: keyof Tour, value: string) => {
    if (!value.trim()) return
    const currentArray = (formData[field] as string[]) || []
    setFormData({ ...formData, [field]: [...currentArray, value.trim()] })
  }

  const removeFromArray = (field: keyof Tour, index: number) => {
    const currentArray = (formData[field] as string[]) || []
    setFormData({ ...formData, [field]: currentArray.filter((_, i) => i !== index) })
  }

  const updateArrayItem = (field: keyof Tour, index: number, value: string) => {
    const currentArray = (formData[field] as string[]) || []
    const updated = [...currentArray]
    updated[index] = value
    setFormData({ ...formData, [field]: updated })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación: al menos un ítem en itinerario
    if (!formData.itinerary || formData.itinerary.length === 0) {
      alert('Agrega al menos un día de itinerario')
      setActiveFormTab('itinerary')
      return
    }

    // Validación: cada día debe tener al menos una actividad
    const dayWithoutActivities = formData.itinerary.find(day => day.activities.length === 0)
    if (dayWithoutActivities) {
      alert(`El día ${dayWithoutActivities.day} no tiene actividades. Agrega al menos una.`)
      setActiveFormTab('itinerary')
      return
    }
    
    onSave(formData as Tour)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {tour ? 'Editar paquete' : 'Agregar nuevo paquete'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6 bg-gray-50 overflow-x-auto">
          <button
            onClick={() => setActiveFormTab('basic')}
            className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeFormTab === 'basic'
                ? 'border-brand-teal text-brand-teal'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Básica
          </button>
          <button
            onClick={() => setActiveFormTab('details')}
            className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeFormTab === 'details'
                ? 'border-brand-teal text-brand-teal'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ✨ Detalles
          </button>
          <button
            onClick={() => setActiveFormTab('itinerary')}
            className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeFormTab === 'itinerary'
                ? 'border-brand-teal text-brand-teal'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🗓️ Itinerario
          </button>
          <button
            onClick={() => setActiveFormTab('media')}
            className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeFormTab === 'media'
                ? 'border-brand-teal text-brand-teal'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📁 PDF e Imágenes
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* TAB: BASIC INFO */}
          {activeFormTab === 'basic' && (
            <BasicInfoForm formData={formData} setFormData={setFormData} />
          )}

          {/* TAB: ADVANCED DETAILS */}
          {activeFormTab === 'details' && (
            <AdvancedDetailsForm 
              formData={formData} 
              addToArray={addToArray}
              removeFromArray={removeFromArray}
              updateArrayItem={updateArrayItem}
            />
          )}

          {/* TAB: ITINERARY */}
          {activeFormTab === 'itinerary' && (
            <ItineraryForm 
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {/* TAB: MEDIA (PDF & IMAGES) */}
          {activeFormTab === 'media' && (
            <MediaForm 
              formData={formData}
              setFormData={setFormData}
            />
          )}

          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-brand-teal hover:bg-brand-teal-d text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {tour ? 'Guardar cambios' : 'Agregar paquete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


// ─── Basic Info Form ──────────────────────────────────────────────────────────

interface BasicInfoFormProps {
  formData: Partial<Tour>
  setFormData: (data: Partial<Tour>) => void
}

function BasicInfoForm({ formData, setFormData }: BasicInfoFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nombre del paquete *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
          placeholder="Ej: Machu Picchu 3D/2N"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ubicación *
        </label>
        <input
          type="text"
          required
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
          placeholder="Ej: Cusco, Perú"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Región *
        </label>
        <select
          required
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
        >
          <option value="Lima">Lima</option>
          <option value="Ica">Ica</option>
          <option value="Ayacucho">Ayacucho</option>
          <option value="Junín / Pasco">Junín / Pasco</option>
          <option value="Cusco">Cusco</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Precio (texto) *
        </label>
        <input
          type="text"
          required
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
          placeholder="Ej: S/ 180"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Precio (valor numérico) *
        </label>
        <input
          type="number"
          required
          value={formData.priceValue}
          onChange={(e) => setFormData({ ...formData, priceValue: Number(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
          placeholder="180"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Duración *
        </label>
        <input
          type="text"
          required
          value={formData.days}
          onChange={(e) => setFormData({ ...formData, days: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
          placeholder="Ej: Full Day"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Etiqueta *
        </label>
        <select
          required
          value={formData.tag}
          onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
        >
          <option value="Más popular">Más popular</option>
          <option value="Aventura">Aventura</option>
          <option value="Cultural">Cultural</option>
          <option value="Naturaleza">Naturaleza</option>
          <option value="Relax">Relax</option>
          <option value="Playa">Playa</option>
          <option value="Selva">Selva</option>
          <option value="Nevado">Nevado</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          URL de la imagen principal *
        </label>
        <input
          type="text"
          required
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
          placeholder="/ruta/a/imagen.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Rating
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={formData.rating || 5.0}
          onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Número de reseñas
        </label>
        <input
          type="number"
          value={formData.reviewCount || 0}
          onChange={(e) => setFormData({ ...formData, reviewCount: Number(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tamaño de grupo
        </label>
        <input
          type="text"
          value={formData.groupSize || 'Grupos pequeños'}
          onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
          placeholder="Ej: Grupos pequeños, Hasta 20 personas"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          🗓️ Temporadas Disponibles
        </label>
        <div className="flex flex-wrap gap-2">
          {['Verano', 'Invierno', 'Primavera', 'Otoño', 'Semana Santa', 'Fiestas Patrias', 'Año Nuevo'].map(season => {
            const isSelected = (formData.seasons || []).includes(season)
            return (
              <button
                key={season}
                type="button"
                onClick={() => {
                  const currentSeasons = formData.seasons || []
                  const newSeasons = isSelected
                    ? currentSeasons.filter(s => s !== season)
                    : [...currentSeasons, season]
                  setFormData({ ...formData, seasons: newSeasons })
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {season}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Selecciona las temporadas en las que este paquete estará disponible. Los filtros de temporada activarán automáticamente estos paquetes.
        </p>
      </div>
    </div>
  )
}

// ─── Advanced Details Form ────────────────────────────────────────────────────

interface AdvancedDetailsFormProps {
  formData: Partial<Tour>
  addToArray: (field: keyof Tour, value: string) => void
  removeFromArray: (field: keyof Tour, index: number) => void
  updateArrayItem: (field: keyof Tour, index: number, value: string) => void
}

function AdvancedDetailsForm({ formData, addToArray, removeFromArray, updateArrayItem }: AdvancedDetailsFormProps) {
  const [newInclude, setNewInclude] = useState('')
  const [newNotInclude, setNewNotInclude] = useState('')
  const [newRecommendation, setNewRecommendation] = useState('')
  const [newNote, setNewNote] = useState('')

  return (
    <div className="space-y-6">
      {/* Incluye */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ✅ Incluye
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newInclude}
            onChange={(e) => setNewInclude(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addToArray('includes', newInclude)
                setNewInclude('')
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
            placeholder="Ej: Transporte ida y vuelta"
          />
          <button
            type="button"
            onClick={() => {
              addToArray('includes', newInclude)
              setNewInclude('')
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-1">
          {(formData.includes || []).map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <input
                type="text"
                value={item}
                onChange={(e) => updateArrayItem('includes', i, e.target.value)}
                className="flex-1 bg-transparent focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => removeFromArray('includes', i)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* No Incluye */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ❌ No incluye
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newNotInclude}
            onChange={(e) => setNewNotInclude(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addToArray('notIncludes', newNotInclude)
                setNewNotInclude('')
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
            placeholder="Ej: Comidas no especificadas"
          />
          <button
            type="button"
            onClick={() => {
              addToArray('notIncludes', newNotInclude)
              setNewNotInclude('')
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-1">
          {(formData.notIncludes || []).map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <input
                type="text"
                value={item}
                onChange={(e) => updateArrayItem('notIncludes', i, e.target.value)}
                className="flex-1 bg-transparent focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => removeFromArray('notIncludes', i)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendaciones */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          💡 Recomendaciones
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newRecommendation}
            onChange={(e) => setNewRecommendation(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addToArray('recommendations', newRecommendation)
                setNewRecommendation('')
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
            placeholder="Ej: Llevar bloqueador solar"
          />
          <button
            type="button"
            onClick={() => {
              addToArray('recommendations', newRecommendation)
              setNewRecommendation('')
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-1">
          {(formData.recommendations || []).map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <input
                type="text"
                value={item}
                onChange={(e) => updateArrayItem('recommendations', i, e.target.value)}
                className="flex-1 bg-transparent focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => removeFromArray('recommendations', i)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notas importantes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ⚠️ Notas importantes
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addToArray('notes', newNote)
                setNewNote('')
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
            placeholder="Ej: Sujeto a disponibilidad"
          />
          <button
            type="button"
            onClick={() => {
              addToArray('notes', newNote)
              setNewNote('')
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-1">
          {(formData.notes || []).map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <input
                type="text"
                value={item}
                onChange={(e) => updateArrayItem('notes', i, e.target.value)}
                className="flex-1 bg-transparent focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => removeFromArray('notes', i)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Itinerary Form ───────────────────────────────────────────────────────────

interface ItineraryFormProps {
  formData: Partial<Tour>
  setFormData: (data: Partial<Tour>) => void
}

function ItineraryForm({ formData, setFormData }: ItineraryFormProps) {
  const [editingDay, setEditingDay] = useState<number | null>(null)

  const addDay = () => {
    const currentItinerary = formData.itinerary || []
    const newDay: DayItinerary = {
      day: currentItinerary.length + 1,
      title: '',
      summary: '',
      activities: []
    }
    setFormData({
      ...formData,
      itinerary: [...currentItinerary, newDay]
    })
    setEditingDay(currentItinerary.length)
  }

  const removeDay = (index: number) => {
    const updated = (formData.itinerary || []).filter((_, i) => i !== index)
    // Renumerar días
    const renumbered = updated.map((day, i) => ({ ...day, day: i + 1 }))
    setFormData({ ...formData, itinerary: renumbered })
    if (editingDay === index) setEditingDay(null)
  }

  const updateDay = (index: number, field: keyof DayItinerary, value: any) => {
    const updated = [...(formData.itinerary || [])]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, itinerary: updated })
  }

  const addActivity = (dayIndex: number) => {
    const updated = [...(formData.itinerary || [])]
    updated[dayIndex].activities.push({
      time: '08:00',
      description: '',
      icon: 'default'
    })
    setFormData({ ...formData, itinerary: updated })
  }

  const updateActivity = (dayIndex: number, actIndex: number, field: keyof Activity, value: any) => {
    const updated = [...(formData.itinerary || [])]
    const currentActivity = updated[dayIndex].activities[actIndex]
    updated[dayIndex].activities[actIndex] = {
      ...currentActivity,
      [field]: value
    }
    setFormData({ ...formData, itinerary: updated })
  }

  const removeActivity = (dayIndex: number, actIndex: number) => {
    const updated = [...(formData.itinerary || [])]
    updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== actIndex)
    setFormData({ ...formData, itinerary: updated })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {(formData.itinerary?.length || 0) === 0 
            ? 'No hay días agregados. Agrega al menos uno.' 
            : `${formData.itinerary?.length} día(s) en el itinerario`}
        </p>
        <button
          type="button"
          onClick={addDay}
          className="flex items-center gap-1 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal-d transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar día
        </button>
      </div>

      <div className="space-y-3">
        {(formData.itinerary || []).map((day, dayIndex) => (
          <div key={dayIndex} className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <div
              onClick={() => setEditingDay(editingDay === dayIndex ? null : dayIndex)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-brand-teal text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {day.day}
                </span>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">
                    {day.title || `Día ${day.day} (sin título)`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {day.activities.length} actividad(es)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeDay(dayIndex)
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {editingDay === dayIndex ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>

            {editingDay === dayIndex && (
              <div className="p-4 space-y-4 bg-white">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Título del día
                  </label>
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) => updateDay(dayIndex, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                    placeholder="Ej: Viaje a Machu Picchu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Resumen
                  </label>
                  <textarea
                    value={day.summary}
                    onChange={(e) => updateDay(dayIndex, 'summary', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                    placeholder="Breve descripción del día"
                    rows={2}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      Actividades
                    </label>
                    <button
                      type="button"
                      onClick={() => addActivity(dayIndex)}
                      className="text-xs flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Agregar
                    </button>
                  </div>

                  <div className="space-y-2">
                    {day.activities.map((act, actIndex) => (
                      <div key={actIndex} className="flex gap-2 items-start bg-gray-50 p-2 rounded-lg">
                        <input
                          type="time"
                          value={act.time || '08:00'}
                          onChange={(e) => updateActivity(dayIndex, actIndex, 'time', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        />
                        <select
                          value={act.icon || 'default'}
                          onChange={(e) => updateActivity(dayIndex, actIndex, 'icon', e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        >
                          <option value="default">📍 Lugar</option>
                          <option value="food">🍽️ Comida</option>
                          <option value="sleep">🛏️ Dormir</option>
                          <option value="transport">🚌 Transporte</option>
                        </select>
                        <input
                          type="text"
                          value={act.description}
                          onChange={(e) => updateActivity(dayIndex, actIndex, 'description', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand-teal"
                          placeholder="Descripción de la actividad"
                        />
                        <button
                          type="button"
                          onClick={() => removeActivity(dayIndex, actIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {day.activities.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">
                        No hay actividades. Agrega al menos una.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {(formData.itinerary?.length || 0) === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No hay días en el itinerario</p>
          <button
            type="button"
            onClick={addDay}
            className="mt-3 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal-d transition-colors text-sm"
          >
            Agregar primer día
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Media Form (PDF & Images) ────────────────────────────────────────────────

interface MediaFormProps {
  formData: Partial<Tour>
  setFormData: (data: Partial<Tour>) => void
}

function MediaForm({ formData, setFormData }: MediaFormProps) {
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const addImage = () => {
    if (!newImageUrl.trim()) return
    const currentImages = formData.images || []
    setFormData({
      ...formData,
      images: [...currentImages, newImageUrl.trim()]
    })
    setNewImageUrl('')
  }

  const removeImage = (index: number) => {
    const currentImages = formData.images || []
    setFormData({
      ...formData,
      images: currentImages.filter((_, i) => i !== index)
    })
  }

  const updateImage = (index: number, value: string) => {
    const currentImages = formData.images || []
    const updated = [...currentImages]
    updated[index] = value
    setFormData({
      ...formData,
      images: updated
    })
  }

  // Función para convertir archivo a base64 (para almacenamiento local)
  const handleFileUpload = async (file: File, type: 'pdf' | 'image') => {
    if (!file) return

    setUploading(true)
    setUploadProgress(`Procesando ${file.name}...`)

    try {
      // Verificar tamaño (máx 2MB para localStorage)
      const maxSize = 2 * 1024 * 1024 // 2MB
      if (file.size > maxSize) {
        alert(`El archivo es muy grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 2MB.\n\nRecomendación: Usa un servicio como Cloudinary o ImgBB para archivos grandes.`)
        setUploading(false)
        setUploadProgress('')
        return
      }

      const reader = new FileReader()
      
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        
        if (type === 'pdf') {
          setFormData({ ...formData, brochure: base64 })
          setUploadProgress(`✅ PDF cargado: ${file.name}`)
        } else {
          const currentImages = formData.images || []
          setFormData({
            ...formData,
            images: [...currentImages, base64]
          })
          setUploadProgress(`✅ Imagen agregada: ${file.name}`)
        }
        
        setTimeout(() => {
          setUploading(false)
          setUploadProgress('')
        }, 2000)
      }

      reader.onerror = () => {
        alert('Error al leer el archivo')
        setUploading(false)
        setUploadProgress('')
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al cargar el archivo')
      setUploading(false)
      setUploadProgress('')
    }
  }

  // Función para subir a Cloudinary (requiere configuración)
  const uploadToCloudinary = async (file: File, type: 'pdf' | 'image') => {
    const cloudName = 'DEMO' // Cambiar por el cloud name real
    const uploadPreset = 'ml_default' // Cambiar por el upload preset real
    
    setUploading(true)
    setUploadProgress(`Subiendo ${file.name} a Cloudinary...`)

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('upload_preset', uploadPreset)

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${type === 'pdf' ? 'raw' : 'image'}/upload`,
        {
          method: 'POST',
          body: uploadFormData,
        }
      )

      const data = await response.json()

      if (data.secure_url) {
        if (type === 'pdf') {
          setFormData({ ...formData, brochure: data.secure_url })
        } else {
          const currentImages = formData.images || []
          setFormData({
            ...formData,
            images: [...currentImages, data.secure_url]
          })
        }
        setUploadProgress(`✅ Archivo subido exitosamente`)
        setTimeout(() => {
          setUploading(false)
          setUploadProgress('')
        }, 2000)
      } else {
        throw new Error('No se recibió URL del archivo')
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error)
      alert('Error al subir a Cloudinary. Verifica tu configuración o usa la opción de carga local.')
      setUploading(false)
      setUploadProgress('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 flex items-center gap-3">
          {uploading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
          <span className="text-sm text-blue-800 font-medium">{uploadProgress}</span>
        </div>
      )}

      {/* Brochure PDF */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-1h8v1H8zm0-3v-1h8v1H8zm0-3V10h5v1H8z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">📄 Brochure PDF del paquete</h3>
            <p className="text-sm text-gray-600 mb-3">
              Sube el archivo PDF con la información completa del paquete
            </p>

            {/* Upload Button */}
            <div className="mb-3">
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors w-fit">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="font-semibold text-sm">Seleccionar PDF</span>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'pdf')
                  }}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Or Manual URL */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-red-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-red-50 px-2 text-gray-500">o ingresa URL manualmente</span>
              </div>
            </div>

            <input
              type="text"
              value={formData.brochure || ''}
              onChange={(e) => setFormData({ ...formData, brochure: e.target.value })}
              className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white mt-3"
              placeholder="https://... o /brochures/nombre.pdf"
            />
          </div>
        </div>

        {formData.brochure && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                  {formData.brochure.substring(0, 50)}...
                </span>
              </div>
              <div className="flex items-center gap-2">
                {formData.brochure.startsWith('http') && (
                  <a
                    href={formData.brochure}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-600 hover:text-red-700 font-semibold"
                  >
                    Ver PDF →
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, brochure: '' })}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gallery Images */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">🖼️ Galería de imágenes</h3>
            <p className="text-sm text-gray-600 mb-3">
              Agrega múltiples imágenes que se mostrarán en el carrusel del paquete
            </p>

            {/* Upload Button */}
            <div className="mb-3">
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors w-fit">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-sm">Seleccionar Imágenes</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    files.forEach(file => handleFileUpload(file, 'image'))
                  }}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Or Manual URL */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-blue-50 px-2 text-gray-500">o ingresa URL manualmente</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3 mb-4">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addImage()
                  }
                }}
                className="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="https://... o /carpeta/imagen.jpg"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Images List */}
            {(formData.images || []).length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  {formData.images?.length || 0} imagen(es) en la galería
                </p>
                {(formData.images || []).map((img, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-blue-200">
                    <img 
                      src={img} 
                      alt={`Preview ${i + 1}`} 
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E?%3C/text%3E%3C/svg%3E'
                      }}
                    />
                    <input
                      type="text"
                      value={img.substring(0, 60)}
                      onChange={(e) => updateImage(i, e.target.value)}
                      className="flex-1 px-2 py-1 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded border border-transparent hover:border-blue-200"
                      title={img}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-blue-300">
                <ImageIcon className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No hay imágenes en la galería</p>
                <p className="text-xs text-gray-400 mt-1">Sube imágenes usando el botón de arriba</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-purple-900">
            <p className="font-bold mb-2">💡 Opciones de almacenamiento:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-white/50 rounded p-2">
                <p className="font-semibold text-purple-800">✅ Opción 1: Carga directa (Recomendado para pruebas)</p>
                <p className="text-purple-700 mt-1">Los archivos se convierten a Base64 y se guardan en el navegador. Límite: 2MB por archivo.</p>
              </div>
              <div className="bg-white/50 rounded p-2">
                <p className="font-semibold text-purple-800">✅ Opción 2: Cloudinary (Producción)</p>
                <p className="text-purple-700 mt-1">Crea cuenta gratis en <a href="https://cloudinary.com" target="_blank" className="underline font-semibold">cloudinary.com</a> (25GB gratis). Configura las credenciales en el código.</p>
              </div>
              <div className="bg-white/50 rounded p-2">
                <p className="font-semibold text-purple-800">✅ Opción 3: URL externa</p>
                <p className="text-purple-700 mt-1">Sube a Google Drive, Dropbox o cualquier servicio y pega el link público.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

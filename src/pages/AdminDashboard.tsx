import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tours, type Tour, type DayItinerary, type Activity } from '../data/tours'
import { normalizeToTime24, normalizeActivities } from '../utils/timeFormat'
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, LogOut, Save, X, 
  Package, DollarSign, MapPin, Clock, Image as ImageIcon,
  Sun, Snowflake, Leaf, Calendar as CalendarIcon, Percent, Tag,
  MessageSquare, Database, ShoppingCart, Download
} from 'lucide-react'
import Navbar from '../components/Navbar'

// API Helpers
const API_URL = (import.meta as any).env?.VITE_API_URL || ''

// Package Intelligence Functions
function analyzePackageType(label: string, price: string) {
  const labelLower = label.toLowerCase()
  const priceNum = parseFloat(price.replace(/[^\d.]/g, '')) || 0
  
  const analysis = {
    type: 'unknown',
    personsIncluded: 1,
    isFixed: false,
    isGroup: false,
    isCouple: false,
    description: '',
    examples: [] as string[]
  }
  
  // Detectar patrones específicos
  if (labelLower.includes('quintuple') || labelLower.includes('quíntuple')) {
    analysis.type = 'habitacion-fija'
    analysis.personsIncluded = 5
    analysis.isFixed = true
    analysis.description = 'Habitación fija para 5 personas'
    analysis.examples = [
      '5 personas → 1 Quintuple (S/ ' + priceNum.toFixed(0) + ')',
      '6 personas → 1 Quintuple + 1 individual',
      '10 personas → 2 Quintuples exactos'
    ]
  } else if (labelLower.includes('cuádruple') || labelLower.includes('cuadruple')) {
    analysis.type = 'habitacion-fija'
    analysis.personsIncluded = 4
    analysis.isFixed = true
    analysis.description = 'Habitación fija para 4 personas'
    analysis.examples = [
      '4 personas → 1 Cuádruple (S/ ' + priceNum.toFixed(0) + ')',
      '5 personas → 1 Cuádruple + 1 individual',
      '8 personas → 2 Cuádruples exactos'
    ]
  } else if (labelLower.includes('triple') && !labelLower.includes('a partir de')) {
    analysis.type = 'habitacion-fija'
    analysis.personsIncluded = 3
    analysis.isFixed = true
    analysis.description = 'Habitación fija para 3 personas'
    analysis.examples = [
      '3 personas → 1 Triple (S/ ' + priceNum.toFixed(0) + ')',
      '4 personas → 1 Triple + 1 individual',
      '6 personas → 2 Triples exactos'
    ]
  } else if ((labelLower.includes('doble') || labelLower.includes('matrimonial')) && !labelLower.includes('pareja')) {
    analysis.type = 'habitacion-fija'
    analysis.personsIncluded = 2
    analysis.isFixed = true
    analysis.description = 'Habitación fija para 2 personas'
    analysis.examples = [
      '2 personas → 1 Doble (S/ ' + priceNum.toFixed(0) + ')',
      '3 personas → 1 Doble + 1 individual',
      '4 personas → 2 Dobles exactos'
    ]
  } else if (labelLower.includes('pareja') || labelLower.includes('parejas')) {
    analysis.type = 'promo-pareja'
    analysis.personsIncluded = 2
    analysis.isCouple = true
    analysis.description = 'Promoción de parejas (precio total para 2)'
    analysis.examples = [
      '2 personas → S/ ' + priceNum.toFixed(0) + ' total (ambos incluidos)',
      '4 personas → 2 Promos de pareja = S/ ' + (priceNum * 2).toFixed(0),
      '6 personas → 3 Promos de pareja = S/ ' + (priceNum * 3).toFixed(0)
    ]
  } else if (labelLower.includes('a partir de 3') || labelLower.includes('apartir de 3')) {
    analysis.type = 'precio-grupal'
    analysis.personsIncluded = 1
    analysis.isGroup = true
    analysis.description = 'Precio por persona cuando hay 3 o más'
    analysis.examples = [
      '3 personas → S/ ' + priceNum.toFixed(0) + ' c/u = S/ ' + (priceNum * 3).toFixed(0),
      '5 personas → S/ ' + priceNum.toFixed(0) + ' c/u = S/ ' + (priceNum * 5).toFixed(0),
      'Siempre disponible si el tour total ≥ 3 personas'
    ]
  } else if (labelLower.includes('individual') || labelLower.includes('1 persona')) {
    analysis.type = 'individual'
    analysis.personsIncluded = 1
    analysis.description = 'Precio individual por persona'
    analysis.examples = [
      '1 persona → S/ ' + priceNum.toFixed(0),
      '2 personas → S/ ' + priceNum.toFixed(0) + ' c/u = S/ ' + (priceNum * 2).toFixed(0),
      'Recomendado solo para tours de 1-2 personas'
    ]
  } else {
    analysis.description = 'Paquete estándar (revisar configuración)'
    analysis.examples = [
      'No se detectó tipo específico',
      'Verifica el nombre del paquete',
      'Añade palabras clave: Triple, Cuádruple, etc.'
    ]
  }
  
  return analysis
}

// Package Intelligence Display Component
function PackageIntelligence({ label, price }: { label: string, price: string }) {
  if (!label || !price) return null
  
  const analysis = analyzePackageType(label, price)
  const color = getTypeColor(analysis.type)
  const icon = getTypeIcon(analysis.type)
  
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    pink: 'bg-pink-50 border-pink-200 text-pink-800', 
    green: 'bg-green-50 border-green-200 text-green-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  }
  
  return (
    <div className={`mt-3 p-3 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-start gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{analysis.description}</p>
          <p className="text-xs opacity-80 mt-1">
            {analysis.isFixed && `Agrupa ${analysis.personsIncluded} personas automáticamente`}
            {analysis.isCouple && `Precio total dividido entre 2 personas`}
            {analysis.isGroup && `Se aplica individualmente cuando hay 3+ personas totales`}
            {analysis.type === 'individual' && `Precio por persona individual`}
            {analysis.type === 'unknown' && `Añade palabras clave para mejor detección`}
          </p>
        </div>
      </div>
      
      {analysis.examples.length > 0 && (
        <div className="mt-2 pt-2 border-t border-current border-opacity-20">
          <p className="text-xs font-semibold mb-1">🧪 Ejemplos de uso:</p>
          <ul className="text-xs space-y-0.5 opacity-90">
            {analysis.examples.map((example, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-current opacity-60 shrink-0">•</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function getTypeColor(type: string) {
  switch (type) {
    case 'habitacion-fija': return 'blue'
    case 'promo-pareja': return 'pink'
    case 'precio-grupal': return 'green'
    case 'individual': return 'gray'
    default: return 'yellow'
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'habitacion-fija': return '🏨'
    case 'promo-pareja': return '💕'
    case 'precio-grupal': return '👥'
    case 'individual': return '👤'
    default: return '📦'
  }
}

async function fetchTours(): Promise<Tour[]> {
  try {
    const res = await fetch(`${API_URL}/api/tours`)
    
    if (!res.ok) {
      const text = await res.text()
      console.error(`❌ API /api/tours returned ${res.status}:`, text)
      return []
    }
    
    const data = await res.json()
    if (data.ok && data.tours) {
      return data.tours.map((t: any) => ({
        ...t,
        itinerary: (t.itinerary || []).map((day: any) => ({
          ...day,
          activities: normalizeActivities(day.activities || [])
        }))
      }))
    }
    return []
  } catch (error) {
    console.error('Error fetching tours:', error)
    return []
  }
}

async function saveTourToAPI(tour: Tour): Promise<boolean> {
  if (!API_URL) {
    console.error('❌ API_URL is not defined!')
    alert('❌ Error: API_URL no está configurado')
    return false
  }
  
  try {
    const method = tour._id ? 'PUT' : 'POST'
    const url = tour._id ? `${API_URL}/api/tours/${tour.id}` : `${API_URL}/api/tours`
    
    console.log(`🔄 ${method} request to:`, url)
    console.log('🔄 Tour data:', {
      name: tour.name,
      id: tour.id,
      _id: tour._id,
      hasItinerary: !!tour.itinerary?.length
    })
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tour)
    })
    
    if (!res.ok) {
      const text = await res.text()
      console.error(`❌ API ${method} ${url} returned ${res.status}:`, text)
      alert(`❌ Error ${method} tour: ${res.status} - ${text}`)
      return false
    }
    
    const data = await res.json()
    console.log('📥 API response:', data)
    
    if (data.ok) {
      console.log('✅ Tour saved successfully to MongoDB')
      return true
    } else {
      console.error('❌ API returned ok=false:', data)
      alert(`❌ API error: ${JSON.stringify(data)}`)
      return false
    }
  } catch (error) {
    console.error('❌ Network/fetch error:', error)
    alert(`❌ Network error: ${error.message}`)
    return false
  }
}

async function deleteTourFromAPI(tourId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/tours/${tourId}`, { method: 'DELETE' })
    
    if (!res.ok) {
      const text = await res.text()
      console.error(`❌ API DELETE /api/tours/${tourId} returned ${res.status}:`, text)
      return false
    }
    
    const data = await res.json()
    return data.ok
  } catch (error) {
    console.error('Error deleting tour:', error)
    return false
  }
}

interface Testimonial {
  _id?: string
  name: string
  location: string
  avatar: string
  text: string
  stars: number
  createdAt?: Date
}

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'tours' | 'testimonials' | 'purchases'>('tours')
  const [tourList, setTourList] = useState<Tour[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSeasonManager, setShowSeasonManager] = useState(false)
  const [activeSeason, setActiveSeason] = useState<string | null>(null)
  const [showSeasonConfig, setShowSeasonConfig] = useState(false)
  const [configuringSeason, setConfiguringSeason] = useState<string | null>(null)
  
  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [showTestimonialForm, setShowTestimonialForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  
  // Purchases state
  const [purchases, setPurchases] = useState<any[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(false)
  
  // DB status
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login')
      return
    }

    // Cargar tours desde MongoDB API
    async function loadTours() {
      const toursFromAPI = await fetchTours()
      if (toursFromAPI.length > 0) {
        setTourList(toursFromAPI)
      } else {
        // Si no hay tours en BD, usar datos iniciales (fallback)
        const processedOriginalTours = tours.map((tour: Tour) => ({
          ...tour,
          itinerary: (tour.itinerary || []).map(day => ({
            ...day,
            activities: normalizeActivities(day.activities || [])
          }))
        }))
        setTourList(processedOriginalTours)
      }
    }
    loadTours()
  }, [isAuthenticated, navigate])

  const saveTours = async (newTours: Tour[]) => {
    // Normalizar todas las horas a formato 24h antes de guardar
    const normalizedTours = newTours.map(tour => ({
      ...tour,
      itinerary: (tour.itinerary || []).map(day => ({
        ...day,
        activities: normalizeActivities(day.activities || [])
      }))
    }))
    
    setTourList(normalizedTours)
    
    // Guardar cada tour en MongoDB
    let allSuccess = true
    for (const tour of normalizedTours) {
      console.log('💾 Guardando tour:', tour.name, tour.id)
      const success = await saveTourToAPI(tour)
      if (!success) {
        console.error('❌ Error guardando tour:', tour.name)
        allSuccess = false
      } else {
        console.log('✅ Tour guardado exitosamente:', tour.name)
      }
    }
    
    if (!allSuccess) {
      alert('❌ Error: Algunos tours no se pudieron guardar. Revisa la consola para más detalles.')
    } else {
      console.log('✅ Todos los tours guardados exitosamente')
    }
  }

  const toggleTourStatus = (tourId: string) => {
    const updatedTours = tourList.map(tour =>
      tour.id === tourId ? { ...tour, disabled: !tour.disabled } : tour
    )
    saveTours(updatedTours)
  }

  const deleteTour = async (tourId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paquete?')) {
      const success = await deleteTourFromAPI(tourId)
      if (success) {
        const updatedTours = tourList.filter(tour => tour.id !== tourId)
        setTourList(updatedTours)
      } else {
        alert('Error al eliminar el paquete')
      }
    }
  }

  // ─── Season Management ────────────────────────────────────────────────────

  const applySeasonFilter = (seasonName: string, discount: number) => {
    // Mantener el orden original de los tours al aplicar filtros
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
      } else {
        // Deshabilitar paquetes que NO pertenecen a la temporada activa
        return {
          ...tour,
          disabled: true
        }
      }
    })
    
    // Guardar manteniendo el orden
    setTourList(updatedTours)
    // Guardar cada tour actualizado en MongoDB
    updatedTours.forEach(tour => saveTourToAPI(tour))
    setActiveSeason(seasonName)
    localStorage.setItem('activeSeason', seasonName)
    localStorage.setItem('activeSeasonDiscount', discount.toString())
  }

  const removeSeasonFilter = () => {
    const updatedTours = tourList.map(tour => {
      // Restaurar precios originales
      const updates: Partial<Tour> = {
        disabled: false // Habilitar todos los paquetes
      }
      
      if (tour.originalPriceValue) {
        updates.priceValue = tour.originalPriceValue
        updates.price = tour.originalPrice || tour.price
        updates.seasonalDiscount = undefined
        updates.originalPrice = undefined
        updates.originalPriceValue = undefined
      }
      
      return { ...tour, ...updates }
    })
    
    // Guardar manteniendo el orden
    setTourList(updatedTours)
    // Guardar cada tour actualizado en MongoDB
    updatedTours.forEach(tour => saveTourToAPI(tour))
    setActiveSeason(null)
    localStorage.removeItem('activeSeason')
    localStorage.removeItem('activeSeasonDiscount')
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

  // Check DB status and load testimonials
  useEffect(() => {
    checkDBStatus()
    if (activeTab === 'testimonials') {
      loadTestimonials()
    } else if (activeTab === 'purchases') {
      loadPurchases()
    }
  }, [activeTab])

  const checkDBStatus = async () => {
    try {
      const res = await fetch('/api/health')
      const data = await res.json()
      setDbStatus(data.mongo?.includes('conectado') ? 'connected' : 'disconnected')
    } catch {
      setDbStatus('disconnected')
    }
  }

  const loadTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials')
      const data = await res.json()
      if (data.ok) {
        setTestimonials(data.testimonials)
      }
    } catch (err) {
      console.error('Error loading testimonials:', err)
    }
  }

  const loadPurchases = async () => {
    setLoadingPurchases(true)
    try {
      const res = await fetch('/api/compras')
      const data = await res.json()
      if (data.ok) {
        setPurchases(data.compras)
      }
    } catch (err) {
      console.error('Error loading purchases:', err)
    } finally {
      setLoadingPurchases(false)
    }
  }

  const downloadPurchasesExcel = async () => {
    try {
      // Importar xlsx dinámicamente
      const XLSX = await import('xlsx')
      
      // Preparar datos para Excel
      const excelData = purchases.map((purchase, index) => {
        const pasajeros = purchase.metadata?.pasajeros || []
        // Validar si pasajeros es array o string
        const pasajerosTexto = Array.isArray(pasajeros) 
          ? pasajeros.map((p: any) => 
              `${p.nombre || '-'} (DNI: ${p.dni || '-'}, Edad: ${p.edad || '-'})`
            ).join('; ')
          : (typeof pasajeros === 'string' ? pasajeros : 'N/A')
        
        return {
          'N°': index + 1,
          'Fecha': purchase.createdAt ? new Date(purchase.createdAt).toLocaleString('es-PE') : '',
          'Cliente': purchase.buyerName || 'No especificado',
          'DNI Cliente': purchase.metadata?.dni || 'N/A',
          'Teléfono': purchase.metadata?.telefono || 'N/A',
          'Email': purchase.email || 'N/A',
          'Monto (PEN)': purchase.amount || 0,
          'Estado': purchase.status || 'desconocido',
          'Método de Pago': purchase.paymentMethod || 'Tarjeta',
          'Tour/Paquete': purchase.description || '',
          'Fecha de Partida': purchase.metadata?.fechaViaje || 'N/A',
          'Cantidad Personas': purchase.metadata?.totalPersonas || 0,
          'Pasajeros (Nombre/DNI/Edad)': pasajerosTexto || 'N/A',
          'Punto de Embarque': purchase.metadata?.puntoEmbarque || 'N/A',
          'Habitación': purchase.metadata?.habitacion || 'N/A',
          'Comentario': purchase.metadata?.comentario || '',
          'Nota Voucher': purchase.metadata?.notaVoucher || '',
          'Cantidad Items': purchase.items ? purchase.items.length : 0
        }
      })

      // Crear workbook y worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)

      // Configurar ancho de columnas
      const colWidths = [
        { wch: 5 },  // N°
        { wch: 20 }, // Fecha
        { wch: 25 }, // Cliente
        { wch: 12 }, // DNI Cliente
        { wch: 15 }, // Teléfono
        { wch: 30 }, // Email
        { wch: 12 }, // Monto
        { wch: 12 }, // Estado
        { wch: 20 }, // Método Pago
        { wch: 40 }, // Tour/Paquete
        { wch: 15 }, // Fecha Viaje
        { wch: 10 }, // Cantidad Personas
        { wch: 60 }, // Pasajeros (Nombre/DNI/Edad)
        { wch: 30 }, // Punto Embarque
        { wch: 25 }, // Habitación
        { wch: 40 }, // Comentario
        { wch: 30 }, // Nota Voucher
        { wch: 10 }  // Cantidad Items
      ]
      ws['!cols'] = colWidths

      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Compras')

      // Generar nombre de archivo con fecha actual
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
      const filename = `peru-in-travel-compras-${dateStr}-${timeStr}.xlsx`

      // Descargar archivo
      XLSX.writeFile(wb, filename)
      
      alert(`✅ Archivo descargado: ${filename}`)
    } catch (error) {
      console.error('Error downloading Excel:', error)
      alert('❌ Error al descargar el archivo Excel')
    }
  }

  const deleteTestimonial = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este testimonio?')) return
    
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      
      if (data.ok) {
        loadTestimonials()
      } else {
        alert('Error al eliminar testimonio')
      }
    } catch (err) {
      console.error('Error deleting testimonial:', err)
      alert('Error al eliminar testimonio')
    }
  }

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
      <Navbar />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
              <p className="text-sm text-gray-500">Gestiona tu contenido</p>
            </div>
            {/* DB Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <Database className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">MongoDB:</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  dbStatus === 'connected' ? 'bg-green-500' :
                  dbStatus === 'disconnected' ? 'bg-red-500' :
                  'bg-gray-400 animate-pulse'
                }`} />
                <span className={`text-xs font-semibold ${
                  dbStatus === 'connected' ? 'text-green-600' :
                  dbStatus === 'disconnected' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {dbStatus === 'connected' ? 'Conectado' :
                   dbStatus === 'disconnected' ? 'Desconectado' :
                   'Verificando...'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'tours' && (
              <button
                onClick={async () => {
                  if (window.confirm('¿Migrar tours originales a MongoDB? Esto NO elimina los tours existentes, solo agrega los que faltan.')) {
                    // Cargar tours desde API
                    const existing = await fetchTours()
                    const existingIds = existing.map(t => t.id)
                    
                    // Filtrar tours originales que no existen en BD
                    const toursToMigrate = tours.filter(t => !existingIds.includes(t.id))
                    
                    if (toursToMigrate.length === 0) {
                      alert('Todos los tours originales ya están en la base de datos')
                      return
                    }
                    
                    // Guardar tours faltantes
                    for (const tour of toursToMigrate) {
                      await saveTourToAPI(tour)
                    }
                    
                    alert(`✅ ${toursToMigrate.length} tour(s) migrados exitosamente`)
                    window.location.reload()
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                title="Migrar tours originales a MongoDB"
              >
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Migrar originales</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('tours')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all relative ${
                activeTab === 'tours'
                  ? 'text-brand-teal border-b-2 border-brand-teal'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-4 h-4" />
              Paquetes Turísticos
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all relative ${
                activeTab === 'testimonials'
                  ? 'text-brand-teal border-b-2 border-brand-teal'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Testimonios
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all relative ${
                activeTab === 'purchases'
                  ? 'text-brand-teal border-b-2 border-brand-teal'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Compras
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'tours' ? (
          <>
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
                onConfigure={() => {
                  setConfiguringSeason('Verano')
                  setShowSeasonConfig(true)
                }}
              />
              <SeasonCard
                name="Invierno"
                icon={<Snowflake className="w-6 h-6" />}
                color="from-blue-400 to-cyan-500"
                description="Nevados, termas, aventura"
                discount={15}
                isActive={activeSeason === 'Invierno'}
                onApply={(discount) => applySeasonFilter('Invierno', discount)}
                onConfigure={() => {
                  setConfiguringSeason('Invierno')
                  setShowSeasonConfig(true)
                }}
              />
              <SeasonCard
                name="Semana Santa"
                icon={<CalendarIcon className="w-6 h-6" />}
                color="from-purple-400 to-pink-500"
                description="Ayacucho, turismo religioso"
                discount={5}
                isActive={activeSeason === 'Semana Santa'}
                onApply={(discount) => applySeasonFilter('Semana Santa', discount)}
                onConfigure={() => {
                  setConfiguringSeason('Semana Santa')
                  setShowSeasonConfig(true)
                }}
              />
              <SeasonCard
                name="Fiestas Patrias"
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 6v15H3v-2h2V3h9v1h5v15h2v2h-4V6h-3zm-4 5v7h2v-7h-2z"/></svg>}
                color="from-red-400 to-red-600"
                description="Destinos nacionales"
                discount={8}
                isActive={activeSeason === 'Fiestas Patrias'}
                onApply={(discount) => applySeasonFilter('Fiestas Patrias', discount)}
                onConfigure={() => {
                  setConfiguringSeason('Fiestas Patrias')
                  setShowSeasonConfig(true)
                }}
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
          </>
        ) : activeTab === 'testimonials' ? (
          /* Testimonials View */
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total de testimonios</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{testimonials.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Promedio de estrellas</p>
                    <p className="text-3xl font-bold text-yellow-500 mt-1">
                      {testimonials.length > 0 
                        ? (testimonials.reduce((acc, t) => acc + t.stars, 0) / testimonials.length).toFixed(1)
                        : '0'}
                      <span className="text-lg">★</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Gestiona los testimonios que aparecen en tu página web
                </p>
                <button
                  onClick={() => setShowTestimonialForm(true)}
                  className="flex items-center gap-2 bg-brand-teal hover:bg-brand-teal-d text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Agregar testimonio
                </button>
              </div>
            </div>

            {/* Testimonials List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.length === 0 ? (
                <div className="col-span-2 bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay testimonios aún</p>
                  <button
                    onClick={() => setShowTestimonialForm(true)}
                    className="mt-4 text-brand-teal hover:underline font-semibold"
                  >
                    Agregar el primero
                  </button>
                </div>
              ) : (
                testimonials.map((testimonial) => (
                  <div
                    key={testimonial._id}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">📍 {testimonial.location}</p>
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: testimonial.stars }).map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm italic mb-4">"{testimonial.text}"</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingTestimonial(testimonial)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => deleteTestimonial(testimonial._id!)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : activeTab === 'purchases' ? (
          /* Purchases View */
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total de compras</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{purchases.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Ingresos totales</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      S/ {purchases.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Compra promedio</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">
                      S/ {purchases.length > 0 ? Math.round(purchases.reduce((acc, p) => acc + (p.amount || 0), 0) / purchases.length) : 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Gestión de Compras</h3>
                  <p className="text-sm text-gray-600">
                    Visualiza y descarga todas las compras realizadas por tus clientes
                  </p>
                </div>
                <button
                  onClick={downloadPurchasesExcel}
                  disabled={purchases.length === 0}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Descargar Excel
                </button>
              </div>
            </div>

            {/* Purchases List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {loadingPurchases ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Cargando compras...</p>
                </div>
              ) : purchases.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-semibold mb-2">No hay compras registradas</p>
                  <p className="text-gray-400 text-sm">Las compras aparecerán aquí cuando los clientes realicen pagos</p>
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      <div className="col-span-2">Cliente / Contacto</div>
                      <div className="col-span-2">Paquete / Tour</div>
                      <div className="col-span-1">Fecha Partida</div>
                      <div className="col-span-1">Personas</div>
                      <div className="col-span-2">Embarque</div>
                      <div className="col-span-1 text-center">Monto</div>
                      <div className="col-span-2">Método / Estado</div>
                      <div className="col-span-1">Detalles</div>
                    </div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {purchases.map((purchase, index) => (
                      <div key={purchase._id || index} className="px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                        <div className="grid grid-cols-12 gap-3 text-sm">
                          
                          {/* Cliente / Contacto */}
                          <div className="col-span-2">
                            <div className="font-semibold text-gray-900 text-sm mb-1">
                              {purchase.buyerName || 'No especificado'}
                            </div>
                            <div className="text-xs text-gray-500 space-y-0.5">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">DNI:</span> {purchase.metadata?.dni || 'N/A'}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Tel:</span> {purchase.metadata?.telefono || 'N/A'}
                              </div>
                              {purchase.email && (
                                <div className="flex items-center gap-1 truncate" title={purchase.email}>
                                  <span className="font-medium">✉</span> {purchase.email}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : ''} {purchase.createdAt ? new Date(purchase.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </div>

                          {/* Paquete */}
                          <div className="col-span-2">
                            <div className="text-sm text-gray-900 font-medium line-clamp-2" title={purchase.description}>
                              {purchase.description || 'Sin descripción'}
                            </div>
                            {purchase.metadata?.habitacion && (
                              <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                                🛏️ {purchase.metadata.habitacion}
                              </div>
                            )}
                          </div>

                          {/* Fecha Partida */}
                          <div className="col-span-1">
                            <div className="text-xs text-gray-700 font-medium">
                              {purchase.metadata?.fechaViaje || 'N/A'}
                            </div>
                          </div>

                          {/* Personas */}
                          <div className="col-span-1">
                            <div className="flex justify-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                                {purchase.metadata?.totalPersonas || 0}
                              </span>
                            </div>
                          </div>

                          {/* Embarque */}
                          <div className="col-span-2">
                            <div className="text-xs text-gray-600 line-clamp-2" title={purchase.metadata?.puntoEmbarque}>
                              📍 {purchase.metadata?.puntoEmbarque || 'N/A'}
                            </div>
                          </div>

                          {/* Monto */}
                          <div className="col-span-1 text-center">
                            <div className="text-lg font-bold text-green-600">
                              S/ {purchase.amount || 0}
                            </div>
                          </div>

                          {/* Método / Estado */}
                          <div className="col-span-2 space-y-1">
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                              {purchase.paymentMethod || 'Tarjeta'}
                            </span>
                            <br />
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                              purchase.status === 'venta' || purchase.status === 'successful' 
                                ? 'bg-green-100 text-green-700'
                                : purchase.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {purchase.status === 'venta' ? 'Pagado' : purchase.status === 'successful' ? 'Exitoso' : purchase.status === 'failed' ? 'Fallido' : 'Pendiente'}
                            </span>
                          </div>

                          {/* Detalles - Botón expandir */}
                          <div className="col-span-1 flex items-center justify-center">
                            {(purchase.metadata?.pasajeros) || purchase.metadata?.comentario || purchase.metadata?.yapeScreenshot ? (
                              <button 
                                onClick={() => {
                                  const row = document.getElementById(`details-${purchase._id}`)
                                  if (row) {
                                    row.style.display = row.style.display === 'none' ? 'block' : 'none'
                                  }
                                }}
                                className="text-brand-teal hover:text-brand-teal-d text-xs font-semibold px-3 py-1 border border-brand-teal rounded-lg hover:bg-teal-50 transition-colors"
                              >
                                Ver más
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Fila expandible con más detalles */}
                        {(purchase.metadata?.pasajeros && purchase.metadata.pasajeros.length > 0) || purchase.metadata?.comentario || purchase.metadata?.notaVoucher || purchase.metadata?.yapeScreenshot ? (
                          <div id={`details-${purchase._id}`} style={{ display: 'none' }} className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-gray-50 rounded-lg p-4">
                              
                              {/* Captura de Yape */}
                              {purchase.metadata?.yapeScreenshot && (
                                <div className="md:col-span-2">
                                  <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    📸 Comprobante de Yape
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border-2 border-purple-200">
                                    {typeof purchase.metadata.yapeScreenshot === 'string' && purchase.metadata.yapeScreenshot.length > 50 ? (
                                      <div className="flex flex-col md:flex-row gap-4 items-start">
                                        {/* Preview de la imagen */}
                                        <div className="flex-shrink-0">
                                          <img 
                                            src={purchase.metadata.yapeScreenshot} 
                                            alt="Comprobante Yape" 
                                            className="max-w-xs max-h-80 rounded-lg shadow-md border border-gray-200 object-contain cursor-pointer hover:scale-105 transition-transform"
                                            onClick={() => {
                                              const win = window.open('', '_blank')
                                              if (win) {
                                                win.document.write(`
                                                  <html>
                                                    <head><title>Comprobante Yape - ${purchase.buyerName}</title></head>
                                                    <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#000;">
                                                      <img src="${purchase.metadata.yapeScreenshot}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                                                    </body>
                                                  </html>
                                                `)
                                              }
                                            }}
                                            title="Click para ver en tamaño completo"
                                            onError={(e) => {
                                              console.error('Error cargando imagen de Yape:', e)
                                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5FcnJvciBjYXJnYW5kbyBpbWFnZW48L3RleHQ+PC9zdmc+'
                                            }}
                                          />
                                        </div>
                                        {/* Datos de validación */}
                                        <div className="flex-1 space-y-2">
                                          <div className="bg-purple-50 rounded px-3 py-2">
                                            <span className="font-semibold text-purple-800">📱 Celular Yape:</span>
                                            <span className="ml-2 text-purple-700 font-mono">{purchase.metadata.yapePhone || 'No registrado'}</span>
                                          </div>
                                          <div className="bg-green-50 rounded px-3 py-2">
                                            <span className="font-semibold text-green-800">💰 Monto Yapeado:</span>
                                            <span className="ml-2 text-green-700 font-bold">S/ {purchase.amount.toFixed(2)}</span>
                                          </div>
                                          <div className="bg-blue-50 rounded px-3 py-2">
                                            <span className="font-semibold text-blue-800">📅 Fecha de pago:</span>
                                            <span className="ml-2 text-blue-700">{new Date(purchase.createdAt).toLocaleString('es-PE')}</span>
                                          </div>
                                          <div className="mt-3 flex gap-2">
                                            <a
                                              href={purchase.metadata.yapeScreenshot}
                                              download={`yape-${purchase.buyerName}-${purchase._id}.jpg`}
                                              className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                              </svg>
                                              Descargar
                                            </a>
                                            <button
                                              onClick={() => {
                                                const win = window.open('', '_blank')
                                                if (win) {
                                                  win.document.write(`
                                                    <html>
                                                      <head><title>Comprobante Yape - ${purchase.buyerName}</title></head>
                                                      <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#000;">
                                                        <img src="${purchase.metadata.yapeScreenshot}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                                                      </body>
                                                    </html>
                                                  `)
                                                }
                                              }}
                                              className="inline-flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                              </svg>
                                              Ver completa
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-gray-500 text-sm">
                                        <p>⚠️ Captura no disponible o corrupta</p>
                                        <p className="text-xs mt-1">El formato de la imagen no es válido</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {purchase.metadata?.pasajeros && (
                                <div>
                                  <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    👥 Pasajeros
                                  </div>
                                  <div className="space-y-1.5">
                                    {Array.isArray(purchase.metadata.pasajeros) ? (
                                      // Si es array (formato nuevo)
                                      purchase.metadata.pasajeros.map((p: any, i: number) => (
                                        <div key={i} className="text-gray-600 bg-white rounded px-2 py-1">
                                          <span className="font-medium">{i + 1}.</span> {p.nombre || 'Sin nombre'} 
                                          <span className="text-gray-500"> • DNI: {p.dni || 'N/A'} • Edad: {p.edad || 'N/A'}</span>
                                        </div>
                                      ))
                                    ) : (
                                      // Si es string (formato antiguo)
                                      <div className="text-gray-600 bg-white rounded px-2 py-1">
                                        {purchase.metadata.pasajeros}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {purchase.metadata?.comentario && (
                                <div>
                                  <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    💬 Comentario
                                  </div>
                                  <div className="text-gray-600 italic bg-white rounded px-3 py-2">
                                    "{purchase.metadata.comentario}"
                                  </div>
                                </div>
                              )}
                              {purchase.metadata?.notaVoucher && (
                                <div>
                                  <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    📎 Nota del Voucher
                                  </div>
                                  <div className="text-gray-600 bg-white rounded px-3 py-2 font-mono text-xs">
                                    {purchase.metadata.notaVoucher}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        ) : null}
      </main>

      {/* Modals */}
      {showAddForm && (
        <TourFormModal
          onClose={() => setShowAddForm(false)}
          onSave={async (newTour) => {
            await saveTours([...tourList, newTour])
            // Recargar la lista después de guardar
            const updatedTours = await fetchTours()
            if (updatedTours.length > 0) {
              setTourList(updatedTours)
            }
            setShowAddForm(false)
          }}
        />
      )}

      {editingTour && (
        <TourFormModal
          tour={editingTour}
          onClose={() => setEditingTour(null)}
          onSave={async (updatedTour) => {
            const updatedTours = tourList.map(t =>
              t.id === updatedTour.id ? updatedTour : t
            )
            await saveTours(updatedTours)
            // Recargar la lista después de guardar
            const refreshedTours = await fetchTours()
            if (refreshedTours.length > 0) {
              setTourList(refreshedTours)
            }
            setEditingTour(null)
          }}
        />
      )}

      {/* Season Configuration Modal */}
      {showSeasonConfig && configuringSeason && (
        <SeasonConfigModal
          seasonName={configuringSeason}
          tours={tourList}
          onClose={() => {
            setShowSeasonConfig(false)
            setConfiguringSeason(null)
          }}
          onToggleTour={(tourId) => toggleSeasonForTour(tourId, configuringSeason)}
        />
      )}

      {/* Testimonial Form Modal */}
      {(showTestimonialForm || editingTestimonial) && (
        <TestimonialFormModal
          testimonial={editingTestimonial}
          onClose={() => {
            setShowTestimonialForm(false)
            setEditingTestimonial(null)
          }}
          onSave={() => {
            loadTestimonials()
            setShowTestimonialForm(false)
            setEditingTestimonial(null)
          }}
        />
      )}
    </div>
  )
}

// ─── Season Config Modal ──────────────────────────────────────────────────────

interface SeasonConfigModalProps {
  seasonName: string
  tours: Tour[]
  onClose: () => void
  onToggleTour: (tourId: string) => void
}

function SeasonConfigModal({ seasonName, tours, onClose, onToggleTour }: SeasonConfigModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredTours = tours.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const toursInSeason = tours.filter(t => (t.seasons || []).includes(seasonName))
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Configurar Temporada: {seasonName}</h2>
              <p className="text-purple-100 text-sm mt-1">
                {toursInSeason.length} paquetes asignados a esta temporada
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar paquetes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Selecciona los paquetes que quieres activar cuando apliques esta temporada
          </p>
        </div>

        {/* Tours List */}
        <div className="overflow-y-auto max-h-[50vh] p-6">
          <div className="grid grid-cols-1 gap-3">
            {filteredTours.map(tour => {
              const isInSeason = (tour.seasons || []).includes(seasonName)
              return (
                <div
                  key={tour.id}
                  onClick={() => onToggleTour(tour.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isInSeason
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isInSeason ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isInSeason ? '✓' : <Package className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{tour.name}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {tour.location}
                          <span className="text-gray-300">•</span>
                          {tour.region}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-purple-600">{tour.price}</p>
                        <p className="text-xs text-gray-400">{tour.days}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {toursInSeason.length} de {tours.length} paquetes seleccionados
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Estos paquetes se activarán al aplicar la temporada "{seasonName}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
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
  onConfigure: () => void
}

function SeasonCard({ name, icon, color, description, discount, isActive, onApply, onConfigure }: SeasonCardProps) {
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

        <div className="flex gap-2">
          <button
            onClick={() => onApply(customDiscount)}
            disabled={isActive}
            className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
              isActive
                ? 'bg-white/30 cursor-not-allowed'
                : 'bg-white/90 hover:bg-white text-gray-900 hover:scale-105'
            }`}
          >
            {isActive ? 'Aplicada' : 'Aplicar'}
          </button>
          <button
            onClick={onConfigure}
            className="px-3 py-2 rounded-lg font-semibold text-sm bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
            title="Configurar paquetes"
          >
            ⚙️
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tour Form Modal ──────────────────────────────────────────────────────────

function TourFormModal({ tour, onClose, onSave }: TourFormModalProps) {
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'details' | 'itinerary' | 'media'>('basic')
  const [coverImageTab, setCoverImageTab] = useState<'url' | 'upload' | 'drive'>('url')
  const [coverImagePreview, setCoverImagePreview] = useState<string>('')
  
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
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || []
      return { ...prev, [field]: [...currentArray, value.trim()] }
    })
  }

  const removeFromArray = (field: keyof Tour, index: number) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || []
      return { ...prev, [field]: currentArray.filter((_, i) => i !== index) }
    })
  }

  const updateArrayItem = (field: keyof Tour, index: number, value: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || []
      const updated = [...currentArray]
      updated[index] = value
      return { ...prev, [field]: updated }
    })
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
            <BasicInfoForm 
              formData={formData} 
              setFormData={setFormData}
              coverImageTab={coverImageTab}
              setCoverImageTab={setCoverImageTab}
              coverImagePreview={coverImagePreview}
              setCoverImagePreview={setCoverImagePreview}
            />
          )}

          {/* TAB: ADVANCED DETAILS */}
          {activeFormTab === 'details' && (
            <AdvancedDetailsForm 
              formData={formData}
              setFormData={setFormData}
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
  setFormData: React.Dispatch<React.SetStateAction<Partial<Tour>>>
  coverImageTab: 'url' | 'upload' | 'drive'
  setCoverImageTab: (tab: 'url' | 'upload' | 'drive') => void
  coverImagePreview: string
  setCoverImagePreview: (v: string) => void
}

function BasicInfoForm({ formData, setFormData, coverImageTab, setCoverImageTab, coverImagePreview, setCoverImagePreview }: BasicInfoFormProps) {
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
        <input
          type="text"
          required
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
          placeholder="Ej: Lima, Ica, Cusco, Junín, etc."
        />
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
          Imagen principal *
        </label>

        {/* Tabs de método */}
        <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-lg w-fit">
          {(['url', 'upload', 'drive'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setCoverImageTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                coverImageTab === tab
                  ? 'bg-white shadow text-brand-teal'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'url' ? '🔗 URL' : tab === 'upload' ? '📁 Archivo' : '📂 Drive'}
            </button>
          ))}
        </div>

        {/* URL directa */}
        {coverImageTab === 'url' && (
          <input
            type="text"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
            placeholder="https://ejemplo.com/imagen.jpg  ó  /public/carpeta/imagen.jpg"
          />
        )}

        {/* Subir archivo local */}
        {coverImageTab === 'upload' && (
          <div className="space-y-2">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-brand-teal transition-colors cursor-pointer"
              onClick={() => document.getElementById('cover-image-upload')?.click()}
            >
              <input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  if (!file.type.startsWith('image/')) {
                    alert('Solo se permiten imágenes')
                    return
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    alert(`Archivo muy grande (${(file.size/1024/1024).toFixed(2)}MB). Máximo 2MB.`)
                    return
                  }
                  const reader = new FileReader()
                  reader.onload = (ev) => {
                    setFormData(prev => ({ ...prev, image: ev.target?.result as string }))
                    setCoverImagePreview(ev.target?.result as string)
                  }
                  reader.readAsDataURL(file)
                }}
              />
              {coverImagePreview || formData.image?.startsWith('data:') ? (
                <div className="space-y-2">
                  <img
                    src={coverImagePreview || formData.image}
                    alt="Preview portada"
                    className="max-h-32 mx-auto rounded-lg object-contain"
                  />
                  <p className="text-xs text-green-600 font-semibold">✓ Imagen cargada — click para cambiar</p>
                </div>
              ) : (
                <div className="py-4">
                  <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600 font-medium">Click para subir imagen</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (máx. 2MB)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* URL de Google Drive */}
        {coverImageTab === 'drive' && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Pega el enlace de Google Drive aquí..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
              onChange={(e) => {
                const raw = e.target.value.trim()
                // Convertir link de Drive a link directo de imagen
                const match = raw.match(/\/d\/([a-zA-Z0-9_-]+)/)
                if (match) {
                  const id = match[1]
                  const direct = `https://drive.google.com/uc?export=view&id=${id}`
                  setFormData(prev => ({ ...prev, image: direct }))
                } else if (raw.startsWith('http')) {
                  setFormData(prev => ({ ...prev, image: raw }))
                }
              }}
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">💡 ¿Cómo usar Google Drive?</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Sube tu imagen a Google Drive</li>
                <li>Click derecho → "Obtener enlace"</li>
                <li>Cambia acceso a <strong>"Cualquier persona con el enlace"</strong></li>
                <li>Copia y pega el enlace aquí</li>
              </ol>
            </div>
            {formData.image?.includes('drive.google.com') && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-700">
                ✓ URL de Drive detectada: <span className="font-mono break-all">{formData.image}</span>
              </div>
            )}
          </div>
        )}

        {/* Preview de imagen actual (para URL y Drive) */}
        {(coverImageTab === 'url' || coverImageTab === 'drive') && formData.image && !formData.image.startsWith('data:') && (
          <div className="mt-2">
            <img
              src={formData.image}
              alt="Preview"
              className="h-20 w-auto rounded-lg object-cover border border-gray-200"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        )}
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
          value={formData.rating ?? 5.0}
          onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
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
  setFormData: React.Dispatch<React.SetStateAction<Partial<Tour>>>
  addToArray: (field: keyof Tour, value: string) => void
  removeFromArray: (field: keyof Tour, index: number) => void
  updateArrayItem: (field: keyof Tour, index: number, value: string) => void
}

function AdvancedDetailsForm({ formData, setFormData, addToArray, removeFromArray, updateArrayItem }: AdvancedDetailsFormProps) {
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

      {/* Opciones de Precio */}
      <div className="border-t pt-6">
        <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
          💰 Opciones de Precio
        </h4>
        <div className="space-y-3">
          {(formData.priceOptions || []).map((option, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Opción {i + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = (formData.priceOptions || []).filter((_, idx) => idx !== i)
                    setFormData({ ...formData, priceOptions: updated })
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Etiqueta (Ej: Individual, Triple, Cuádruple)"
                  value={option.label}
                  onChange={(e) => {
                    const updated = [...(formData.priceOptions || [])]
                    updated[i] = { ...updated[i], label: e.target.value }
                    setFormData({ ...formData, priceOptions: updated })
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
                <input
                  type="text"
                  placeholder="Precio (Ej: S/ 135)"
                  value={option.price}
                  onChange={(e) => {
                    const updated = [...(formData.priceOptions || [])]
                    updated[i] = { ...updated[i], price: e.target.value }
                    setFormData({ ...formData, priceOptions: updated })
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
              <input
                type="text"
                placeholder="Nota opcional (Ej: No válido feriados)"
                value={option.note || ''}
                onChange={(e) => {
                  const updated = [...(formData.priceOptions || [])]
                  updated[i] = { ...updated[i], note: e.target.value }
                  setFormData({ ...formData, priceOptions: updated })
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
              {/* Package Intelligence Component */}
              <PackageIntelligence label={option.label} price={option.price} />
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newOption = { label: '', price: '', note: '' }
              setFormData({
                ...formData,
                priceOptions: [...(formData.priceOptions || []), newOption]
              })
            }}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-teal hover:text-brand-teal transition-colors text-sm font-semibold"
          >
            + Agregar opción de precio
          </button>
        </div>
      </div>

      {/* Puntos de Embarque */}
      <div className="border-t pt-6">
        <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
          📍 Puntos de Embarque
        </h4>
        <div className="space-y-3">
          {(formData.boardingPoints || []).map((point, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Punto {i + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = (formData.boardingPoints || []).filter((_, idx) => idx !== i)
                    setFormData({ ...formData, boardingPoints: updated })
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Nombre (Ej: C.C. Plaza Norte)"
                value={point.name}
                onChange={(e) => {
                  const updated = [...(formData.boardingPoints || [])]
                  updated[i] = { ...updated[i], name: e.target.value }
                  setFormData({ ...formData, boardingPoints: updated })
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
              <input
                type="text"
                placeholder="Dirección completa"
                value={point.address}
                onChange={(e) => {
                  const updated = [...(formData.boardingPoints || [])]
                  updated[i] = { ...updated[i], address: e.target.value }
                  setFormData({ ...formData, boardingPoints: updated })
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
              <input
                type="time"
                value={point.time}
                onChange={(e) => {
                  const updated = [...(formData.boardingPoints || [])]
                  updated[i] = { ...updated[i], time: e.target.value }
                  setFormData({ ...formData, boardingPoints: updated })
                }}
                className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newPoint = { name: '', address: '', time: '06:00' }
              setFormData({
                ...formData,
                boardingPoints: [...(formData.boardingPoints || []), newPoint]
              })
            }}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-teal hover:text-brand-teal transition-colors text-sm font-semibold"
          >
            + Agregar punto de embarque
          </button>
        </div>
      </div>

      {/* Días de Salida y Retorno */}
      <div className="border-t pt-6">
        <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
          📅 Días de Salida y Retorno
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Días de salida (separados por coma)
            </label>
            <input
              type="text"
              placeholder="Ej: Sábados, Domingos, Feriados"
              value={(formData.departureDays || []).join(', ')}
              onChange={(e) => {
                const days = e.target.value.split(',').map(d => d.trim()).filter(d => d)
                setFormData({ ...formData, departureDays: days })
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hora de retorno
            </label>
            <input
              type="text"
              placeholder="Ej: 08:00 pm aprox. (llegada a Lima)"
              value={formData.returnTime || ''}
              onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Fechas Disponibles ─────────────────────────────────────────────── */}
      <div className="border-t pt-6">
        <h4 className="text-md font-bold text-gray-900 mb-1 flex items-center gap-2">
          🗓️ Fechas Disponibles para Reservar
        </h4>
        <p className="text-xs text-gray-500 mb-4">
          Configura qué días puede reservar el cliente. Si no configuras nada, cualquier fecha futura estará disponible.
        </p>

        {/* Días de la semana recurrentes */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Días recurrentes de la semana
          </label>
          <div className="flex flex-wrap gap-2">
            {(['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'] as const).map(day => {
              const selected = (formData.availableDates?.weekDays || []).includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setFormData(prev => {
                      const current = prev.availableDates?.weekDays || []
                      const updated = selected
                        ? current.filter(d => d !== day)
                        : [...current, day]
                      return { ...prev, availableDates: { ...prev.availableDates, weekDays: updated } }
                    })
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                    selected
                      ? 'bg-brand-teal text-white border-brand-teal'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-brand-teal'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
          {(formData.availableDates?.weekDays || []).length > 0 && (
            <p className="text-xs text-brand-teal mt-2">
              ✓ Sale cada: {(formData.availableDates?.weekDays || []).join(', ')}
            </p>
          )}
        </div>

        {/* Fechas específicas */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fechas específicas (feriados, eventos especiales, etc.)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="date"
              id="specific-date-input"
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('specific-date-input') as HTMLInputElement
                const val = input?.value
                if (!val) return
                setFormData(prev => {
                  const current = prev.availableDates?.specificDates || []
                  if (current.includes(val)) return prev
                  return { ...prev, availableDates: { ...prev.availableDates, specificDates: [...current, val].sort() } }
                })
                if (input) input.value = ''
              }}
              className="px-4 py-2 bg-brand-teal text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              + Agregar
            </button>
          </div>

          {/* Lista de fechas específicas */}
          {(formData.availableDates?.specificDates || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(formData.availableDates?.specificDates || []).map(date => {
                // Formatear fecha a texto legible: "2026-07-28" → "Mar 28 Jul 2026"
                const d = new Date(date + 'T12:00:00')
                const label = d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <span key={date} className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                    📅 {label}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          availableDates: {
                            ...prev.availableDates,
                            specificDates: (prev.availableDates?.specificDates || []).filter(d => d !== date)
                          }
                        }))
                      }}
                      className="text-teal-500 hover:text-red-500 transition-colors ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No hay fechas específicas agregadas.</p>
          )}
        </div>

        {/* Resumen visual */}
        {((formData.availableDates?.weekDays || []).length > 0 || (formData.availableDates?.specificDates || []).length > 0) && (
          <div className="mt-4 bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-800">
            <p className="font-semibold mb-1">📋 Configuración activa:</p>
            {(formData.availableDates?.weekDays || []).length > 0 && (
              <p>• Recurrente: cada {(formData.availableDates?.weekDays || []).join(', ')}</p>
            )}
            {(formData.availableDates?.specificDates || []).length > 0 && (
              <p>• {(formData.availableDates?.specificDates || []).length} fecha(s) específica(s) configuradas</p>
            )}
            <p className="mt-1 text-teal-600">El cliente solo podrá seleccionar estas fechas en el carrito.</p>
          </div>
        )}
      </div>

      {/* Términos y Condiciones */}
      <div className="border-t pt-6">
        <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
          📋 Términos y Condiciones
        </h4>
        <div className="space-y-2">
          {(formData.terms || []).map((term, i) => (
            <div key={i} className="flex items-start gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <span className="text-xs font-bold text-gray-400 mt-1 shrink-0">{i + 1}.</span>
              <input
                type="text"
                value={term}
                onChange={(e) => {
                  const updated = [...(formData.terms || [])]
                  updated[i] = e.target.value
                  setFormData({ ...formData, terms: updated })
                }}
                className="flex-1 bg-transparent focus:outline-none text-sm"
                placeholder="Término o condición"
              />
              <button
                type="button"
                onClick={() => {
                  const updated = (formData.terms || []).filter((_, idx) => idx !== i)
                  setFormData({ ...formData, terms: updated })
                }}
                className="text-red-500 hover:text-red-700 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                terms: [...(formData.terms || []), '']
              })
            }}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-teal hover:text-brand-teal transition-colors text-sm font-semibold"
          >
            + Agregar término
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Itinerary Form ───────────────────────────────────────────────────────────

interface ItineraryFormProps {
  formData: Partial<Tour>
  setFormData: React.Dispatch<React.SetStateAction<Partial<Tour>>>
}

function ItineraryForm({ formData, setFormData }: ItineraryFormProps) {
  const [editingDay, setEditingDay] = useState<number | null>(null)

  const addDay = () => {
    setFormData(prev => {
      const currentItinerary = prev.itinerary || []
      const newDay: DayItinerary = {
        day: currentItinerary.length + 1,
        title: '',
        summary: '',
        activities: []
      }
      setEditingDay(currentItinerary.length)
      return { ...prev, itinerary: [...currentItinerary, newDay] }
    })
  }

  const removeDay = (index: number) => {
    setFormData(prev => {
      const updated = (prev.itinerary || []).filter((_, i) => i !== index)
      const renumbered = updated.map((day, i) => ({ ...day, day: i + 1 }))
      return { ...prev, itinerary: renumbered }
    })
    if (editingDay === index) setEditingDay(null)
  }

  const updateDay = (index: number, field: keyof DayItinerary, value: any) => {
    setFormData(prev => {
      const updated = [...(prev.itinerary || [])]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, itinerary: updated }
    })
  }

  const addActivity = (dayIndex: number) => {
    setFormData(prev => {
      const updated = [...(prev.itinerary || [])]
      updated[dayIndex].activities.push({
        time: '',
        description: '',
        icon: 'default'
      })
      return { ...prev, itinerary: updated }
    })
  }

  const updateActivity = (dayIndex: number, actIndex: number, field: keyof Activity, value: any) => {
    setFormData(prev => {
      const updated = [...(prev.itinerary || [])]
      const currentActivity = updated[dayIndex].activities[actIndex]
      updated[dayIndex].activities[actIndex] = {
        ...currentActivity,
        [field]: value
      }
      return { ...prev, itinerary: updated }
    })
  }

  const removeActivity = (dayIndex: number, actIndex: number) => {
    setFormData(prev => {
      const updated = [...(prev.itinerary || [])]
      updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== actIndex)
      return { ...prev, itinerary: updated }
    })
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
                        <div className="flex flex-col gap-0.5">
                          <input
                            type="time"
                            value={act.time || ''}
                            onChange={(e) => updateActivity(dayIndex, actIndex, 'time', e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand-teal"
                          />
                          <span className="text-[10px] text-gray-400 text-center">opcional</span>
                        </div>
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

// ─── Image Folder Browser ─────────────────────────────────────────────────────

// Carpetas de imágenes conocidas en /public
const IMAGE_FOLDERS = [
  'Autisha',
  'AyacuchoSemanaSanta',
  'CarnavalesCajamarca',
  'Churin',
  'Cusco',
  'Huancaya',
  'ICA',
  'Laraos',
  'LomasLachay',
  'Lunahuana',
  'MancoraAnoNuevo',
  'NevadoRajuntay',
  'NevadoRaura',
  'Otao',
  'OxapampaSelva',
  'PlayaMina',
  'TingoMaria',
  'Vichaycocha'
]

interface ImageFolderBrowserProps {
  formData: Partial<Tour>
  setFormData: React.Dispatch<React.SetStateAction<Partial<Tour>>>
}

function ImageFolderBrowser({ formData, setFormData }: ImageFolderBrowserProps) {
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [availableImages, setAvailableImages] = useState<string[]>([])
  const [newFolderName, setNewFolderName] = useState('')
  const [customFolders, setCustomFolders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const allFolders = [...IMAGE_FOLDERS, ...customFolders].sort()

  // Cargar imágenes de una carpeta
  const loadImagesFromFolder = async (folder: string) => {
    setLoading(true)
    try {
      // Intentar cargar un índice de imágenes conocidas
      // Como no podemos escanear directorios en el navegador, 
      // vamos a intentar cargar imágenes con nombres comunes
      const commonExtensions = ['jpg', 'jpeg', 'JPG', 'JPEG', 'png', 'PNG']
      const commonNames = Array.from({ length: 30 }, (_, i) => i + 1)
      
      const possibleImages: string[] = []
      
      // Intentar cargar algunas imágenes conocidas
      for (let ext of commonExtensions) {
        for (let name of commonNames) {
          const imagePath = `/${folder}/image${name}.${ext}`
          possibleImages.push(imagePath)
        }
      }

      // También intentar algunos patrones comunes de nombres
      const patterns = [
        'DSC_', 'IMG_', 'PXL_', 'G0', 'photo', 'image',
        '332366821_', // Ejemplo de AyacuchoSemanaSanta
      ]

      for (let pattern of patterns) {
        for (let i = 0; i < 20; i++) {
          for (let ext of commonExtensions) {
            possibleImages.push(`/${folder}/${pattern}${String(i).padStart(4, '0')}.${ext}`)
          }
        }
      }

      // Cargar la lista real si existe un manifest
      const manifestPath = `/${folder}/manifest.json`
      try {
        const response = await fetch(manifestPath)
        if (response.ok) {
          const manifest = await response.json()
          setAvailableImages(manifest.images.map((img: string) => `/${folder}/${img}`))
          setLoading(false)
          return
        }
      } catch (e) {
        // No hay manifest, usar la lista generada
      }

      // Por defecto, mostrar algunas rutas probables
      setAvailableImages(possibleImages.slice(0, 20))
    } catch (error) {
      console.error('Error loading images:', error)
      setAvailableImages([])
    }
    setLoading(false)
  }

  const handleFolderSelect = (folder: string) => {
    setSelectedFolder(folder)
    loadImagesFromFolder(folder)
  }

  const addCustomFolder = () => {
    if (newFolderName.trim() && !allFolders.includes(newFolderName.trim())) {
      setCustomFolders([...customFolders, newFolderName.trim()])
      setNewFolderName('')
    }
  }

  const setAsCoverImage = (imagePath: string) => {
    setFormData(prev => ({ ...prev, image: imagePath }))
  }

  const addToGallery = (imagePath: string) => {
    setFormData(prev => {
      const currentImages = prev.images || []
      if (!currentImages.includes(imagePath)) {
        return { ...prev, images: [...currentImages, imagePath] }
      }
      return prev
    })
  }

  const quickAddAllToGallery = () => {
    setFormData(prev => {
      const currentImages = prev.images || []
      const newImages = availableImages.filter(img => !currentImages.includes(img))
      return { ...prev, images: [...currentImages, ...newImages] }
    })
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">📂 Explorador de Carpetas de Imágenes</h3>
          <p className="text-sm text-gray-600 mb-4">
            Selecciona una carpeta existente o crea una nueva para organizar las imágenes del paquete
          </p>

          {/* Selector de carpeta */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Carpeta de imágenes
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => handleFolderSelect(e.target.value)}
              className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">-- Seleccionar carpeta --</option>
              {allFolders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>

          {/* Crear nueva carpeta */}
          <div className="bg-white/70 rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">O crear nueva carpeta</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomFolder()
                  }
                }}
                className="flex-1 px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="NombreCarpeta (sin espacios)"
              />
              <button
                type="button"
                onClick={addCustomFolder}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
              >
                Crear
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Crea la carpeta en /public con este nombre y sube tus imágenes ahí
            </p>
          </div>

          {/* Instrucciones si no hay carpeta seleccionada */}
          {!selectedFolder && (
            <div className="bg-white rounded-lg p-4 border-2 border-dashed border-green-300 text-center">
              <svg className="w-12 h-12 text-green-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="text-sm text-gray-500">Selecciona una carpeta para ver sus imágenes</p>
            </div>
          )}

          {/* Visor de imágenes */}
          {selectedFolder && (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-700">
                  📁 /{selectedFolder}
                </p>
                <button
                  type="button"
                  onClick={quickAddAllToGallery}
                  className="text-xs px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Agregar todas al carrusel
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Cargando imágenes...</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    Haz clic en una imagen para establecerla como portada o agregarla al carrusel
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                    {availableImages.map((imagePath, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={imagePath}
                          alt={`${selectedFolder} ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-green-500 transition-all cursor-pointer"
                          onError={(e) => {
                            // Si la imagen no existe, ocultarla
                            (e.target as HTMLElement).style.display = 'none'
                          }}
                          onLoad={(e) => {
                            // Si la imagen carga, mostrarla
                            (e.target as HTMLElement).style.display = 'block'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1 p-1">
                          <button
                            type="button"
                            onClick={() => setAsCoverImage(imagePath)}
                            className="w-full px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                            title="Establecer como portada"
                          >
                            📸 Portada
                          </button>
                          <button
                            type="button"
                            onClick={() => addToGallery(imagePath)}
                            className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                            title="Agregar al carrusel"
                          >
                            ➕ Carrusel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {availableImages.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-400">No se encontraron imágenes en esta carpeta</p>
                      <p className="text-xs text-gray-400 mt-1">Sube imágenes a /public/{selectedFolder}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Preview de selección actual */}
          {formData.image && (
            <div className="mt-4 bg-purple-100 border border-purple-300 rounded-lg p-3">
              <p className="text-xs font-bold text-purple-800 mb-2">✅ Portada seleccionada:</p>
              <div className="flex items-center gap-2">
                <img 
                  src={formData.image} 
                  alt="Portada" 
                  className="w-16 h-16 object-cover rounded border-2 border-purple-400"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E?%3C/text%3E%3C/svg%3E'
                  }}
                />
                <p className="text-xs text-purple-700 font-mono">{formData.image}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Media Form (PDF & Images) ────────────────────────────────────────────────

interface MediaFormProps {
  formData: Partial<Tour>
  setFormData: React.Dispatch<React.SetStateAction<Partial<Tour>>>
}

function MediaForm({ formData, setFormData }: MediaFormProps) {
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const addImage = () => {
    if (!newImageUrl.trim()) return
    const currentImages = formData.images || []
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), newImageUrl.trim()]
    }))
    setNewImageUrl('')
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }))
  }

  const updateImage = (index: number, value: string) => {
    const currentImages = formData.images || []
    const updated = [...currentImages]
    updated[index] = value
    setFormData(prev => {
      const updated = [...(prev.images || [])]
      updated[index] = value
      return { ...prev, images: updated }
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
          setFormData(prev => {
            const currentImages = prev.images || []
            return { ...prev, images: [...currentImages, base64] }
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
          setFormData(prev => ({ ...prev, brochure: data.secure_url }))
        } else {
          setFormData(prev => {
            const currentImages = prev.images || []
            return { ...prev, images: [...currentImages, data.secure_url] }
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

      {/* Image Folder Browser */}
      <ImageFolderBrowser 
        formData={formData}
        setFormData={setFormData}
      />

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

// ─── Testimonial Form Modal ───────────────────────────────────────────────────

interface TestimonialFormModalProps {
  testimonial?: Testimonial | null
  onClose: () => void
  onSave: () => void
}

function TestimonialFormModal({ testimonial, onClose, onSave }: TestimonialFormModalProps) {
  const [formData, setFormData] = useState({
    name: testimonial?.name || '',
    location: testimonial?.location || '',
    text: testimonial?.text || '',
    stars: testimonial?.stars || 5,
    avatar: testimonial?.avatar || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.location.trim() || !formData.text.trim()) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setLoading(true)

    try {
      const method = testimonial ? 'PUT' : 'POST'
      const url = testimonial 
        ? `/api/testimonials/${testimonial._id}`
        : '/api/testimonials'

      const body = {
        ...formData,
        avatar: formData.avatar || `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70)}`
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (data.ok) {
        onSave()
      } else {
        throw new Error(data.error || 'Error al guardar testimonio')
      }
    } catch (err) {
      console.error('Error saving testimonial:', err)
      alert('Error al guardar el testimonio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {testimonial ? 'Editar Testimonio' : 'Agregar Testimonio'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {testimonial ? 'Modifica la información del testimonio' : 'Agrega un nuevo testimonio de cliente'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: María Fernández"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Lima, Arequipa, Cusco"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Testimonio *
            </label>
            <textarea
              required
              rows={4}
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Escribe aquí la experiencia del cliente..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calificación (estrellas) *
              </label>
              <select
                required
                value={formData.stars}
                onChange={(e) => setFormData({ ...formData, stars: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 estrellas)</option>
                <option value={4}>⭐⭐⭐⭐ (4 estrellas)</option>
                <option value={3}>⭐⭐⭐ (3 estrellas)</option>
                <option value={2}>⭐⭐ (2 estrellas)</option>
                <option value={1}>⭐ (1 estrella)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL Avatar (opcional)
              </label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://ejemplo.com/avatar.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si lo dejas vacío, se generará uno automáticamente
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Vista previa:</p>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: formData.stars }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm italic mb-3">
                "{formData.text || 'El testimonio aparecerá aquí...'}"
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src={formData.avatar || `https://i.pravatar.cc/80?img=47`} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-teal-l" 
                />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {formData.name || 'Nombre del cliente'}
                  </div>
                  <div className="text-xs text-gray-400">
                    📍 {formData.location || 'Ubicación'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {testimonial ? 'Guardar cambios' : 'Agregar testimonio'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export interface CartItem {
  tourId: string
  tourName: string
  tourImage: string
  priceOption: string
  priceValue: number
  quantity: number // Cantidad de paquetes
  travelDate: string
  personsPerPackage: number // Cuántas personas incluye cada paquete
  boardingPoints?: Array<{ name: string; address: string; time: string }> // Puntos de embarque del tour
  hasAccommodation: boolean // Si el paquete incluye alojamiento
}

// Helper function para detectar cuántas personas incluye un paquete
export function detectPersonsPerPackage(optionLabel: string): number {
  const label = optionLabel.toLowerCase()
  
  // Detectar patrones específicos
  if (label.includes('cuádruple') || label.includes('cuadruple')) return 4
  if (label.includes('triple')) return 3
  if (label.includes('doble') || label.includes('matrimonial') || label.includes('parejas') || label.includes('2 personas')) return 2
  if (label.includes('individual') || label.includes('1 persona')) return 1
  
  // Detectar "a partir de X personas"
  const matchApartir = label.match(/a partir de (\d+)/i)
  if (matchApartir) return parseInt(matchApartir[1])
  
  // Detectar "X personas"
  const matchPersonas = label.match(/(\d+)\s*personas?/i)
  if (matchPersonas) return parseInt(matchPersonas[1])
  
  // Por defecto, asumimos 1 persona por paquete
  return 1
}

// Helper function para detectar si tiene alojamiento
export function detectHasAccommodation(optionLabel: string, tourDays: string): boolean {
  const label = optionLabel.toLowerCase()
  const days = tourDays.toLowerCase()
  
  // Si menciona habitación, hotel, hospedaje, o noches
  if (label.includes('habitación') || label.includes('hotel') || label.includes('hospedaje') || label.includes('noche')) {
    return true
  }
  
  // Si el tour es de varios días (no full day)
  if (!days.includes('full day') && !days.includes('1 día')) {
    return true
  }
  
  return false
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (tourId: string, priceOption: string) => void
  updateQuantity: (tourId: string, priceOption: string, quantity: number) => void
  clearCart: () => void
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'peru-in-travel-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Initialize from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [cartOpen, setCartOpen] = useState(false)

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.tourId === newItem.tourId && item.priceOption === newItem.priceOption
      )
      if (existing) {
        return prev.map((item) =>
          item.tourId === newItem.tourId && item.priceOption === newItem.priceOption
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }
      return [...prev, newItem]
    })
    setCartOpen(true)
  }

  const removeItem = (tourId: string, priceOption: string) => {
    setItems((prev) => prev.filter((item) => !(item.tourId === tourId && item.priceOption === priceOption)))
  }

  const updateQuantity = (tourId: string, priceOption: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(tourId, priceOption)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.tourId === tourId && item.priceOption === priceOption ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartOpen,
        setCartOpen,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

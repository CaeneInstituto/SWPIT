import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export interface CartItem {
  tourId: string
  tourName: string
  tourImage: string
  priceOption: string
  priceValue: number
  quantity: number
  travelDate: string
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

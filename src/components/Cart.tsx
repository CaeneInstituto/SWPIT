import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import PaymentModal from './PaymentModal'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, cartOpen, setCartOpen, totalItems, totalPrice } = useCart()
  const [showToast, setShowToast] = useState(false)
  const [lastAddedItem, setLastAddedItem] = useState<string>('')
  const [showPayment, setShowPayment] = useState(false)

  // Watch for new items added
  useEffect(() => {
    if (items.length > 0 && cartOpen) {
      const latest = items[items.length - 1]
      setLastAddedItem(latest.tourName)
      setShowToast(true)
      const timer = setTimeout(() => setShowToast(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [items.length])

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return

    let message = '🌄 *Solicitud de Reserva - Peru In Travel*\n\n'
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.tourName}*\n`
      message += `   Opción: ${item.priceOption}\n`
      message += `   Personas: ${item.quantity}\n`
      message += `   Fecha: ${item.travelDate}\n`
      message += `   Subtotal: S/ ${(item.priceValue * item.quantity).toFixed(2)}\n\n`
    })
    message += `💰 *Total: S/ ${totalPrice.toFixed(2)}*\n\n`
    message += `¿Podrían confirmar disponibilidad y enviarme más detalles?`

    const whatsappUrl = `https://wa.me/51984123456?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    // Close cart after sending
    setTimeout(() => setCartOpen(false), 500)
  }

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      clearCart()
    }
  }

  if (!cartOpen) return null

  return (
    <>
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-[80] bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium text-sm">Agregado al carrito</span>
        </div>
      )}

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mi carrito</h2>
            <p className="text-sm text-gray-500">{totalItems} {totalItems === 1 ? 'paquete' : 'paquetes'}</p>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
              <p className="text-gray-400 text-sm mt-2">Agrega paquetes para comenzar</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.tourId}-${item.priceOption}`} className="bg-gray-50 rounded-xl p-4">
                <div className="flex gap-3">
                  <img
                    src={item.tourImage}
                    alt={item.tourName}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">{item.tourName}</h3>
                    <p className="text-xs text-gray-600 mb-1">{item.priceOption}</p>
                    <p className="text-xs text-gray-500">📅 {item.travelDate}</p>
                    <p className="text-brand-teal font-bold mt-2">S/ {item.priceValue.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.tourId, item.priceOption)}
                    className="p-1 h-fit rounded-full hover:bg-red-100 text-red-500 transition-colors"
                    aria-label="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-gray-600">Personas:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.tourId, item.priceOption, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.tourId, item.priceOption, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="font-bold text-2xl text-brand-teal">S/ {totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">50% de reserva · Saldo restante el día del tour</p>
            <button
              onClick={() => setShowPayment(true)}
              className="w-full bg-brand-teal hover:bg-brand-teal-d text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Proceder al pago
            </button>
            <button
              onClick={handleClearCart}
              className="w-full text-gray-600 hover:text-red-600 text-sm font-medium transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
    </>
  )
}

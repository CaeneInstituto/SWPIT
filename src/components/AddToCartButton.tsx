import { useState } from 'react'
import { useCart } from '../context/CartContext'
import type { Tour } from '../data/tours'

interface AddToCartButtonProps {
  tour: Tour
  variant?: 'card' | 'detail'
}

export default function AddToCartButton({ tour, variant = 'card' }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [showModal, setShowModal] = useState(false)
  const [selectedOption, setSelectedOption] = useState(tour.priceOptions?.[0] || { label: 'Estándar', price: tour.price, note: '' })
  const [quantity, setQuantity] = useState(1)
  const [travelDate, setTravelDate] = useState('')

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const handleAddToCart = () => {
    if (!travelDate) {
      alert('Por favor selecciona una fecha de viaje')
      return
    }

    const priceNumeric = parseFloat(selectedOption.price.replace(/[^\d.]/g, ''))

    addItem({
      tourId: tour.id,
      tourName: tour.name,
      tourImage: tour.image,
      priceOption: selectedOption.label,
      priceValue: priceNumeric,
      quantity,
      travelDate,
    })

    setShowModal(false)
    setQuantity(1)
    setTravelDate('')
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
          <CartModal
            tour={tour}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            quantity={quantity}
            setQuantity={setQuantity}
            travelDate={travelDate}
            setTravelDate={setTravelDate}
            minDate={minDate}
            onClose={() => setShowModal(false)}
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
        <CartModal
          tour={tour}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          quantity={quantity}
          setQuantity={setQuantity}
          travelDate={travelDate}
          setTravelDate={setTravelDate}
          minDate={minDate}
          onClose={() => setShowModal(false)}
          onAdd={handleAddToCart}
        />
      )}
    </>
  )
}

interface CartModalProps {
  tour: Tour
  selectedOption: any
  setSelectedOption: (option: any) => void
  quantity: number
  setQuantity: (q: number) => void
  travelDate: string
  setTravelDate: (date: string) => void
  minDate: string
  onClose: () => void
  onAdd: () => void
}

function CartModal({
  tour,
  selectedOption,
  setSelectedOption,
  quantity,
  setQuantity,
  travelDate,
  setTravelDate,
  minDate,
  onClose,
  onAdd,
}: CartModalProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
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

        <div className="space-y-4">
          {/* Price Options */}
          {tour.priceOptions && tour.priceOptions.length > 1 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">opción de paquete</label>
              <div className="space-y-2">
                {tour.priceOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedOption.label === option.label
                        ? 'border-brand-teal bg-brand-teal/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{option.label}</p>
                        {option.note && <p className="text-xs text-gray-500 mt-1">{option.note}</p>}
                      </div>
                      <span className="font-bold text-brand-teal">{option.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">número de personas</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold transition-colors"
              >
                −
              </button>
              <span className="text-2xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Travel Date */}
          <div>
            <label htmlFor="travel-date" className="block text-sm font-semibold text-gray-700 mb-2">
              fecha de viaje
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
              <span className="text-gray-600">Subtotal ({quantity} {quantity === 1 ? 'persona' : 'personas'})</span>
              <span className="text-2xl font-bold text-brand-teal">
                S/ {(parseFloat(selectedOption.price.replace(/[^\d.]/g, '')) * quantity).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onAdd}
              className="flex-1 bg-brand-gradient text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

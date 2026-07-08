import { useState } from 'react'
import { useCart } from '../context/CartContext'

// Claves Culqi (se cargan desde .env)
const CULQI_PUBLIC_KEY = (import.meta as any).env?.VITE_CULQI_PUBLIC_KEY || 'pk_test_XXXXXXXXXXXXXXXX'
const API_URL          = (import.meta as any).env?.VITE_API_URL          || 'http://localhost:3001'
const WHATSAPP_NUMBER  = '51929648380'

const PAYMENT_INFO = {
  yape:     { number: '+51 929 648 380', name: 'Peru In Travel' },
  plin:     { number: '+51 929 648 380', name: 'Peru In Travel' },
  transfer: {
    bank: 'BCP',
    account: '000-000000000',
    cci: '00200000000000000000',
    name: 'Peru In Travel',
  },
}

type PaymentMethod = 'yape' | 'plin' | 'transfer' | 'card'
type ModalStep     = 'method' | 'instructions' | 'confirm'

interface Props { onClose: () => void }

export default function PaymentModal({ onClose }: Props) {
  const { items, totalPrice, clearCart, setCartOpen } = useCart()
  const [step, setStep]         = useState<ModalStep>('method')
  const [method, setMethod]     = useState<PaymentMethod>('yape')
  const [voucherNote, setVoucherNote] = useState('')
  const [name, setName]         = useState('')

  const methodLabels: Record<PaymentMethod, string> = {
    yape:     'Yape',
    plin:     'Plin',
    transfer: 'Transferencia bancaria',
    card:     'Tarjeta de crédito/débito',
  }

  const handleConfirm = () => {
    let message = `🌄 *Reserva Peru In Travel*\n\n`
    message += `👤 *Nombre:* ${name || '(sin especificar)'}\n`
    message += `💳 *Método de pago:* ${methodLabels[method]}\n\n`
    message += `📦 *Paquetes:*\n`
    items.forEach((item, i) => {
      message += `${i + 1}. ${item.tourName}\n`
      message += `   Opción: ${item.priceOption}\n`
      message += `   Personas: ${item.quantity}\n`
      message += `   Fecha: ${item.travelDate}\n`
      message += `   Subtotal: S/ ${(item.priceValue * item.quantity).toFixed(2)}\n\n`
    })
    message += `💰 *Total: S/ ${totalPrice.toFixed(2)}*\n`
    if (voucherNote) message += `📎 *Nota:* ${voucherNote}\n`
    message += `\nPor favor confirmen la reserva. ¡Gracias! 🙏`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
    clearCart()
    setCartOpen(false)
    onClose()
  }

  const tourNames = items.map(i => i.tourName)

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-brand-teal to-brand-teal-d px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-white font-bold text-lg">Método de pago</h2>
            <p className="text-white/70 text-sm">Total: <span className="font-bold text-white">S/ {totalPrice.toFixed(2)}</span></p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex border-b">
          {(['method', 'instructions', 'confirm'] as ModalStep[]).map((s, i) => (
            <div key={s} className={`flex-1 py-2 text-center text-xs font-semibold transition-colors ${
              step === s ? 'text-brand-teal border-b-2 border-brand-teal' : 'text-gray-400'
            }`}>
              {i + 1}. {s === 'method' ? 'Método' : s === 'instructions' ? 'Pagar' : 'Confirmar'}
            </div>
          ))}
        </div>

        <div className="p-6">

          {/* STEP 1 – Elegir método */}
          {step === 'method' && (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm mb-4">Selecciona cómo realizarás el pago del 50% de reserva:</p>
              {(['yape', 'plin', 'card', 'transfer'] as PaymentMethod[]).map((m) => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    method === m ? 'border-brand-teal bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                    m === 'yape' ? 'bg-[#6C1DDB]' : m === 'plin' ? 'bg-[#00B0EA]' : m === 'card' ? 'bg-indigo-600' : 'bg-gray-600'
                  }`}>
                    {m === 'yape' ? 'Y' : m === 'plin' ? 'P' : m === 'card' ? '💳' : '🏦'}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-800">{methodLabels[m]}</p>
                    <p className="text-xs text-gray-500">
                      {m === 'yape' ? 'Pago rápido desde tu app Yape'
                      : m === 'plin' ? 'Pago rápido desde tu app Plin'
                      : m === 'card' ? 'Visa, Mastercard, Amex · Powered by Culqi'
                      : 'Depósito o transferencia bancaria'}
                    </p>
                  </div>
                  {method === m && (
                    <svg className="w-5 h-5 text-brand-teal shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
              ))}
              <button onClick={() => setStep('instructions')}
                className="w-full mt-4 bg-brand-teal hover:bg-brand-teal-d text-white font-bold py-3 rounded-xl transition-colors">
                Continuar →
              </button>
            </div>
          )}

          {/* STEP 2 – Instrucciones / Formulario de pago */}
          {step === 'instructions' && (
            <div className="space-y-4">

              {/* Yape / Plin */}
              {(method === 'yape' || method === 'plin') && (
                <>
                  <div className={`rounded-xl p-4 text-center ${method === 'yape' ? 'bg-[#6C1DDB]/10' : 'bg-[#00B0EA]/10'}`}>
                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-black text-white mb-3 ${method === 'yape' ? 'bg-[#6C1DDB]' : 'bg-[#00B0EA]'}`}>
                      {method === 'yape' ? 'Y' : 'P'}
                    </div>
                    <p className="font-bold text-gray-800 text-lg">
                      {method === 'yape' ? PAYMENT_INFO.yape.number : PAYMENT_INFO.plin.number}
                    </p>
                    <p className="text-gray-500 text-sm">Peru In Travel</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-yellow-800">📋 Instrucciones:</p>
                    <ol className="list-decimal list-inside space-y-1 text-yellow-700 mt-2">
                      <li>Abre tu app {method === 'yape' ? 'Yape' : 'Plin'}</li>
                      <li>Ingresa el número <strong>{method === 'yape' ? PAYMENT_INFO.yape.number : PAYMENT_INFO.plin.number}</strong></li>
                      <li>Envía el <strong>50% (S/ {(totalPrice * 0.5).toFixed(2)})</strong> como reserva</li>
                      <li>Guarda el comprobante y continúa</li>
                    </ol>
                  </div>
                </>
              )}

              {/* Tarjeta - Culqi */}
              {method === 'card' && (
                <CardPaymentForm
                  totalPrice={totalPrice}
                  tourNames={tourNames}
                />
              )}

              {/* Transferencia */}
              {method === 'transfer' && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <p className="font-bold text-gray-700 mb-3">🏦 Datos bancarios:</p>
                    <div className="flex justify-between"><span className="text-gray-500">Banco:</span><span className="font-semibold">{PAYMENT_INFO.transfer.bank}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Titular:</span><span className="font-semibold">{PAYMENT_INFO.transfer.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">N° cuenta:</span><span className="font-semibold font-mono">{PAYMENT_INFO.transfer.account}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">CCI:</span><span className="font-semibold font-mono text-xs">{PAYMENT_INFO.transfer.cci}</span></div>
                    <div className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-500">Monto (50%):</span><span className="font-bold text-brand-teal">S/ {(totalPrice * 0.5).toFixed(2)}</span></div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
                    ⚠️ Realiza la transferencia y guarda tu voucher antes de continuar.
                  </div>
                </>
              )}

              {method !== 'card' && (
                <div className="flex gap-3">
                  <button onClick={() => setStep('method')} className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50">
                    ← Volver
                  </button>
                  <button onClick={() => setStep('confirm')} className="flex-1 bg-brand-teal hover:bg-brand-teal-d text-white font-bold py-3 rounded-xl">
                    Ya pagué →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 – Confirmar */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <svg className="w-10 h-10 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-green-800 font-semibold text-sm">
                  ¡Casi listo! Envíanos el comprobante por WhatsApp para confirmar tu reserva.
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Tu nombre completo</label>
                  <input type="text" placeholder="Ej: Juan Pérez" value={name} onChange={e => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Nota del voucher (opcional)</label>
                  <input type="text" placeholder="Ej: N° operación 123456" value={voucherNote} onChange={e => setVoucherNote(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"/>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-700 mb-2">Resumen:</p>
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.tourName} x{item.quantity}</span>
                    <span className="font-semibold">S/ {(item.priceValue * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-1 mt-1 font-bold text-gray-800">
                  <span>Total</span><span>S/ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-teal font-semibold">
                  <span>Reserva (50%)</span><span>S/ {(totalPrice * 0.5).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('instructions')} className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50">
                  ← Volver
                </button>
                <button onClick={handleConfirm}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Confirmar por WhatsApp
                </button>
              </div>
              <p className="text-center text-xs text-gray-400">
                Un asesor verificará tu pago y te enviará la confirmación oficial.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ==============================================================================
// COMPONENTE CardPaymentForm (Integración real con Culqi)
// ==============================================================================

interface CardPaymentFormProps {
  totalPrice: number
  tourNames?: string[]
}

type CardStep = 'form' | 'processing' | 'success' | 'error'

function CardPaymentForm({ totalPrice, tourNames = [] }: CardPaymentFormProps) {
  const [step, setStep]           = useState<CardStep>('form')
  const [email, setEmail]         = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv]             = useState('')
  const [holderName, setHolderName] = useState('')
  const [errorMsg, setErrorMsg]   = useState('')
  const [chargeId, setChargeId]   = useState('')

  const reserveAmount    = totalPrice * 0.5
  const reserveAmountStr = reserveAmount.toFixed(2)

  // Formateadores
  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').substring(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }
  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').substring(0, 4)
    if (digits.length >= 3) return digits.substring(0, 2) + '/' + digits.substring(2)
    return digits
  }
  const formatCvv = (v: string) => v.replace(/\D/g, '').substring(0, 4)

  // Cargar script Culqi dinámicamente
  const loadCulqiScript = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if ((window as any).Culqi) { resolve(); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.culqi.com/js/v4'
      script.onload  = () => resolve()
      script.onerror = () => reject(new Error('No se pudo cargar Culqi.js'))
      document.head.appendChild(script)
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) { setErrorMsg('Ingresa un email válido'); return }
    setStep('processing')
    setErrorMsg('')

    try {
      await loadCulqiScript()
      const CulqiSDK = (window as any).Culqi
      CulqiSDK.publicKey = CULQI_PUBLIC_KEY

      const [expMonth, expYearShort] = expiryDate.split('/')
      const expYear = expYearShort ? `20${expYearShort}` : ''

      const tokenData: any = await new Promise((resolve, reject) => {
        CulqiSDK.createToken(
          {
            card_number:       cardNumber.replace(/\s/g, ''),
            cvv,
            expiration_month:  expMonth,
            expiration_year:   expYear,
            email,
          },
          (token: any) => {
            if (token.object === 'error') {
              reject(new Error(token.user_message || 'Error al procesar la tarjeta'))
            } else {
              resolve(token)
            }
          }
        )
      })

      const response = await fetch(`${API_URL}/api/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token:       tokenData.id,
          amount:      reserveAmount,
          email,
          description: tourNames.length ? `Reserva: ${tourNames.join(', ')}` : 'Reserva Peru In Travel',
          metadata:    { paquetes: tourNames.join(' | '), tipo: '50% reserva' },
        }),
      })

      const result = await response.json()
      if (!response.ok || result.error) throw new Error(result.error || 'Error al procesar el pago')

      setChargeId(result.chargeId || 'culqi-' + Date.now())
      setStep('success')
    } catch (err: any) {
      console.error('Error en pago:', err)
      setErrorMsg(err.message || 'Error inesperado. Intenta nuevamente.')
      setStep('error')
    }
  }

  // ---- Procesando ----
  if (step === 'processing') {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
        <p className="font-semibold text-gray-700">Procesando tu pago...</p>
        <p className="text-xs text-gray-400">No cierres esta ventana</p>
      </div>
    )
  }

  // ---- Éxito ----
  if (step === 'success') {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-gray-900">¡Pago exitoso!</p>
          <p className="text-brand-teal font-semibold mt-1">S/ {reserveAmountStr} cobrados</p>
        </div>
        <p className="text-xs text-gray-400 font-mono bg-gray-50 rounded-lg px-4 py-2 break-all">
          ID: {chargeId}
        </p>
        <p className="text-sm text-gray-600">
          Tu reserva está confirmada. Recibirás los detalles en<br />
          <strong>{email}</strong> y por WhatsApp.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-brand-teal hover:bg-brand-teal-d text-white font-bold py-3 rounded-xl"
        >
          Volver al inicio
        </button>
      </div>
    )
  }

  // ---- Error ----
  if (step === 'error') {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="font-bold text-gray-900">No se pudo procesar el pago</p>
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{errorMsg}</p>
        <button
          onClick={() => setStep('form')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
        >
          Intentar nuevamente
        </button>
      </div>
    )
  }

  // ---- Formulario ----
  return (
    <div className="space-y-4">
      {/* Header resumen monto */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg">💳</div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Tarjeta crédito / débito</p>
            <p className="text-xs text-gray-500">Powered by Culqi</p>
          </div>
        </div>
        <p className="text-2xl font-extrabold text-indigo-600">S/ {reserveAmountStr}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Correo electrónico</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="tu@correo.com" required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Número de tarjeta */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Número de tarjeta</label>
          <div className="relative">
            <input
              type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456" maxLength={19} required
              className="w-full pl-4 pr-20 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono tracking-widest transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <div className="w-8 h-5 bg-blue-700 rounded text-white text-[8px] flex items-center justify-center font-bold">VISA</div>
              <div className="w-8 h-5 bg-red-500 rounded text-white text-[8px] flex items-center justify-center font-bold">MC</div>
            </div>
          </div>
        </div>

        {/* Nombre del titular */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Nombre del titular</label>
          <input
            type="text" value={holderName} onChange={e => setHolderName(e.target.value.toUpperCase())}
            placeholder="JUAN PÉREZ" required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 uppercase transition-colors"
          />
        </div>

        {/* Vencimiento + CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Vencimiento</label>
            <input
              type="text" value={expiryDate} onChange={e => setExpiryDate(formatExpiry(e.target.value))}
              placeholder="MM/AA" maxLength={5} required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-center font-mono transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">CVV</label>
            <input
              type="password" value={cvv} onChange={e => setCvv(formatCvv(e.target.value))}
              placeholder="•••" maxLength={4} required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-center font-mono transition-colors"
            />
          </div>
        </div>

        {/* Sello de seguridad */}
        <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
          <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          Datos cifrados con SSL · Procesado por Culqi
        </div>

        {/* Botón pagar */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl font-bold text-white text-base bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95"
        >
          Pagar S/ {reserveAmountStr} con Culqi
        </button>
      </form>

      {/* Nota modo demo */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
        <p className="font-bold text-amber-800 mb-1">⚙️ Activa tus claves Culqi</p>
        <p className="text-amber-700">
          Agrega <code className="bg-amber-100 px-1 rounded">VITE_CULQI_PUBLIC_KEY</code> y{' '}
          <code className="bg-amber-100 px-1 rounded">CULQI_SECRET_KEY</code> en tu{' '}
          <code className="bg-amber-100 px-1 rounded">.env</code> para cobros reales.{' '}
          <a href="https://dashboard.culqi.com" target="_blank" rel="noopener noreferrer" className="font-bold underline">
            dashboard.culqi.com
          </a>
        </p>
      </div>
    </div>
  )
}


import { useState } from 'react'
import { useCart } from '../context/CartContext'

// ─── Datos de pago ────────────────────────────────────────────────────────────
const PAYMENT_INFO = {
  yape: {
    number: '967 460 215',
    name: 'Peru In Travel',
  },
  plin: {
    number: '967 460 215',     // Cambiar si el número de Plin es diferente
    name: 'Peru In Travel',
  },
  transfer: {
    bank: 'BCP',               // Cambiar al banco real
    account: '000-000000000',  // Cambiar al número de cuenta real
    cci: '00200000000000000000', // Cambiar al CCI real
    name: 'Peru In Travel SAC',
  },
}

const WHATSAPP_NUMBER = '51929648380' // WhatsApp de contacto

type PaymentMethod = 'yape' | 'plin' | 'transfer'

interface Props {
  onClose: () => void
}

export default function PaymentModal({ onClose }: Props) {
  const { items, totalPrice, clearCart, setCartOpen } = useCart()
  const [step, setStep] = useState<'method' | 'instructions' | 'confirm'>('method')
  const [method, setMethod] = useState<PaymentMethod>('yape')
  const [voucherNote, setVoucherNote] = useState('')
  const [name, setName] = useState('')

  const methodLabels: Record<PaymentMethod, string> = {
    yape: 'Yape',
    plin: 'Plin',
    transfer: 'Transferencia bancaria',
  }

  const handleConfirm = () => {
    const methodLabel = methodLabels[method]
    let message = `🌄 *Reserva Peru In Travel*\n\n`
    message += `👤 *Nombre:* ${name || '(sin especificar)'}\n`
    message += `💳 *Método de pago:* ${methodLabel}\n\n`
    message += `📦 *Paquetes:*\n`
    items.forEach((item, i) => {
      message += `${i + 1}. ${item.tourName}\n`
      message += `   Opción: ${item.priceOption}\n`
      message += `   Personas: ${item.quantity}\n`
      message += `   Fecha: ${item.travelDate}\n`
      message += `   Subtotal: S/ ${(item.priceValue * item.quantity).toFixed(2)}\n\n`
    })
    message += `💰 *Total: S/ ${totalPrice.toFixed(2)}*\n\n`
    if (voucherNote) message += `📎 *Nota del voucher:* ${voucherNote}\n\n`
    message += `Por favor confirmen la reserva. ¡Gracias! 🙏`

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
    clearCart()
    setCartOpen(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-teal to-brand-teal-d px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Método de pago</h2>
            <p className="text-white/70 text-sm">Total a pagar: <span className="font-bold text-white">S/ {totalPrice.toFixed(2)}</span></p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex border-b">
          {(['method', 'instructions', 'confirm'] as const).map((s, i) => (
            <div key={s} className={`flex-1 py-2 text-center text-xs font-semibold transition-colors ${
              step === s ? 'text-brand-teal border-b-2 border-brand-teal' : 'text-gray-400'
            }`}>
              {i + 1}. {s === 'method' ? 'Método' : s === 'instructions' ? 'Instrucciones' : 'Confirmar'}
            </div>
          ))}
        </div>

        <div className="p-6">

          {/* ── STEP 1: Elegir método ── */}
          {step === 'method' && (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm mb-4">Selecciona cómo realizarás el pago del 50% de reserva:</p>

              {(['yape', 'plin', 'transfer'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    method === m
                      ? 'border-brand-teal bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                    m === 'yape' ? 'bg-[#6C1DDB]' :
                    m === 'plin' ? 'bg-[#00B0EA]' :
                    'bg-gray-600'
                  }`}>
                    {m === 'yape' ? 'Y' : m === 'plin' ? 'P' : '🏦'}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">{methodLabels[m]}</p>
                    <p className="text-xs text-gray-500">
                      {m === 'yape' ? 'Pago rápido desde tu app Yape' :
                       m === 'plin' ? 'Pago rápido desde tu app Plin' :
                       'Depósito o transferencia bancaria'}
                    </p>
                  </div>
                  {method === m && (
                    <svg className="w-5 h-5 text-brand-teal ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}

              <button
                onClick={() => setStep('instructions')}
                className="w-full mt-4 bg-brand-teal hover:bg-brand-teal-d text-white font-bold py-3 rounded-xl transition-colors"
              >
                Continuar →
              </button>
            </div>
          )}

          {/* ── STEP 2: Instrucciones ── */}
          {step === 'instructions' && (
            <div className="space-y-4">
              {(method === 'yape' || method === 'plin') && (
                <>
                  <div className={`rounded-xl p-4 text-center ${method === 'yape' ? 'bg-[#6C1DDB]/10' : 'bg-[#00B0EA]/10'}`}>
                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-black text-white mb-3 ${
                      method === 'yape' ? 'bg-[#6C1DDB]' : 'bg-[#00B0EA]'
                    }`}>
                      {method === 'yape' ? 'Y' : 'P'}
                    </div>
                    <p className="font-bold text-gray-800 text-lg">
                      {method === 'yape' ? PAYMENT_INFO.yape.number : PAYMENT_INFO.plin.number}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {method === 'yape' ? PAYMENT_INFO.yape.name : PAYMENT_INFO.plin.name}
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 space-y-1">
                    <p className="font-semibold">📋 Instrucciones:</p>
                    <ol className="list-decimal list-inside space-y-1 text-yellow-700">
                      <li>Abre tu app {method === 'yape' ? 'Yape' : 'Plin'}</li>
                      <li>Ingresa el número <strong>{method === 'yape' ? PAYMENT_INFO.yape.number : PAYMENT_INFO.plin.number}</strong></li>
                      <li>Envía el <strong>50% del total (S/ {(totalPrice * 0.5).toFixed(2)})</strong> como reserva</li>
                      <li>Guarda el comprobante / captura de pantalla</li>
                      <li>Continúa al siguiente paso para confirmar por WhatsApp</li>
                    </ol>
                  </div>
                </>
              )}

              {method === 'transfer' && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <p className="font-bold text-gray-700 mb-3">🏦 Datos bancarios:</p>
                    <div className="flex justify-between"><span className="text-gray-500">Banco:</span><span className="font-semibold">{PAYMENT_INFO.transfer.bank}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Titular:</span><span className="font-semibold">{PAYMENT_INFO.transfer.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">N° cuenta:</span><span className="font-semibold font-mono">{PAYMENT_INFO.transfer.account}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">CCI:</span><span className="font-semibold font-mono text-xs">{PAYMENT_INFO.transfer.cci}</span></div>
                    <div className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-500">Monto reserva (50%):</span><span className="font-bold text-brand-teal">S/ {(totalPrice * 0.5).toFixed(2)}</span></div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
                    ⚠️ Realiza la transferencia y guarda tu voucher antes de continuar.
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('method')} className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  ← Volver
                </button>
                <button onClick={() => setStep('confirm')} className="flex-1 bg-brand-teal hover:bg-brand-teal-d text-white font-bold py-3 rounded-xl transition-colors">
                  Ya pagué →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Confirmar ── */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <svg className="w-10 h-10 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 font-semibold text-sm">
                  ¡Casi listo! Envíanos el comprobante por WhatsApp para confirmar tu reserva.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Tu nombre completo</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Nota del voucher (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: N° operación 123456 o 'ya te yapé'"
                    value={voucherNote}
                    onChange={(e) => setVoucherNote(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-700 mb-2">Resumen de tu reserva:</p>
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate max-w-[60%]">{item.tourName}</span>
                    <span className="font-semibold">S/ {(item.priceValue * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-1 mt-1 font-bold text-gray-800">
                  <span>Total</span>
                  <span>S/ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-teal font-semibold">
                  <span>Pago reserva (50%)</span>
                  <span>S/ {(totalPrice * 0.5).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('instructions')} className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  ← Volver
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Confirmar por WhatsApp
                </button>
              </div>

              <p className="text-center text-xs text-gray-400">
                Al confirmar, un asesor verificará tu pago y te enviará la confirmación oficial.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

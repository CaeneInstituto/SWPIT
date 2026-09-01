import { useState } from 'react'
import { useCart } from '../context/CartContext'
import jsPDF from 'jspdf'

// Claves Culqi (se cargan desde .env)
const CULQI_PUBLIC_KEY = (import.meta as any).env?.VITE_CULQI_PUBLIC_KEY
const API_URL          = (import.meta as any).env?.VITE_API_URL || '' // Si está vacío, usará rutas relativas
const WHATSAPP_NUMBER  = '51929648380'

// Validar que existe la Public Key
if (!CULQI_PUBLIC_KEY) {
  console.error('❌ VITE_CULQI_PUBLIC_KEY no está configurada en las variables de entorno')
}

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
type ModalStep     = 'method' | 'instructions' | 'confirm' | 'passengers'

interface Props { onClose: () => void }

// Declarar tipo de Culqi global
declare global {
  interface Window {
    Culqi: any
    culqi: () => void
  }
}

export default function PaymentModal({ onClose }: Props) {
  const { items, totalPrice, clearCart, setCartOpen } = useCart()
  const [step, setStep]         = useState<ModalStep>('method')
  const [method, setMethod]     = useState<PaymentMethod>('yape')
  const [voucherNote, setVoucherNote] = useState('')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [dni, setDni]           = useState('')
  const [embarque, setEmbarque] = useState('')
  const [habitacion, setHabitacion] = useState('')
  const [comentario, setComentario] = useState('')

  // Datos del pago exitoso con tarjeta
  const [cardPaymentData, setCardPaymentData] = useState<{
    chargeId: string
    email: string
    holderName: string
    phone: string
    dni: string
    embarque: string
    habitacion: string
    comentario: string
    passengers: Array<{ nombre: string; dni: string; edad: string }>
    amount: string
  } | null>(null)
  
  // Calcular total de personas del carrito (sumando personsPerPackage * quantity de cada item)
  const totalPersonsFromCart = items.reduce((sum, item) => sum + (item.personsPerPackage * item.quantity), 0)
  
  // Verificar si hay algún paquete con alojamiento
  const hasAnyAccommodation = items.some(item => item.hasAccommodation)
  
  // Obtener puntos de embarque (del primer item que los tenga)
  const boardingPoints = items.find(item => item.boardingPoints)?.boardingPoints || []
  
  // Inicializar pasajeros según la cantidad del carrito
  const initializePassengers = () => {
    const passengerCount = Math.max(1, totalPersonsFromCart)
    return Array.from({ length: passengerCount }, () => ({ nombre: '', dni: '', edad: '' }))
  }
  
  const [passengers, setPassengers] = useState<Array<{
    nombre: string
    dni: string
    edad: string
  }>>(initializePassengers())

  const methodLabels: Record<PaymentMethod, string> = {
    yape:     'Yape (50% adelanto por WhatsApp)',
    plin:     'Plin (50% adelanto por WhatsApp)',
    transfer: 'Transferencia bancaria',
    card:     'Tarjeta de crédito/débito',
  }

  // Validar campos obligatorios
  const isFormValid = () => {
    if (!name.trim()) return false
    if (!dni.trim()) return false
    if (!phone.trim()) return false
    if (boardingPoints.length > 0 && !embarque) return false
    return true
  }

  const handleConfirm = async () => {
    // Calcular monto según método (Yape y Plin 50%, demás 100%)
    const isPartialPayment = method === 'yape' || method === 'plin'
    const amountToPay = isPartialPayment ? totalPrice * 0.5 : totalPrice
    
    // Preparar datos para guardar
    const purchaseData = {
      name: name || 'Sin especificar',
      email: method === 'card' ? email : '', // Solo guardar email si es tarjeta
      phone: phone || '',
      dni: dni || '',
      method: methodLabels[method],
      tours: items.map(item => `${item.tourName} (${item.priceOption})`).join('; '),
      totalPersons: totalPersonsFromCart,
      travelDate: items.map(item => item.travelDate).join('; '),
      totalPrice: totalPrice.toFixed(2),
      reserveAmount: amountToPay.toFixed(2),
      paymentStatus: 'Pendiente confirmación',
      note: voucherNote || '',
      culqiId: '',
      embarque: embarque || '',
      habitacion: habitacion || '',
      comentario: comentario || '',
      passengers: passengers.filter(p => p.nombre || p.dni || p.edad) // Solo pasajeros con datos
    }

    // Guardar en BD solo para métodos manuales (NO para tarjeta, eso lo hace /api/charge)
    if (method !== 'card') {
      try {
        await fetch(`${API_URL}/api/save-purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(purchaseData)
        })
      } catch (error) {
        console.error('Error guardando compra:', error)
      }
    }

    // Construir mensaje de WhatsApp
    let message = `🌄 *Reserva Peru In Travel*\n\n`
    message += `👤 *Nombre:* ${name || '(sin especificar)'}\n`
    if (dni) message += `🆔 *DNI:* ${dni}\n`
    message += `📱 *Teléfono:* ${phone || '(sin especificar)'}\n`
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
    message += `💵 *Monto a pagar: S/ ${amountToPay.toFixed(2)}*${isPartialPayment ? ' (50% adelanto)' : ''}\n`
    if (embarque) message += `📍 *Punto de embarque:* ${embarque}\n`
    if (voucherNote) message += `📎 *Nota:* ${voucherNote}\n`
    if (comentario) message += `💬 *Comentario:* ${comentario}\n`
    message += `\nPor favor confirmen la reserva. ¡Gracias! 🙏`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
    clearCart()
    setCartOpen(false)
    onClose()
  }

  const tourNames = items.map(i => i.tourName)

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { if (cardPaymentData) { clearCart(); setCartOpen(false) }; onClose() }} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-brand-teal to-brand-teal-d px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-white font-bold text-lg">Método de pago</h2>
            <p className="text-white/70 text-sm">Total: <span className="font-bold text-white">S/ {totalPrice.toFixed(2)}</span></p>
          </div>
          <button onClick={() => { if (cardPaymentData) { clearCart(); setCartOpen(false) }; onClose() }} className="text-white/80 hover:text-white">
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
              <p className="text-gray-600 text-sm mb-4">Selecciona cómo realizarás el pago:</p>
              {(['yape', 'plin', 'card'] as PaymentMethod[]).map((m) => (
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
                      {m === 'yape' ? 'Pago rápido desde tu app Yape · Coordinación por WhatsApp (50% adelanto)'
                      : m === 'plin' ? 'Pago rápido desde tu app Plin · Coordinación por WhatsApp (50% adelanto)'
                      : 'Visa, Mastercard, Amex · Powered by Culqi (100%)'}
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
                  {method === 'yape' ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                      <p className="font-semibold text-blue-800">📋 Instrucciones (Pago 50% adelanto):</p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-700 mt-2">
                        <li>Abre tu app Yape</li>
                        <li>Ingresa el número <strong>{PAYMENT_INFO.yape.number}</strong></li>
                        <li>Envía <strong>S/ {(totalPrice * 0.5).toFixed(2)}</strong> (50% del total)</li>
                        <li>Guarda el comprobante</li>
                        <li>Completa el formulario y envía por WhatsApp</li>
                        <li>El 50% restante se paga antes del viaje</li>
                      </ol>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
                      <p className="font-semibold text-yellow-800">📋 Instrucciones (Pago 50% adelanto):</p>
                      <ol className="list-decimal list-inside space-y-1 text-yellow-700 mt-2">
                        <li>Abre tu app Plin</li>
                        <li>Ingresa el número <strong>{PAYMENT_INFO.plin.number}</strong></li>
                        <li>Envía <strong>S/ {(totalPrice * 0.5).toFixed(2)}</strong> (50% del total)</li>
                        <li>Guarda el comprobante</li>
                        <li>Completa el formulario y envía por WhatsApp</li>
                        <li>El 50% restante se paga antes del viaje</li>
                      </ol>
                    </div>
                  )}
                </>
              )}

              {/* Tarjeta - Culqi */}
              {method === 'card' && (
                <CardPaymentForm
                  totalPrice={totalPrice}
                  tourNames={tourNames}
                  items={items}
                  onSuccess={(data) => {
                    setCardPaymentData(data)
                    setStep('confirm')
                    // NO limpiar el carrito aquí, se limpia al cerrar el modal de éxito
                  }}
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
                    <div className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-500">Monto:</span><span className="font-bold text-brand-teal">S/ {totalPrice.toFixed(2)}</span></div>
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

              {/* ── Pago con tarjeta: pantalla de éxito con PDF y WhatsApp ── */}
              {cardPaymentData ? (
                <>
                  {/* Icono éxito */}
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  {/* Título y monto */}
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-gray-900">¡Pago exitoso!</p>
                    <p className="text-brand-teal font-bold text-3xl mt-1">S/ {cardPaymentData.amount}</p>
                    <p className="text-sm text-gray-500 mt-1">Pago procesado correctamente</p>
                  </div>

                  {/* ID transacción */}
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">ID DE TRANSACCIÓN</p>
                    <p className="text-xs font-mono text-gray-700 break-all">{cardPaymentData.chargeId}</p>
                  </div>

                  {/* Datos del cliente */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 space-y-1">
                    <p className="text-sm text-blue-800"><strong>📧 Email:</strong> {cardPaymentData.email}</p>
                    <p className="text-sm text-blue-800"><strong>👤 Nombre:</strong> {cardPaymentData.holderName}</p>
                    {cardPaymentData.dni && <p className="text-sm text-blue-800"><strong>🆔 DNI:</strong> {cardPaymentData.dni}</p>}
                    {cardPaymentData.phone && <p className="text-sm text-blue-800"><strong>📱 Teléfono:</strong> {cardPaymentData.phone}</p>}
                    {cardPaymentData.embarque && <p className="text-sm text-blue-800"><strong>📍 Embarque:</strong> {cardPaymentData.embarque}</p>}
                  </div>

                  {/* Tours reservados */}
                  <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 max-h-32 overflow-y-auto">
                    <p className="text-xs font-bold text-teal-800 mb-2">🎒 TOURS RESERVADOS:</p>
                    {items.map((item, i) => (
                      <div key={i} className="text-xs text-teal-700 mb-2 pb-2 border-b border-teal-200 last:border-0">
                        <p className="font-semibold">{i + 1}. {item.tourName}</p>
                        <p>📅 {item.travelDate} · 👥 {item.quantity} persona(s)</p>
                      </div>
                    ))}
                  </div>

                  {/* Botones */}
                  <div className="space-y-3">
                    {/* Descargar PDF */}
                    <button
                      onClick={() => {
                        const doc = new jsPDF()
                        const teal = [10, 108, 111] as [number, number, number]
                        const gray = [100, 100, 100] as [number, number, number]
                        doc.setFillColor(...teal); doc.rect(0, 0, 210, 35, 'F')
                        doc.setTextColor(255,255,255); doc.setFontSize(22); doc.setFont('helvetica','bold')
                        doc.text('PERU IN TRAVEL', 105, 14, { align: 'center' })
                        doc.setFontSize(11); doc.setFont('helvetica','normal')
                        doc.text('Voucher de Reserva Confirmada', 105, 25, { align: 'center' })
                        doc.setTextColor(...gray); doc.setFontSize(10)
                        let y = 48
                        const row = (label: string, val: string) => {
                          doc.setFont('helvetica','bold'); doc.text(label, 20, y)
                          doc.setFont('helvetica','normal'); doc.text(val, 72, y); y += 8
                        }
                        row('ID de Transacción:', cardPaymentData.chargeId)
                        row('Email:', cardPaymentData.email)
                        row('Nombre:', cardPaymentData.holderName)
                        if (cardPaymentData.dni)      row('DNI:', cardPaymentData.dni)
                        if (cardPaymentData.phone)    row('Teléfono:', cardPaymentData.phone)
                        if (cardPaymentData.embarque) row('Embarque:', cardPaymentData.embarque)
                        if (cardPaymentData.habitacion) row('Habitación:', cardPaymentData.habitacion)
                        row('Fecha de pago:', new Date().toLocaleString('es-PE'))
                        y += 4
                        doc.setDrawColor(...teal); doc.setLineWidth(0.5); doc.line(20, y, 190, y); y += 10
                        doc.setFontSize(13); doc.setFont('helvetica','bold'); doc.setTextColor(...teal)
                        doc.text('Detalle de la Reserva', 20, y); y += 10
                        doc.setFontSize(10); doc.setTextColor(...gray)
                        items.forEach((item, idx) => {
                          doc.setFont('helvetica','bold'); doc.text(`${idx+1}. ${item.tourName}`, 20, y); y += 6
                          doc.setFont('helvetica','normal')
                          doc.text(`   Opción: ${item.priceOption}`, 25, y); y += 5
                          doc.text(`   Personas: ${item.quantity}  |  Fecha: ${item.travelDate}`, 25, y); y += 5
                          doc.text(`   Subtotal: S/ ${(item.priceValue * item.quantity).toFixed(2)}`, 25, y); y += 8
                        })
                        y += 4
                        doc.setDrawColor(...teal); doc.line(20, y, 190, y); y += 10
                        doc.setFontSize(15); doc.setFont('helvetica','bold'); doc.setTextColor(...teal)
                        doc.text('TOTAL PAGADO:', 20, y)
                        doc.text(`S/ ${cardPaymentData.amount}`, 190, y, { align: 'right' })
                        y += 20
                        doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(...gray)
                        doc.text('Gracias por confiar en Peru In Travel', 105, y, { align: 'center' })
                        doc.text('WhatsApp: +51 929 648 380', 105, y+6, { align: 'center' })
                        doc.save(`Voucher-PeruInTravel-${cardPaymentData.chargeId}.pdf`)
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Descargar Voucher (PDF)
                    </button>

                    {/* Compartir por WhatsApp */}
                    <button
                      onClick={() => {
                        const msg =
                          `🎉 *¡Reserva Confirmada – Peru In Travel!*\n\n` +
                          `📋 *ID:* ${cardPaymentData.chargeId}\n` +
                          `👤 *Nombre:* ${cardPaymentData.holderName}\n` +
                          (cardPaymentData.dni ? `🆔 *DNI:* ${cardPaymentData.dni}\n` : '') +
                          `📧 *Email:* ${cardPaymentData.email}\n` +
                          (cardPaymentData.phone ? `📱 *Tel:* ${cardPaymentData.phone}\n` : '') +
                          `💳 *Total pagado:* S/ ${cardPaymentData.amount}\n\n` +
                          `🎒 *Tours:*\n` +
                          items.map((it, i) =>
                            `${i+1}. ${it.tourName}\n   📅 ${it.travelDate} · 👥 ${it.quantity} persona(s)`
                          ).join('\n') +
                          (cardPaymentData.embarque ? `\n\n📍 *Embarque:* ${cardPaymentData.embarque}` : '') +
                          (cardPaymentData.comentario ? `\n💬 *Nota:* ${cardPaymentData.comentario}` : '') +
                          `\n\n¡Gracias por elegirnos! 🌄`
                        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
                      }}
                      className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Enviar resumen por WhatsApp
                    </button>

                    {/* Volver al inicio */}
                    <button
                      onClick={() => { clearCart(); setCartOpen(false); onClose() }}
                      className="w-full border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white font-bold py-3 rounded-xl transition-colors"
                    >
                      Volver al inicio
                    </button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-yellow-800">
                      💡 Guarda tu voucher y el ID de transacción. Te contactaremos por WhatsApp para coordinar los detalles del viaje.
                    </p>
                  </div>
                </>

              ) : (
                /* ── Otros métodos: formulario de confirmación normal ── */
                <>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <svg className="w-10 h-10 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-green-800 font-semibold text-sm">
                      ¡Casi listo! Envíanos el comprobante por WhatsApp para confirmar tu reserva.
                    </p>
                  </div>
                  
                  {/* Alerta de campos obligatorios */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                    <p className="font-semibold mb-1">📋 Datos requeridos para confirmar:</p>
                    <ul className="text-xs space-y-0.5 ml-4 list-disc">
                      <li>Nombre completo</li>
                      <li>DNI</li>
                      <li>Teléfono / WhatsApp</li>
                      {boardingPoints.length > 0 && <li>Punto de embarque</li>}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                        Tu nombre completo <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="Ej: Juan Pérez" value={name} onChange={e => setName(e.target.value)} required
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal ${
                          !name.trim() ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}/>
                      {!name.trim() && <p className="text-xs text-red-500 mt-1">Este campo es obligatorio</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                        DNI <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="Ej: 12345678" value={dni} onChange={e => setDni(e.target.value)} required
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal ${
                          !dni.trim() ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}/>
                      {!dni.trim() && <p className="text-xs text-red-500 mt-1">Este campo es obligatorio</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                        Teléfono / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input type="tel" placeholder="Ej: 987654321" value={phone} onChange={e => setPhone(e.target.value)} required
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal ${
                          !phone.trim() ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}/>
                      {!phone.trim() && <p className="text-xs text-red-500 mt-1">Este campo es obligatorio</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                        Punto de embarque {boardingPoints.length > 0 && <span className="text-red-500">*</span>}
                      </label>
                      {boardingPoints.length > 0 ? (
                        <>
                          <select value={embarque} onChange={e => setEmbarque(e.target.value)} required
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal ${
                              !embarque ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            }`}>
                            <option value="">Selecciona un punto de embarque</option>
                            {boardingPoints.map((point, index) => (
                              <option key={index} value={point.name}>{point.name} - {point.time}</option>
                            ))}
                            <option value="Otro">Otro (especificar en comentario)</option>
                          </select>
                          {!embarque && <p className="text-xs text-red-500 mt-1">Debes seleccionar un punto de embarque</p>}
                        </>
                      ) : (
                        <input type="text" placeholder="Ej: Plaza San Martín, Lima" value={embarque} onChange={e => setEmbarque(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"/>
                      )}
                    </div>
                    {hasAnyAccommodation && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Habitación (si aplica)</label>
                        <input type="text" placeholder="Ej: Simple, Doble, Matrimonial" value={habitacion} onChange={e => setHabitacion(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"/>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Datos de pasajeros</label>
                      {passengers.map((passenger, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 mb-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-600">Pasajero {index + 1}</span>
                            {passengers.length > 1 && (
                              <button type="button" onClick={() => setPassengers(passengers.filter((_, i) => i !== index))}
                                className="text-red-500 text-xs hover:text-red-700">Eliminar</button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <input type="text" placeholder="Nombre" value={passenger.nombre}
                              onChange={e => { const p = [...passengers]; p[index].nombre = e.target.value; setPassengers(p) }}
                              className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs"/>
                            <input type="text" placeholder="DNI" value={passenger.dni}
                              onChange={e => { const p = [...passengers]; p[index].dni = e.target.value; setPassengers(p) }}
                              className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs"/>
                            <input type="text" placeholder="Edad" value={passenger.edad}
                              onChange={e => { const p = [...passengers]; p[index].edad = e.target.value; setPassengers(p) }}
                              className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs"/>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => setPassengers([...passengers, { nombre: '', dni: '', edad: '' }])}
                        className="text-xs text-brand-teal hover:underline font-semibold">+ Agregar pasajero</button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Comentario adicional</label>
                      <textarea placeholder="Alguna indicación especial..." value={comentario} onChange={e => setComentario(e.target.value)} rows={2}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal resize-none"/>
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
                      <span>Monto a pagar</span><span>S/ {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('instructions')} className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50">
                      ← Volver
                    </button>
                    <button 
                      onClick={handleConfirm}
                      disabled={!isFormValid()}
                      className={`flex-1 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                        isFormValid() 
                          ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      {isFormValid() ? 'Confirmar por WhatsApp' : 'Completa los campos obligatorios'}
                    </button>
                  </div>
                  <p className="text-center text-xs text-gray-400">
                    Un asesor verificará tu pago y te enviará la confirmación oficial.
                  </p>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ==============================================================================
// COMPONENTE CardPaymentForm (Integración con CulqiJS)
// ==============================================================================

interface CardPaymentFormProps {
  totalPrice: number
  tourNames?: string[]
  items: any[]
  onSuccess: (data: {
    chargeId: string
    email: string
    holderName: string
    phone: string
    dni: string
    embarque: string
    habitacion: string
    comentario: string
    passengers: Array<{ nombre: string; dni: string; edad: string }>
    amount: string
  }) => void
}

type CardStep = 'form' | 'client-data' | 'processing' | 'success' | 'error'

function CardPaymentForm({ totalPrice, tourNames = [], items, onSuccess }: CardPaymentFormProps) {
  const [step, setStep]           = useState<CardStep>('form')
  const [email, setEmail]         = useState('')
  const [holderName, setHolderName] = useState('')
  const [errorMsg, setErrorMsg]   = useState('')
  const [chargeId, setChargeId]   = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Datos adicionales del cliente
  const [phone, setPhone]         = useState('')
  const [dni, setDni]             = useState('')
  const [embarque, setEmbarque]   = useState('')
  const [habitacion, setHabitacion] = useState('')
  const [comentario, setComentario] = useState('')
  
  // Calcular total de personas del carrito
  const totalPersonsFromCart = items.reduce((sum, item) => sum + (item.personsPerPackage * item.quantity), 0)
  
  // Verificar si hay algún paquete con alojamiento
  const hasAnyAccommodation = items.some(item => item.hasAccommodation)
  
  // Obtener puntos de embarque
  const boardingPoints = items.find(item => item.boardingPoints)?.boardingPoints || []
  
  // Inicializar pasajeros
  const initializePassengers = () => {
    const passengerCount = Math.max(1, totalPersonsFromCart)
    return Array.from({ length: passengerCount }, () => ({ nombre: '', dni: '', edad: '' }))
  }
  
  const [passengers, setPassengers] = useState<Array<{
    nombre: string
    dni: string
    edad: string
  }>>(initializePassengers())

  const reserveAmount    = totalPrice // 100% para tarjeta
  const reserveAmountStr = reserveAmount.toFixed(2)

  // Inicializar Culqi y manejar el callback
  const initializeCulqi = () => {
    if (!window.Culqi) {
      setErrorMsg('Error: Culqi no está cargado. Recarga la página.')
      return
    }

    if (!CULQI_PUBLIC_KEY) {
      setErrorMsg('Error de configuración: falta la clave pública de Culqi')
      return
    }

    // Configurar Culqi
    window.Culqi.publicKey = CULQI_PUBLIC_KEY
    
    // Definir el callback que Culqi llamará después de tokenizar
    window.culqi = function() {
      if (window.Culqi.token) {
        // Token generado exitosamente
        const token = window.Culqi.token.id
        console.log('✅ Token Culqi generado:', token)
        processPayment(token)
      } else if (window.Culqi.error) {
        // Error al generar token
        console.error('❌ Error Culqi:', window.Culqi.error)
        
        // Cerrar el modal de Culqi
        if (window.Culqi.close) {
          window.Culqi.close()
        }
        
        setErrorMsg(window.Culqi.error.user_message || 'Error al procesar la tarjeta')
        setStep('error')
        setIsProcessing(false)
      }
    }
  }

  // Procesar el pago con el token
  const processPayment = async (token: string) => {
    try {
      console.log('Enviando token al backend...')
      
      // Generar orderId único para idempotencia
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Enviar token y datos de tours al backend
      const response = await fetch(`${API_URL}/api/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          orderId, // ID único para prevenir doble cobro
          email,
          buyerName: holderName,
          description: tourNames.length ? `Reserva: ${tourNames.join(', ')}` : 'Reserva Peru In Travel',
          metadata: {
            paquetes: tourNames.join(' | '),
            tipo: 'Pago completo',
            telefono: phone,
            dni,
            embarque,
            habitacion,
            comentario,
            pasajeros: passengers.filter(p => p.nombre || p.dni).map(p => `${p.nombre} (${p.dni})`).join(', ')
          },
          items: items.map(item => ({
            tourId: item.tourId || item.id,
            tourName: item.tourName,
            priceOption: item.priceOption,
            quantity: item.quantity,
            personsPerPackage: item.personsPerPackage || 1,
            travelDate: item.travelDate
          }))
        }),
      })

      const result = await response.json()
      
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Error al procesar el pago')
      }

      console.log('✅ Pago procesado exitosamente:', result)
      
      const finalChargeId = result.chargeId || 'culqi-' + Date.now()
      setChargeId(finalChargeId)

      // Cerrar el modal de Culqi
      if (window.Culqi && window.Culqi.close) {
        window.Culqi.close()
      }

      // Notificar éxito al componente padre
      onSuccess({
        chargeId: finalChargeId,
        email,
        holderName,
        phone,
        dni,
        embarque,
        habitacion,
        comentario,
        passengers: passengers.filter(p => p.nombre || p.dni || p.edad),
        amount: reserveAmountStr,
      })
      
      setIsProcessing(false)
    } catch (err: any) {
      console.error('❌ Error en pago:', err)
      
      // Cerrar el modal de Culqi en caso de error
      if (window.Culqi && window.Culqi.close) {
        window.Culqi.close()
      }
      
      setErrorMsg(err.message || 'Error inesperado. Intenta nuevamente.')
      setStep('error')
      setIsProcessing(false)
    }
  }

  // Abrir Culqi Checkout
  const openCulqiCheckout = () => {
    if (isProcessing) return // Prevenir doble click
    
    if (!email || !holderName) {
      setErrorMsg('Por favor completa todos los campos requeridos')
      return
    }

    setIsProcessing(true)
    setStep('processing')
    setErrorMsg('')

    // Inicializar Culqi
    initializeCulqi()

    // Abrir el checkout de Culqi
    // order debe ser string o número según Culqi V4
    const orderId = Date.now().toString()
    
    window.Culqi.settings({
      title: 'Peru In Travel',
      currency: 'PEN',
      amount: Math.round(reserveAmount * 100), // Culqi espera céntimos
      order: orderId
    })
    
    window.Culqi.options({
      lang: 'es',
      modal: true,
      style: {
        logo: 'https://swpit.vercel.app/logo.png',
        maincolor: '#0A6C6F',
        buttontext: '#ffffff',
        maintext: '#4A4A4A',
        desctext: '#4A4A4A'
      }
    })

    window.Culqi.open()
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
          onClick={() => {
            setStep('form')
            setIsProcessing(false)
          }}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
        >
          Intentar nuevamente
        </button>
      </div>
    )
  }

  // ---- Formulario de datos del cliente ----
  if (step === 'client-data') {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
          <p className="text-sm text-green-800">
            ✅ Datos validados. Completa la información adicional.
          </p>
        </div>
        
        <div className="space-y-3">
          {/* DNI */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">DNI *</label>
            <input type="text" placeholder="Ej: 12345678" value={dni} onChange={e => setDni(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"/>
          </div>
          
          {/* Teléfono */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Teléfono / WhatsApp *</label>
            <input type="tel" placeholder="Ej: 987654321" value={phone} onChange={e => setPhone(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"/>
          </div>
          
          {/* Punto de embarque */}
          {boardingPoints.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Punto de embarque</label>
              <select value={embarque} onChange={e => setEmbarque(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal">
                <option value="">Selecciona un punto</option>
                {boardingPoints.map((point: { name: string; address: string; time: string }, i: number) => (
                  <option key={i} value={point.name}>{point.name} - {point.time}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Habitación */}
          {hasAnyAccommodation && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Tipo de habitación</label>
              <select value={habitacion} onChange={e => setHabitacion(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal">
                <option value="">Selecciona tipo</option>
                <option value="Simple">Simple</option>
                <option value="Doble">Doble</option>
                <option value="Matrimonial">Matrimonial</option>
                <option value="Triple">Triple</option>
              </select>
            </div>
          )}
          
          {/* Comentarios */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Comentarios adicionales</label>
            <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={2}
              placeholder="Alguna petición especial, alergias, etc."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal resize-none"/>
          </div>
          
          {/* Pasajeros */}
          {totalPersonsFromCart > 0 && (
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                Datos de pasajeros ({totalPersonsFromCart} persona{totalPersonsFromCart > 1 ? 's' : ''})
              </p>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {passengers.map((p, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Pasajero {i + 1}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="Nombre" value={p.nombre}
                        onChange={e => {
                          const updated = [...passengers]
                          updated[i].nombre = e.target.value
                          setPassengers(updated)
                        }}
                        className="col-span-2 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-teal"/>
                      <input type="text" placeholder="DNI" value={p.dni}
                        onChange={e => {
                          const updated = [...passengers]
                          updated[i].dni = e.target.value
                          setPassengers(updated)
                        }}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-teal"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => setStep('form')}
            className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50">
            ← Volver
          </button>
          <button onClick={openCulqiCheckout}
            disabled={isProcessing}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
            Pagar S/ {reserveAmountStr} 💳
          </button>
        </div>
      </div>
    )
  }

  // ---- Formulario inicial ----
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

      <form onSubmit={(e) => { e.preventDefault(); if (!email || !holderName) { setErrorMsg('Completa todos los campos'); return }; setStep('client-data') }} className="space-y-3">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Correo electrónico *</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="tu@correo.com" required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Nombre del titular */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Nombre del titular *</label>
          <input
            type="text" value={holderName} onChange={e => setHolderName(e.target.value.toUpperCase())}
            placeholder="JUAN PÉREZ" required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 uppercase transition-colors"
          />
        </div>

        {/* Sello de seguridad */}
        <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
          <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          Los datos de tu tarjeta se procesan de forma segura con Culqi
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        {/* Botón continuar */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl font-bold text-white text-base bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95"
        >
          Continuar →
        </button>
      </form>

      {/* Sello de confianza */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
        <p className="text-green-700">Pago 100% seguro procesado por <strong>Culqi</strong></p>
      </div>
    </div>
  )
}

/**
 * Backend de pagos - Peru In Travel
 * Procesa cobros con Culqi usando la clave secreta
 * 
 * ⚠️  NUNCA exponer CULQI_SECRET_KEY al frontend
 */

import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

// ─── Claves Culqi ─────────────────────────────────────────────────────────────
// Reemplaza con tus claves reales desde https://dashboard.culqi.com
const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY || 'sk_test_XXXXXXXXXXXXXXXX'
const CULQI_BASE_URL   = 'https://api.culqi.com/v2'

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'https://tu-dominio.com'] }))
app.use(express.json())

// ─── POST /api/charge ─────────────────────────────────────────────────────────
// Recibe: { token, amount, email, description, metadata }
// Retorna: { success, chargeId } o { error }
app.post('/api/charge', async (req, res) => {
  const { token, amount, email, description, metadata } = req.body

  if (!token || !amount || !email) {
    return res.status(400).json({ error: 'Faltan campos requeridos: token, amount, email' })
  }

  // amount en Culqi siempre va en CENTIMOS (ej: S/ 85.00 → 8500)
  const amountInCents = Math.round(amount * 100)

  try {
    const response = await fetch(`${CULQI_BASE_URL}/charges`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CULQI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency_code: 'PEN',
        email,
        source_id: token,
        description: description || 'Reserva Peru In Travel',
        metadata: metadata || {},
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Culqi error:', data)
      return res.status(400).json({
        error: data.user_message || data.merchant_message || 'Error al procesar el pago',
      })
    }

    console.log(`✅ Cobro exitoso: ${data.id} | S/ ${amount} | ${email}`)
    return res.json({ success: true, chargeId: data.id, amount: data.amount })

  } catch (err) {
    console.error('Error de red al llamar a Culqi:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// ─── GET /api/health ──────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', mode: CULQI_SECRET_KEY.startsWith('sk_test') ? 'TEST' : 'PRODUCCIÓN' })
})

app.listen(PORT, () => {
  const mode = CULQI_SECRET_KEY.startsWith('sk_test') ? '🧪 TEST' : '🔴 PRODUCCIÓN'
  console.log(`\n💳 Servidor de pagos Peru In Travel`)
  console.log(`📡 Puerto: ${PORT}`)
  console.log(`🔑 Modo: ${mode}`)
  console.log(`✅ Listo en http://localhost:${PORT}\n`)
})

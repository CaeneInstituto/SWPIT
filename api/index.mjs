import express      from 'express'
import cors         from 'cors'
import { readFileSync } from 'fs'
import { MongoClient }  from 'mongodb'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ── Cargar .env ───────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
try {
  const envFile = readFileSync(join(__dirname, '../.env'), 'utf8')
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) return
    const key = trimmed.substring(0, eqIdx).trim()
    let val = trimmed.substring(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (key && !process.env[key]) process.env[key] = val
  })
} catch (_) { /* En Vercel las variables vienen de process.env directamente */ }

const app = express()

const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY || ''
const MONGODB_URI      = process.env.MONGODB_URI      || ''

// ── MongoDB ───────────────────────────────────────────────────────────────────
let db = null

async function connectDB() {
  if (!MONGODB_URI || db) return
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS:         10000,
      tls: true,
    })
    await client.connect()
    await client.db('admin').command({ ping: 1 })
    db = client.db('peruintravel')
  } catch (err) {
    console.error('MongoDB error:', err.message)
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mongo:  db ? '✅ conectado' : '❌ desconectado',
    culqi:  CULQI_SECRET_KEY.startsWith('sk_live') ? '🟢 LIVE' : '🧪 TEST',
    mongoUri: MONGODB_URI ? '✅ configurado' : '❌ NO configurado'
  })
})

// ── POST /api/charge ──────────────────────────────────────────────────────────
app.post('/api/charge', async (req, res) => {
  const { token, amount, email, description, metadata, buyerName, items } = req.body

  if (!token || !amount || !email) {
    return res.status(400).json({ error: 'Faltan campos: token, amount, email' })
  }

  try {
    const culqiRes = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${CULQI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount:        Math.round(amount * 100),
        currency_code: 'PEN',
        email,
        source_id:     token,
        description:   description || 'Reserva Peru In Travel',
        metadata:      metadata    || {},
      }),
    })

    const charge = await culqiRes.json()
    if (charge.object === 'error') {
      return res.status(400).json({ error: charge.user_message || 'Error en Culqi' })
    }

    const compra = {
      chargeId:    charge.id,
      amount,
      currency:    'PEN',
      status:      charge.outcome?.type || 'unknown',
      email,
      buyerName:   buyerName || metadata?.nombre || '',
      description: description || '',
      items:       items    || [],
      metadata:    metadata || {},
      createdAt:   new Date(),
      card: charge.source ? {
        brand:   charge.source.brand,
        last4:   charge.source.last_four,
        country: charge.source.issuer?.country,
      } : null,
    }

    if (db) {
      await db.collection('compras').insertOne(compra)
    }

    res.json({ ok: true, chargeId: charge.id })
  } catch (err) {
    console.error('Error /api/charge:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// ── GET /api/compras ──────────────────────────────────────────────────────────
app.get('/api/compras', async (_req, res) => {
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  try {
    const compras = await db.collection('compras')
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray()
    res.json({ ok: true, total: compras.length, compras })
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener compras' })
  }
})

// ── POST /api/save-purchase ───────────────────────────────────────────────────
app.post('/api/save-purchase', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })

  const {
    name, email, phone, dni, method, tours, totalPersons,
    travelDate, totalPrice, reserveAmount, paymentStatus,
    note, culqiId, embarque, habitacion, comentario, passengers
  } = req.body

  try {
    const compra = {
      chargeId: culqiId || `manual_${(method || 'web').toLowerCase().replace(/\s/g,'_')}_${Date.now()}`,
      amount: parseFloat(reserveAmount) || parseFloat(totalPrice) || 0,
      currency: 'PEN',
      status: paymentStatus === 'Pagado' ? 'venta' : 'pendiente',
      email: email || '',
      buyerName: name || 'Sin especificar',
      description: tours || 'Reserva Peru In Travel',
      items: tours ? tours.split(';').map((t: string) => ({ name: t.trim(), quantity: 1 })) : [],
      metadata: {
        telefono: phone || '',
        dni: dni || '',
        origen: method || 'Web',
        fechaViaje: travelDate || '',
        totalPersonas: totalPersons || 0,
        notaVoucher: note || '',
        tipoCompra: 'Manual',
        puntoEmbarque: embarque || '',
        habitacion: habitacion || '',
        comentario: comentario || '',
        pasajeros: passengers || []
      },
      createdAt: new Date(),
      paymentMethod: method
    }

    const result = await db.collection('compras').insertOne(compra)
    res.json({ ok: true, id: result.insertedId })
  } catch (err) {
    console.error('Error /api/save-purchase:', err)
    res.status(500).json({ error: 'Error al guardar la compra' })
  }
})

// ── Testimonials ──────────────────────────────────────────────────────────────
app.get('/api/testimonials', async (_req, res) => {
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible', detail: 'Verifica MONGODB_URI en variables de entorno' })
  try {
    const testimonials = await db.collection('testimonials')
      .find({}).sort({ createdAt: -1 }).toArray()
    res.json({ ok: true, testimonials })
  } catch (err) {
    console.error('Error /api/testimonials:', err)
    res.status(500).json({ error: 'Error al obtener testimonios' })
  }
})

app.post('/api/testimonials', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  const { name, location, text, stars, avatar } = req.body
  if (!name || !location || !text || !stars) {
    return res.status(400).json({ error: 'Faltan campos requeridos' })
  }
  try {
    const testimonial = {
      name, location, text, stars: Number(stars),
      avatar: avatar || `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70)}`,
      createdAt: new Date(), updatedAt: new Date(),
    }
    const result = await db.collection('testimonials').insertOne(testimonial)
    res.json({ ok: true, id: result.insertedId, testimonial })
  } catch (err) {
    res.status(500).json({ error: 'Error al crear testimonio' })
  }
})

app.put('/api/testimonials/:id', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  const { id } = req.params
  const { name, location, text, stars, avatar } = req.body
  try {
    const { ObjectId } = await import('mongodb')
    const updates = {
      ...(name && { name }), ...(location && { location }),
      ...(text && { text }), ...(stars && { stars: Number(stars) }),
      ...(avatar && { avatar }), updatedAt: new Date(),
    }
    const result = await db.collection('testimonials').updateOne(
      { _id: new ObjectId(id) }, { $set: updates }
    )
    if (result.matchedCount === 0) return res.status(404).json({ error: 'No encontrado' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar testimonio' })
  }
})

app.delete('/api/testimonials/:id', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  const { id } = req.params
  try {
    const { ObjectId } = await import('mongodb')
    const result = await db.collection('testimonials').deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return res.status(404).json({ error: 'No encontrado' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar testimonio' })
  }
})

// ── Export para Vercel Serverless ─────────────────────────────────────────────
export default async function handler(req, res) {
  await connectDB()
  return app(req, res)
}

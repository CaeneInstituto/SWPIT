import express         from 'express'
import cors            from 'cors'
import { readFileSync, existsSync } from 'fs'
import { MongoClient, ObjectId }    from 'mongodb'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ── Cargar .env (solo en desarrollo; en prod las vars vienen del entorno) ─────
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath   = join(__dirname, '../.env')
if (existsSync(envPath)) {
  try {
    readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) return
      const key = trimmed.substring(0, eqIdx).trim()
      let val   = trimmed.substring(eqIdx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
      if (key && !process.env[key]) process.env[key] = val
    })
    console.log('📄 .env cargado')
  } catch { console.warn('⚠️  Error leyendo .env') }
} else {
  console.log('ℹ️  Sin .env — usando variables del entorno del sistema')
}

// ── Importar handler de api/index.mjs (contiene tours, drive, uploads…) ──────
import apiHandler from '../api/index.mjs'

const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY || ''
const MONGODB_URI      = process.env.MONGODB_URI      || ''
const PORT             = process.env.PORT || 3000

// ── MongoDB (conexión persistente para rutas propias de este servidor) ────────
let db = null

async function connectDB() {
  if (!MONGODB_URI) { console.warn('⚠️  MONGODB_URI no configurado'); return }
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS:         10000,
      socketTimeoutMS:          45000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads:  true,
    })
    await client.connect()
    await client.db('admin').command({ ping: 1 })
    db = client.db('peruintravel')
    console.log('✅ MongoDB conectado — DB: peruintravel')
  } catch (err) {
    console.error('❌ MongoDB error:', err.message)
  }
}

// ── App ───────────────────────────────────────────────────────────────────────
const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ── Servir frontend Vite desde /dist en producción ────────────────────────────
const distPath = join(__dirname, '../dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  console.log(`📦 Sirviendo frontend desde ${distPath}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// RUTAS PROPIAS (compras, save-purchase) — estas usan la conexión `db` local
// ─────────────────────────────────────────────────────────────────────────────

// ── GET /api/health ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mongo:  db ? '✅ conectado' : '❌ desconectado',
    culqi:  CULQI_SECRET_KEY.startsWith('sk_live') ? '🟢 LIVE' : '🧪 TEST',
  })
})

// ── GET /api/compras ──────────────────────────────────────────────────────────
app.get('/api/compras', async (_req, res) => {
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  try {
    const compras = await db.collection('compras')
      .find({}).sort({ createdAt: -1 }).limit(200).toArray()
    res.json({ ok: true, total: compras.length, compras })
  } catch (err) {
    console.error('Error /api/compras:', err)
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
      chargeId:    culqiId || `manual_${(method||'web').toLowerCase().replace(/\s/g,'_')}_${Date.now()}`,
      amount:      parseFloat(reserveAmount) || parseFloat(totalPrice) || 0,
      currency:    'PEN',
      status:      paymentStatus === 'Pagado' ? 'venta' : 'pendiente',
      email:       email || '',
      buyerName:   name  || 'Sin especificar',
      description: tours || 'Reserva Peru In Travel',
      items:       tours ? tours.split(';').map(t => ({ name: t.trim(), quantity: 1 })) : [],
      metadata: {
        telefono:       phone        || '',
        dni:            dni          || '',
        origen:         method       || 'Web',
        fechaViaje:     travelDate   || '',
        totalPersonas:  totalPersons || 0,
        notaVoucher:    note         || '',
        tipoCompra:     'Manual',
        puntoEmbarque:  embarque     || '',
        habitacion:     habitacion   || '',
        comentario:     comentario   || '',
        pasajeros:      passengers   || [],
      },
      createdAt:     new Date(),
      paymentMethod: method || '',
      card: (method||'').toLowerCase().includes('tarjeta')
        ? { brand: 'Manual', last4: '0000', country: 'PE' }
        : null,
    }
    const result = await db.collection('compras').insertOne(compra)
    console.log(`💾 Compra manual — ${compra.chargeId} | ${email || phone}`)
    res.json({ ok: true, id: result.insertedId })
  } catch (err) {
    console.error('Error /api/save-purchase:', err)
    res.status(500).json({ error: 'Error al guardar la compra' })
  }
})

// ── Testimonials (rutas propias del servidor Express) ─────────────────────────
app.get('/api/testimonials', async (_req, res) => {
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  try {
    const testimonials = await db.collection('testimonials')
      .find({}).sort({ createdAt: -1 }).toArray()
    res.json({ ok: true, testimonials })
  } catch (err) { res.status(500).json({ error: 'Error al obtener testimonios' }) }
})

app.post('/api/testimonials', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  const { name, location, text, stars, avatar } = req.body
  if (!name || !location || !text || !stars)
    return res.status(400).json({ error: 'Faltan campos: name, location, text, stars' })
  try {
    const doc = {
      name, location, text, stars: Number(stars),
      avatar: avatar || `https://i.pravatar.cc/80?img=${Math.floor(Math.random()*70)}`,
      createdAt: new Date(), updatedAt: new Date(),
    }
    const result = await db.collection('testimonials').insertOne(doc)
    res.json({ ok: true, id: result.insertedId, testimonial: doc })
  } catch (err) { res.status(500).json({ error: 'Error al crear testimonio' }) }
})

app.put('/api/testimonials/:id', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  const { name, location, text, stars, avatar } = req.body
  try {
    const updates = {
      ...(name     && { name }),
      ...(location && { location }),
      ...(text     && { text }),
      ...(stars    && { stars: Number(stars) }),
      ...(avatar   && { avatar }),
      updatedAt: new Date(),
    }
    const result = await db.collection('testimonials')
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
    if (result.matchedCount === 0) return res.status(404).json({ error: 'No encontrado' })
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: 'Error al actualizar' }) }
})

app.delete('/api/testimonials/:id', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  try {
    const result = await db.collection('testimonials')
      .deleteOne({ _id: new ObjectId(req.params.id) })
    if (result.deletedCount === 0) return res.status(404).json({ error: 'No encontrado' })
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: 'Error al eliminar' }) }
})

// ─────────────────────────────────────────────────────────────────────────────
// DELEGACIÓN AL HANDLER DE api/index.mjs
// Cubre: /api/tours, /api/tours/:id, /api/charge, /api/drive/folder,
//        /api/uploads, /api/upload, /api/save-purchase (si no llegó arriba)
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api', (req, res) => {
  // Restaurar req.url con prefijo /api para que el handler lo reconozca
  req.url = '/api' + (req.url === '/' ? '' : req.url)
  apiHandler(req, res)
})

// ── SPA fallback: devolver index.html para rutas del cliente ──────────────────
if (existsSync(distPath)) {
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

// ── Arrancar ──────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('')
    console.log('🦙 Peru In Travel — Servidor Node.js persistente')
    console.log(`📡 Puerto  : ${PORT}`)
    console.log(`🔑 Culqi   : ${CULQI_SECRET_KEY.startsWith('sk_live') ? '🟢 LIVE' : '🧪 TEST'}`)
    console.log(`🍃 MongoDB : ${db ? '✅ Conectado' : '❌ No conectado'}`)
    console.log(`🌐 http://0.0.0.0:${PORT}`)
    console.log('')
  })
})

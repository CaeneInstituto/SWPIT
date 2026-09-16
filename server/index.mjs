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
// RUTAS DE TOURS — copiadas de api/index.mjs para usar la conexión db local
// ─────────────────────────────────────────────────────────────────────────────

// ── GET /api/tours ────────────────────────────────────────────────────────────
app.get('/api/tours', async (_req, res) => {
  console.log(`📋 GET /api/tours — DB: ${db?.databaseName}`)
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  try {
    const tours = await db.collection('tours').find({}).project({
      _id: 1, id: 1, name: 1, location: 1, region: 1,
      price: 1, priceValue: 1, days: 1, tag: 1, image: 1,
      rating: 1, reviewCount: 1, groupSize: 1, disabled: 1,
      availableDates: 1, priceOptions: 1, seasons: 1,
    }).sort({ createdAt: -1 }).toArray()
    console.log(`📋 GET /api/tours — devolviendo ${tours.length} tours`)
    res.setHeader('Cache-Control', 'no-store')
    res.json({ ok: true, tours })
  } catch (err) {
    console.error('❌ GET /api/tours error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// ── GET /api/tours/:id ────────────────────────────────────────────────────────
app.get('/api/tours/:id', async (req, res) => {
  const { id } = req.params
  console.log(`🔍 GET /api/tours/${id} — DB: ${db?.databaseName}`)
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  try {
    let tour = null
    try { tour = await db.collection('tours').findOne({ _id: new ObjectId(id) }) } catch {}
    if (!tour) tour = await db.collection('tours').findOne({ id })
    if (!tour) return res.status(404).json({ error: 'Tour no encontrado' })
    // Limpiar Base64
    if (tour.image?.startsWith('data:image/')) tour.image = '/placeholder-tour.jpg'
    if (tour.images) tour.images = tour.images.filter(img => !img.startsWith('data:image/'))
    res.setHeader('Cache-Control', 'no-store')
    res.json({ ok: true, tour })
  } catch (err) {
    console.error(`❌ GET /api/tours/${id} error:`, err)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// ── POST /api/tours ───────────────────────────────────────────────────────────
app.post('/api/tours', async (req, res) => {
  console.log(`📥 POST /api/tours — DB: ${db?.databaseName} | Colección: tours`)
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  const body = req.body
  console.log(`📥 body.id: ${body.id} | body.name: ${body.name}`)

  if (body.image?.startsWith('data:image/'))
    return res.status(400).json({ ok: false, error: 'No se permiten imágenes Base64' })
  if (body.images?.some(img => img.startsWith('data:image/')))
    return res.status(400).json({ ok: false, error: 'No se permiten imágenes Base64 en galería' })
  if (!body.id || !body.name)
    return res.status(400).json({ error: 'Faltan campos requeridos: id, name' })

  try {
    const existing = await db.collection('tours').findOne({ id: body.id })
    if (existing) {
      console.log(`⚠️ Tour duplicado: ${body.id}`)
      return res.status(409).json({ error: 'Ya existe un tour con ese ID' })
    }
    const tour = { ...body, createdAt: new Date(), updatedAt: new Date() }
    delete tour._id
    const result = await db.collection('tours').insertOne(tour)
    console.log(`✅ Tour insertado — insertedId: ${result.insertedId} | name: ${tour.name}`)
    res.json({ ok: true, id: result.insertedId, tour })
  } catch (err) {
    console.error('❌ POST /api/tours insertOne error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// ── PUT /api/tours/:id ────────────────────────────────────────────────────────
app.put('/api/tours/:id', async (req, res) => {
  const { id } = req.params
  const body = req.body
  console.log(`🔄 PUT /api/tours/${id} — DB: ${db?.databaseName} | name: ${body.name}`)
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })

  if (body.image?.startsWith('data:image/'))
    return res.status(400).json({ ok: false, error: 'No se permiten imágenes Base64' })
  if (body.images?.some(img => img.startsWith('data:image/')))
    return res.status(400).json({ ok: false, error: 'No se permiten imágenes Base64 en galería' })

  try {
    const updates = { ...body, updatedAt: new Date() }
    delete updates._id
    delete updates.createdAt

    // ✅ No sobreescribir itinerario si viene vacío — protege datos existentes
    if (!body.itinerary || body.itinerary.length === 0) {
      delete updates.itinerary
    }
    // ✅ No sobreescribir includes si viene vacío
    if (!body.includes || body.includes.length === 0) {
      delete updates.includes
    }

    // Buscar primero por slug
    let result = await db.collection('tours').updateOne({ id }, { $set: updates })
    // Fallback por ObjectId
    if (result.matchedCount === 0) {
      try {
        result = await db.collection('tours').updateOne({ _id: new ObjectId(id) }, { $set: updates })
      } catch {}
    }
    console.log(`🔄 PUT resultado — matchedCount: ${result.matchedCount} | modifiedCount: ${result.modifiedCount}`)
    if (result.matchedCount === 0) return res.status(404).json({ error: `Tour no encontrado: ${id}` })
    res.json({ ok: true })
  } catch (err) {
    console.error(`❌ PUT /api/tours/${id} error:`, err)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// ── DELETE /api/tours/:id ─────────────────────────────────────────────────────
app.delete('/api/tours/:id', async (req, res) => {
  const { id } = req.params
  console.log(`🗑️ DELETE /api/tours/${id} — DB: ${db?.databaseName}`)
  if (!db) return res.status(503).json({ error: 'MongoDB no disponible' })
  try {
    let result
    try { result = await db.collection('tours').deleteOne({ _id: new ObjectId(id) }) } catch {}
    if (!result || result.deletedCount === 0)
      result = await db.collection('tours').deleteOne({ id })
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Tour no encontrado' })
    console.log(`✅ Tour eliminado: ${id}`)
    res.json({ ok: true })
  } catch (err) {
    console.error(`❌ DELETE /api/tours/${id} error:`, err)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/charge — Implementación directa (no delegar al handler)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/charge', async (req, res) => {
  console.log('📥 POST /api/charge - Entrando')

  const { token, email, buyerName, description, metadata, items, orderId } = req.body

  // Logs de diagnóstico (sin imprimir el token completo)
  console.log(`📥 token: ${token ? token.substring(0, 10) + '...' : 'FALTANTE'}`)
  console.log(`📥 email: ${email || 'FALTANTE'}`)
  console.log(`📥 items: ${items?.length || 0}`)

  if (!token || !email) {
    console.log('❌ Faltan campos: token o email')
    return res.status(400).json({ error: 'Faltan campos requeridos: token, email' })
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    console.log('❌ Faltan items del carrito')
    return res.status(400).json({ error: 'Faltan items del carrito' })
  }

  if (!db) {
    console.error('❌ MongoDB no disponible en /api/charge')
    return res.status(503).json({ error: 'MongoDB no disponible' })
  }

  try {
    // Idempotencia: verificar token duplicado
    const existingCharge = await db.collection('compras').findOne({ 'culqiData.token': token })
    if (existingCharge) {
      console.log('⚠️ Token ya utilizado:', existingCharge.chargeId)
      return res.status(200).json({
        ok: true, success: true,
        chargeId: existingCharge.chargeId,
        amount: existingCharge.amount,
        message: 'Pago ya procesado anteriormente',
        isDuplicate: true
      })
    }

    if (orderId) {
      const existingOrder = await db.collection('compras').findOne({ orderId })
      if (existingOrder) {
        console.log('⚠️ Orden duplicada:', orderId)
        return res.status(409).json({ error: 'Esta orden ya fue procesada', chargeId: existingOrder.chargeId })
      }
    }

    // Calcular monto desde BD
    let totalAmount = 0
    const processedItems = []

    for (const item of items) {
      const { tourId, priceOption, quantity, personsPerPackage, travelDate } = item
      if (!tourId || !priceOption || !quantity) {
        return res.status(400).json({ error: `Item inválido: falta tourId, priceOption o quantity` })
      }

      const tour = await db.collection('tours').findOne({ id: tourId })
      if (!tour) {
        return res.status(404).json({ error: `Tour no encontrado: ${tourId}` })
      }

      let realPrice = null
      if (tour.priceOptions && Array.isArray(tour.priceOptions)) {
        const option = tour.priceOptions.find(opt => opt.label === priceOption)
        if (option?.price) {
          const m = option.price.match(/(\d+(?:\.\d+)?)/)
          if (m) realPrice = parseFloat(m[1])
        }
      }
      if (realPrice === null && tour.priceValue) realPrice = tour.priceValue
      if (realPrice === null || realPrice <= 0) {
        return res.status(400).json({ error: `No se pudo determinar el precio: ${tour.name}` })
      }

      const subtotal = realPrice * quantity
      totalAmount += subtotal
      processedItems.push({
        tourId: tour.id, tourName: tour.name,
        priceOption, realPrice, quantity,
        personsPerPackage: personsPerPackage || 1,
        travelDate: travelDate || '', subtotal
      })
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'El monto total debe ser mayor a 0' })
    }

    console.log(`💰 Monto calculado: S/ ${totalAmount} | Items: ${processedItems.length}`)

    // Llamar a Culqi
    console.log('🔄 Iniciando llamada a Culqi...')
    let culqiRes, charge
    try {
      culqiRes = await fetch('https://api.culqi.com/v2/charges', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CULQI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100),
          currency_code: 'PEN',
          email,
          source_id: token,
          description: description || 'Reserva Peru In Travel',
          metadata: {
            ...metadata,
            montoCalculadoBackend: totalAmount,
            cantidadItems: items.length,
            orderId: orderId || `order-${Date.now()}`
          },
        }),
      })
      console.log(`🔄 Culqi respondió con status: ${culqiRes.status}`)
      charge = await culqiRes.json()
    } catch (culqiErr) {
      console.error('❌ Error en fetch a Culqi:', culqiErr.message)
      return res.status(500).json({ error: 'Error al conectar con Culqi', details: culqiErr.message })
    }

    console.log(`🔄 Culqi charge.object: ${charge.object} | charge.id: ${charge.id || 'N/A'}`)

    if (charge.object === 'error') {
      console.error('❌ Culqi rechazó el pago:', charge.user_message || charge.merchant_message)
      return res.status(400).json({
        error: charge.user_message || charge.merchant_message || 'Error al procesar el pago'
      })
    }

    console.log(`✅ Cargo Culqi exitoso: ${charge.id}`)

    // Guardar en MongoDB
    const totalPersonas = processedItems.reduce((sum, i) => sum + (i.quantity * (i.personsPerPackage || 1)), 0)
    const fechaViaje = items.filter(i => i.travelDate).map(i => i.travelDate)[0] || ''

    const compra = {
      chargeId: charge.id,
      orderId: orderId || `order-${Date.now()}`,
      amount: totalAmount,
      currency: 'PEN',
      status: 'venta',
      paymentStatus: 'Pagado',
      email,
      buyerName: buyerName || '',
      name: buyerName || '',
      description: description || 'Reserva Peru In Travel',
      tours: processedItems.map(i => i.tourName).join('; '),
      totalPersons: totalPersonas,
      travelDate: fechaViaje,
      items: processedItems,
      metadata: { ...metadata, totalPersonas, fechaViaje },
      createdAt: new Date(),
      culqiData: {
        token,
        brand: charge.source?.brand,
        last4: charge.source?.last_four,
        country: charge.source?.issuer?.country,
        cardType: charge.source?.card_type
      },
      paymentMethod: 'Tarjeta de crédito/débito - Culqi',
      method: 'Tarjeta'
    }

    await db.collection('compras').insertOne(compra)
    console.log(`✅ Compra guardada en MongoDB: ${charge.id}`)

    return res.status(200).json({
      ok: true, success: true,
      chargeId: charge.id,
      amount: totalAmount,
      message: 'Pago procesado correctamente'
    })

  } catch (error) {
    console.error('❌ Error inesperado en /api/charge:', error.message)
    return res.status(500).json({ error: 'Error al procesar el pago', details: error.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// DELEGACIÓN AL HANDLER DE api/index.mjs
// Cubre: /api/drive/folder, /api/uploads, /api/upload
// (tours y charge ya están manejados arriba)
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api', (req, res) => {
  const originalUrl = req.url
  req.url = '/api' + (originalUrl.startsWith('/') ? originalUrl : '/' + originalUrl)
  console.log(`🔀 Delegando al handler: ${req.method} ${req.url}`)
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

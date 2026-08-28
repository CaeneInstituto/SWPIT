import { MongoClient, ObjectId } from 'mongodb'

const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY || ''
const MONGODB_URI      = process.env.MONGODB_URI      || ''

// ── MongoDB (conexión cacheada entre invocaciones) ────────────────────────────
let cachedDb = null

async function getDb() {
  if (cachedDb) return cachedDb
  if (!MONGODB_URI) throw new Error('MONGODB_URI no configurado')
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    tls: true,
  })
  await client.connect()
  cachedDb = client.db('peruintravel')
  return cachedDb
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function json(res, status, data) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.status(status).end(JSON.stringify(data))
}

async function readBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch { resolve({}) }
    })
  })
}

// ── Handler principal ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  const url = req.url.split('?')[0]

  try {
    // ── GET /api/health ───────────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/api/health') {
      let mongoStatus = '❌ desconectado'
      try { await getDb(); mongoStatus = '✅ conectado' } catch (e) { mongoStatus = `❌ ${e.message}` }
      return json(res, 200, {
        status: 'ok',
        mongo: mongoStatus,
        culqi: CULQI_SECRET_KEY.startsWith('sk_live') ? '🟢 LIVE' : '🧪 TEST',
        mongoUri: MONGODB_URI ? '✅ configurado' : '❌ NO configurado',
      })
    }

    // ── POST /api/charge ──────────────────────────────────────────────────────
    if (req.method === 'POST' && url === '/api/charge') {
      const { token, amount, email, description, metadata, buyerName, items } = await readBody(req)
      if (!token || !amount || !email) return json(res, 400, { error: 'Faltan campos: token, amount, email' })

      const culqiRes = await fetch('https://api.culqi.com/v2/charges', {
        method: 'POST',
        headers: { Authorization: `Bearer ${CULQI_SECRET_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency_code: 'PEN',
          email,
          source_id: token,
          description: description || 'Reserva Peru In Travel',
          metadata: metadata || {},
        }),
      })
      const charge = await culqiRes.json()
      if (charge.object === 'error') return json(res, 400, { error: charge.user_message || 'Error en Culqi' })

      try {
        const db = await getDb()
        await db.collection('compras').insertOne({
          chargeId: charge.id,
          amount, currency: 'PEN',
          status: charge.outcome?.type || 'unknown',
          email, buyerName: buyerName || '',
          description: description || '',
          items: items || [],
          metadata: metadata || {},
          createdAt: new Date(),
          card: charge.source ? {
            brand: charge.source.brand,
            last4: charge.source.last_four,
            country: charge.source.issuer?.country,
          } : null,
        })
      } catch (e) { console.error('MongoDB save error:', e.message) }

      return json(res, 200, { ok: true, chargeId: charge.id })
    }

    // ── GET /api/compras ──────────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/api/compras') {
      const db = await getDb()
      const compras = await db.collection('compras').find({}).sort({ createdAt: -1 }).limit(200).toArray()
      return json(res, 200, { ok: true, total: compras.length, compras })
    }

    // ── POST /api/save-purchase ───────────────────────────────────────────────
    if (req.method === 'POST' && url === '/api/save-purchase') {
      const body = await readBody(req)
      const { name, email, phone, dni, method, tours, totalPersons,
        travelDate, totalPrice, reserveAmount, paymentStatus,
        note, culqiId, embarque, habitacion, comentario, passengers } = body

      const db = await getDb()
      const compra = {
        chargeId: culqiId || `manual_${(method || 'web').toLowerCase().replace(/\s/g, '_')}_${Date.now()}`,
        amount: parseFloat(reserveAmount) || parseFloat(totalPrice) || 0,
        currency: 'PEN',
        status: paymentStatus === 'Pagado' ? 'venta' : 'pendiente',
        email: email || '',
        buyerName: name || 'Sin especificar',
        description: tours || 'Reserva Peru In Travel',
        items: tours ? tours.split(';').map(t => ({ name: t.trim(), quantity: 1 })) : [],
        metadata: {
          telefono: phone || '', dni: dni || '',
          origen: method || 'Web', fechaViaje: travelDate || '',
          totalPersonas: totalPersons || 0, notaVoucher: note || '',
          tipoCompra: 'Manual', puntoEmbarque: embarque || '',
          habitacion: habitacion || '', comentario: comentario || '',
          pasajeros: passengers || [],
        },
        createdAt: new Date(),
        paymentMethod: method,
      }
      const result = await db.collection('compras').insertOne(compra)
      return json(res, 200, { ok: true, id: result.insertedId })
    }

    // ── GET /api/testimonials ─────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/api/testimonials') {
      const db = await getDb()
      const testimonials = await db.collection('testimonials').find({}).sort({ createdAt: -1 }).toArray()
      return json(res, 200, { ok: true, testimonials })
    }

    // ── POST /api/testimonials ────────────────────────────────────────────────
    if (req.method === 'POST' && url === '/api/testimonials') {
      const { name, location, text, stars, avatar } = await readBody(req)
      if (!name || !location || !text || !stars) return json(res, 400, { error: 'Faltan campos requeridos' })
      const db = await getDb()
      const testimonial = {
        name, location, text, stars: Number(stars),
        avatar: avatar || `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70)}`,
        createdAt: new Date(), updatedAt: new Date(),
      }
      const result = await db.collection('testimonials').insertOne(testimonial)
      return json(res, 200, { ok: true, id: result.insertedId, testimonial })
    }

    // ── PUT /api/testimonials/:id ─────────────────────────────────────────────
    if (req.method === 'PUT' && url.startsWith('/api/testimonials/')) {
      const id = url.split('/').pop()
      const { name, location, text, stars, avatar } = await readBody(req)
      const db = await getDb()
      const updates = {
        ...(name && { name }), ...(location && { location }),
        ...(text && { text }), ...(stars && { stars: Number(stars) }),
        ...(avatar && { avatar }), updatedAt: new Date(),
      }
      const result = await db.collection('testimonials').updateOne({ _id: new ObjectId(id) }, { $set: updates })
      if (result.matchedCount === 0) return json(res, 404, { error: 'No encontrado' })
      return json(res, 200, { ok: true })
    }

    // ── DELETE /api/testimonials/:id ──────────────────────────────────────────
    if (req.method === 'DELETE' && url.startsWith('/api/testimonials/')) {
      const id = url.split('/').pop()
      const db = await getDb()
      const result = await db.collection('testimonials').deleteOne({ _id: new ObjectId(id) })
      if (result.deletedCount === 0) return json(res, 404, { error: 'No encontrado' })
      return json(res, 200, { ok: true })
    }

    // ── GET /api/tours ────────────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/api/tours') {
      const db = await getDb()
      const tours = await db.collection('tours').find({}).sort({ createdAt: -1 }).toArray()
      return json(res, 200, { ok: true, tours })
    }

    // ── GET /api/tours/:id ────────────────────────────────────────────────────
    if (req.method === 'GET' && url.startsWith('/api/tours/') && url.split('/').length === 4) {
      const id = url.split('/').pop()
      const db = await getDb()
      // Buscar por ID o por slug
      let tour = null
      try {
        tour = await db.collection('tours').findOne({ _id: new ObjectId(id) })
      } catch {
        // Si no es ObjectId válido, buscar por slug
        tour = await db.collection('tours').findOne({ id })
      }
      if (!tour) return json(res, 404, { error: 'Tour no encontrado' })
      return json(res, 200, { ok: true, tour })
    }

    // ── POST /api/tours ───────────────────────────────────────────────────────
    if (req.method === 'POST' && url === '/api/tours') {
      const body = await readBody(req)
      
      // Validar campos mínimos requeridos
      if (!body.id || !body.name) {
        return json(res, 400, { error: 'Faltan campos requeridos: id, name' })
      }

      const db = await getDb()
      // Verificar que no exista otro tour con el mismo id
      const existing = await db.collection('tours').findOne({ id: body.id })
      if (existing) {
        return json(res, 409, { error: 'Ya existe un tour con ese ID' })
      }

      // Guardar TODOS los campos del tour (preservar estructura completa)
      const tour = {
        ...body,  // Guardar todos los campos que vengan
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      // Eliminar _id si viene (MongoDB lo genera automáticamente)
      delete tour._id
      const result = await db.collection('tours').insertOne(tour)
      return json(res, 200, { ok: true, id: result.insertedId, tour })
    }

    // ── PUT /api/tours/:id ────────────────────────────────────────────────────
    if (req.method === 'PUT' && url.startsWith('/api/tours/') && url.split('/').length === 4) {
      const tourId = url.split('/').pop()
      const body = await readBody(req)
      
      const db = await getDb()
      // Buscar por _id de MongoDB o por campo id (slug)
      let filter = {}
      try {
        filter = { _id: new ObjectId(tourId) }
      } catch {
        filter = { id: tourId }
      }

      const updates = {
        ...body,  // Spread todos los campos del body
        updatedAt: new Date(),
      }
      
      // Eliminar campos que no deben actualizarse
      delete updates._id
      delete updates.createdAt
      
      const result = await db.collection('tours').updateOne(filter, { $set: updates })
      if (result.matchedCount === 0) return json(res, 404, { error: 'Tour no encontrado' })
      return json(res, 200, { ok: true })
    }

    // ── DELETE /api/tours/:id ─────────────────────────────────────────────────
    if (req.method === 'DELETE' && url.startsWith('/api/tours/') && url.split('/').length === 4) {
      const tourId = url.split('/').pop()
      const db = await getDb()
      
      // Intentar borrar por _id o por campo id
      let result
      try {
        result = await db.collection('tours').deleteOne({ _id: new ObjectId(tourId) })
      } catch {
        result = await db.collection('tours').deleteOne({ id: tourId })
      }
      
      if (result.deletedCount === 0) return json(res, 404, { error: 'Tour no encontrado' })
      return json(res, 200, { ok: true })
    }

    // ── POST /api/upload ──────────────────────────────────────────────────────
    // Endpoint para guardar referencias de archivos (imágenes y documentos)
    // En Vercel, los archivos se suben al public/ en build time, este endpoint
    // solo registra las URLs en la base de datos para tracking
    if (req.method === 'POST' && url === '/api/upload') {
      const { tourId, fileUrl, fileName, fileType, category } = await readBody(req)
      
      if (!tourId || !fileUrl) {
        return json(res, 400, { error: 'Faltan campos: tourId, fileUrl' })
      }

      const db = await getDb()
      const upload = {
        tourId,
        fileUrl,
        fileName: fileName || fileUrl.split('/').pop(),
        fileType: fileType || 'image',
        category: category || 'general', // 'general', 'itinerary', 'document', 'video'
        uploadedAt: new Date(),
      }
      
      const result = await db.collection('uploads').insertOne(upload)
      return json(res, 200, { ok: true, id: result.insertedId, upload })
    }

    // ── GET /api/uploads/:tourId ──────────────────────────────────────────────
    if (req.method === 'GET' && url.startsWith('/api/uploads/')) {
      const tourId = url.split('/').pop()
      const db = await getDb()
      const uploads = await db.collection('uploads').find({ tourId }).sort({ uploadedAt: -1 }).toArray()
      return json(res, 200, { ok: true, uploads })
    }

    // ── DELETE /api/upload/:id ────────────────────────────────────────────────
    if (req.method === 'DELETE' && url.startsWith('/api/upload/')) {
      const uploadId = url.split('/').pop()
      const db = await getDb()
      const result = await db.collection('uploads').deleteOne({ _id: new ObjectId(uploadId) })
      if (result.deletedCount === 0) return json(res, 404, { error: 'Archivo no encontrado' })
      return json(res, 200, { ok: true })
    }

    // ── 404 ───────────────────────────────────────────────────────────────────
    return json(res, 404, { error: 'Ruta no encontrada' })

  } catch (err) {
    console.error('Handler error:', err)
    return json(res, 500, { error: err.message || 'Error interno del servidor' })
  }
}

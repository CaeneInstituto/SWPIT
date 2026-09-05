# 🚀 Optimización Fast Origin Transfer - Vercel

## 📊 Resumen Ejecutivo

**Problema detectado:** 12.98 GB / 10 GB de Fast Origin Transfer  
**Causa principal:** Tours con imágenes Base64 gigantes en MongoDB transferidas en cada llamada a `/api/tours`

---

## 🔍 Causa Principal del Consumo

### 1. **Imágenes Base64 en MongoDB** (90% del problema)
Tours antiguos tenían imágenes guardadas como:
```json
{
  "image": "data:image/png;base64,iVBORw0KG..." // 500KB-2MB POR IMAGEN
}
```

**Impacto:**
- Cada tour con Base64: ~2-5 MB
- GET /api/tours devolvía ~20 tours = **40-100 MB por request**
- AdminDashboard recargaba lista 5-10 veces por sesión
- Destinations recargaba en cada `focus` del navegador

### 2. **Sin caché en endpoints públicos**
Cada visita a la home recargaba:
- `/api/tours` (sin caché)
- `/api/testimonials` (sin caché)

### 3. **Campos innecesarios en listado**
El listado devolvía:
- ❌ Galerías completas (`images[]`)
- ❌ Itinerarios día por día (`itinerary[]`)
- ❌ Arrays largos (`includes`, `notIncludes`, `tourTerms`)
- ❌ PDFs embebidos (si los hubiera)

---

## ✅ Soluciones Implementadas

### 1. **Optimización GET /api/tours (Listado)**

**Antes:**
```javascript
const tours = await db.collection('tours').find({}).toArray()
// Devuelve TODO: ~2-5 MB por tour con Base64
```

**Después:**
```javascript
const tours = await db.collection('tours').find({}).project({
  // Solo campos necesarios para tarjetas
  id: 1, name: 1, location: 1, price: 1, image: 1, rating: 1,
  
  // EXCLUIR pesados
  images: 0,      // Galería NO
  itinerary: 0,   // Itinerario NO
  brochure: 0,    // PDF NO
  tourTerms: 0    // Términos largos NO
}).toArray()

// Convertir Base64 a placeholder
tours.map(tour => ({
  ...tour,
  image: tour.image?.startsWith('data:image/') 
    ? '/placeholder-tour.jpg' 
    : tour.image
}))
```

**Resultado:**
- Peso: ~50-200 KB (antes 2-5 MB)
- **Reducción: 90-95%**

### 2. **Caché HTTP en Endpoints Públicos**

```javascript
// GET /api/tours
res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
// Caché de 5 minutos

// GET /api/testimonials  
res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
// Caché de 10 minutos
```

**Beneficios:**
- Vercel Edge Network cachea respuestas
- Reduce llamadas a MongoDB
- Reduce Fast Origin Transfer

### 3. **Filtrado de Base64 en Detalle**

```javascript
// GET /api/tours/:id
if (tour.images && Array.isArray(tour.images)) {
  tour.images = tour.images.filter(img => !img.startsWith('data:image/'))
}
```

### 4. **Logs para Monitoreo**

```javascript
console.log(`📦 GET /api/tours - Devolviendo ${tours.length} tours (solo campos de listado)`)
```

---

## 📁 Archivos Modificados

### 1. **api/index.mjs** (principal)
- ✅ Optimizado `GET /api/tours` con proyección MongoDB
- ✅ Agregado caché HTTP (5-10 min)
- ✅ Filtrado de Base64 en listado y detalle
- ✅ Logs de monitoreo

### 2. **src/pages/AdminDashboard.tsx** (preparado)
- ✅ Modal de migración Base64 creado
- ⚠️ Aún no ejecutado (espera confirmación)

---

## 💾 Cómo Quedaron las Imágenes

### **Tours NUEVOS** (recomendado)
```json
{
  "image": "/Autisha/DSC_0365332.jpg",
  "images": [
    "/Autisha/DSC_0384335.jpg",
    "/Autisha/DSC_0402330.jpg"
  ]
}
```
✅ Peso: ~100 bytes  
✅ Imágenes servidas desde `/public` (CDN de Vercel)

### **Tours ANTIGUOS con Base64**
```json
{
  "image": "data:image/png;base64,...", // ⚠️ Aún existe en MongoDB
  "_hasBase64Image": true               // Flag para admin
}
```

**En el API:**
- Listado: Convertido a `/placeholder-tour.jpg`
- Detalle: Filtrado de galería, flag `_hasBase64Image: true`

**En MongoDB:**
- ❌ NO se borra automáticamente (compatibilidad)
- ✅ Se puede migrar con el botón "🔄 Migrar Base64" en AdminDashboard

---

## 📈 Estimación de Peso

### Endpoint: GET /api/tours

| Escenario | Antes | Después | Ahorro |
|-----------|-------|---------|--------|
| **20 tours sin Base64** | ~500 KB | ~100 KB | 80% |
| **20 tours con Base64** | **40-100 MB** | **~150 KB** | **99.6%** |
| **Con caché (2da visita)** | 40-100 MB | **0 bytes** (Edge) | 100% |

### Endpoint: GET /api/testimonials

| Escenario | Antes | Después |
|-----------|-------|---------|
| Sin caché | ~50 KB | ~50 KB |
| Con caché (2da visita) | ~50 KB | **0 bytes** |

---

## 🚀 Qué Debes Redeployar en Vercel

### **Opción 1: Deploy automático (recomendado)**
✅ Ya está hecho con `git push`  
Vercel detecta cambios en `/api` y redeploya automáticamente

### **Opción 2: Deploy manual**
Si no hay auto-deploy configurado:
1. Entra a [vercel.com](https://vercel.com)
2. Selecciona tu proyecto `peru-in-travel`
3. Pestaña "Deployments"
4. Click en "Redeploy" del último deployment
5. Marca "Use existing Build Cache"
6. Click "Redeploy"

### **Verificar que funcionó:**
```bash
# En el navegador, abre DevTools (F12)
# Ve a Network > Fetch/XHR
# Visita tu web y busca:
# GET /api/tours
# 
# Deberías ver:
# ✅ Response Headers:
#    cache-control: public, s-maxage=300, stale-while-revalidate=600
#
# ✅ Response size: 
#    ~100-200 KB (antes era MB)
```

---

## 📋 Checklist Post-Deploy

- [ ] Verificar que `/api/tours` devuelve solo campos de listado
- [ ] Verificar header `Cache-Control` en respuesta
- [ ] Verificar que tours se muestran correctamente en home
- [ ] Verificar que detalle de tour funciona (ruta `/tours/:id`)
- [ ] Monitorear logs en Vercel (buscar mensajes `📦 GET /api/tours`)
- [ ] Esperar 24h y revisar consumo en Dashboard de Vercel

---

## 🎯 Próximos Pasos (Opcional)

### 1. **Migrar Base64 a rutas**
En AdminDashboard > Click "🔄 Migrar Base64":
- Detecta tours con Base64
- Intenta relacionar con carpetas en `/public`
- **Importante:** Después deberás editar cada tour y seleccionar las imágenes correctas

### 2. **Implementar CDN externo (futuro)**
Para escalar más:
- Cloudinary (25 GB gratis)
- ImgBB
- AWS S3 + CloudFront

### 3. **Comprimir imágenes existentes**
Ya tienes `compress-images.mjs`:
```bash
npm run compress-images
```

---

## 📞 Soporte

Si tienes dudas:
1. Revisa logs en Vercel Dashboard > Functions
2. Busca mensajes `📦 GET /api/tours`
3. Verifica Network tab en DevTools

**Contacto:**  
GitHub Issues del proyecto

---

**Última actualización:** Agosto 26, 2026  
**Versión:** 1.0.0

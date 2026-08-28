# 🔐 Integración Culqi - Documentación de Producción

## ✅ Resumen de Cambios Implementados

Se ha corregido completamente la integración de Culqi para cumplir con los estándares de seguridad y mejores prácticas para producción.

---

## 📋 1. Archivos Modificados

### Frontend
- ✅ `index.html` - Agregado script de Culqi Checkout V4
- ✅ `src/components/PaymentModal.tsx` - Reescrito completamente con CulqiJS

### Backend
- ✅ `api/index.mjs` - Refactorizado `/api/charge` con validación de montos y prevención de doble cobro

### Configuración
- ✅ `.env.example` - Removidas claves reales, agregados placeholders

---

## 🔧 2. Cambios por Archivo

### `index.html`
**Cambio:** Agregado script de Culqi Checkout V4
```html
<!-- Culqi Checkout V4 -->
<script src="https://checkout.culqi.com/js/v4"></script>
```

### `src/components/PaymentModal.tsx`

#### ❌ ELIMINADO (Causaba CORS):
```typescript
const tokenResponse = await fetch('https://secure.culqi.com/v2/tokens', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CULQI_PUBLIC_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ card_number, cvv, expiration_month, expiration_year, email })
})
```

#### ✅ IMPLEMENTADO (CulqiJS oficial):
```typescript
// Inicializar Culqi
window.Culqi.publicKey = CULQI_PUBLIC_KEY
window.culqi = function() {
  if (window.Culqi.token) {
    const token = window.Culqi.token.id
    processPayment(token)
  } else if (window.Culqi.error) {
    setErrorMsg(window.Culqi.error.user_message)
  }
}

// Abrir modal de Culqi
window.Culqi.settings({
  title: 'Peru In Travel',
  currency: 'PEN',
  amount: Math.round(reserveAmount * 100),
  order: `order-${Date.now()}`
})
window.Culqi.open()
```

#### ❌ ELIMINADO (Fallback hardcodeado):
```typescript
const CULQI_PUBLIC_KEY = import.meta.env?.VITE_CULQI_PUBLIC_KEY || 'pk_test_foBlu9NBJohtJoob'
```

#### ✅ IMPLEMENTADO (Sin fallback):
```typescript
const CULQI_PUBLIC_KEY = import.meta.env?.VITE_CULQI_PUBLIC_KEY
if (!CULQI_PUBLIC_KEY) {
  console.error('❌ VITE_CULQI_PUBLIC_KEY no está configurada')
}
```

#### ❌ ELIMINADO (Doble registro):
```typescript
// Después de pago exitoso
await fetch('/api/charge', { ... })
await fetch('/api/save-purchase', { ... }) // ❌ DUPLICADO
```

#### ✅ IMPLEMENTADO (Registro único):
```typescript
// Solo para métodos manuales (Yape, Plin, Transferencia)
if (method !== 'card') {
  await fetch('/api/save-purchase', { ... })
}
// Para tarjeta, solo /api/charge registra
```

### `api/index.mjs`

#### ❌ ANTES (Monto inseguro del frontend):
```javascript
const { token, amount, email } = await readBody(req)
const culqiRes = await fetch('https://api.culqi.com/v2/charges', {
  body: JSON.stringify({
    amount: Math.round(amount * 100), // ❌ Confía en el frontend
    source_id: token
  })
})
```

#### ✅ AHORA (Monto calculado desde BD):
```javascript
const { token, email, items } = await readBody(req)

// Calcular monto real desde MongoDB
const db = await getDb()
let totalAmount = 0

for (const item of items) {
  const tour = await db.collection('tours').findOne({ id: item.tourId })
  if (!tour) return json(res, 404, { error: 'Tour no encontrado' })
  
  const option = tour.priceOptions.find(opt => opt.label === item.priceOption)
  const realPrice = parseFloat(option.price.match(/(\d+(?:\.\d+)?)/)[1])
  
  totalAmount += realPrice * item.quantity
}

// Validar
if (totalAmount <= 0) return json(res, 400, { error: 'Monto inválido' })

// Cobrar monto calculado
const culqiRes = await fetch('https://api.culqi.com/v2/charges', {
  body: JSON.stringify({
    amount: Math.round(totalAmount * 100), // ✅ Calculado en backend
    source_id: token
  })
})
```

#### ✅ PROTECCIÓN CONTRA DOBLE COBRO:
```javascript
// Verificar si el token ya fue usado
const existingCharge = await db.collection('compras').findOne({ 
  'culqiData.token': token 
})

if (existingCharge) {
  console.log('⚠️ Token ya utilizado')
  return json(res, 200, { 
    chargeId: existingCharge.chargeId,
    isDuplicate: true
  })
}

// Verificar orderId
if (orderId) {
  const existingOrder = await db.collection('compras').findOne({ orderId })
  if (existingOrder) {
    return json(res, 409, { error: 'Orden duplicada' })
  }
}
```

#### ✅ REGISTRO ÚNICO EN MONGODB:
```javascript
const compra = {
  chargeId: charge.id,
  orderId,
  amount: totalAmount,
  currency: 'PEN',
  status: charge.outcome?.type || 'venta',
  email,
  items: processedItems,
  culqiData: {
    token, // Guardar para prevenir reutilización
    brand: charge.source?.brand,
    last4: charge.source?.last_four
  },
  createdAt: new Date()
}
await db.collection('compras').insertOne(compra)
```

### `.env.example`

#### ❌ ANTES:
```bash
VITE_CULQI_PUBLIC_KEY=pk_test_foBlu9NBJohtJoob  # ❌ Clave real
CULQI_SECRET_KEY=sk_test_k7itVpsPROqWlzkc      # ❌ Clave real
```

#### ✅ AHORA:
```bash
VITE_CULQI_PUBLIC_KEY=pk_test_REEMPLAZAR_CON_TU_CLAVE  # ✅ Placeholder
CULQI_SECRET_KEY=sk_test_REEMPLAZAR_CON_TU_CLAVE      # ✅ Placeholder
```

---

## 🐛 3. Causa Exacta del Error CORS

**Problema:**
```
Access to fetch at 'https://secure.culqi.com/v2/tokens'
from origin 'https://swpit.vercel.app'
has been blocked by CORS policy
```

**Causa Raíz:**
El código hacía un `fetch()` directo desde React a `https://secure.culqi.com/v2/tokens` con la **Public Key** en el header `Authorization`. Culqi **NO permite** llamadas directas a `/v2/tokens` desde el navegador por razones de seguridad.

**Solución Implementada:**
Usar **CulqiJS Checkout V4** que:
1. Carga un modal de Culqi en el navegador
2. El usuario ingresa los datos de su tarjeta **directamente en el modal de Culqi**
3. Culqi tokeniza la tarjeta **en sus propios servidores** (sin CORS)
4. Devuelve el token al callback `window.culqi()`
5. El frontend envía **solo el token** al backend
6. El backend usa el token para crear el cargo

---

## 🔒 4. Cómo Quedó la Tokenización de Culqi

### Flujo Completo:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario hace clic en "Pagar con Tarjeta"                    │
│    → PaymentModal abre formulario                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Usuario ingresa email y nombre del titular                  │
│    → Frontend valida campos básicos                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Usuario completa datos adicionales (DNI, teléfono, etc.)   │
│    → Frontend valida y llama a openCulqiCheckout()            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Frontend inicializa CulqiJS                                 │
│    window.Culqi.publicKey = VITE_CULQI_PUBLIC_KEY             │
│    window.Culqi.settings({ amount, currency, order })         │
│    window.Culqi.open()                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Modal de Culqi aparece en el navegador                      │
│    → Usuario ingresa datos de tarjeta (número, CVV, vto.)     │
│    → Los datos NUNCA pasan por nuestro código                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Culqi tokeniza la tarjeta en SUS servidores                │
│    → Genera token: tkn_test_xxxxx o tkn_live_xxxxx            │
│    → Llama a window.culqi() con el token                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Frontend recibe token en callback window.culqi()            │
│    → Llama a processPayment(token)                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Frontend envía a backend:                                   │
│    POST /api/charge                                            │
│    {                                                           │
│      token: "tkn_test_xxxxx",                                 │
│      orderId: "order-1234567890-abc123",                      │
│      email: "usuario@email.com",                              │
│      items: [{ tourId, priceOption, quantity }]               │
│    }                                                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. Backend valida y calcula monto desde MongoDB                │
│    → Busca cada tour en BD                                     │
│    → Extrae precio real de tour.priceOptions                   │
│    → Calcula: totalAmount = Σ(realPrice * quantity)           │
│    → Valida: totalAmount > 0                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. Backend verifica token no usado (prevenir doble cobro)     │
│     → Busca en BD: compras.culqiData.token                     │
│     → Si existe: devuelve compra existente                     │
│     → Si no existe: continúa                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 11. Backend crea cargo en Culqi                                │
│     POST https://api.culqi.com/v2/charges                      │
│     Authorization: Bearer sk_test_xxx (SECRET KEY)             │
│     {                                                          │
│       amount: totalAmount * 100,  // céntimos                 │
│       currency_code: "PEN",                                    │
│       source_id: token,                                        │
│       email: "usuario@email.com"                              │
│     }                                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 12. Culqi procesa el pago                                      │
│     → Aprobado: devuelve chargeId                             │
│     → Rechazado: devuelve error                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 13. Backend registra compra en MongoDB (UNA SOLA VEZ)         │
│     compras.insertOne({                                        │
│       chargeId, orderId, amount, email,                       │
│       items, culqiData: { token, brand, last4 }               │
│     })                                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 14. Backend responde al frontend                               │
│     { success: true, chargeId, amount }                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 15. Frontend muestra pantalla de éxito                         │
│     → Voucher PDF descargable                                  │
│     → Botón WhatsApp para compartir                           │
│     → Limpia carrito                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 5. Cómo Quedó `/api/charge`

### Funciones Principales:

1. **Validación de Entrada**
   - Verifica `token`, `email`, `items[]`
   - Rechaza si faltan campos requeridos

2. **Prevención de Doble Cobro**
   - Busca token en BD: `compras.culqiData.token`
   - Si existe, devuelve compra anterior
   - Verifica `orderId` para evitar órdenes duplicadas

3. **Cálculo Seguro de Monto**
   - Consulta MongoDB: `tours.findOne({ id: tourId })`
   - Extrae precio real de `tour.priceOptions[]`
   - Calcula: `totalAmount = Σ(realPrice * quantity)`
   - Valida: `totalAmount > 0`

4. **Cargo en Culqi**
   - POST a `https://api.culqi.com/v2/charges`
   - Header: `Authorization: Bearer ${CULQI_SECRET_KEY}`
   - Body: `{ amount: totalAmount * 100, currency_code: 'PEN', source_id: token }`

5. **Registro Único en MongoDB**
   - Guarda en `compras` collection
   - Incluye: `chargeId`, `orderId`, `amount`, `items`, `culqiData.token`
   - **NO hay segundo registro** en `/api/save-purchase`

---

## 🚫 6. Cómo Evitamos el Doble Registro

### ❌ ANTES:
```typescript
// Frontend
const response = await fetch('/api/charge', { ... }) // Registra en BD
await fetch('/api/save-purchase', { ... })           // Registra de nuevo ❌
```

### ✅ AHORA:
```typescript
// Frontend - PaymentModal.tsx
const handleConfirm = async () => {
  // Solo para métodos manuales (Yape, Plin, Transferencia)
  if (method !== 'card') {
    await fetch('/api/save-purchase', { ... })
  }
  // Para tarjeta: NO llama a /api/save-purchase
  // El registro lo hace /api/charge automáticamente
}
```

### Backend - api/index.mjs:
```javascript
// POST /api/charge
// Después de cargo exitoso en Culqi
await db.collection('compras').insertOne(compra) // ✅ Registro único aquí
```

**Resumen:**
- **Tarjeta:** Solo `/api/charge` registra
- **Yape/Plin/Transferencia:** Solo `/api/save-purchase` registra
- **Resultado:** Cada compra se registra **UNA SOLA VEZ**

---

## 💰 7. Cómo Protegimos el Monto

### Problema Original:
```typescript
// Frontend enviaba:
{ amount: 150 }

// Backend confiaba ciegamente:
amount: Math.round(amount * 100) // ❌ Usuario puede modificar en DevTools
```

### Solución Implementada:

1. **Frontend envía identificadores, NO monto:**
```typescript
{
  items: [
    { tourId: 'huancaya-full-day', priceOption: '1 persona', quantity: 2 },
    { tourId: 'paracas-huacachina', priceOption: 'Doble', quantity: 1 }
  ]
}
```

2. **Backend consulta precios reales en MongoDB:**
```javascript
let totalAmount = 0
for (const item of items) {
  const tour = await db.collection('tours').findOne({ id: item.tourId })
  const option = tour.priceOptions.find(opt => opt.label === item.priceOption)
  const realPrice = parseFloat(option.price.match(/(\d+(?:\.\d+)?)/)[1])
  totalAmount += realPrice * item.quantity
}
```

3. **Backend valida:**
```javascript
if (totalAmount <= 0) {
  return json(res, 400, { error: 'Monto inválido' })
}
```

4. **Backend cobra monto calculado:**
```javascript
const culqiRes = await fetch('https://api.culqi.com/v2/charges', {
  body: JSON.stringify({
    amount: Math.round(totalAmount * 100) // ✅ Calculado desde BD
  })
})
```

**Resultado:** El usuario **NO puede** modificar el monto desde DevTools porque:
- El frontend NO envía `amount`
- El backend calcula el monto consultando la BD
- Los precios reales vienen de MongoDB (fuente confiable)

---

## 🔑 8. Variables de Entorno Necesarias

### Desarrollo Local (.env):
```bash
# Claves Culqi TEST
VITE_CULQI_PUBLIC_KEY=pk_test_TU_CLAVE_AQUI
CULQI_SECRET_KEY=sk_test_TU_CLAVE_AQUI

# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/peruintravel
```

### Producción (Vercel):
```bash
# Variables de entorno en Vercel → Settings → Environment Variables

# Claves Culqi LIVE
VITE_CULQI_PUBLIC_KEY=pk_live_TU_CLAVE_AQUI
CULQI_SECRET_KEY=sk_live_TU_CLAVE_AQUI

# MongoDB (la misma para TEST y LIVE, o puedes usar una diferente)
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/peruintravel
```

**IMPORTANTE:**
- ✅ `VITE_CULQI_PUBLIC_KEY` - Puede estar en frontend (empieza con `pk_`)
- ❌ `CULQI_SECRET_KEY` - NUNCA debe estar en frontend (empieza con `sk_`)
- ✅ `.env` está en `.gitignore`
- ✅ `.env.example` tiene placeholders, no claves reales

---

## 🧪 9. Pasos Exactos para Probar en TEST

### 1. Configurar Variables de Entorno Locales

```bash
# .env
VITE_CULQI_PUBLIC_KEY=pk_test_TU_CLAVE_TEST
CULQI_SECRET_KEY=sk_test_TU_CLAVE_TEST
MONGODB_URI=mongodb+srv://...
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Ejecutar Localmente
```bash
npm run dev
```

### 4. Realizar Compra de Prueba

1. Navega a http://localhost:5173
2. Agrega un paquete al carrito
3. Click en "Pagar"
4. Selecciona "Tarjeta de crédito/débito"
5. Ingresa email y nombre del titular
6. Completa datos adicionales
7. Click en "Pagar S/ XXX"
8. **Modal de Culqi aparece**
9. Usa una tarjeta de prueba de Culqi:

```
VISA (Aprobada)
Número: 4111 1111 1111 1111
CVV: 123
Vencimiento: 09/25

Mastercard (Aprobada)
Número: 5111 1111 1111 1118
CVV: 123
Vencimiento: 09/25

VISA (Rechazada)
Número: 4000 0000 0000 0002
CVV: 123
Vencimiento: 09/25
```

**Documentación oficial de tarjetas de prueba:**
https://docs.culqi.com/es/documentacion/checkout/pruebas/

### 5. Verificar Logs

**En el navegador (F12 → Console):**
```
✅ Token Culqi generado: tkn_test_xxxxx
Enviando token al backend...
✅ Pago procesado exitosamente: { chargeId: "chr_test_xxxxx" }
```

**En la terminal del servidor:**
```
💰 Monto calculado desde BD: 145 PEN
📦 Items procesados: [...]
✅ Cargo Culqi exitoso: chr_test_xxxxx
✅ Compra registrada en MongoDB
```

### 6. Verificar en MongoDB Atlas

1. Ve a https://cloud.mongodb.com
2. Database → Browse Collections
3. Collection: `compras`
4. Verifica que existe el registro con:
   - `chargeId`
   - `orderId`
   - `amount`
   - `culqiData.token`
   - `items[]`

### 7. Verificar en Culqi Dashboard

1. Ve a https://integ-panel.culqi.com (TEST)
2. Transacciones → Cargos
3. Busca el `chargeId`
4. Verifica estado, monto, tarjeta

### 8. Probar Prevención de Doble Cobro

1. Completa una compra exitosa
2. Anota el `token` generado
3. Intenta enviar el mismo `token` de nuevo desde Postman:

```bash
POST http://localhost:5173/api/charge
Content-Type: application/json

{
  "token": "tkn_test_xxxxx",
  "email": "test@test.com",
  "items": [...]
}
```

**Resultado esperado:**
```json
{
  "ok": true,
  "success": true,
  "chargeId": "chr_test_xxxxx",
  "message": "Pago ya procesado anteriormente",
  "isDuplicate": true
}
```

---

## 🚀 10. Pasos Exactos para Pasar a LIVE (Producción)

### 1. Obtener Claves LIVE de Culqi

1. Ve a https://panel.culqi.com (producción)
2. Verifica que tu comercio esté aprobado para producción
3. Ve a **Desarrollo** → **API Keys** → **Modo Live**
4. Copia:
   - `pk_live_...` (Public Key)
   - `sk_live_...` (Secret Key)

### 2. Configurar en Vercel

1. Ve a https://vercel.com/tu-proyecto
2. **Settings** → **Environment Variables**
3. Edita o agrega:
   ```
   VITE_CULQI_PUBLIC_KEY = pk_live_TU_CLAVE_LIVE
   CULQI_SECRET_KEY = sk_live_TU_CLAVE_LIVE
   ```
4. Click **Save**
5. **Importante:** Redeploy el proyecto para que tome las nuevas variables

### 3. Autorizar Dominio en Culqi (Opcional pero Recomendado)

1. En Culqi Panel → **Configuración** → **Dominios permitidos**
2. Agrega:
   ```
   https://swpit.vercel.app
   ```
3. Guarda cambios

### 4. Redeploy en Vercel

```bash
git push origin main
```

O en Vercel Dashboard → **Deployments** → **Redeploy**

### 5. Verificar Deployment

1. Ve a https://swpit.vercel.app
2. Abre Console (F12)
3. Verifica que **NO hay** errores de:
   - `VITE_CULQI_PUBLIC_KEY no configurada`
   - CORS
   - 404 en scripts

### 6. Realizar Compra REAL de Prueba

**⚠️ ATENCIÓN:** Ahora usarás una tarjeta **REAL** y se **cobrará de verdad**

1. Agrega un paquete al carrito
2. Procede al pago con tarjeta
3. Usa una tarjeta real (puede ser la tuya)
4. Completa la compra

### 7. Verificar en Culqi Panel (LIVE)

1. Ve a https://panel.culqi.com
2. **Transacciones** → **Cargos**
3. Busca el cargo más reciente
4. Verifica:
   - Estado: **Exitoso**
   - Monto correcto
   - Datos del cliente

### 8. Verificar en MongoDB

1. Verifica que se registró en `compras` collection
2. Revisa que todos los campos estén completos

### 9. Probar Diferentes Escenarios

- ✅ Compra aprobada
- ❌ Tarjeta rechazada (fondos insuficientes)
- ❌ Tarjeta expirada
- ❌ CVV incorrecto
- 🔄 Doble click en botón pagar (debe prevenir)

### 10. Monitorear Primeras Transacciones

- Revisa los logs en Vercel → Functions → api/index.mjs
- Verifica que no haya errores
- Confirma que los montos coinciden con los de MongoDB

---

## ⚠️ 11. Problemas de Seguridad Adicionales Encontrados y Corregidos

### ❌ 1. Fallback Hardcodeado de Public Key
**Problema:** Clave de prueba hardcodeada en el código
```typescript
const CULQI_PUBLIC_KEY = import.meta.env?.VITE_CULQI_PUBLIC_KEY || 'pk_test_foBlu9NBJohtJoob'
```
**Solución:** Eliminado fallback, validación estricta
```typescript
const CULQI_PUBLIC_KEY = import.meta.env?.VITE_CULQI_PUBLIC_KEY
if (!CULQI_PUBLIC_KEY) {
  console.error('❌ VITE_CULQI_PUBLIC_KEY no está configurada')
}
```

### ❌ 2. Claves Reales en .env.example
**Problema:** `.env.example` tenía claves de prueba reales
**Solución:** Reemplazadas con placeholders

### ❌ 3. Monto Enviado desde Frontend
**Problema:** El frontend enviaba el monto, que podía ser manipulado
**Solución:** Backend calcula monto desde MongoDB

### ❌ 4. Fetch Directo a secure.culqi.com
**Problema:** Causaba CORS y no es la forma oficial
**Solución:** Implementado CulqiJS Checkout V4

### ❌ 5. Doble Registro de Compra
**Problema:** `/api/charge` y `/api/save-purchase` registraban la misma compra
**Solución:** Unificado registro en `/api/charge` para tarjetas

### ❌ 6. Sin Validación de Token Reutilizado
**Problema:** El mismo token podía usarse múltiples veces
**Solución:** Backend verifica token en BD antes de cobrar

### ❌ 7. Sin Validación de Tours Inexistentes
**Problema:** No se verificaba si el `tourId` existía
**Solución:** Backend consulta tour en BD, rechaza si no existe

### ❌ 8. Sin Validación de Precio Real
**Problema:** No se verificaba si el `priceOption` existía para ese tour
**Solución:** Backend busca precio en `tour.priceOptions[]`

---

## ✅ Checklist Final de Seguridad

- [x] ❌ Fetch directo a `secure.culqi.com/v2/tokens` eliminado
- [x] ✅ CulqiJS Checkout V4 implementado
- [x] ❌ Fallback hardcodeado `pk_test_...` eliminado
- [x] ✅ Validación estricta de `CULQI_PUBLIC_KEY`
- [x] ✅ `CULQI_SECRET_KEY` solo en backend
- [x] ✅ `.env` en `.gitignore`
- [x] ✅ `.env.example` con placeholders
- [x] ✅ Monto calculado desde MongoDB
- [x] ✅ Validación de `tourId` existe en BD
- [x] ✅ Validación de `priceOption` existe para el tour
- [x] ✅ Validación de `totalAmount > 0`
- [x] ✅ Prevención de token reutilizado
- [x] ✅ Prevención de orderId duplicado
- [x] ✅ Registro único en MongoDB
- [x] ✅ Botón pagar deshabilitado durante procesamiento
- [x] ✅ Logs de auditoría en backend
- [x] ✅ Errores amigables al usuario (sin detalles técnicos)
- [x] ✅ Build exitoso sin warnings de seguridad

---

## 📞 Soporte

Si tienes problemas:

1. **CORS Error:**
   - Verifica que el script de Culqi esté cargado en `index.html`
   - Limpia caché del navegador (Ctrl+Shift+R)

2. **Error "CULQI_SECRET_KEY no configurado":**
   - Verifica variables de entorno en Vercel
   - Redeploy después de cambiar variables

3. **Monto incorrecto:**
   - Verifica precios en MongoDB collection `tours`
   - Revisa logs en backend: `💰 Monto calculado desde BD`

4. **Doble cobro:**
   - Verifica logs: `⚠️ Token ya utilizado`
   - Revisa collection `compras` en MongoDB

5. **Culqi rechaza el cargo:**
   - Verifica que las claves (TEST o LIVE) coincidan
   - Revisa respuesta de Culqi en logs: `❌ Error Culqi`

---

## 🎉 Conclusión

La integración de Culqi está ahora **lista para producción** con:
- ✅ Seguridad robusta (montos validados desde BD)
- ✅ Prevención de doble cobro (token único)
- ✅ Sin errores CORS (CulqiJS oficial)
- ✅ Registro único de compras
- ✅ Código limpio sin secrets hardcodeados
- ✅ Cumplimiento de mejores prácticas de Culqi

**Fecha de implementación:** $(date '+%Y-%m-%d')  
**Versión:** 1.0.0  
**Estado:** ✅ PRODUCCIÓN READY

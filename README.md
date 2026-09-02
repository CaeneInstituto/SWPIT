# 🌄 Peru In Travel - LOVI GROUP PERU E.I.R.L.

## 📋 Información de la Empresa

**Razón Social:** LOVI GROUP PERU E.I.R.L.  
**Razón Comercial:** Peru In Travel  
**RUC:** 20606474467  
**Dirección:** Jr. Los Nogales 345, Los Ficus, Santa Anita, Lima  
**Registrado en Mincetur:** Desde 2022  

---

## 🚀 Inicio Rápido

### ⚡ Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Terminal 1: Backend
npm run server

# 3. Terminal 2: Frontend
npm run dev

# 4. Abrir navegador
http://localhost:5173
```

### ✅ Verificar que Todo Funciona

```bash
# Probar sistema de compras
npm run test-compra
```

**Si todo está bien, verás:**
```
✅ ¡Compra guardada exitosamente!
📊 Abre el archivo server/compras.xlsx
```

---

## 🏗️ Arquitectura del Sistema

### 📦 Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Base de Datos:** MongoDB Atlas + Excel (local)
- **Pagos:** Culqi (tarjetas) + Yape/Plin/Transferencia (manual)
- **Deployment:** Vercel
- **Autenticación:** Context-based admin auth

### 🗂️ Estructura de Archivos

```
peru-in-travel/
├── 📂 src/
│   ├── 📂 components/        # Componentes React
│   ├── 📂 context/          # Contextos (Auth, Cart)
│   ├── 📂 data/             # Datos estáticos
│   ├── 📂 pages/            # Páginas principales
│   └── 📂 utils/            # Utilidades
├── 📂 server/               # Backend Express
│   ├── index.mjs            # Servidor principal
│   ├── compras.xlsx         # Compras almacenadas
│   └── README-COMPRAS.md    # Doc del sistema
├── 📂 api/                  # Vercel API Routes
│   └── index.mjs            # API unificada
├── 📂 public/               # Assets estáticos
└── 📄 README.md             # Este archivo
```

---

## 💾 Sistema de Compras

### 🎯 Funcionalidades Principales

El sistema registra **automáticamente** todas las compras con:

- ✅ **Métodos soportados:** Tarjeta, Yape, Plin, Transferencia
- ✅ **Almacenamiento dual:** MongoDB + Excel local
- ✅ **Admin panel completo** con descarga Excel
- ✅ **Prevención de doble cobro**
- ✅ **Cálculo seguro de montos desde BD**

### 📊 Datos Capturados

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **ID Compra** | Identificador único | `PIT-1723456789012` |
| **Cliente** | Nombre completo | `Juan Pérez García` |
| **Email** | Correo electrónico | `juan@example.com` |
| **Método** | Forma de pago | `Yape` / `Tarjeta` |
| **Tours** | Paquetes comprados | `Huancaya Full Day (Adulto)` |
| **Monto** | Precio total en soles | `850.00` |
| **Estado** | Situación del pago | `Pagado` / `Pendiente` |
| **Fecha** | Cuándo se realizó | `14/08/2026 15:30:45` |

### 🔄 Flujo de Compra

#### Para Yape/Plin/Transferencia:
```
1. Cliente agrega tours al carrito
2. Selecciona método de pago manual
3. Ve instrucciones (número, datos bancarios)
4. Realiza pago en su app
5. Completa formulario web (nombre, email, voucher)
6. ✅ SE REGISTRA AUTOMÁTICAMENTE
7. WhatsApp abre con mensaje pre-llenado
8. Envía comprobante por WhatsApp
```

#### Para Tarjeta (Culqi):
```
1. Cliente agrega tours al carrito
2. Selecciona "Tarjeta de crédito/débito"
3. Completa datos personales
4. Modal de Culqi aparece
5. Ingresa datos de tarjeta
6. ✅ SE COBRA Y REGISTRA AUTOMÁTICAMENTE
7. Descarga voucher PDF
```

---

## 🔐 Integración de Pagos

### 💳 Culqi (Tarjetas)

**Características:**
- ✅ **CulqiJS Checkout V4** (modal oficial)
- ✅ **Monto calculado desde BD** (no manipulable)
- ✅ **Prevención doble cobro** (token único)
- ✅ **Tarjetas soportadas:** Visa, Mastercard, Amex
- ✅ **3D Secure** automático

**Variables de Entorno Necesarias:**
```bash
# Frontend (público)
VITE_CULQI_PUBLIC_KEY=pk_test_xxx  # o pk_live_xxx

# Backend (privado)
CULQI_SECRET_KEY=sk_test_xxx       # o sk_live_xxx
```

**Tarjetas de Prueba:**
```
VISA Aprobada:     4111 1111 1111 1111
Mastercard:        5111 1111 1111 1118
VISA Rechazada:    4000 0000 0000 0002
CVV: 123 | Vencimiento: 09/25
```

### 📱 Pagos Manuales

**Métodos Soportados:**
- **Yape:** +51 929 648 380
- **Plin:** +51 929 648 380
- **Transferencia BCP:**
  - Cuenta: 000-000000000
  - CCI: 00200000000000000000
  - Titular: LOVI GROUP PERU E.I.R.L.

**Flujo:**
1. Cliente ve instrucciones
2. Realiza pago en su app/banco
3. Completa formulario web
4. Sistema registra automáticamente
5. WhatsApp abre para enviar comprobante

---

## 👨‍💼 Panel de Administración

### 🎯 Funcionalidades

#### 📦 Gestión de Paquetes
- ✅ **CRUD completo:** Crear, leer, actualizar, eliminar
- ✅ **Filtros de temporada** con descuentos automáticos
- ✅ **Búsqueda** por nombre/ubicación
- ✅ **🧠 Inteligencia de paquetes:** Detección automática de tipos
  - 🏨 Triple, Cuádruple, Quintuple (habitaciones fijas)
  - 💕 Promo Parejas (precio total para 2)
  - 👥 A partir de 3 (precio grupal)
  - 👤 Individual
- ✅ **Análisis en tiempo real** con ejemplos prácticos

#### 💬 Testimonios
- ✅ **Gestión completa** de testimonios de clientes
- ✅ **Vista previa** en tiempo real
- ✅ **Sincronización** con MongoDB
- ✅ **Fallback** a datos locales si BD no responde

#### 🛒 Compras
- ✅ **Dashboard de ventas** con estadísticas
- ✅ **Tabla detallada** de todas las transacciones
- ✅ **Descarga Excel** profesional con un click
- ✅ **Filtros y búsqueda** por cliente, fecha, método
- ✅ **Datos completos:** Cliente, tours, montos, estados

### 📊 Estadísticas en Tiempo Real

- **Total de compras realizadas**
- **Ingresos totales acumulados**
- **Compra promedio por transacción**
- **Paquetes activos vs deshabilitados**
- **Indicador de estado MongoDB**

### 📥 Descarga Excel

**Características:**
- ✅ **Generación automática** con datos actualizados
- ✅ **12 columnas detalladas** con toda la información
- ✅ **Formato profesional** con anchos optimizados
- ✅ **Nombre automático** con fecha: `peru-in-travel-compras-YYYY-MM-DD.xlsx`
- ✅ **Compatible** con Excel, Google Sheets, LibreOffice

**Contenido del Excel:**
```
N° | Fecha | Cliente | Email | Monto | Estado | Método | Paquete | País | ...
1  | 21/08 | Ana G.  | ana@  | 180   | venta  | Tarjeta| Huancaya| PE   | ...
2  | 21/08 | Carlos  | car@  | 45    | pendiente| Yape | Lachay  | PE   | ...
```

---

## 🔧 Gestión de Temporadas

### 📅 Temporadas Disponibles

| Temporada | Descuento | Descripción |
|-----------|-----------|-------------|
| **Verano** | 10% | Enero - Marzo |
| **Invierno** | 15% | Junio - Agosto |
| **Semana Santa** | 5% | Marzo/Abril |
| **Fiestas Patrias** | 8% | Julio |

### ⚙️ Funcionalidades

- ✅ **Aplicar descuentos** automáticos por temporada
- ✅ **Configurar paquetes** para cada temporada
- ✅ **Precios originales** guardados para restaurar
- ✅ **Activar/desactivar** paquetes según temporada
- ✅ **Persistencia** en localStorage y MongoDB

---

## 🔍 Diagnóstico y Soluciones

### ⚠️ Errores Comunes

#### HTTP 500 en `/api/tours` o `/api/testimonials`

**Síntomas:**
```javascript
Failed to load resource: the server responded with a status of 500
SyntaxError: Unexpected token 'A', "A server e"... is not valid JSON
```

**Causa:** Variable `MONGODB_URI` mal configurada en Vercel

**Solución:**
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Verifica/agrega `MONGODB_URI` con formato correcto:
   ```bash
   mongodb+srv://user:pass@cluster.mongodb.net/peruintravel
   # O formato manual:
   mongodb://user:pass@host1:27017,host2:27017/peruintravel?ssl=true&...
   ```
3. Redeploy el proyecto

#### Error CORS con Culqi

**Causa:** Fetch directo a `secure.culqi.com`

**Solución:** Ya implementado - usa CulqiJS Checkout V4

#### Doble Registro de Compras

**Causa:** Llamadas duplicadas a API

**Solución:** Ya implementado - registro único por método

### ✅ Health Check

```bash
# Verificar APIs en producción
curl https://tu-dominio.vercel.app/api/health

# Respuesta esperada:
{
  "status": "ok",
  "mongo": "✅ conectado",
  "culqi": "🧪 TEST",
  "mongoUri": "✅ configurado"
}
```

---

## 🌐 Despliegue

### 🚀 Vercel (Producción)

**Configuración requerida:**

1. **Variables de Entorno:**
   ```bash
   # MongoDB
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/peruintravel
   
   # Culqi LIVE
   VITE_CULQI_PUBLIC_KEY=pk_live_xxx
   CULQI_SECRET_KEY=sk_live_xxx
   ```

2. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node Version: 18.x

3. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy a producción"
   git push origin main
   ```

### 📱 Pruebas en Producción

1. **Verificar health:** `/api/health`
2. **Probar carga de tours:** Home page
3. **Probar compra con tarjeta de prueba**
4. **Verificar admin panel**
5. **Descargar Excel de prueba**

---

## 📚 APIs Disponibles

### 🔌 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Estado del sistema |
| `GET` | `/api/tours` | Lista de paquetes turísticos |
| `GET` | `/api/testimonials` | Testimonios de clientes |
| `GET` | `/api/compras` | Lista de compras realizadas |
| `POST` | `/api/charge` | Procesar pago con tarjeta |
| `POST` | `/api/save-purchase` | Guardar compra manual |
| `POST` | `/api/testimonials` | Crear testimonio |
| `PUT` | `/api/testimonials/:id` | Actualizar testimonio |
| `DELETE` | `/api/testimonials/:id` | Eliminar testimonio |

### 📝 Ejemplos de Uso

#### Crear Compra Manual (Yape/Plin)
```javascript
POST /api/save-purchase
{
  "items": [{ "tourName": "Huancaya", "quantity": 2, "price": 90 }],
  "customerData": {
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "phone": "999888777"
  },
  "paymentMethod": "Yape",
  "voucherNote": "YAP123456"
}
```

#### Procesar Pago con Tarjeta
```javascript
POST /api/charge
{
  "token": "tkn_test_xxx",
  "email": "cliente@email.com",
  "items": [
    {
      "tourId": "huancaya-full-day",
      "priceOption": "1 persona",
      "quantity": 2
    }
  ]
}
```

---

## 🛠️ Desarrollo

### 📋 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Frontend en puerto 5173
npm run server       # Backend en puerto 3001

# Producción
npm run build        # Build para producción
npm run preview      # Preview del build

# Utilidades
npm run test-compra  # Probar sistema de compras
node test-mongodb.mjs # Probar conexión MongoDB
```

### 🧪 Testing

#### Probar Sistema de Compras
```bash
npm run test-compra
```

#### Probar Conexión MongoDB
```bash
node test-mongodb.mjs
```

#### Probar Pago Manual
1. `npm run dev`
2. Agregar paquete al carrito
3. Seleccionar Yape/Plin
4. Completar datos
5. Verificar `server/compras.xlsx`

#### Probar Pago con Tarjeta
1. `npm run dev`
2. Agregar paquete al carrito
3. Seleccionar "Tarjeta"
4. Usar tarjeta de prueba: `4111 1111 1111 1111`
5. Verificar admin panel

---

## 🔒 Seguridad

### ✅ Implementadas

- ✅ **Cálculo de montos en backend** (no manipulable desde frontend)
- ✅ **Validación de tours desde MongoDB** (prices reales)
- ✅ **Prevención de doble cobro** (tokens únicos)
- ✅ **Variables de entorno** para secrets
- ✅ **Sanitización de datos** de usuario
- ✅ **CORS configurado** correctamente
- ✅ **Rate limiting** implícito de Vercel
- ✅ **No hay secrets hardcodeados** en el código

### 📋 Buenas Prácticas

- **Secrets nunca en frontend** (`CULQI_SECRET_KEY` solo en backend)
- **Public keys sí en frontend** (`VITE_CULQI_PUBLIC_KEY`)
- **Variables de entorno en `.env`** (nunca commitear)
- **`.env.example` con placeholders** (sin valores reales)
- **Logs sin información sensible**
- **Validación de entrada en todas las APIs**

---

## 📞 Soporte

### 🐛 Reportar Problemas

1. **Revisar logs** en Vercel Dashboard
2. **Verificar variables de entorno**
3. **Probar health endpoint**: `/api/health`
4. **Verificar conexión MongoDB**

### 💡 Tips de Desarrollo

- **MongoDB debe estar conectado** para testimonios y compras
- **Variables de entorno son case-sensitive**
- **Clearing cache del navegador** a menudo ayuda
- **Build antes de deploy** para verificar errores
- **Usar herramientas de dev de navegador** para debugging

### 📖 Documentación Técnica

- **Culqi:** https://docs.culqi.com/
- **MongoDB:** https://docs.mongodb.com/
- **Vercel:** https://vercel.com/docs
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/

---

## 🏆 Características Destacadas

### 🧠 Inteligencia de Paquetes (Admin)
- **Detección automática** de tipos al escribir nombres
- **Análisis en tiempo real** con ejemplos
- **Indicadores visuales** por categoría
- **Cálculos de agrupación** automáticos

### 💎 Sistema de Compras Robusto
- **Dual storage:** MongoDB + Excel local
- **Métodos múltiples:** Tarjeta + manuales
- **Registro único** sin duplicados
- **Admin panel completo**

### 🎨 UI/UX Profesional
- **Diseño responsive** mobile-first
- **Loading states** en todas las acciones
- **Error handling** amigable
- **Animaciones suaves**

### 🔐 Seguridad Enterprise
- **Cálculo backend** de montos
- **Prevención doble cobro**
- **No secrets en frontend**
- **Validación completa de datos**

---

## 📈 Roadmap Futuro

### 📅 Corto Plazo
- [ ] **Webhooks de Culqi** para confirmación automática
- [ ] **Panel de estadísticas** más avanzado
- [ ] **Filtros por fechas** en admin
- [ ] **Backup automático** de compras

### 🚀 Mediano Plazo
- [ ] **App móvil** React Native
- [ ] **Sistema de cupones** y descuentos
- [ ] **Multi-idioma** (inglés)
- [ ] **Integración WhatsApp Business**

### 🌟 Largo Plazo
- [ ] **IA para recomendaciones** de tours
- [ ] **Realidad virtual** preview de destinos
- [ ] **Blockchain** para certificados de viaje
- [ ] **Marketplace** de operadores turísticos

---

## 📜 Changelog

### v2.1.0 (Agosto 2026)
- ✅ **PackageIntelligence:** Detector automático de tipos de paquetes en admin
- ✅ **Información empresarial:** Actualizada a LOVI GROUP PERU E.I.R.L.
- ✅ **Análisis en tiempo real:** Ejemplos prácticos por tipo de paquete

### v2.0.0 (Agosto 2026)
- ✅ **Sistema de compras completo:** MongoDB + Excel
- ✅ **Admin panel:** 3 pestañas con funcionalidades completas
- ✅ **Integración Culqi:** CulqiJS Checkout V4 seguro
- ✅ **Pagos manuales:** Yape, Plin, Transferencia
- ✅ **Descarga Excel:** Profesional con 12 columnas

### v1.0.0 (Julio 2026)
- ✅ **Web básica:** Catálogo de tours
- ✅ **Carrito de compras:** Funcionalidad básica
- ✅ **Diseño responsive:** Mobile-first
- ✅ **Deploy en Vercel:** Producción inicial

---

**© 2026 LOVI GROUP PERU E.I.R.L. - Peru In Travel**  
*Todos los derechos reservados*

---

*Esta documentación se mantiene actualizada con cada release. Última actualización: Agosto 2026*
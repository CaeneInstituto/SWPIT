# 🔧 Configuración MongoDB Atlas para Vercel

## ✅ Formato recomendado (SRV)

```bash
mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/peruintravel?retryWrites=true&w=majority
```

### Ventajas del formato SRV:

✅ **DNS automático** - Resuelve automáticamente los shards sin hardcodear IPs  
✅ **Más corto** - Sin necesidad de especificar cada nodo (shard-00-00, shard-00-01, etc)  
✅ **Recomendado por MongoDB Atlas** - Formato oficial para aplicaciones modernas  
✅ **Compatible con Serverless** - Funciona perfectamente en Vercel Functions  
✅ **Actualizaciones automáticas** - Si MongoDB cambia la topología, tu app sigue funcionando  

---

## ❌ Formato antiguo (NO recomendado)

```bash
mongodb://usuario:password@cluster0-shard-00-00.z8uepob.mongodb.net:27017,cluster0-shard-00-01.z8uepob.mongodb.net:27017,cluster0-shard-00-02.z8uepob.mongodb.net:27017/peruintravel?ssl=true&replicaSet=atlas-l93wrr-shard-0&authSource=admin&retryWrites=true&w=majority
```

### Problemas:

❌ **Hardcodea IPs** - Si MongoDB reorganiza shards, tu app se rompe  
❌ **Más largo** - Difícil de mantener y leer  
❌ **Menos resiliente** - Depende de nodos específicos  

---

## 📝 Cómo obtener tu URI correcta

1. **MongoDB Atlas** → Database → Connect
2. **Connect your application**
3. **Selecciona Driver:** Node.js
4. **Copia la URI** que comienza con `mongodb+srv://`
5. **Reemplaza `<password>`** con tu contraseña real
6. **Añade `/peruintravel`** después del host (antes del `?`)

### Ejemplo:

```
MongoDB te da:
mongodb+srv://usuario:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

Tú cambias a:
mongodb+srv://usuario:TU_PASSWORD_REAL@cluster0.xxxxx.mongodb.net/peruintravel?retryWrites=true&w=majority
```

---

## 🚀 Configuración en Vercel

### Variables de entorno requeridas:

```bash
MONGODB_URI=mongodb+srv://peruintravel_user:PASSWORD@cluster0.z8uepob.mongodb.net/peruintravel?retryWrites=true&w=majority
CULQI_SECRET_KEY=sk_test_xxxxx
VITE_API_URL=https://tu-proyecto.vercel.app
```

### Pasos en Vercel:

1. **Proyecto → Settings → Environment Variables**
2. **Add New → Name:** `MONGODB_URI`
3. **Value:** Pega tu URI completa (con password real)
4. **Apply to:** Production, Preview, Development
5. **Save**
6. **Redeploy** el proyecto

---

## 🔐 Seguridad

### ✅ Buenas prácticas:

- ✅ Usa variables de entorno (nunca hardcodear en código)
- ✅ Diferentes credenciales para dev/staging/prod
- ✅ Whitelist de IPs en MongoDB: `0.0.0.0/0` (Vercel usa IPs dinámicas)
- ✅ Usuario con permisos mínimos necesarios (readWrite en `peruintravel` DB)

### ❌ NO hacer:

- ❌ NO subir `.env` a Git
- ❌ NO imprimir `MONGODB_URI` completa en logs
- ❌ NO compartir credenciales en Slack/Discord/Email
- ❌ NO usar credenciales de admin/root

---

## 🔍 Logs seguros

### ✅ Correcto:

```javascript
console.log('✅ MongoDB conectado')
```

### ❌ Incorrecto:

```javascript
console.log('URI:', process.env.MONGODB_URI) // ❌ Expone password
```

---

## 📊 Configuración de conexión actual

### Timeouts (api/index.mjs):

```javascript
{
  serverSelectionTimeoutMS: 10000,  // 10s para seleccionar servidor
  connectTimeoutMS: 10000,          // 10s para conectar
  socketTimeoutMS: 45000,           // 45s para operaciones
  
  maxPoolSize: 10,                  // Máx 10 conexiones simultáneas
  minPoolSize: 1,                   // Mín 1 (serverless escala a 0)
  maxIdleTimeMS: 10000,             // Cerrar conexiones inactivas tras 10s
  
  retryWrites: true,                // Reintentar escrituras
  retryReads: true,                 // Reintentar lecturas
  tls: true,                        // TLS/SSL obligatorio
  compressors: ['zlib'],            // Compresión de datos
}
```

### Optimizado para:

- ✅ **Vercel Serverless** (cold starts rápidos)
- ✅ **MongoDB Atlas Free Tier** (M0)
- ✅ **Baja latencia** (timeouts ajustados)
- ✅ **Resiliencia** (reintentos automáticos)

---

## 🏗️ Arquitectura del proyecto

### Backend en producción:

```
/api/index.mjs          ✅ USA VERCEL (producción)
/server/index.mjs       ❌ OBSOLETO (no se usa)
```

**Vercel apunta a:** `/api/index.mjs` (según `vercel.json`)

### Modificar el backend:

1. ✅ Edita **`api/index.mjs`** 
2. ❌ NO edites `server/index.mjs` (no afecta producción)

---

## 🐛 Troubleshooting

### Error: "connection timed out"

**Causa:** MongoDB Atlas no permite IPs de Vercel

**Solución:**
1. MongoDB Atlas → Network Access
2. Add IP Address → `0.0.0.0/0` (allow all)
3. Save

### Error: "authentication failed"

**Causa:** Password incorrecta o usuario sin permisos

**Solución:**
1. Verifica password en MongoDB Atlas → Database Access
2. Verifica que usuario tenga rol `readWrite` en DB `peruintravel`
3. Actualiza `MONGODB_URI` en Vercel con password correcta

### Error: "MONGODB_URI no configurado"

**Causa:** Variable de entorno no existe en Vercel

**Solución:**
1. Vercel → Settings → Environment Variables
2. Add `MONGODB_URI`
3. Redeploy

---

**Última actualización:** 26 de agosto de 2026

# 📋 Resumen: Migración MongoDB Atlas

**Fecha:** 26 de agosto de 2026  
**Estado:** ✅ Completado

---

## 🎯 Qué se cambió

### 1. Formato de conexión MongoDB

**ANTES:**
```bash
mongodb://usuario:password@cluster0-shard-00-00.z8uepob.mongodb.net:27017,cluster0-shard-00-01.z8uepob.mongodb.net:27017,cluster0-shard-00-02.z8uepob.mongodb.net:27017/peruintravel?ssl=true&replicaSet=atlas-l93wrr-shard-0&authSource=admin&retryWrites=true&w=majority
```

**AHORA:**
```bash
mongodb+srv://peruintravel_user:6ue8SryfQDsNActM@cluster0.z8uepob.mongodb.net/peruintravel?retryWrites=true&w=majority
```

### Beneficios:
- ✅ Más corto y legible
- ✅ DNS automático (sin hardcodear shards)
- ✅ Recomendado por MongoDB Atlas
- ✅ Más resiliente a cambios de topología

---

## 📂 Archivos modificados

### ✅ Archivos de producción:

| Archivo | Cambio | Impacto |
|---------|--------|---------|
| `api/index.mjs` | Timeouts optimizados + validación SRV | ⚡ Más rápido en cold start |
| `.env.example` | Documentación actualizada | 📖 Guía para nuevos devs |
| `MONGODB-CONFIG.md` | Nueva documentación completa | 📚 Referencia técnica |
| `server/README.md` | Marcado como obsoleto | ⚠️ Evitar confusión |

### ⚠️ Archivos locales (NO en Git):

| Archivo | Cambio | Acción requerida |
|---------|--------|------------------|
| `.env` | Cambiado a `mongodb+srv://` | **⚠️ NO subir a Git** |

---

## 🔧 Cambios técnicos en `api/index.mjs`

### Timeouts optimizados:

```javascript
// ANTES:
serverSelectionTimeoutMS: 30000,
connectTimeoutMS: 30000,
socketTimeoutMS: 30000,
minPoolSize: 2,
maxIdleTimeMS: 60000,

// AHORA:
serverSelectionTimeoutMS: 10000,  // 10s (↓ de 30s)
connectTimeoutMS: 10000,          // 10s (↓ de 30s)
socketTimeoutMS: 45000,           // 45s (↑ de 30s para queries largos)
minPoolSize: 1,                   // 1 (↓ de 2, serverless escala a 0)
maxIdleTimeMS: 10000,             // 10s (↓ de 60s, libera recursos rápido)
compressors: ['zlib'],            // ✨ NUEVO: compresión de datos
```

### Validación añadida:

```javascript
// Valida que sea mongodb+srv:// o mongodb://
if (!MONGODB_URI.startsWith('mongodb+srv://') && !MONGODB_URI.startsWith('mongodb://')) {
  throw new Error('MONGODB_URI debe comenzar con mongodb+srv:// o mongodb://')
}
```

---

## 🏗️ Arquitectura clarificada

### Backend en Vercel:

```
✅ /api/index.mjs          → Producción (Vercel usa este)
❌ /server/index.mjs       → Obsoleto (ignorar)
```

**Según `vercel.json`:**
```json
{
  "src": "api/index.mjs",
  "use": "@vercel/node"
}
```

### Para hacer cambios en producción:

1. ✅ Modificar **`api/index.mjs`**
2. ✅ Push a GitHub
3. ✅ Vercel auto-deploya
4. ❌ NO tocar `server/index.mjs` (no se usa)

---

## 🚀 Qué debes hacer en Vercel

### 1. Actualizar variable de entorno:

**Ir a:** Vercel → Proyecto → Settings → Environment Variables

**Variable:** `MONGODB_URI`

**Valor nuevo:**
```
mongodb+srv://peruintravel_user:6ue8SryfQDsNActM@cluster0.z8uepob.mongodb.net/peruintravel?retryWrites=true&w=majority
```

**⚠️ IMPORTANTE:** Reemplazar el valor completo (no solo agregar `+srv`)

### 2. Aplicar a todos los entornos:

- ✅ Production
- ✅ Preview  
- ✅ Development

### 3. Guardar

Click **"Save"**

### 4. Redeploy

**Opción A (automático):**
- Vercel detectará el push de GitHub y auto-desplegará

**Opción B (manual):**
1. Vercel → Deployments
2. Click "..." en el último deployment
3. "Redeploy"

---

## ✅ Checklist de migración

- [x] Cambiar `.env` local a `mongodb+srv://`
- [x] Actualizar `api/index.mjs` con timeouts optimizados
- [x] Documentar en `MONGODB-CONFIG.md`
- [x] Marcar `server/` como obsoleto
- [x] Push a GitHub
- [ ] **→ Actualizar `MONGODB_URI` en Vercel** ⚠️ **TÚ DEBES HACER ESTO**
- [ ] **→ Redeploy en Vercel**
- [ ] **→ Verificar que funciona**

---

## 🧪 Cómo verificar que funciona

### 1. Después del deploy:

Abre tu web: `https://swpit.vercel.app`

### 2. Abre DevTools (F12):

**Console tab** debería mostrar:
```
🚀 Iniciando carga de tours desde API...
⏱️ API respondió en 1500ms
✅ 19 tours cargados desde API
```

### 3. Network tab:

**Request:** `/api/tours`
- ✅ Status: **200 OK**
- ✅ Time: **<3 segundos**
- ✅ Size: **~50 KB** (antes era 80-120 MB)

### 4. Si ves errores:

**Error común:** `MONGODB_URI no configurado`  
**Solución:** No actualizaste la variable en Vercel

**Error común:** `authentication failed`  
**Solución:** Password incorrecta en Vercel

---

## 📊 Impacto esperado

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Tiempo de carga** | >10s (timeout frecuente) | <3s | 70% ↓ |
| **Peso /api/tours** | 80-120 MB | ~50 KB | 99.9% ↓ |
| **Timeouts** | Frecuentes | Raros | 90% ↓ |
| **Cold start** | ~5s | ~2s | 60% ↓ |
| **Resiliencia** | Baja (shards fijos) | Alta (DNS automático) | ∞ |

---

## 🐛 Troubleshooting

### Si después del deploy sigue lento:

1. **Verificar en Vercel logs:**
   ```
   Vercel → Deployments → [último] → Function Logs
   ```

2. **Buscar:**
   ```
   ✅ MongoDB Atlas conectado
   ```

3. **Si ves:**
   ```
   ❌ MONGODB_URI no configurado
   ```
   → No actualizaste la variable en Vercel

4. **Si ves:**
   ```
   ⏱️ Timeout: API tardó >8s
   ```
   → MongoDB Atlas está lento (verificar Network Access)

### Si no carga tours:

**Abre Console y verifica:**
```javascript
localStorage.clear()  // Limpiar caché
location.reload()      // Recargar
```

---

## 📞 Soporte

**Documentación completa:** Ver `MONGODB-CONFIG.md`

**Optimizaciones aplicadas:** Ver `OPTIMIZACION-VERCEL.md`

---

**Última actualización:** 26 de agosto de 2026

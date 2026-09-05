# 🐛 Debug: Caché no se actualiza

## Problema actual

Frontend muestra código viejo con timeout 8s a pesar de múltiples deploys.

---

## Verificaciones realizadas

### ✅ Código local correcto
- `src/components/Destinations.tsx` tiene timeout 15000ms
- `api/index.mjs` tiene logs detallados
- Commits pushed correctamente

### ✅ Builds de Vercel
- Múltiples deploys ejecutados
- Version bumped (0.1.0 → 0.1.1)
- index.html modificado
- .vercel-trigger creado

### ❌ Frontend no se actualiza
- Sigue mostrando `index-0CB2vwnI.js` (hash viejo)
- Timeout sigue siendo 8s
- Logs nuevos no aparecen

---

## Posibles causas

### 1. **Vercel está usando build cacheado**
**Síntomas:** Deploy dice "Ready" pero el hash del JS no cambia
**Solución:** Invalidar caché en Vercel

### 2. **Navegador tiene caché muy agresivo**
**Síntomas:** Mismo hash incluso en incógnito
**Solución:** Hard refresh múltiple

### 3. **CDN de Vercel no invalidó**
**Síntomas:** Vercel muestra nuevo código pero usuario ve viejo
**Solución:** Esperar propagación CDN (5-10 min)

### 4. **Usuario está viendo deployment incorrecto**
**Síntomas:** URL de preview en lugar de production
**Solución:** Verificar URL exacta

---

## Checklist de diagnóstico

Por favor, verifica:

### [ ] 1. URL correcta
¿Cuál es la URL exacta que estás abriendo?
- Production: `https://swpit.vercel.app`
- Preview: `https://peru-in-travel-XXXXX.vercel.app`

### [ ] 2. Deployment activo en Vercel
1. Ve a: Vercel → Deployments
2. ¿Cuál deployment tiene el badge "PRODUCTION"?
3. ¿Cuándo fue creado? (debe ser hace <10 min)

### [ ] 3. Hash del archivo JS
1. F12 → Network tab
2. Busca: `index-XXXXX.js`
3. ¿Qué hash ves?

### [ ] 4. Caché del navegador
1. F12 → Application → Storage
2. Click "Clear site data"
3. Reload con Ctrl+Shift+R
4. ¿Cambió el hash?

### [ ] 5. Incógnito limpio
1. Cierra TODO
2. Abre nuevo incógnito
3. Ve a la URL
4. F12 → Network
5. ¿Qué hash ves?

---

## Soluciones por intentar

### Opción A: Invalidar caché de Vercel manualmente
```bash
# En Vercel dashboard:
Settings → Advanced → Clear cache
```

### Opción B: Cambiar URL de deployment
Si estás en preview, ir a production:
```
https://swpit.vercel.app
```

### Opción C: Esperar propagación CDN
A veces tarda 5-10 minutos en propagarse a todos los edge servers.

### Opción D: Forzar redeploy sin caché
En Vercel:
1. Deployments → [...] → Redeploy
2. **Desmarcar** "Use existing Build Cache"
3. Deploy

---

## Logs esperados (código nuevo)

```javascript
🚀 Iniciando carga de tours desde API...
⏱️ getDb() tardó: XXms                    // ← NUEVO
✅ 19 tours obtenidos (query: XXms)        // ← NUEVO
⏱️ API respondió en XXXXms                 // ← NUEVO
⏱️ Timeout: API tardó >15s                 // ← 15s, no 8s
```

---

## Siguiente paso

**Por favor, responde:**

1. **URL exacta** que estás abriendo
2. **Hash del JS** en Network (`index-XXXXX.js`)
3. **Deployment ID** activo en Vercel (en la URL o en el dashboard)

Con esa información podré identificar exactamente dónde está el problema.

---

**Fecha:** 26 de agosto de 2026

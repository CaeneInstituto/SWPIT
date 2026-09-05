# ⚠️ OBSOLETO - No usar

Esta carpeta `server/` contiene un backend antiguo que **NO se usa en producción**.

## Backend actual

**Vercel usa:** `/api/index.mjs`

Según `vercel.json`:
```json
{
  "src": "api/index.mjs",
  "use": "@vercel/node"
}
```

## ¿Por qué existe esta carpeta?

Probablemente fue un intento anterior de backend o desarrollo local que quedó en el proyecto.

## ¿Qué hacer?

1. **NO modificar** `server/index.mjs`
2. **Modificar solo** `api/index.mjs` para cambios en producción
3. **Considerar eliminar** esta carpeta en una futura limpieza del proyecto

## Archivos importantes

- ✅ **`/api/index.mjs`** → Backend de producción en Vercel
- ❌ **`/server/index.mjs`** → NO se usa
- ✅ **`/vercel.json`** → Configuración de deployment

---

**Última actualización:** 26 de agosto de 2026

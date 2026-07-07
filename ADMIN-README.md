# 🔐 Panel de Administración - Peru In Travel

## Acceso al Panel

**URL:** `https://tu-dominio.com/admin/login`  
**Contraseña por defecto:** `peruintravel2025`

⚠️ **IMPORTANTE:** Cambia la contraseña en el archivo `src/context/AuthContext.tsx` antes de subir a producción.

---

## 🎯 Funcionalidades

### 1. **Dashboard Principal**
- Vista general con estadísticas:
  - Total de paquetes
  - Paquetes activos
  - Paquetes deshabilitados
- Buscador de paquetes por nombre o ubicación

### 2. **Gestión de Paquetes**

#### ✅ **Habilitar / Deshabilitar Paquetes**
- Los paquetes deshabilitados NO aparecen en la web pública
- Útil para temporadas específicas o paquetes en mantenimiento
- Se puede reactivar en cualquier momento

#### ➕ **Agregar Nuevo Paquete**
Campos básicos:
- Nombre del paquete
- Ubicación
- Región (Lima, Ica, Ayacucho, Junín/Pasco, Cusco)
- Precio (texto y valor numérico)
- Duración
- Etiqueta (Más popular, Aventura, Cultural, etc.)
- URL de imagen

#### ✏️ **Editar Paquete**
- Modificar información básica del paquete
- Para editar itinerarios detallados, puntos de embarque, incluye/no incluye, etc., editar directamente `src/data/tours.ts`

#### 🗑️ **Eliminar Paquete**
- Elimina permanentemente el paquete
- Requiere confirmación

---

## 💾 Almacenamiento

Los cambios se guardan en **localStorage** del navegador:
- ✅ Persistencia entre sesiones
- ✅ No requiere base de datos
- ⚠️ Los cambios son locales al navegador usado
- ⚠️ Si limpias el cache/localStorage, los cambios se pierden

### Para Producción (Recomendado)
Para persistencia real en producción, considera:
1. **Backend con base de datos** (MongoDB, PostgreSQL, etc.)
2. **CMS Headless** (Strapi, Contentful, Sanity)
3. **Firebase/Supabase** para backend sin servidor

---

## 🔒 Seguridad

### Cambiar Contraseña
Edita `src/context/AuthContext.tsx`:
```typescript
const ADMIN_PASSWORD = 'TU_NUEVA_CONTRASEÑA_SEGURA'
```

### Recomendaciones
- ✅ Usa contraseña fuerte (mín. 12 caracteres)
- ✅ No compartas la contraseña
- ✅ En producción, considera OAuth o JWT
- ⚠️ Esta implementación es básica, ideal para uso interno

---

## 🚀 Flujo de Trabajo Recomendado

1. **Desarrollo local:** 
   - Prueba cambios en `localhost:5173/admin/login`
   
2. **Agregar/Editar paquetes básicos:**
   - Usa el panel de administración
   
3. **Edición avanzada (itinerarios, detalles):**
   - Edita directamente `src/data/tours.ts`
   - Commit y push a GitHub
   - Vercel redeploya automáticamente

4. **Deshabilitar temporalmente:**
   - Usa el toggle en el panel (sin eliminar el paquete)

---

## 📝 Estructura de Datos

Cada paquete tiene esta estructura mínima:
```typescript
{
  id: 'tour-123456',           // Generado automáticamente
  name: 'Nombre del Tour',
  location: 'Ciudad, Región',
  region: 'Lima',
  price: 'S/ 180',
  priceValue: 180,
  days: 'Full Day',
  tag: 'Aventura',
  image: '/ruta/imagen.jpg',
  disabled: false              // true = no visible en web
}
```

---

## 🐛 Solución de Problemas

### Los cambios no se reflejan en la web
1. Verifica que el paquete NO esté deshabilitado
2. Refresca la página (Ctrl+F5)
3. Verifica en DevTools > Application > Local Storage

### Perdí mis cambios
Si limpiaste el localStorage:
1. Los datos originales están en `src/data/tours.ts`
2. Puedes volver a agregarlos manualmente desde el panel

### No puedo acceder al admin
1. Verifica que la URL sea `/admin/login` (no `/admin`)
2. Verifica la contraseña en `src/context/AuthContext.tsx`
3. Intenta en modo incógnito (para descartar cache)

---

## 📞 Soporte

Para más ayuda o personalizaciones, contacta al desarrollador del proyecto.

**Versión:** 1.0.0  
**Última actualización:** Julio 2026

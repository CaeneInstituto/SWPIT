# 📤 Configuración de Cloudinary para Carga de Archivos

## 🎯 ¿Qué es Cloudinary?

Cloudinary es un servicio **GRATUITO** (hasta 25GB) que permite subir y alojar imágenes y PDFs en la nube sin necesidad de tocar el código de tu proyecto.

---

## 🆓 Crear Cuenta Gratuita

1. **Ve a:** https://cloudinary.com/users/register_free
2. **Completa el formulario:**
   - Nombre
   - Email
   - Contraseña
3. **Confirma tu email**
4. **Listo!** Ya tienes 25GB gratis

---

## ⚙️ Configurar Credenciales

### Paso 1: Obtener tus credenciales

1. Inicia sesión en Cloudinary
2. Ve al **Dashboard** (página principal)
3. Copia estos 3 datos:
   - **Cloud Name** (ej: `dxxxxx123`)
   - **API Key**
   - **API Secret**

### Paso 2: Crear Upload Preset

1. En el menú izquierdo, ve a: **Settings** > **Upload**
2. Scroll hacia abajo hasta **Upload presets**
3. Click en **Add upload preset**
4. Configura:
   - **Preset name:** `peru-in-travel`
   - **Signing mode:** `Unsigned` ⭐ (IMPORTANTE)
   - **Folder:** `peru-in-travel` (opcional, para organizar)
5. **Save**

### Paso 3: Configurar en el código

Abre el archivo: `src/pages/AdminDashboard.tsx`

Busca la línea **1223** (aprox.) donde dice:

```typescript
const uploadToCloudinary = async (file: File, type: 'pdf' | 'image') => {
  const cloudName = 'DEMO' // Cambiar por el cloud name real
  const uploadPreset = 'ml_default' // Cambiar por el upload preset real
```

**Reemplaza con tus datos:**

```typescript
const uploadToCloudinary = async (file: File, type: 'pdf' | 'image') => {
  const cloudName = 'TU_CLOUD_NAME_AQUI' // Ej: 'dxxxxx123'
  const uploadPreset = 'peru-in-travel' // El nombre que creaste
```

### Paso 4: Guardar y probar

1. Guarda el archivo
2. El servidor de desarrollo recargará automáticamente
3. Ve al admin y prueba subir una imagen o PDF
4. ¡Funcionará! 🎉

---

## 🖼️ Cómo Usar en el Admin

### Subir PDF:

1. Ve al tab **"📁 PDF e Imágenes"**
2. En la sección del PDF, click en **"Seleccionar PDF"**
3. Elige tu archivo PDF
4. Espera unos segundos mientras sube
5. ✅ Verás un mensaje de confirmación
6. El PDF queda guardado automáticamente

### Subir Imágenes:

1. En la sección de galería, click en **"Seleccionar Imágenes"**
2. Puedes seleccionar **múltiples imágenes** a la vez
3. Espera mientras se suben todas
4. ✅ Verás cada imagen agregándose a la galería
5. Las imágenes quedan guardadas automáticamente

---

## 🔧 Alternativas (Sin Cloudinary)

### Opción 1: Carga Local (Base64) - Ya está activada

- **Límite:** 2MB por archivo
- **Ventajas:** No necesita configuración, funciona inmediatamente
- **Desventajas:** Archivos grandes pueden llenar el localStorage
- **Recomendado para:** Pruebas y desarrollo

**Cómo usar:**
1. Click en "Seleccionar PDF" o "Seleccionar Imágenes"
2. Los archivos se convierten a Base64 automáticamente
3. Se guardan en el navegador (localStorage)

### Opción 2: URL Externa

- **Límite:** Sin límite
- **Ventajas:** Muy simple, compatible con cualquier servicio
- **Desventajas:** Necesitas subir manualmente a otro sitio

**Servicios recomendados:**
- **Google Drive:** Sube el archivo → Obtén link público → Pega en el campo de URL
- **Dropbox:** Igual que Google Drive
- **ImgBB** (imágenes): https://imgbb.com - Sube imagen → Copia "Direct link"
- **Imgur** (imágenes): https://imgur.com - Sube imagen → Copia link

**Cómo usar:**
1. Sube tu archivo a cualquiera de estos servicios
2. Copia el link público/directo
3. Pégalo en el campo "o ingresa URL manualmente"
4. Listo!

---

## 🎓 Comparación de Opciones

| Característica | Cloudinary | Base64 Local | URL Externa |
|----------------|------------|--------------|-------------|
| **Configuración** | Media (una vez) | Ninguna | Ninguna |
| **Límite de tamaño** | 10MB/archivo | 2MB/archivo | Sin límite |
| **Storage gratuito** | 25GB | Limitado por navegador (~10MB) | Depende del servicio |
| **Velocidad de carga** | ⭐⭐⭐⭐⭐ Rápida | ⭐⭐⭐ Media | ⭐⭐⭐⭐ Buena |
| **Persistencia** | ✅ Permanente | ⚠️ Solo en ese navegador | ✅ Permanente |
| **Recomendado para** | Producción | Desarrollo/pruebas | Cualquier uso |

---

## 🐛 Solución de Problemas

### "Error al subir a Cloudinary"
- ✅ Verifica que el **Cloud Name** esté correcto
- ✅ Verifica que el **Upload Preset** exista y sea **Unsigned**
- ✅ Verifica tu conexión a internet

### "El archivo es muy grande"
- ✅ Usa Cloudinary en lugar de Base64 local
- ✅ O comprime la imagen antes de subir (usa https://tinypng.com)

### "No veo la imagen en la web"
- ✅ Verifica que el link sea público
- ✅ Abre el link en una pestaña nueva para verificar que funcione
- ✅ Refresca la página de la web pública (Ctrl+F5)

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas configurando Cloudinary:

1. Verifica que seguiste todos los pasos
2. Revisa que el Upload Preset sea **Unsigned**
3. Prueba primero con la opción de Base64 local
4. Como última opción, usa URLs externas (Google Drive, ImgBB)

---

## 💡 Tips Pro

- **Organiza tus carpetas** en Cloudinary por paquete (usa el campo "folder")
- **Optimiza imágenes** antes de subir para páginas más rápidas
- **Usa formatos modernos** como WebP para mejor rendimiento
- **No borres archivos** en Cloudinary si sigues usándolos en la web

---

**Versión:** 1.0.0  
**Última actualización:** Julio 2026

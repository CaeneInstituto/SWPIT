# 🚀 Inicio Rápido - Sistema de Compras

## 📦 ¿Qué tienes ahora?

Tu web de Peru In Travel ahora **guarda automáticamente todas las compras en Excel** 📊

Cada vez que alguien compra, se guarda:
- ✅ Nombre, email, teléfono
- ✅ Tours comprados
- ✅ Precio y método de pago
- ✅ Fecha y estado

---

## 🏃 Prueba en 3 Pasos

### 1️⃣ Inicia el Servidor
```bash
npm run server
```
✅ Verás: `✅ Listo en http://localhost:3001`

### 2️⃣ Prueba el Sistema
```bash
npm run test-compra
```
✅ Verás: `✅ ¡Compra guardada exitosamente!`

### 3️⃣ Abre el Excel
```
📂 server/compras.xlsx
```
✅ Verás la compra guardada con todos los datos

---

## 💻 Desarrollo Completo

### Terminal 1: Servidor Backend
```bash
npm run server
```

### Terminal 2: Frontend React
```bash
npm run dev
```

### Probar manualmente:
1. Abre `http://localhost:5173`
2. Agrega un tour al carrito
3. Completa la compra
4. Llena tus datos (nombre, email, teléfono)
5. Confirma
6. ✅ Abre `server/compras.xlsx` - ¡Está guardado!

---

## 📊 Ver las Compras

Abre el archivo con:
- **Excel** (Windows/Mac)
- **Google Sheets** (sube el archivo)
- **LibreOffice** (gratis)

### Qué puedes hacer:
- 🔍 Buscar clientes
- 📅 Filtrar por fecha
- 💰 Sumar ventas totales
- 📈 Crear gráficos
- 📤 Exportar a PDF

---

## 🌐 Subir a Vercel

### Fix del Error 404 ✅
El error 404 que viste está solucionado con el archivo `vercel.json`

### Subir cambios:
```bash
git add .
git commit -m "Sistema de compras + fix 404"
git push
```

Vercel desplegará automáticamente con las correcciones.

---

## ⚠️ Importante para Producción

El Excel solo funciona en **local** (tu computadora).

Para producción en Vercel necesitas:
- Google Sheets API (recomendado y fácil)
- Base de datos (Supabase/MongoDB)

📖 Ver `server/README-COMPRAS.md` para instrucciones detalladas.

---

## 📚 Documentación Completa

- 📄 `COMPRAS-SISTEMA.md` - Guía completa del sistema
- 📄 `RESUMEN-CAMBIOS.md` - Qué se modificó
- 📄 `server/README-COMPRAS.md` - Detalles técnicos

---

## 🎉 ¡Ya está listo!

Cada compra se guardará automáticamente.
Solo inicia el servidor y el frontend, y todo funciona solo.

**Peru In Travel** 🇵🇪

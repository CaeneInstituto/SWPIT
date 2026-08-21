# Sistema de Registro de Compras - Peru In Travel

## 📋 Descripción

Este sistema guarda automáticamente todas las compras realizadas en la web en un archivo Excel (`compras.xlsx`) ubicado en la carpeta `server/`.

## 📊 Estructura del Excel

El archivo contiene las siguientes columnas:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| **ID Compra** | Identificador único de la compra | PIT-1723456789012 |
| **Fecha y Hora** | Fecha y hora de la compra en hora de Perú | 14/08/2026 15:30:45 |
| **Nombre Cliente** | Nombre completo del cliente | Juan Pérez García |
| **Email** | Correo electrónico | juan@example.com |
| **Teléfono** | Número de teléfono/WhatsApp | 929648380 |
| **Método de Pago** | Yape, Plin, Transferencia o Tarjeta | Yape |
| **Tours** | Tours comprados con opciones | Huancaya Full Day (Adulto); Paracas 2D1N (Niño) |
| **Cantidad Personas** | Total de personas en todos los tours | 3 |
| **Fecha de Viaje** | Fechas seleccionadas para los tours | 2026-09-15; 2026-09-20 |
| **Precio Total (S/)** | Precio total de la compra | 850.00 |
| **Monto Reserva (S/)** | 50% del total (reserva inicial) | 425.00 |
| **Estado Pago** | Pendiente confirmación o Pagado | Pendiente confirmación |
| **Nota/Voucher** | Nota adicional o número de operación | N° operación 123456 |
| **ID Culqi** | ID de transacción si se pagó con tarjeta | chr_live_abc123... |

## 🔄 Funcionamiento

### 1. Compras con Yape/Plin/Transferencia

Cuando un cliente completa el proceso de compra:
1. Llena sus datos (nombre, email, teléfono, nota)
2. Confirma y envía mensaje por WhatsApp
3. **Automáticamente** se guarda un registro en `compras.xlsx`
4. Estado inicial: "Pendiente confirmación"

### 2. Compras con Tarjeta (Culqi)

Cuando se paga con tarjeta:
1. El pago se procesa en tiempo real
2. Si es exitoso, se guarda automáticamente en `compras.xlsx`
3. Estado: "Pagado"
4. Se incluye el ID de Culqi para seguimiento

## 📁 Ubicación del Archivo

```
peru-in-travel/
└── server/
    ├── index.mjs
    ├── compras.xlsx    ← Aquí se guardan las compras
    └── README-COMPRAS.md
```

## 🚀 Cómo usar

### Iniciar el servidor

```bash
npm run server
```

El servidor se iniciará en `http://localhost:3001` y creará automáticamente el archivo `compras.xlsx` si no existe.

### Ver las compras

Simplemente abre el archivo `server/compras.xlsx` con:
- Microsoft Excel
- Google Sheets (sube el archivo)
- LibreOffice Calc
- Cualquier visor de archivos Excel

### Análisis de datos

Puedes usar Excel para:
- **Filtrar** por método de pago
- **Ordenar** por fecha o precio
- **Sumar** totales de ventas
- **Crear tablas dinámicas**
- **Exportar** a otros formatos (CSV, PDF)

## ⚙️ Configuración en Producción

### Opción 1: Base de datos (Recomendado para producción)

Para un sistema más robusto, considera migrar a una base de datos:
- PostgreSQL (recomendado)
- MongoDB
- MySQL

### Opción 2: Seguir usando Excel en Vercel

Si despliegas en Vercel, necesitarás:

1. **Usar almacenamiento persistente** (el sistema de archivos de Vercel es efímero)
2. **Opciones recomendadas:**
   - Google Sheets API (guardar directamente en Google Sheets)
   - Supabase (base de datos gratuita)
   - MongoDB Atlas (base de datos gratuita)

### Migración a Google Sheets (Ejemplo)

```javascript
// Instalar: npm install googleapis
import { google } from 'googleapis'

async function saveToGoogleSheets(purchaseData) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  
  const sheets = google.sheets({ version: 'v4', auth })
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: 'Compras!A:N',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[
        purchaseData.id,
        purchaseData.date,
        purchaseData.name,
        // ... resto de datos
      ]]
    }
  })
}
```

## 🔒 Seguridad

- El archivo `compras.xlsx` **NO** está expuesto públicamente
- Solo es accesible desde el servidor backend
- Contiene información sensible de clientes, **NO lo subas a GitHub**
- Agregar `compras.xlsx` a `.gitignore`

## 📧 Soporte

Para más información sobre el sistema de compras, contacta al equipo de desarrollo.

---

**Peru In Travel** - Sistema de gestión de compras v1.0

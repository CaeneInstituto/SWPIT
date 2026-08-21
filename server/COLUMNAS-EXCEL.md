# 📊 Estructura de Columnas - compras.xlsx

## Vista General

El archivo Excel tiene **14 columnas** que capturan toda la información de cada compra.

---

## 📋 Columnas Detalladas

### 1. ID Compra
- **Tipo:** Texto único
- **Formato:** `PIT-[timestamp]`
- **Ejemplo:** `PIT-1723456789012`
- **Descripción:** Identificador único de cada compra
- **Ancho:** 12 caracteres

---

### 2. Fecha y Hora
- **Tipo:** Fecha/Hora
- **Formato:** DD/MM/YYYY HH:mm:ss
- **Ejemplo:** `14/08/2026 15:30:45`
- **Descripción:** Fecha y hora exacta de la compra (Hora de Perú)
- **Ancho:** 20 caracteres

---

### 3. Nombre Cliente
- **Tipo:** Texto
- **Ejemplo:** `Juan Pérez García`
- **Descripción:** Nombre completo del cliente
- **Origen:** Campo "Tu nombre completo" en el checkout
- **Ancho:** 25 caracteres

---

### 4. Email
- **Tipo:** Email
- **Ejemplo:** `juan@example.com`
- **Descripción:** Correo electrónico del cliente
- **Origen:** Campo "Correo electrónico" en el checkout
- **Ancho:** 30 caracteres

---

### 5. Teléfono
- **Tipo:** Texto/Número
- **Ejemplo:** `929648380`
- **Descripción:** WhatsApp o teléfono de contacto
- **Origen:** Campo "Teléfono / WhatsApp" en el checkout
- **Ancho:** 15 caracteres

---

### 6. Método de Pago
- **Tipo:** Texto (opciones fijas)
- **Valores posibles:**
  - `Yape`
  - `Plin`
  - `Transferencia bancaria`
  - `Tarjeta de crédito/débito`
- **Ejemplo:** `Yape`
- **Descripción:** Método seleccionado para el pago
- **Ancho:** 20 caracteres

---

### 7. Tours
- **Tipo:** Texto largo (separado por `;`)
- **Formato:** `[Nombre Tour] ([Opción]); [Nombre Tour 2] ([Opción 2])`
- **Ejemplo:** `Huancaya Full Day (Adulto); Paracas 2D1N (Niño)`
- **Descripción:** Lista de todos los tours comprados con sus opciones de precio
- **Ancho:** 40 caracteres

---

### 8. Cantidad Personas
- **Tipo:** Número entero
- **Ejemplo:** `3`
- **Descripción:** Total de personas (suma de todas las cantidades)
- **Cálculo:** Suma de `quantity` de todos los items del carrito
- **Ancho:** 18 caracteres

---

### 9. Fecha de Viaje
- **Tipo:** Texto (fechas separadas por `;`)
- **Formato:** YYYY-MM-DD
- **Ejemplo:** `2026-09-15; 2026-09-20`
- **Descripción:** Fechas seleccionadas para cada tour
- **Ancho:** 18 caracteres

---

### 10. Precio Total (S/)
- **Tipo:** Número decimal (2 decimales)
- **Formato:** `####.##`
- **Ejemplo:** `850.00`
- **Descripción:** Precio total de toda la compra en Soles
- **Cálculo:** Suma de (precio × cantidad) de todos los tours
- **Ancho:** 15 caracteres

---

### 11. Monto Reserva (S/)
- **Tipo:** Número decimal (2 decimales)
- **Formato:** `####.##`
- **Ejemplo:** `425.00`
- **Descripción:** Monto que debe pagar como adelanto
- **Cálculo:**
  - Yape/Plin/Transferencia: 50% del total
  - Tarjeta: 100% del total (se cobra completo)
- **Ancho:** 18 caracteres

---

### 12. Estado Pago
- **Tipo:** Texto (opciones fijas)
- **Valores posibles:**
  - `Pendiente confirmación` - Para Yape/Plin/Transferencia
  - `Pagado` - Para tarjeta (Culqi) cuando el pago fue exitoso
  - `Prueba - Pendiente` - Para compras de prueba
- **Ejemplo:** `Pendiente confirmación`
- **Descripción:** Estado actual del pago
- **Ancho:** 12 caracteres

---

### 13. Nota/Voucher
- **Tipo:** Texto libre
- **Ejemplo:** `N° operación 123456`
- **Descripción:** Nota adicional o número de comprobante
- **Origen:** Campo opcional "Nota del voucher" en el checkout
- **Ancho:** 30 caracteres

---

### 14. ID Culqi
- **Tipo:** Texto
- **Formato:** `chr_test_XXXXXXXX` o `chr_live_XXXXXXXX`
- **Ejemplo:** `chr_live_abc123xyz456`
- **Descripción:** ID de transacción de Culqi (solo para pagos con tarjeta)
- **Vacío si:** Pago con Yape/Plin/Transferencia
- **Ancho:** 25 caracteres

---

## 📊 Ejemplo de Fila Completa

```
PIT-1723456789012 | 14/08/2026 15:30:45 | Juan Pérez García | juan@example.com | 929648380 | Yape | Huancaya Full Day (Adulto); Paracas 2D1N (Niño) | 3 | 2026-09-15; 2026-09-20 | 850.00 | 425.00 | Pendiente confirmación | N° operación 123456 | 
```

---

## 🎯 Uso de las Columnas

### Para Análisis de Ventas
- **Precio Total:** Suma total de ventas
- **Método de Pago:** Ver cuál es más usado
- **Fecha y Hora:** Análisis temporal (días/horas con más ventas)

### Para Seguimiento de Clientes
- **Nombre + Email + Teléfono:** Contactar clientes
- **Estado Pago:** Filtrar pendientes de confirmación
- **Tours:** Ver preferencias de clientes

### Para Gestión Operativa
- **Fecha de Viaje:** Planificar tours
- **Cantidad Personas:** Coordinar transporte/guías
- **Tours:** Organizar itinerarios

### Para Contabilidad
- **Precio Total:** Ingresos totales
- **Monto Reserva:** Adelantos recibidos
- **ID Culqi:** Reconciliación con pasarela de pago

---

## 🔧 Personalización

Si necesitas agregar más columnas, edita la función `initializeExcel()` en `server/index.mjs`:

```javascript
const headers = [
  'ID Compra',
  'Fecha y Hora',
  // ... columnas existentes
  'Nueva Columna'  // ← Agrega aquí
]
```

Y actualiza `saveToExcel()` para incluir el nuevo dato:

```javascript
const newRow = [
  purchaseId,
  new Date().toLocaleString('es-PE'),
  // ... datos existentes
  purchaseData.nuevoCampo || ''  // ← Agrega aquí
]
```

---

## 💡 Tips

### Formateo en Excel
1. **Montos:** Selecciona columnas 10 y 11 → Formato → Moneda (S/)
2. **Fechas:** Selecciona columna 2 → Formato → Fecha/Hora personalizada
3. **Centrar:** Columna 8 (Cantidad Personas) → Centrar texto

### Filtros y Ordenamiento
1. Selecciona toda la tabla
2. Datos → Filtros
3. Ahora puedes filtrar por cualquier columna

### Tabla Dinámica
1. Selecciona los datos
2. Insertar → Tabla dinámica
3. Analiza ventas por tour, por fecha, por método, etc.

---

**Peru In Travel** | Documentación de Estructura Excel v1.0

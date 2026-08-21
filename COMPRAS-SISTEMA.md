# 💾 Sistema de Compras — Peru In Travel

## ✅ Estado Actual

El sistema de pagos está **funcionando** y guardando las compras en:
```
server/compras.json
```

Cada vez que alguien paga con tarjeta a través de Culqi, se guarda automáticamente toda la información.

---

## 📋 Lo que se guarda de cada compra

Cada pago guarda:
- **`chargeId`**: ID del cargo en Culqi (ej: `ch_test_abc123`)
- **`amount`**: Monto cobrado en soles (ej: `135.00`)
- **`currency`**: Siempre `PEN`
- **`status`**: Estado del pago (`authorized`, `captured`, etc.)
- **`email`**: Email del cliente
- **`buyerName`**: Nombre del cliente (si se proporciona)
- **`description`**: Descripción del tour/paquete
- **`items`**: Array con los tours comprados
- **`metadata`**: Información adicional
- **`createdAt`**: Fecha y hora ISO 8601
- **`culqiData`**: Detalles de la tarjeta (marca, últimos 4 dígitos, país)

---

## 🔍 Ver las compras

### Opción 1: Abrir el archivo directamente
```
server/compras.json
```

### Opción 2: API endpoint (para integrar en tu admin)
```
GET http://localhost:3001/api/compras
```

Retorna:
```json
{
  "ok": true,
  "total": 5,
  "compras": [...]
}
```

---

## 🍃 Migrar a MongoDB (cuando funcione)

**Problema actual:** Tu red no resuelve DNS de MongoDB Atlas.

**Soluciones:**

### A) Esperar y reintentar más tarde
A veces es temporal — problema de tu ISP.

### B) Usar VPN
Si tienes VPN, actívala y reinicia el servidor.

### C) Cambiar de red
Intenta con otra red WiFi o datos móviles.

### D) Usar desde Compass para importar
1. Abre las compras: `server/compras.json`
2. En Compass: **Add Data** → **Import JSON**
3. Selecciona el archivo `compras.json`
4. Collection: `compras`
5. Import

---

## 🔄 Código MongoDB (para cuando funcione)

Ya está en el código, solo comentado. Para activarlo:

1. Verifica que DNS funcione:
```bash
nslookup cluster0.z8uepob.mongodb.net
```

2. Si responde, reinstala mongodb:
```bash
npm install mongodb
```

3. Descomentar el código MongoDB en `server/index.mjs` (está listo, solo deshabilitado)

---

## 📊 Ejemplo de compra guardada

```json
{
  "chargeId": "ch_test_abc123xyz",
  "amount": 135,
  "currency": "PEN",
  "status": "authorized",
  "email": "juan@example.com",
  "buyerName": "Juan Pérez",
  "description": "Reserva: Huancaya Full Day",
  "items": [
    {
      "tourName": "Huancaya Full Day",
      "quantity": 2,
      "price": 135
    }
  ],
  "metadata": {
    "paquetes": "Huancaya Full Day",
    "tipo": "Pago completo"
  },
  "createdAt": "2026-08-20T19:30:00.000Z",
  "culqiData": {
    "outcome": {
      "type": "authorized"
    },
    "card": {
      "brand": "Visa",
      "last4": "1111",
      "country": "PE"
    }
  }
}
```

---

## 🚀 Próximos pasos

1. **Panel Admin**: Crear una página en `/admin/dashboard` que muestre las compras
2. **Exportar a Excel**: Botón para descargar las compras como CSV/Excel
3. **Estadísticas**: Dashboard con totales por día/mes
4. **MongoDB**: Cuando DNS funcione, migrar al cloud

---

## 💡 Tips

- El archivo `compras.json` crece con cada venta
- Respáldalo regularmente (copia a otro lugar)
- No lo borres — es tu único registro de ventas
- Cuando migres a MongoDB, importa todo este archivo

---

**Sistema funcionando ✅**
**Listo para recibir pagos reales con tarjeta 💳**

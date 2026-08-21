# 📥 Guía de Descarga de Compras en Excel

## ¿Qué es?

La pestaña "Compras" del admin panel te permite:
- 👁️ Ver todas las compras que hacen los clientes
- 📊 Visualizar estadísticas de ventas
- 💾 **Descargar un archivo Excel profesional** con todos los datos

## 🚀 Pasos para Descargar Compras

### 1. Acceder al Admin Panel
```
http://localhost:5173/admin
```

### 2. Hacer Clic en la Pestaña "Compras"
- En la cabecera verás 3 pestañas
- Selecciona la tercera: **🛒 Compras**

### 3. Ver Estadísticas
Una vez en la pestaña verás 3 cuadros informativos:

| Estadística | Descripción |
|---|---|
| **Total de compras** | Cantidad de transacciones realizadas |
| **Ingresos totales** | Suma de todos los montos en soles |
| **Compra promedio** | Monto promedio por transacción |

### 4. Ver Tabla de Compras
Debajo verás una tabla con todas las compras:

| Columna | Contenido |
|---|---|
| **Fecha** | Cuándo se realizó la compra |
| **Cliente** | Nombre de quien compró |
| **Email** | Correo del cliente |
| **Monto** | Cuánto pagó (S/) |
| **Paquete** | Qué tour compró |
| **Tarjeta** | Tipo y últimos dígitos |
| **Estado** | Si fue exitosa o falló |

### 5. Descargar en Excel
- Haz clic en el botón verde: **📥 Descargar Excel**
- Se descargará automáticamente un archivo

### 6. Archivo Descargado
El archivo se llamará:
```
peru-in-travel-compras-2026-08-21-15-30-45.xlsx
```

Donde:
- `2026-08-21` = Fecha (año-mes-día)
- `15-30-45` = Hora (horas-minutos-segundos)

## 📊 Contenido del Excel

El archivo incluye **12 columnas** con información detallada:

### Columnas en el Excel

1. **N°** - Número de fila (1, 2, 3, etc.)
2. **ID de Cargo** - Identificador único de Culqi
3. **Fecha** - Fecha y hora completa
4. **Cliente** - Nombre del comprador
5. **Email** - Correo electrónico
6. **Monto (PEN)** - Cantidad pagada en soles
7. **Estado** - venta / fallo / desconocido
8. **Descripción** - Qué paquete compró
9. **Tarjeta** - Marca y últimos 4 dígitos (Ej: Visa ****4321)
10. **País** - País de la tarjeta (PE = Perú)
11. **Items** - Productos comprados (con cantidad)
12. **Metadata** - Información extra (teléfono, origen, etc.)

## 💡 Ejemplos de Uso

### Ejemplo 1: Auditoría de Ventas
1. Abre la pestaña Compras
2. Descarga el Excel
3. Ábrelo en Microsoft Excel o Google Sheets
4. Haz análisis, gráficos, filtros

### Ejemplo 2: Generar Factura
1. Ve la compra en la tabla
2. Anota el ID de Cargo
3. Usa ese ID para generar factura oficial

### Ejemplo 3: Contactar Cliente
1. Descarga el Excel
2. Busca al cliente por nombre
3. Copia su email
4. Envía confirmación o pregunta

### Ejemplo 4: Reportes Mensuales
1. Descarga Excel cada mes
2. Guarda en carpeta organizada
3. Haz resumen de ingresos
4. Presenta a tu equipo

## 🔧 Características Técnicas

✅ **Automático**: Se genera dinámicamente con datos actuales
✅ **Completo**: Todas las compras sin límite
✅ **Formatado**: Columnas con ancho automático
✅ **Compatible**: Abre en Excel, Google Sheets, LibreOffice
✅ **Seguro**: Los datos se descarga directamente desde MongoDB

## ❓ Preguntas Frecuentes

### ¿Puedo descargar varias veces?
Sí, cada vez que descargas obtienes los datos más actualizados.

### ¿Se incluyen todas las compras?
Sí, sin límite de cantidad. Se descarga el historial completo.

### ¿El Excel tiene fórmulas?
No, son datos puros. Puedes agregar tus propias fórmulas en Excel.

### ¿Puedo compartir el Excel?
Sí, es seguro. No contiene datos sensibles de tarjeta (solo últimos 4 dígitos).

### ¿Se actualiza automáticamente?
No, es una captura del momento. Descarga nuevamente para datos actuales.

### ¿Dónde se guardan los archivos?
En la carpeta de Descargas de tu navegador (Descargas / Downloads).

## 🎯 Flujo Completo

```
1. Admin Panel
   ↓
2. Click Pestaña "Compras"
   ↓
3. Ver estadísticas y tabla
   ↓
4. Click "Descargar Excel"
   ↓
5. Archivo se descarga automáticamente
   ↓
6. Abre en Excel/Sheets
   ↓
7. ¡Analiza y usa tus datos! 🎉
```

## 📝 Notas Importantes

- ⚠️ El archivo se descarga en tu carpeta de descargas del navegador
- 📅 La fecha del archivo indica cuándo se descargó
- 💾 Se recomienda guardar los Excel descargados como respaldo
- 🔒 MongoDB debe estar conectado para descargar (indicador verde en cabecera)

## 🚀 Próximas Características (Futuro)

- [ ] Filtrar por rango de fechas antes de descargar
- [ ] Exportar en PDF
- [ ] Enviar por email automáticamente
- [ ] Gráficos de ventas en el admin
- [ ] Facturación automática integrada

---

**¡Ahora tienes control total de tus compras!** 🎊

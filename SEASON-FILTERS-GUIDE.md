# 🗓️ Guía de Filtros de Temporada

## 📋 ¿Qué son los Filtros de Temporada?

Los **Filtros de Temporada** te permiten gestionar tu catálogo de paquetes turísticos de forma dinámica según la época del año. Con un solo clic puedes:

- ✅ **Activar paquetes específicos** para una temporada
- 💰 **Aplicar descuentos automáticos**
- 🎯 **Destacar ofertas estacionales**
- ⚡ **Cambiar rápidamente** entre configuraciones

## 🎨 Temporadas Disponibles

### 1. **☀️ Verano**
- **Ideal para**: Playas, lomas verdes, full days al aire libre
- **Descuento sugerido**: 10%
- **Paquetes recomendados**: Paracas, Lunahuaná, Lomas de Lachay

### 2. **❄️ Invierno**
- **Ideal para**: Nevados, termas, aventura en altura
- **Descuento sugerido**: 15%
- **Paquetes recomendados**: Nevado Raura, Churín, Cañón de Autisha

### 3. **🌸 Semana Santa**
- **Ideal para**: Turismo religioso, cultural
- **Descuento sugerido**: 5%
- **Paquetes recomendados**: Ayacucho Semana Santa

### 4. **🏛️ Fiestas Patrias**
- **Ideal para**: Destinos nacionales, turismo interno
- **Descuento sugerido**: 8%
- **Paquetes recomendados**: Tours por todo el Perú

## 📖 Cómo Usar

### Paso 1: Asignar Temporadas a los Paquetes

1. Ve al **Panel de Administración** (`/admin/dashboard`)
2. Click en **Editar** (✏️) en cualquier paquete
3. En el **Tab Básica**, ve a la sección "**🗓️ Temporadas Disponibles**"
4. Selecciona las temporadas en las que este paquete estará disponible
5. Guarda los cambios

**Ejemplo:**
- Paquete "Paracas + Huacachina" → Seleccionar: **Verano**, **Fiestas Patrias**
- Paquete "Nevado Raura" → Seleccionar: **Invierno**, **Semana Santa**

### Paso 2: Activar un Filtro de Temporada

1. En el Dashboard, ve a la sección "**Filtros de Temporada**"
2. Click en "**Gestionar**" para ver las tarjetas de temporada
3. Ajusta el **porcentaje de descuento** con el slider (0-50%)
4. Click en "**Aplicar temporada**"

### ¿Qué sucede al aplicar?

✅ **Se activan automáticamente** todos los paquetes marcados para esa temporada
💰 **Se aplica el descuento** al precio de cada paquete
🏷️ **Se guarda el precio original** para restaurar después
🎯 **Se muestra un indicador** de que la temporada está activa

### Paso 3: Desactivar una Temporada

1. En la sección de **Filtros de Temporada**, verás el indicador "TEMPORADA ACTIVA"
2. Click en "**Desactivar**"
3. Los precios vuelven a su valor original

## 💡 Casos de Uso

### Caso 1: Promoción de Verano
```
Objetivo: Promover paquetes de playa durante enero-marzo
Acción:
1. Asignar temporada "Verano" a: Paracas, Lunahuaná, Lomas de Lachay
2. Aplicar filtro "Verano" con 15% descuento
3. Resultado: Estos paquetes se activan y muestran precio rebajado
```

### Caso 2: Campaña Semana Santa
```
Objetivo: Destacar Ayacucho durante Semana Santa
Acción:
1. Asignar temporada "Semana Santa" a paquetes de Ayacucho
2. Aplicar filtro "Semana Santa" con 5% descuento
3. Resultado: Paquetes religiosos/culturales activos con oferta
```

### Caso 3: Temporada Alta (Fiestas Patrias)
```
Objetivo: Activar todos los destinos nacionales
Acción:
1. Asignar temporada "Fiestas Patrias" a múltiples paquetes
2. Aplicar filtro con 10% descuento
3. Resultado: Catálogo completo activo para turismo interno
```

## 📊 Ejemplo Práctico

**Antes de aplicar temporada:**
- Paquete: Paracas + Huacachina
- Precio: S/ 135
- Estado: Normal

**Después de aplicar "Verano" (15% descuento):**
- Paquete: Paracas + Huacachina
- Precio mostrado: S/ 115 ✨
- Precio original guardado: S/ 135
- Descuento aplicado: 15%

**Al desactivar temporada:**
- Precio vuelve a: S/ 135
- Descuento eliminado

## 🔧 Detalles Técnicos

### Almacenamiento
- La temporada activa se guarda en `localStorage` como `activeSeason`
- Los datos de tours con precios modificados se guardan en `localStorage.tours`
- Al desactivar, se restauran los precios originales

### Campos en Tour
```typescript
interface Tour {
  // ... otros campos
  seasons?: string[]              // Temporadas asignadas
  seasonalDiscount?: number       // % de descuento actual
  originalPrice?: string          // Precio original guardado
  originalPriceValue?: number     // Valor original guardado
}
```

### Persistencia
- Los cambios persisten entre sesiones
- Al recargar la página, la temporada activa se mantiene
- Los precios se restauran correctamente al desactivar

## ⚠️ Consideraciones Importantes

1. **Solo un filtro activo a la vez**: No puedes tener "Verano" e "Invierno" activos simultáneamente

2. **Los descuentos son acumulativos**: Si aplicas 15% y luego cambias a 20%, se usa el nuevo valor

3. **Precios originales protegidos**: El sistema guarda siempre el precio original para poder restaurarlo

4. **Paquetes sin temporada**: Los paquetes que no tienen asignada ninguna temporada no se ven afectados por los filtros

5. **Descuento personalizable**: Puedes ajustar el descuento antes de aplicar, no estás limitado al sugerido

## 🎯 Mejores Prácticas

1. **Planifica tus temporadas**: Asigna temporadas a todos tus paquetes según tu calendario comercial

2. **Usa descuentos competitivos**: 
   - Temporadas altas: 5-10%
   - Temporadas bajas: 15-25%
   - Ofertas especiales: 30-50%

3. **Comunica las ofertas**: Actualiza tu sitio web y redes sociales cuando actives un filtro

4. **Desactiva después de la temporada**: No olvides desactivar el filtro cuando termine el periodo

5. **Prueba antes de aplicar**: Verifica que los paquetes correctos tienen las temporadas asignadas

## 🚀 Flujo de Trabajo Recomendado

```
Inicio de Temporada:
1. Revisar paquetes → 2. Asignar temporadas → 3. Aplicar filtro → 4. Comunicar oferta

Fin de Temporada:
1. Desactivar filtro → 2. Verificar precios → 3. Preparar siguiente temporada
```

## 📞 Soporte

Si tienes dudas o necesitas ayuda:
- Revisa esta guía
- Prueba en modo de prueba antes de aplicar a producción
- Los cambios son reversibles, así que puedes experimentar

---

**¡Aprovecha al máximo tus filtros de temporada para maximizar ventas! 🎉**

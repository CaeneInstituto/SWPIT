/**
 * Utilidades para manejar formatos de hora 12h y 24h
 */

/**
 * Convierte cualquier formato de hora a 24h (HH:MM)
 * Acepta:
 * - "07:15 am" → "07:15"
 * - "01:30 pm" → "13:30"
 * - "12:00 am" → "00:00"
 * - "12:00 pm" → "12:00"
 * - "13:00" → "13:00" (ya está en 24h)
 * - "1:30" → "01:30" (sin am/pm asume formato 24h)
 */
export function normalizeToTime24(time: string): string {
  // Aceptar valores vacíos, null o placeholders sin generar warning
  if (!time || time.trim() === '' || time === '--:--') return '--:--'
  
  const cleaned = time.trim()
  
  // LABELS DESCRIPTIVOS: Mañana, Tarde, Noche, etc. - devolverlos tal cual
  const descriptiveLabels = ['Mañana', 'Mediodía', 'Tarde', 'Noche', 'Madrugada', 'Temprano']
  if (descriptiveLabels.includes(cleaned)) return cleaned
  
  const cleanedLower = cleaned.toLowerCase()
  
  // Si ya está en formato 24h puro (HH:MM o H:MM sin am/pm)
  if (/^\d{1,2}:\d{2}$/.test(cleanedLower) && !cleanedLower.includes('am') && !cleanedLower.includes('pm')) {
    const [hours, minutes] = cleanedLower.split(':')
    return `${hours.padStart(2, '0')}:${minutes}`
  }
  
  // Si tiene am/pm, convertir de 12h a 24h
  const match = cleanedLower.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i)
  if (!match) {
    // Si no hay match, intentar parsear como 24h
    const simpleMatch = cleanedLower.match(/(\d{1,2}):(\d{2})/)
    if (simpleMatch) {
      const [, hours, minutes] = simpleMatch
      return `${hours.padStart(2, '0')}:${minutes}`
    }
    // NO generar warning para valores válidos descriptivos
    return cleaned
  }
  
  let [, hours, minutes, period] = match
  let hour24 = parseInt(hours, 10)
  
  // Conversión de 12h a 24h
  if (period === 'pm' && hour24 !== 12) {
    hour24 += 12
  } else if (period === 'am' && hour24 === 12) {
    hour24 = 0
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}`
}

/**
 * Convierte hora en formato 24h a formato 12h con am/pm
 * - "07:15" → "07:15 am"
 * - "13:30" → "01:30 pm"
 * - "00:00" → "12:00 am"
 * - "12:00" → "12:00 pm"
 * 
 * MANEJA TAMBIÉN FORMATOS INCORRECTOS:
 * - "13:00 pm" → "01:00 pm" (corrige 24h mezclado con am/pm)
 * - "07:15 am" → "07:15 am" (ya correcto, lo deja igual)
 * - "00:30 am" → "12:30 am" (corrige medianoche)
 * - Formatos descriptivos como "Mañana", "Tarde" → se devuelven tal como están
 */
export function formatToTime12(time24: string): string {
  // Aceptar valores vacíos, null o placeholders sin generar warning
  if (!time24 || time24.trim() === '' || time24 === '--:--') return '--:--'
  
  const cleaned = time24.trim()
  
  // LABELS DESCRIPTIVOS: Mañana, Tarde, Noche, etc. - devolverlos tal cual
  const descriptiveLabels = ['Mañana', 'Mediodía', 'Tarde', 'Noche', 'Madrugada', 'Temprano']
  if (descriptiveLabels.includes(cleaned)) return cleaned
  
  // Si es un formato descriptivo genérico (sin dígitos), devolverlo tal como está
  if (!/\d/.test(cleaned)) {
    return cleaned
  }
  
  const lowerCleaned = cleaned.toLowerCase()
  
  // Si ya tiene am/pm, extraer la hora y verificar si es formato mixto incorrecto
  if (lowerCleaned.includes('am') || lowerCleaned.includes('pm')) {
    const match = lowerCleaned.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i)
    if (!match) return '--:--'
    
    const [, hoursStr, minutes, period] = match
    let hours = parseInt(hoursStr, 10)
    
    // Corregir casos especiales
    if (hours === 0 && period === 'am') {
      // 00:xx am → 12:xx am (medianoche)
      hours = 12
    } else if (hours > 12) {
      // Si la hora es > 12, significa que está en formato 24h mezclado incorrectamente
      hours = hours - 12
      return `${hours.toString().padStart(2, '0')}:${minutes} pm`
    }
    
    // Ya está en formato correcto, devolverlo limpio
    return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`
  }
  
  // Formato 24h puro, convertir a 12h
  const match = lowerCleaned.match(/(\d{1,2}):(\d{2})/)
  if (!match) {
    // NO generar warning para valores válidos descriptivos
    return cleaned
  }
  
  const [, hoursStr, minutes] = match
  let hours = parseInt(hoursStr, 10)
  
  const period = hours >= 12 ? 'pm' : 'am'
  
  // Convertir hora 24 a 12
  if (hours === 0) {
    hours = 12 // Medianoche
  } else if (hours > 12) {
    hours -= 12 // Tarde/noche
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`
}

/**
 * Valida si una cadena es un formato de hora válido
 */
export function isValidTime(time: string): boolean {
  if (!time || time.trim() === '') return false
  
  // Formato 24h
  if (/^\d{1,2}:\d{2}$/.test(time)) return true
  
  // Formato 12h con am/pm
  if (/^\d{1,2}:\d{2}\s*(am|pm)$/i.test(time)) return true
  
  return false
}

/**
 * Convierte un array de actividades normalizando sus horas
 */
export function normalizeActivities<T extends { time?: string }>(activities: T[]): T[] {
  return activities.map(act => ({
    ...act,
    time: normalizeToTime24(act.time || '')
  }))
}

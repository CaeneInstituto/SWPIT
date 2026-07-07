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
  if (!time || time.trim() === '') return '08:00'
  
  const cleaned = time.trim().toLowerCase()
  
  // Si ya está en formato 24h puro (HH:MM o H:MM sin am/pm)
  if (/^\d{1,2}:\d{2}$/.test(cleaned) && !cleaned.includes('am') && !cleaned.includes('pm')) {
    const [hours, minutes] = cleaned.split(':')
    return `${hours.padStart(2, '0')}:${minutes}`
  }
  
  // Si tiene am/pm, convertir de 12h a 24h
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i)
  if (!match) {
    // Si no hay match, intentar parsear como 24h
    const simpleMatch = cleaned.match(/(\d{1,2}):(\d{2})/)
    if (simpleMatch) {
      const [, hours, minutes] = simpleMatch
      return `${hours.padStart(2, '0')}:${minutes}`
    }
    console.warn('Invalid time format:', time)
    return '08:00'
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
 */
export function formatToTime12(time24: string): string {
  if (!time24 || time24.trim() === '') return '08:00 am'
  
  // Si ya tiene am/pm, devolverlo tal cual
  if (time24.toLowerCase().includes('am') || time24.toLowerCase().includes('pm')) {
    return time24
  }
  
  const match = time24.match(/(\d{1,2}):(\d{2})/)
  if (!match) {
    console.warn('Invalid 24h time format:', time24)
    return '08:00 am'
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
    time: normalizeToTime24(act.time || '08:00')
  }))
}

/**
 * Script de prueba para el sistema de compras
 * Simula una compra y la guarda en Excel
 * 
 * Uso: node test-compra.mjs
 */

const API_URL = 'http://localhost:3001'

// Datos de compra de prueba
const compraPrueba = {
  name: 'Cliente de Prueba',
  email: 'prueba@test.com',
  phone: '999888777',
  method: 'Yape',
  tours: 'Huancaya Full Day (Adulto); Paracas 2D1N (Niño)',
  totalPersons: 3,
  travelDate: '2026-09-15; 2026-09-20',
  totalPrice: '850.00',
  reserveAmount: '425.00',
  paymentStatus: 'Prueba - Pendiente',
  note: 'Esta es una compra de prueba del sistema',
  culqiId: ''
}

async function testPurchase() {
  console.log('🧪 Probando sistema de compras...\n')
  
  try {
    // Verificar que el servidor esté corriendo
    console.log('1️⃣ Verificando conexión con servidor...')
    const healthResponse = await fetch(`${API_URL}/api/health`)
    const health = await healthResponse.json()
    console.log(`✅ Servidor OK - Modo: ${health.mode}\n`)
    
    // Enviar compra de prueba
    console.log('2️⃣ Enviando compra de prueba...')
    console.log('📦 Datos:', compraPrueba)
    console.log()
    
    const response = await fetch(`${API_URL}/api/save-purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(compraPrueba)
    })
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }
    
    const result = await response.json()
    
    console.log('✅ ¡Compra guardada exitosamente!')
    console.log(`🆔 ID de compra: ${result.purchaseId}`)
    console.log()
    console.log('📊 Abre el archivo server/compras.xlsx para ver la compra guardada')
    
  } catch (error) {
    console.error('❌ Error en la prueba:')
    console.error(error.message)
    console.log()
    console.log('💡 Asegúrate de que el servidor esté corriendo:')
    console.log('   npm run server')
  }
}

// Ejecutar prueba
testPurchase()

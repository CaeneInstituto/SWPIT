#!/usr/bin/env node
/**
 * Script para probar conexión a MongoDB
 * Uso: node test-mongodb.mjs
 */

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

console.log('\n🔍 Probando conexión a MongoDB...\n')

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI no está configurado')
  console.error('   Usa: set MONGODB_URI=tu_uri && node test-mongodb.mjs')
  process.exit(1)
}

// Mostrar formato de URI (sin password)
const uriFormat = MONGODB_URI.includes('mongodb+srv://') 
  ? '✅ Formato SRV (recomendado para Vercel Serverless)' 
  : '⚠️  Formato manual (puede causar problemas en Vercel)'
console.log(`Formato: ${uriFormat}`)
console.log(`URI (oculta): ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}\n`)

async function testConnection() {
  let client
  try {
    console.log('📡 Conectando a MongoDB...')
    
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      tls: true,
    })
    
    await client.connect()
    console.log('✅ Conexión exitosa a MongoDB\n')
    
    const db = client.db('peruintravel')
    
    // Probar consultas básicas
    console.log('📊 Probando colecciones...\n')
    
    const toursCount = await db.collection('tours').countDocuments()
    console.log(`   Tours: ${toursCount} documentos`)
    
    const testimonialsCount = await db.collection('testimonials').countDocuments()
    console.log(`   Testimonios: ${testimonialsCount} documentos`)
    
    const comprasCount = await db.collection('compras').countDocuments()
    console.log(`   Compras: ${comprasCount} documentos`)
    
    console.log('\n✅ Todas las consultas funcionaron correctamente\n')
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message)
    console.error('\nDetalles del error:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('🔒 Conexión cerrada')
    }
  }
}

testConnection()

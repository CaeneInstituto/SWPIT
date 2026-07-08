/**
 * Script para generar archivos manifest.json en cada carpeta de imágenes
 * Esto permite que el admin panel sepa qué imágenes hay en cada carpeta
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicDir = path.join(__dirname, 'public')

// Extensiones de imagen válidas
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG']

// Carpetas a excluir
const excludeFolders = ['brochures', 'node_modules', '.git']

function isImageFile(filename) {
  const ext = path.extname(filename)
  return imageExtensions.includes(ext)
}

function generateManifest(folderPath) {
  try {
    const files = fs.readdirSync(folderPath)
    const images = files.filter(isImageFile).sort()

    if (images.length > 0) {
      const manifest = {
        folder: path.basename(folderPath),
        generated: new Date().toISOString(),
        count: images.length,
        images: images
      }

      const manifestPath = path.join(folderPath, 'manifest.json')
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
      
      console.log(`✅ ${path.basename(folderPath)}: ${images.length} imágenes`)
      return true
    }
    return false
  } catch (error) {
    console.error(`❌ Error en ${folderPath}:`, error.message)
    return false
  }
}

function scanPublicFolder() {
  console.log('🔍 Escaneando carpetas en /public...\n')

  if (!fs.existsSync(publicDir)) {
    console.error('❌ Carpeta /public no encontrada')
    return
  }

  const folders = fs.readdirSync(publicDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => !excludeFolders.includes(dirent.name))
    .map(dirent => path.join(publicDir, dirent.name))

  let manifestsCreated = 0
  
  folders.forEach(folder => {
    if (generateManifest(folder)) {
      manifestsCreated++
    }
  })

  console.log(`\n✨ Generados ${manifestsCreated} manifests`)
  console.log('📝 Ahora el admin panel puede cargar las imágenes automáticamente')
}

// Ejecutar
scanPublicFolder()

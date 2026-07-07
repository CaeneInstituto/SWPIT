import sharp from 'sharp'
import { readdirSync, statSync, writeFileSync, readFileSync } from 'fs'
import { join, extname, basename } from 'path'

const PUBLIC_DIR = 'D:/Users/CLIENTE/Escritorio/SWPIT/peru-in-travel/public'
const MAX_WIDTH = 1400
const QUALITY = 70
const SKIP_FILES = ['logo.png']

function getImageFiles(dir) {
  const files = []
  try {
    const entries = readdirSync(dir, { encoding: 'utf8' })
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
          files.push(...getImageFiles(fullPath))
        } else {
          const ext = extname(entry).toLowerCase()
          if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            files.push(fullPath)
          }
        }
      } catch {}
    }
  } catch {}
  return files
}

const images = getImageFiles(PUBLIC_DIR).filter(
  (f) => !SKIP_FILES.includes(basename(f)) && statSync(f).size > 300 * 1024
)

console.log(`\nComprimiendo ${images.length} imágenes...\n`)

let totalBefore = 0, totalAfter = 0, ok = 0, skipped = 0, errors = 0

for (const filePath of images) {
  const sizeBefore = statSync(filePath).size
  totalBefore += sizeBefore
  try {
    const ext = extname(filePath).toLowerCase()
    const isJpg = ext === '.jpg' || ext === '.jpeg'
    
    // Leer el archivo primero en memoria
    const inputBuffer = readFileSync(filePath)
    
    const buffer = await sharp(inputBuffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      [isJpg ? 'jpeg' : 'png']({ quality: QUALITY, compressionLevel: 9 })
      .toBuffer()

    if (buffer.length < sizeBefore * 0.95) { // Solo si reduce al menos 5%
      writeFileSync(filePath, buffer)
      const saved = ((sizeBefore - buffer.length) / 1024).toFixed(0)
      console.log(`✅ ${basename(filePath).padEnd(50)} ${(sizeBefore/1024).toFixed(0)}KB → ${(buffer.length/1024).toFixed(0)}KB (-${saved}KB)`)
      totalAfter += buffer.length
      ok++
    } else {
      totalAfter += sizeBefore
      skipped++
    }
  } catch (err) {
    console.log(`❌ ${basename(filePath)}: ${err.message}`)
    totalAfter += sizeBefore
    errors++
  }
}

console.log(`\n────────────────────────────────────────`)
console.log(`📊 Antes:   ${(totalBefore/1024/1024).toFixed(1)} MB`)
console.log(`📦 Después: ${(totalAfter/1024/1024).toFixed(1)} MB`)
console.log(`💾 Ahorro:  ${((totalBefore-totalAfter)/1024/1024).toFixed(1)} MB`)
console.log(`✅ Comprimidas: ${ok} | ⏭️ Ya ok: ${skipped} | ❌ Errores: ${errors}`)
console.log(`────────────────────────────────────────\n`)

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
] as const

let loaded = false

for (const candidate of candidates) {
  if (!fs.existsSync(candidate)) continue

  const result = dotenv.config({ path: candidate })
  if (result.error) {
    console.warn(`[env] Failed to load environment file at ${candidate}: ${result.error.message}`)
    continue
  }

  console.log(`[env] Loaded environment variables from ${candidate}`)
  loaded = true
  break
}

if (!loaded) {
  dotenv.config()
  console.warn('[env] No explicit .env file found; relying on existing process.env values')
}



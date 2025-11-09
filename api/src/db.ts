import { Pool } from 'pg'

// Support both POSTGRES_URL and DATABASE_URL
// Trim whitespace and ensure it's a valid string
const connectionString = (process.env.POSTGRES_URL || process.env.DATABASE_URL)?.trim()

if (!connectionString) {
  console.error('[db] ERROR: POSTGRES_URL or DATABASE_URL is not set. Backend will fail to connect to DB.')
  console.error('[db] Please set one of these environment variables in your .env file')
}

// Validate connection string format
if (connectionString && typeof connectionString !== 'string') {
  console.error('[db] ERROR: Connection string must be a string')
  throw new Error('Invalid DATABASE_URL: must be a string')
}

// Create pool with proper configuration
export const pool = connectionString
  ? new Pool({
      connectionString,
      // Add SSL for Neon.tech
      ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
    })
  : new Pool({
      // This will fail but with a clearer error message
      connectionString: 'postgresql://localhost:5432/test',
    })

// Test connection
pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle client', err)
})

// Log connection status
if (connectionString) {
  console.log('[db] Database connection configured')
  // Mask password in log
  const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':****@')
  console.log('[db] Connection string:', maskedUrl)
} else {
  console.warn('[db] WARNING: No database connection string found')
}

export async function ensureSchema() {
  // No-op: bạn đã tạo bảng trên Neon.tech theo schema cung cấp
  return
}



import './load-env'
import { Pool } from 'pg'

const connectionString = (process.env.POSTGRES_URL || process.env.DATABASE_URL)?.trim()

if (!connectionString) {
  console.error('[db] ERROR: POSTGRES_URL or DATABASE_URL is not set. Backend will fail to connect to DB.')
  console.error('[db] Please set one of these environment variables in your .env file')
}

if (connectionString && typeof connectionString !== 'string') {
  console.error('[db] ERROR: Connection string must be a string')
  throw new Error('Invalid DATABASE_URL: must be a string')
}

function createPool(conn: string | undefined): Pool {
  if (!conn) {
    return new Pool({ connectionString: 'postgresql://localhost:5432/test' })
  }

  try {
    const url = new URL(conn)

    url.searchParams.delete('channel_binding')

    const isNeon = url.hostname.includes('neon.tech')

    const config: any = {
      host: url.hostname,
      port: Number(url.port || '5432'),
      user: decodeURIComponent(url.username),
      password: String(url.password || ''),
      database: decodeURIComponent(url.pathname.replace(/^\//, '')),
      ssl: isNeon ? { rejectUnauthorized: false } : undefined,
    }

    if (!config.password) {
      console.error('[db] ERROR: Connection string has empty password')
    }

    return new Pool(config)
  } catch (e) {
    console.warn('[db] Could not parse connection string, falling back to raw connectionString', e)
    const config: any = { connectionString: conn }
    if (conn.includes('neon.tech')) {
      config.ssl = { rejectUnauthorized: false }
    }
    return new Pool(config)
  }
}

export const pool = createPool(connectionString)

pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle client', err)
})

if (connectionString) {
  console.log('[db] Database connection configured')
  const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':****@')
  console.log('[db] Connection string:', maskedUrl)
} else {
  console.warn('[db] WARNING: No database connection string found')
}

export async function ensureSchema() {
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      reset_token TEXT,
      reset_token_expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  } catch (err) {
    console.error('[db] ensureSchema failed:', err)
    throw err
  }
}

ensureSchema().catch((err) => {
  console.error('[db] Failed to ensure schema during startup', err)
})




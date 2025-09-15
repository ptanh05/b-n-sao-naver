import { Pool } from 'pg'

const connectionString = process.env.POSTGRES_URL
if (!connectionString) {
  console.warn('[db] POSTGRES_URL/DATABASE_URL is not set. Backend will fail to connect to DB.')
}

export const pool = new Pool({ connectionString })

export async function ensureSchema() {
  // No-op: bạn đã tạo bảng trên Neon.tech theo schema cung cấp
  return
}



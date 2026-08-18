import { Pool, PoolConfig } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  }
}

export const pool = new Pool(poolConfig)

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  // Don't exit - allow pool to recover when DB comes back
})

export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount })
  }
  
  return res
}

export const getClient = async () => {
  const client = await pool.connect()
  
  const originalRelease = client.release.bind(client)
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!')
  }, 5000)
  
  client.release = () => {
    clearTimeout(timeout)
    client.release = originalRelease
    return originalRelease()
  }
  
  return client
}

export default pool

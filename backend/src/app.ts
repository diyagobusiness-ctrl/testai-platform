import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import superAdminRoutes from './routes/superAdmin'
import tenantAdminRoutes from './routes/tenantAdmin'
import studentRoutes from './routes/student'
import publicRoutes from './routes/public'

import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'
import { pool } from './utils/database'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection:', { reason, promise })
})

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack })
})

app.use(helmet())

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://testai-platform.vercel.app',
  'https://frontend-ashen-six-h007fxz3fe.vercel.app',
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP, please try again later.',
})

app.use('/api/', limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many login attempts, please try again later.',
})

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(cookieParser())

app.use(compression())

app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}))

// Health check - also pings the database
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.status(200).json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected', timestamp: new Date().toISOString() })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/super-admin', superAdminRoutes)
app.use('/api/tenant', tenantAdminRoutes)
app.use('/api/student', studentRoutes)
app.use('/api', publicRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use(errorHandler)

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  console.log(`Server running on http://localhost:${PORT}`)
})

// Server timeouts to prevent hanging connections
server.timeout = 65000
server.requestTimeout = 60000
server.headersTimeout = 65000
server.keepAliveTimeout = 5000

export default app

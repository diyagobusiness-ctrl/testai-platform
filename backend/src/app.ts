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

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Prevent server crashes from unhandled async errors
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection:', { reason, promise })
})

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack })
})

// Security middleware
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})

app.use('/api/', limiter)

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many login attempts, please try again later.',
})

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Compression
app.use(compression())

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/super-admin', superAdminRoutes)
app.use('/api/tenant', tenantAdminRoutes)
app.use('/api/student', studentRoutes)
app.use('/api', publicRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app

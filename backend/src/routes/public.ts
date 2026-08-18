import express from 'express'
import { pool } from '../utils/database'

const router = express.Router()

// Public routes (no authentication required)

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

// Get tenant by slug (for public pages)
router.get('/tenant/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    const result = await pool.query(
      `SELECT id, name, slug, logo_url, is_active
       FROM tenants
       WHERE slug = $1`,
      [slug]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
      })
    }

    res.json({
      success: true,
      tenant: result.rows[0],
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
})

// Get available subscription plans
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: [
      {
        id: 'trial',
        name: 'Trial',
        maxStudents: 50,
        price: 0,
        features: ['Basic features', '50 students', 'Email support'],
      },
      {
        id: 'basic',
        name: 'Basic',
        maxStudents: 100,
        price: 299,
        features: ['All features', '100 students', 'Priority support', 'Analytics'],
      },
      {
        id: 'premium',
        name: 'Premium',
        maxStudents: 500,
        price: 999,
        features: ['All features', '500 students', '24/7 support', 'Advanced analytics', 'Custom branding'],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        maxStudents: 9999,
        price: 2999,
        features: ['Unlimited students', 'Custom features', 'Dedicated support', 'SLA guarantee'],
      },
    ],
  })
})

export default router

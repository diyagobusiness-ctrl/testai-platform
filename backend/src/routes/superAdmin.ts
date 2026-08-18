import express from 'express'
import { pool } from '../utils/database'
import bcrypt from 'bcryptjs'
import { 
  createTenant, 
  getTenants, 
  getTenantById, 
  updateTenant, 
  suspendTenant, 
  reactivateTenant,
  getTenantStats
} from '../controllers/tenantController'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validation'
import { tenantSchema } from '../utils/validators'
import { logger } from '../utils/logger'

const router = express.Router()

// All routes require authentication and SUPER_ADMIN role
router.use(authenticate)
router.use(authorize('SUPER_ADMIN'))

// Tenant management
router.post('/tenants', validate(tenantSchema.create), createTenant)
router.get('/tenants', getTenants)
router.get('/tenants/:id', getTenantById)
router.put('/tenants/:id', validate(tenantSchema.update), updateTenant)
router.post('/tenants/:id/suspend', suspendTenant)
router.post('/tenants/:id/reactivate', reactivateTenant)
router.get('/tenants/:id/stats', getTenantStats)

// Reset tenant admin password
router.post('/tenants/:id/reset-admin-password', async (req, res) => {
  try {
    const { id } = req.params

    // Find the tenant admin user
    const userResult = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.tenant_id = $1 AND r.name = 'TENANT_ADMIN'
       LIMIT 1`,
      [id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No admin user found for this tenant' })
    }

    const user = userResult.rows[0]
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, user.id]
    )

    logger.info(`Password reset for tenant admin: ${user.email}`)

    res.json({
      success: true,
      admin: { email: user.email, firstName: user.first_name, lastName: user.last_name },
      tempPassword,
    })
  } catch (error) {
    logger.error('Reset admin password error:', error)
    throw error
  }
})

// Create admin for existing tenant
router.post('/tenants/:id/create-admin', async (req, res) => {
  try {
    const { id } = req.params
    const { email, firstName, lastName } = req.body

    // Check if tenant exists
    const tenantResult = await pool.query('SELECT id, name FROM tenants WHERE id = $1', [id])
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Tenant not found' })
    }

    // Check if admin already exists for this tenant
    const existingAdmin = await pool.query(
      `SELECT u.id FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.tenant_id = $1 AND r.name = 'TENANT_ADMIN'`,
      [id]
    )

    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Tenant already has an admin user' })
    }

    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered' })
    }

    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name`,
      [email, passwordHash, firstName || 'Admin', lastName || tenantResult.rows[0].name]
    )

    const user = userResult.rows[0]
    const roleResult = await pool.query("SELECT id FROM roles WHERE name = 'TENANT_ADMIN'")

    await pool.query(
      `INSERT INTO user_roles (user_id, role_id, tenant_id)
       VALUES ($1, $2, $3)`,
      [user.id, roleResult.rows[0].id, id]
    )

    logger.info(`Admin created for tenant ${id}: ${email}`)

    res.status(201).json({
      success: true,
      admin: { email: user.email, firstName: user.first_name, lastName: user.last_name },
      tempPassword,
    })
  } catch (error) {
    logger.error('Create tenant admin error:', error)
    throw error
  }
})

// Get tenant admin user
router.get('/tenants/:id/admin', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, u.last_login
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.tenant_id = $1 AND r.name = 'TENANT_ADMIN'`,
      [id]
    )

    res.json({
      success: true,
      admins: result.rows,
    })
  } catch (error) {
    logger.error('Get tenant admin error:', error)
    throw error
  }
})

// Dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const tenantStats = await pool.query(
      `SELECT
        COUNT(*) as total_tenants,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_tenants
       FROM tenants`
    )

    const studentStats = await pool.query(
      `SELECT
        COUNT(*) as total_students,
        COUNT(CASE WHEN s.is_active = true THEN 1 END) as active_students
       FROM students s`
    )

    res.json({
      success: true,
      stats: {
        totalTenants: parseInt(tenantStats.rows[0].total_tenants),
        activeTenants: parseInt(tenantStats.rows[0].active_tenants),
        totalStudents: parseInt(studentStats.rows[0].total_students),
        activeStudents: parseInt(studentStats.rows[0].active_students),
        mrr: 2999,
      },
    })
  } catch (error) {
    throw error
  }
})

// Subscription plans
router.get('/subscriptions', async (req, res) => {
  try {
    res.json({
      success: true,
      plans: [
        { id: '1', name: 'TRIAL', maxStudents: 50, price: 0 },
        { id: '2', name: 'BASIC', maxStudents: 100, price: 299 },
        { id: '3', name: 'PREMIUM', maxStudents: 500, price: 999 },
        { id: '4', name: 'ENTERPRISE', maxStudents: 9999, price: 2999 },
      ],
    })
  } catch (error) {
    throw error
  }
})

// Billing & Invoices
router.get('/invoices', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const countResult = await pool.query('SELECT COUNT(*) FROM invoices')
    const total = parseInt(countResult.rows[0].count)

    const result = await pool.query(
      `SELECT i.*, t.name as tenant_name
       FROM invoices i
       LEFT JOIN tenants t ON i.tenant_id = t.id
       ORDER BY i.created_at DESC
       LIMIT $1 OFFSET $2`,
      [Number(limit), offset]
    )

    res.json({
      success: true,
      invoices: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    throw error
  }
})

// Roles & Permissions
router.get('/roles', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, COUNT(ur.user_id) as user_count
       FROM roles r
       LEFT JOIN user_roles ur ON r.id = ur.role_id
       GROUP BY r.id
       ORDER BY r.name`
    )

    res.json({
      success: true,
      roles: result.rows,
    })
  } catch (error) {
    throw error
  }
})

router.get('/permissions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, r.name as role_name
       FROM permissions p
       LEFT JOIN role_permissions rp ON p.id = rp.permission_id
       LEFT JOIN roles r ON rp.role_id = r.id
       ORDER BY p.category, p.name`
    )

    res.json({
      success: true,
      permissions: result.rows,
    })
  } catch (error) {
    throw error
  }
})

// Platform settings
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT key, value, description FROM platform_settings ORDER BY key'
    )

    const settings: Record<string, string> = {}
    result.rows.forEach((row) => {
      settings[row.key] = row.value
    })

    res.json({
      success: true,
      settings,
    })
  } catch (error) {
    throw error
  }
})

router.put('/settings', async (req, res) => {
  try {
    const { settings } = req.body

    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO platform_settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      )
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    throw error
  }
})

// Recent activity
router.get('/activity', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10

    const result = await pool.query(
      `SELECT * FROM activity_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    )

    res.json({
      success: true,
      activity: result.rows,
    })
  } catch (error) {
    // If table doesn't exist, return empty
    res.json({
      success: true,
      activity: [],
    })
  }
})

export default router

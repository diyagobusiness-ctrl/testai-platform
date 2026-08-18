import { Request, Response } from 'express'
import { pool } from '../utils/database'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { AppError, NotFoundError, ConflictError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { name, slug, logoUrl, subscriptionPlan, maxStudents, adminEmail, adminFirstName, adminLastName } = req.body

    // Check if slug already exists
    const existingTenant = await pool.query(
      'SELECT id FROM tenants WHERE slug = $1',
      [slug]
    )

    if (existingTenant.rows.length > 0) {
      throw new ConflictError('Tenant slug already exists')
    }

    // Create tenant
    const tenantId = uuidv4()
    const result = await pool.query(
      `INSERT INTO tenants (id, name, slug, logo_url, subscription_plan, max_students)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [tenantId, name, slug, logoUrl, subscriptionPlan, maxStudents]
    )

    const tenant = result.rows[0]
    let tempPassword = null
    let adminUser = null

    // Create admin user for this tenant if email is provided
    if (adminEmail) {
      tempPassword = Math.random().toString(36).slice(-8) + 'A1!'
      const passwordHash = await bcrypt.hash(tempPassword, 12)

      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, first_name, last_name`,
        [adminEmail, passwordHash, adminFirstName || 'Admin', adminLastName || name]
      )

      adminUser = userResult.rows[0]

      // Get TENANT_ADMIN role
      const roleResult = await pool.query(
        "SELECT id FROM roles WHERE name = 'TENANT_ADMIN'"
      )

      if (roleResult.rows.length > 0) {
        await pool.query(
          `INSERT INTO user_roles (user_id, role_id, tenant_id)
           VALUES ($1, $2, $3)`,
          [adminUser.id, roleResult.rows[0].id, tenantId]
        )
      }

      logger.info(`Tenant admin created: ${adminEmail} for tenant ${name}`)
    }

    logger.info(`Tenant created: ${tenant.name} (${tenant.slug})`)

    res.status(201).json({
      success: true,
      tenant,
      adminUser: adminUser ? {
        email: adminUser.email,
        firstName: adminUser.first_name,
        lastName: adminUser.last_name,
      } : null,
      tempPassword,
    })
  } catch (error) {
    logger.error('Create tenant error:', error)
    throw error
  }
}

export const getTenants = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status, plan } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let whereClause = 'WHERE 1=1'
    const params: unknown[] = []
    let paramIndex = 1

    if (search) {
      whereClause += ` AND (t.name ILIKE $${paramIndex} OR t.slug ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (status) {
      if (status === 'active') {
        whereClause += ` AND t.is_active = true AND t.suspended_at IS NULL`
      } else if (status === 'suspended') {
        whereClause += ` AND t.suspended_at IS NOT NULL`
      } else if (status === 'trial') {
        whereClause += ` AND t.subscription_plan = 'TRIAL'`
      }
    }

    if (plan) {
      whereClause += ` AND t.subscription_plan = $${paramIndex}`
      params.push(plan)
      paramIndex++
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM tenants t ${whereClause}`
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0].count)

    // Get tenants with student count and admin email
    const query = `
      SELECT t.*, 
             COALESCE(sc.student_count, 0) as student_count,
             (SELECT u.email FROM users u 
              JOIN user_roles ur ON u.id = ur.user_id 
              JOIN roles r ON ur.role_id = r.id 
              WHERE ur.tenant_id = t.id AND r.name = 'TENANT_ADMIN' 
              LIMIT 1) as admin_email
      FROM tenants t
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) as student_count
        FROM students
        WHERE is_active = true
        GROUP BY tenant_id
      ) sc ON t.id = sc.tenant_id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    params.push(Number(limit), offset)

    const result = await pool.query(query, params)

    res.json({
      success: true,
      tenants: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    logger.error('Get tenants error:', error)
    throw error
  }
}

export const getTenantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT t.*, 
              COUNT(s.id) as student_count,
              COUNT(CASE WHEN s.is_active = true THEN 1 END) as active_student_count
       FROM tenants t
       LEFT JOIN students s ON t.id = s.tenant_id
       WHERE t.id = $1
       GROUP BY t.id`,
      [id]
    )

    if (result.rows.length === 0) {
      throw new NotFoundError('Tenant not found')
    }

    res.json({
      success: true,
      tenant: result.rows[0],
    })
  } catch (error) {
    logger.error('Get tenant error:', error)
    throw error
  }
}

export const updateTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, logoUrl, subscriptionPlan, maxStudents } = req.body

    const result = await pool.query(
      `UPDATE tenants 
       SET name = COALESCE($1, name),
           logo_url = COALESCE($2, logo_url),
           subscription_plan = COALESCE($3, subscription_plan),
           max_students = COALESCE($4, max_students)
       WHERE id = $5
       RETURNING *`,
      [name, logoUrl, subscriptionPlan, maxStudents, id]
    )

    if (result.rows.length === 0) {
      throw new NotFoundError('Tenant not found')
    }

    logger.info(`Tenant updated: ${result.rows[0].name}`)

    res.json({
      success: true,
      tenant: result.rows[0],
    })
  } catch (error) {
    logger.error('Update tenant error:', error)
    throw error
  }
}

export const suspendTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `UPDATE tenants 
       SET suspended_at = NOW(), is_active = false
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      throw new NotFoundError('Tenant not found')
    }

    // Suspend all students in this tenant
    await pool.query(
      `UPDATE students SET is_active = false, suspended_at = NOW()
       WHERE tenant_id = $1`,
      [id]
    )

    logger.info(`Tenant suspended: ${result.rows[0].name}`)

    res.json({
      success: true,
      tenant: result.rows[0],
      message: 'Tenant and all associated students have been suspended',
    })
  } catch (error) {
    logger.error('Suspend tenant error:', error)
    throw error
  }
}

export const reactivateTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `UPDATE tenants 
       SET suspended_at = NULL, is_active = true
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      throw new NotFoundError('Tenant not found')
    }

    logger.info(`Tenant reactivated: ${result.rows[0].name}`)

    res.json({
      success: true,
      tenant: result.rows[0],
    })
  } catch (error) {
    logger.error('Reactivate tenant error:', error)
    throw error
  }
}

export const getTenantStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const stats = await pool.query(
      `SELECT 
        COUNT(s.id) as total_students,
        COUNT(CASE WHEN s.is_active = true THEN 1 END) as active_students,
        COUNT(CASE WHEN s.is_active = false THEN 1 END) as suspended_students,
        AVG(s.current_credits) as average_credits,
        COUNT(DISTINCT q.id) as total_questions,
        COUNT(DISTINCT j.id) as total_jobs
       FROM tenants t
       LEFT JOIN students s ON t.id = s.tenant_id
       LEFT JOIN questions q ON t.id = q.tenant_id
       LEFT JOIN job_listings j ON t.id = j.tenant_id
       WHERE t.id = $1
       GROUP BY t.id`,
      [id]
    )

    res.json({
      success: true,
      stats: stats.rows[0] || {},
    })
  } catch (error) {
    logger.error('Get tenant stats error:', error)
    throw error
  }
}

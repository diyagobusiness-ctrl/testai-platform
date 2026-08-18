import express from 'express'
import { pool } from '../utils/database'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { authenticate, authorize } from '../middleware/auth'
import { tenantIsolation } from '../middleware/tenantIsolation'
import { AppError, NotFoundError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = express.Router()

// All routes require authentication and TENANT_ADMIN role
router.use(authenticate)
router.use(authorize('TENANT_ADMIN'))
router.use(tenantIsolation)

// Student management
router.get('/students', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { page = 1, limit = 10, search, status } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = `
      SELECT s.*, u.email, u.first_name, u.last_name, u.avatar_url
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.tenant_id = $1
    `
    const params: unknown[] = [tenantId]
    let paramIndex = 2

    if (search) {
      query += ` AND (u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (status === 'active') {
      query += ` AND s.is_active = true`
    } else if (status === 'suspended') {
      query += ` AND s.is_active = false`
    }

    const countResult = await pool.query(
      query.replace('SELECT s.*, u.email, u.first_name, u.last_name, u.avatar_url', 'SELECT COUNT(*)'),
      params
    )
    const total = parseInt(countResult.rows[0].count)

    query += ` ORDER BY s.enrollment_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(Number(limit), offset)

    const result = await pool.query(query, params)

    res.json({
      success: true,
      students: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    logger.error('Get students error:', error)
    throw error
  }
})

router.post('/students', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { email, firstName, lastName } = req.body

    // Check if tenant is at student limit
    const tenantResult = await pool.query(
      'SELECT max_students, current_students_count FROM tenants WHERE id = $1',
      [tenantId]
    )
    const tenant = tenantResult.rows[0]

    if (tenant.current_students_count >= tenant.max_students) {
      throw new AppError('Student limit reached for this subscription plan', 400)
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 409)
    }

    // Generate random password
    const tempPassword = Math.random().toString(36).slice(-8)
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    // Create user
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [email, passwordHash, firstName, lastName]
    )
    const userId = userResult.rows[0].id

    // Get student role ID
    const roleResult = await pool.query(
      "SELECT id FROM roles WHERE name = 'STUDENT'"
    )
    const roleId = roleResult.rows[0].id

    // Assign role
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id, tenant_id)
       VALUES ($1, $2, $3)`,
      [userId, roleId, tenantId]
    )

    // Create student
    const studentResult = await pool.query(
      `INSERT INTO students (tenant_id, user_id, total_credits, current_credits)
       VALUES ($1, $2, 100, 100)
       RETURNING *`,
      [tenantId, userId]
    )

    // Update tenant student count
    await pool.query(
      `UPDATE tenants SET current_students_count = current_students_count + 1 WHERE id = $1`,
      [tenantId]
    )

    logger.info(`Student created: ${email} for tenant ${tenantId}`)

    res.status(201).json({
      success: true,
      student: {
        ...studentResult.rows[0],
        email,
        firstName,
        lastName,
      },
      tempPassword,
    })
  } catch (error) {
    logger.error('Create student error:', error)
    throw error
  }
})

router.post('/students/bulk', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { students } = req.body // Array of { email, firstName, lastName }

    const results = []
    const errors = []

    for (const student of students) {
      try {
        // Similar logic as single student creation
        const tempPassword = Math.random().toString(36).slice(-8)
        const passwordHash = await bcrypt.hash(tempPassword, 12)

        const userResult = await pool.query(
          `INSERT INTO users (email, password_hash, first_name, last_name)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [student.email, passwordHash, student.firstName, student.lastName]
        )

        const roleResult = await pool.query(
          "SELECT id FROM roles WHERE name = 'STUDENT'"
        )

        await pool.query(
          `INSERT INTO user_roles (user_id, role_id, tenant_id)
           VALUES ($1, $2, $3)`,
          [userResult.rows[0].id, roleResult.rows[0].id, tenantId]
        )

        await pool.query(
          `INSERT INTO students (tenant_id, user_id, total_credits, current_credits)
           VALUES ($1, $2, 100, 100)`,
          [tenantId, userResult.rows[0].id]
        )

        results.push({ email: student.email, success: true })
      } catch (error) {
        errors.push({ email: student.email, error: (error as Error).message })
      }
    }

    // Update tenant student count
    await pool.query(
      `UPDATE tenants SET current_students_count = current_students_count + $1 WHERE id = $2`,
      [results.length, tenantId]
    )

    res.json({
      success: true,
      imported: results.length,
      failed: errors.length,
      errors,
    })
  } catch (error) {
    logger.error('Bulk import error:', error)
    throw error
  }
})

router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { firstName, lastName, isActive } = req.body

    const result = await pool.query(
      `UPDATE users u
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name)
       FROM students s
       WHERE u.id = s.user_id AND s.id = $3 AND s.tenant_id = $4
       RETURNING s.*, u.email, u.first_name, u.last_name`,
      [firstName, lastName, id, req.user?.tenantId]
    )

    if (result.rows.length === 0) {
      throw new NotFoundError('Student not found')
    }

    if (isActive !== undefined) {
      await pool.query(
        'UPDATE students SET is_active = $1 WHERE id = $2',
        [isActive, id]
      )
    }

    res.json({
      success: true,
      student: result.rows[0],
    })
  } catch (error) {
    logger.error('Update student error:', error)
    throw error
  }
})

router.post('/students/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `UPDATE students 
       SET is_active = false, suspended_at = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING *`,
      [id, req.user?.tenantId]
    )

    if (result.rows.length === 0) {
      throw new NotFoundError('Student not found')
    }

    await pool.query(
      'UPDATE tenants SET current_students_count = current_students_count - 1 WHERE id = $1',
      [req.user?.tenantId]
    )

    res.json({
      success: true,
      student: result.rows[0],
    })
  } catch (error) {
    logger.error('Suspend student error:', error)
    throw error
  }
})

// Dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId

    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_students,
        COUNT(CASE WHEN is_active = false THEN 1 END) as suspended_students
       FROM students WHERE tenant_id = $1`,
      [tenantId]
    )

    res.json({
      success: true,
      stats: stats.rows[0],
    })
  } catch (error) {
    logger.error('Get dashboard stats error:', error)
    throw error
  }
})

// Content Management - Questions
router.get('/questions', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { page = 1, limit = 20, category } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let whereClause = 'WHERE q.tenant_id = $1'
    const params: unknown[] = [tenantId]
    let paramIndex = 2

    if (category) {
      whereClause += ` AND q.category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM questions q ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].count)

    params.push(Number(limit), offset)
    const result = await pool.query(
      `SELECT q.* FROM questions q
       ${whereClause}
       ORDER BY q.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    )

    res.json({
      success: true,
      questions: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    })
  } catch (error) {
    logger.error('Get questions error:', error)
    throw error
  }
})

router.post('/questions', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { title, description, category, difficulty, options, correctAnswer, explanation } = req.body

    const result = await pool.query(
      `INSERT INTO questions (tenant_id, title, description, category, difficulty, options, correct_answer, explanation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [tenantId, title, description, category, difficulty, JSON.stringify(options), correctAnswer, explanation]
    )

    res.status(201).json({ success: true, question: result.rows[0] })
  } catch (error) {
    logger.error('Create question error:', error)
    throw error
  }
})

router.delete('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params
    const tenantId = req.user?.tenantId

    const result = await pool.query(
      'DELETE FROM questions WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenantId]
    )

    if (result.rows.length === 0) {
      throw new NotFoundError('Question not found')
    }

    res.json({ success: true, message: 'Question deleted' })
  } catch (error) {
    logger.error('Delete question error:', error)
    throw error
  }
})

// Bulk upload questions
router.post('/questions/bulk', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { questions } = req.body

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new AppError('Questions array is required', 400)
    }

    const results = []
    const errors = []

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      try {
        const result = await pool.query(
          `INSERT INTO questions (tenant_id, title, description, category, difficulty, options, correct_answer, explanation)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [tenantId, q.title, q.description, q.category || 'QUANTITATIVE', q.difficulty || 'MEDIUM',
           JSON.stringify(q.options || []), q.correctAnswer || 'a', q.explanation || '']
        )
        results.push({ index: i, id: result.rows[0].id, success: true })
      } catch (error) {
        errors.push({ index: i, error: (error as Error).message })
      }
    }

    res.json({ success: true, imported: results.length, failed: errors.length, errors })
  } catch (error) {
    logger.error('Bulk upload questions error:', error)
    throw error
  }
})

// Content Management - Coding Challenges
router.get('/coding-challenges', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM coding_challenges WHERE tenant_id = $1',
      [tenantId]
    )
    const total = parseInt(countResult.rows[0].count)

    const result = await pool.query(
      `SELECT * FROM coding_challenges
       WHERE tenant_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [tenantId, Number(limit), offset]
    )

    res.json({
      success: true,
      challenges: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    })
  } catch (error) {
    logger.error('Get coding challenges error:', error)
    throw error
  }
})

router.post('/coding-challenges', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { title, description, difficulty, language, starterCode, solution } = req.body

    const result = await pool.query(
      `INSERT INTO coding_challenges (tenant_id, title, description, difficulty, language, starter_code, solution)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [tenantId, title, description, difficulty, language, starterCode, solution]
    )

    res.status(201).json({ success: true, challenge: result.rows[0] })
  } catch (error) {
    logger.error('Create coding challenge error:', error)
    throw error
  }
})

router.delete('/coding-challenges/:id', async (req, res) => {
  try {
    const { id } = req.params
    const tenantId = req.user?.tenantId

    const result = await pool.query(
      'DELETE FROM coding_challenges WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenantId]
    )

    if (result.rows.length === 0) {
      throw new NotFoundError('Challenge not found')
    }

    res.json({ success: true, message: 'Challenge deleted' })
  } catch (error) {
    logger.error('Delete coding challenge error:', error)
    throw error
  }
})

// Bulk upload coding challenges
router.post('/coding-challenges/bulk', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { challenges } = req.body

    if (!Array.isArray(challenges) || challenges.length === 0) {
      throw new AppError('Challenges array is required', 400)
    }

    const results = []
    const errors = []

    for (let i = 0; i < challenges.length; i++) {
      const c = challenges[i]
      try {
        const result = await pool.query(
          `INSERT INTO coding_challenges (tenant_id, title, description, difficulty, language, starter_code, solution)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [tenantId, c.title, c.description, c.difficulty || 'MEDIUM', c.language || 'javascript',
           c.starterCode || '', c.solution || '']
        )
        results.push({ index: i, id: result.rows[0].id, success: true })
      } catch (error) {
        errors.push({ index: i, error: (error as Error).message })
      }
    }

    res.json({ success: true, imported: results.length, failed: errors.length, errors })
  } catch (error) {
    logger.error('Bulk upload challenges error:', error)
    throw error
  }
})

// Content Management - Job Listings
router.get('/job-listings', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM job_listings WHERE tenant_id = $1',
      [tenantId]
    )
    const total = parseInt(countResult.rows[0].count)

    const result = await pool.query(
      `SELECT * FROM job_listings
       WHERE tenant_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [tenantId, Number(limit), offset]
    )

    res.json({
      success: true,
      jobs: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    })
  } catch (error) {
    logger.error('Get job listings error:', error)
    throw error
  }
})

router.post('/job-listings', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { title, company, description, location, salaryMin, salaryMax, type, requirements } = req.body

    const result = await pool.query(
      `INSERT INTO job_listings (tenant_id, title, company, description, location, salary_min, salary_max, type, requirements)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [tenantId, title, company, description, location, salaryMin, salaryMax, type, JSON.stringify(requirements)]
    )

    res.status(201).json({ success: true, job: result.rows[0] })
  } catch (error) {
    logger.error('Create job listing error:', error)
    throw error
  }
})

router.delete('/job-listings/:id', async (req, res) => {
  try {
    const { id } = req.params
    const tenantId = req.user?.tenantId

    const result = await pool.query(
      'DELETE FROM job_listings WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenantId]
    )

    if (result.rows.length === 0) {
      throw new NotFoundError('Job listing not found')
    }

    res.json({ success: true, message: 'Job listing deleted' })
  } catch (error) {
    logger.error('Delete job listing error:', error)
    throw error
  }
})

// Bulk upload job listings
router.post('/job-listings/bulk', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { jobs } = req.body

    if (!Array.isArray(jobs) || jobs.length === 0) {
      throw new AppError('Jobs array is required', 400)
    }

    const results = []
    const errors = []

    for (let i = 0; i < jobs.length; i++) {
      const j = jobs[i]
      try {
        const result = await pool.query(
          `INSERT INTO job_listings (tenant_id, title, company, description, location, salary_min, salary_max, type, requirements)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [tenantId, j.title, j.company, j.description, j.location || '',
           j.salaryMin || 0, j.salaryMax || 0, j.type || 'FULL_TIME',
           JSON.stringify(j.requirements || [])]
        )
        results.push({ index: i, id: result.rows[0].id, success: true })
      } catch (error) {
        errors.push({ index: i, error: (error as Error).message })
      }
    }

    res.json({ success: true, imported: results.length, failed: errors.length, errors })
  } catch (error) {
    logger.error('Bulk upload jobs error:', error)
    throw error
  }
})

// Tenant settings
router.get('/settings', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId

    const result = await pool.query(
      'SELECT name, slug, logo_url, subscription_plan, max_students FROM tenants WHERE id = $1',
      [tenantId]
    )

    res.json({
      success: true,
      settings: result.rows[0] || {},
    })
  } catch (error) {
    logger.error('Get tenant settings error:', error)
    throw error
  }
})

router.put('/settings', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { name, logoUrl } = req.body

    const result = await pool.query(
      `UPDATE tenants
       SET name = COALESCE($1, name),
           logo_url = COALESCE($2, logo_url),
           updated_at = NOW()
       WHERE id = $3
       RETURNING name, slug, logo_url, subscription_plan`,
      [name, logoUrl, tenantId]
    )

    res.json({
      success: true,
      settings: result.rows[0],
    })
  } catch (error) {
    logger.error('Update tenant settings error:', error)
    throw error
  }
})

export default router

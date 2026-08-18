import express from 'express'
import { pool } from '../utils/database'
import { authenticate, authorize } from '../middleware/auth'
import { tenantIsolation } from '../middleware/tenantIsolation'
import { NotFoundError, AppError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = express.Router()

// All routes require authentication and STUDENT role
router.use(authenticate)
router.use(authorize('STUDENT'))
router.use(tenantIsolation)

// Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const studentId = req.user?.userId

    // Get student data
    const studentResult = await pool.query(
      `SELECT s.*, u.first_name, u.last_name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = $1`,
      [studentId]
    )

    if (studentResult.rows.length === 0) {
      throw new NotFoundError('Student not found')
    }

    const student = studentResult.rows[0]

    // Get recent activity
    const activityResult = await pool.query(
      `SELECT 
        'aptitude' as type,
        'Completed Aptitude Test' as action,
        score::text || '%' as result,
        started_at as created_at
       FROM student_exams
       WHERE student_id = $1
       UNION ALL
       SELECT
        'voice_ai' as type,
        'Voice AI Session' as action,
        accuracy_score::text || '%' as result,
        created_at
       FROM voice_practice_sessions
       WHERE student_id = $1
       UNION ALL
       SELECT
        'ycode' as type,
        'Y-Code Submission' as action,
        CASE WHEN execution_status = 'SUCCESS' THEN 'Passed' ELSE 'Failed' END as result,
        submitted_at as created_at
       FROM code_submissions
       WHERE student_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [student.id]
    )

    res.json({
      success: true,
      student: {
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        currentCredits: student.current_credits,
        totalCredits: student.total_credits,
      },
      stats: {
        overallProgress: 65,
        activityStreak: 7,
        completedModules: 3,
        totalModules: 5,
      },
      recentActivity: activityResult.rows,
    })
  } catch (error) {
    logger.error('Get dashboard error:', error)
    throw error
  }
})

// Profile
router.get('/profile', async (req, res) => {
  try {
    const studentId = req.user?.userId

    const result = await pool.query(
      `SELECT s.*, u.first_name, u.last_name, u.email, u.avatar_url, u.phone
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = $1`,
      [studentId]
    )

    if (result.rows.length === 0) {
      throw new NotFoundError('Student not found')
    }

    const student = result.rows[0]

    res.json({
      success: true,
      student: {
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        avatarUrl: student.avatar_url,
        phone: student.phone,
        currentCredits: student.current_credits,
        totalCredits: student.total_credits,
        enrollmentDate: student.enrollment_date,
      },
    })
  } catch (error) {
    logger.error('Get profile error:', error)
    throw error
  }
})

router.put('/profile', async (req, res) => {
  try {
    const studentId = req.user?.userId
    const { firstName, lastName, phone, avatarUrl } = req.body

    const result = await pool.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           avatar_url = COALESCE($4, avatar_url),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, first_name, last_name, avatar_url, phone`,
      [firstName, lastName, phone, avatarUrl, studentId]
    )

    res.json({
      success: true,
      student: result.rows[0],
    })
  } catch (error) {
    logger.error('Update profile error:', error)
    throw error
  }
})

// Questions (Aptitude Arena)
router.get('/questions', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { category, difficulty, page = 1, limit = 10 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = `
      SELECT id, category, question_text, options, difficulty_level, time_limit_seconds
      FROM questions
      WHERE tenant_id = $1
    `
    const params: unknown[] = [tenantId]
    let paramIndex = 2

    if (category) {
      query += ` AND category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (difficulty) {
      query += ` AND difficulty_level = $${paramIndex}`
      params.push(difficulty)
      paramIndex++
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(Number(limit), offset)

    const result = await pool.query(query, params)

    res.json({
      success: true,
      questions: result.rows,
    })
  } catch (error) {
    logger.error('Get questions error:', error)
    throw error
  }
})

// Exam
router.post('/exam/start', async (req, res) => {
  try {
    const studentId = req.user?.userId
    const { category, questionCount = 50, timeLimitMinutes = 60 } = req.body

    // Get random questions
    const questions = await pool.query(
      `SELECT id, question_text, options, difficulty_level
       FROM questions
       WHERE tenant_id = $1 AND category = $2
       ORDER BY RANDOM()
       LIMIT $3`,
      [req.user?.tenantId, category, questionCount]
    )

    if (questions.rows.length === 0) {
      throw new AppError('No questions available for this category', 400)
    }

    // Create exam session
    const examResult = await pool.query(
      `INSERT INTO student_exams (student_id, category, question_count, time_limit_minutes, started_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [studentId, category, questions.rows.length, timeLimitMinutes]
    )

    res.json({
      success: true,
      examId: examResult.rows[0].id,
      questions: questions.rows,
      timeLimitMinutes,
    })
  } catch (error) {
    logger.error('Start exam error:', error)
    throw error
  }
})

router.post('/exam/submit', async (req, res) => {
  try {
    const studentId = req.user?.userId
    const { examId, answers } = req.body

    // Get exam details
    const examResult = await pool.query(
      'SELECT * FROM student_exams WHERE id = $1 AND student_id = $2',
      [examId, studentId]
    )

    if (examResult.rows.length === 0) {
      throw new NotFoundError('Exam not found')
    }

    const exam = examResult.rows[0]

    // Calculate score
    let correctCount = 0
    const questionIds = answers.map((a: { questionId: string }) => a.questionId)

    if (questionIds.length > 0) {
      const questionsResult = await pool.query(
        'SELECT id, correct_answer FROM questions WHERE id = ANY($1)',
        [questionIds]
      )

      for (const answer of answers) {
        const question = questionsResult.rows.find(q => q.id === answer.questionId)
        if (question && question.correct_answer === answer.answer) {
          correctCount++
        }
      }
    }

    const score = Math.round((correctCount / exam.question_count) * 100)

    // Update exam
    await pool.query(
      `UPDATE student_exams 
       SET answers = $1, score = $2, submitted_at = NOW()
       WHERE id = $3`,
      [JSON.stringify(answers), score, examId]
    )

    res.json({
      success: true,
      score,
      correctCount,
      totalQuestions: exam.question_count,
      percentage: score,
    })
  } catch (error) {
    logger.error('Submit exam error:', error)
    throw error
  }
})

router.get('/exam/results/:id', async (req, res) => {
  try {
    const { id } = req.params
    const studentId = req.user?.userId

    const result = await pool.query(
      `SELECT * FROM student_exams 
       WHERE id = $1 AND student_id = $2`,
      [id, studentId]
    )

    if (result.rows.length === 0) {
      throw new NotFoundError('Exam result not found')
    }

    res.json({
      success: true,
      result: result.rows[0],
    })
  } catch (error) {
    logger.error('Get exam results error:', error)
    throw error
  }
})

// Credits
router.get('/credits', async (req, res) => {
  try {
    const studentId = req.user?.userId

    const result = await pool.query(
      'SELECT current_credits, total_credits FROM students WHERE user_id = $1',
      [studentId]
    )

    if (result.rows.length === 0) {
      throw new NotFoundError('Student not found')
    }

    res.json({
      success: true,
      credits: result.rows[0],
    })
  } catch (error) {
    logger.error('Get credits error:', error)
    throw error
  }
})

// Voice AI Sessions
router.get('/voice/sessions', async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user?.userId]
    )
    if (studentResult.rows.length === 0) throw new NotFoundError('Student not found')
    const studentId = studentResult.rows[0].id

    const result = await pool.query(
      `SELECT * FROM voice_practice_sessions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [studentId]
    )

    res.json({ success: true, sessions: result.rows })
  } catch (error) {
    logger.error('Get voice sessions error:', error)
    throw error
  }
})

router.post('/voice/submit-session', async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user?.userId]
    )
    if (studentResult.rows.length === 0) throw new NotFoundError('Student not found')
    const studentId = studentResult.rows[0].id

    const { sessionType, durationSeconds, accuracyScore, transcribedText, aiFeedback } = req.body

    const result = await pool.query(
      `INSERT INTO voice_practice_sessions (student_id, session_type, duration_seconds, accuracy_score, transcribed_text, ai_feedback)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [studentId, sessionType || 'GENERAL_PRACTICE', durationSeconds, accuracyScore, transcribedText, JSON.stringify(aiFeedback || {})]
    )

    res.json({ success: true, session: result.rows[0] })
  } catch (error) {
    logger.error('Submit voice session error:', error)
    throw error
  }
})

// Code Challenges (Y-Codes)
router.get('/code-challenges', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const result = await pool.query(
      `SELECT id, title, description, difficulty, language, starter_code, test_cases, points
       FROM coding_challenges WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId]
    )
    res.json({ success: true, challenges: result.rows })
  } catch (error) {
    logger.error('Get code challenges error:', error)
    throw error
  }
})

router.post('/code-submit', async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user?.userId]
    )
    if (studentResult.rows.length === 0) throw new NotFoundError('Student not found')
    const studentId = studentResult.rows[0].id

    const { challengeId, language, codeContent } = req.body

    const result = await pool.query(
      `INSERT INTO code_submissions (student_id, challenge_id, language, code_content, execution_status, output)
       VALUES ($1, $2, $3, $4, 'SUCCESS', 'Code submitted successfully') RETURNING *`,
      [studentId, challengeId, language, codeContent]
    )

    res.json({ success: true, submission: result.rows[0] })
  } catch (error) {
    logger.error('Submit code error:', error)
    throw error
  }
})

// Jobs
router.get('/jobs', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId
    const { search, type } = req.query

    let query = `SELECT * FROM job_listings WHERE tenant_id = $1`
    const params: unknown[] = [tenantId]
    let paramIndex = 2

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR company_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }
    if (type) {
      query += ` AND job_type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }

    query += ' ORDER BY posted_date DESC'
    const result = await pool.query(query, params)

    res.json({ success: true, jobs: result.rows })
  } catch (error) {
    logger.error('Get jobs error:', error)
    throw error
  }
})

router.post('/jobs/:jobId/apply', async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user?.userId]
    )
    if (studentResult.rows.length === 0) throw new NotFoundError('Student not found')
    const studentId = studentResult.rows[0].id
    const { jobId } = req.params

    const existing = await pool.query(
      'SELECT id FROM student_job_applications WHERE student_id = $1 AND job_id = $2',
      [studentId, jobId]
    )
    if (existing.rows.length > 0) throw new AppError('Already applied to this job', 409)

    const result = await pool.query(
      `INSERT INTO student_job_applications (student_id, job_id, status) VALUES ($1, $2, 'APPLIED') RETURNING *`,
      [studentId, jobId]
    )

    res.json({ success: true, application: result.rows[0] })
  } catch (error) {
    logger.error('Apply to job error:', error)
    throw error
  }
})

router.get('/applications', async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user?.userId]
    )
    if (studentResult.rows.length === 0) throw new NotFoundError('Student not found')
    const studentId = studentResult.rows[0].id

    const result = await pool.query(
      `SELECT sja.*, jl.title as job_title, jl.company_name, jl.location
       FROM student_job_applications sja
       JOIN job_listings jl ON sja.job_id = jl.id
       WHERE sja.student_id = $1
       ORDER BY sja.applied_at DESC`,
      [studentId]
    )

    res.json({ success: true, applications: result.rows })
  } catch (error) {
    logger.error('Get applications error:', error)
    throw error
  }
})

// Resumes
router.get('/resumes', async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user?.userId]
    )
    if (studentResult.rows.length === 0) throw new NotFoundError('Student not found')
    const studentId = studentResult.rows[0].id

    const result = await pool.query(
      `SELECT sr.*, rd.name as template_name
       FROM student_resumes sr
       LEFT JOIN resume_designs rd ON sr.design_id = rd.id
       WHERE sr.student_id = $1
       ORDER BY sr.updated_at DESC`,
      [studentId]
    )

    res.json({ success: true, resumes: result.rows })
  } catch (error) {
    logger.error('Get resumes error:', error)
    throw error
  }
})

router.post('/resumes', async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user?.userId]
    )
    if (studentResult.rows.length === 0) throw new NotFoundError('Student not found')
    const studentId = studentResult.rows[0].id

    const { title, content, designId } = req.body

    const result = await pool.query(
      `INSERT INTO student_resumes (student_id, design_id, title, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [studentId, designId, title, JSON.stringify(content)]
    )

    res.json({ success: true, resume: result.rows[0] })
  } catch (error) {
    logger.error('Create resume error:', error)
    throw error
  }
})

router.put('/resumes/:id', async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user?.userId]
    )
    if (studentResult.rows.length === 0) throw new NotFoundError('Student not found')
    const studentId = studentResult.rows[0].id
    const { id } = req.params
    const { title, content, designId } = req.body

    const result = await pool.query(
      `UPDATE student_resumes
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           design_id = COALESCE($3, design_id),
           updated_at = NOW()
       WHERE id = $4 AND student_id = $5
       RETURNING *`,
      [title, content ? JSON.stringify(content) : null, designId, id, studentId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Resume not found')
    res.json({ success: true, resume: result.rows[0] })
  } catch (error) {
    logger.error('Update resume error:', error)
    throw error
  }
})

router.post('/resumes/:id/download', async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user?.userId]
    )
    if (studentResult.rows.length === 0) throw new NotFoundError('Student not found')
    const studentId = studentResult.rows[0].id
    const { id } = req.params

    const result = await pool.query(
      'SELECT * FROM student_resumes WHERE id = $1 AND student_id = $2',
      [id, studentId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Resume not found')
    res.json({ success: true, resume: result.rows[0] })
  } catch (error) {
    logger.error('Download resume error:', error)
    throw error
  }
})

export default router

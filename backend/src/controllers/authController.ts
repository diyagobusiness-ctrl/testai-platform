import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../utils/database'
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt'
import { AppError, AuthenticationError, NotFoundError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 409)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name`,
      [email, passwordHash, firstName, lastName]
    )

    const user = result.rows[0]

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: 'STUDENT' as const,
    }

    const token = generateToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      token,
    })
  } catch (error) {
    logger.error('Registration error:', error)
    throw error
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Find user
    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name,
              ur.role_id, r.name as role_name, t.id as tenant_id, t.slug as tenant_slug
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       LEFT JOIN tenants t ON ur.tenant_id = t.id
       WHERE u.email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      throw new AuthenticationError('Invalid email or password')
    }

    const user = result.rows[0]

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password')
    }

    // Check if user is active
    const userStatus = await pool.query(
      'SELECT is_active FROM users WHERE id = $1',
      [user.id]
    )

    if (!userStatus.rows[0].is_active) {
      throw new AuthenticationError('Account is suspended')
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role_name,
      tenantId: user.tenant_id,
    }

    const token = generateToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // Set cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      tenant: user.tenant_id ? {
        id: user.tenant_id,
        slug: user.tenant_slug,
      } : null,
      role: user.role_name,
      token,
    })
  } catch (error) {
    logger.error('Login error:', error)
    throw error
  }
}

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token')
  res.clearCookie('refreshToken')
  
  res.json({
    success: true,
    message: 'Logged out successfully',
  })
}

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      throw new AuthenticationError('No refresh token provided')
    }

    const decoded = verifyToken(refreshToken)
    const token = generateToken(decoded)

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      success: true,
      token,
    })
  } catch (error) {
    res.clearCookie('token')
    res.clearCookie('refreshToken')
    throw new AuthenticationError('Invalid refresh token')
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    // Check if user exists
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    })
  } catch (error) {
    logger.error('Forgot password error:', error)
    throw error
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body

    // Verify token and update password
    const decoded = verifyToken(token)
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, decoded.userId]
    )

    res.json({
      success: true,
      message: 'Password reset successful',
    })
  } catch (error) {
    logger.error('Reset password error:', error)
    throw new AppError('Invalid or expired reset token', 400)
  }
}

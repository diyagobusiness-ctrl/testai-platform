import { Request, Response, NextFunction } from 'express'
import { pool } from '../utils/database'
import { AuthorizationError } from './errorHandler'

export const tenantIsolation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Not authenticated')
    }

    // Super admin can access all tenants
    if (req.user.role === 'SUPER_ADMIN') {
      return next()
    }

    // Get tenant ID from JWT token (set by authenticate middleware)
    const tenantId = req.user.tenantId

    if (!tenantId) {
      throw new AuthorizationError('Tenant ID is required')
    }

    // Check if tenant is active
    const result = await pool.query(
      'SELECT is_active FROM tenants WHERE id = $1',
      [tenantId]
    )

    if (result.rows.length === 0) {
      throw new AuthorizationError('Tenant not found')
    }

    if (!result.rows[0].is_active) {
      throw new AuthorizationError('Tenant is suspended')
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const checkStudentTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Not authenticated')
    }

    if (req.user.role !== 'STUDENT') {
      return next()
    }

    // Verify student belongs to the requested tenant
    const studentTenantId = req.user.tenantId
    const requestedTenantId = req.params.tenantId

    if (requestedTenantId && studentTenantId !== requestedTenantId) {
      throw new AuthorizationError('Access denied')
    }

    next()
  } catch (error) {
    next(error)
  }
}

export default tenantIsolation

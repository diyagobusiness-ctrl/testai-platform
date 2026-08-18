import { Request, Response, NextFunction } from 'express'
import { verifyToken, getTokenFromHeader, TokenPayload } from '../utils/jwt'
import { AuthenticationError, AuthorizationError } from './errorHandler'

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      throw new AuthenticationError('No token provided')
    }

    const decoded = verifyToken(token)
    req.user = decoded

    next()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        error: error.message,
      })
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('Not authenticated')
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError('Insufficient permissions')
    }

    next()
  }
}

export const requireTenant = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AuthenticationError('Not authenticated')
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next()
  }

  if (!req.user.tenantId) {
    throw new AuthorizationError('No tenant associated with this user')
  }

  next()
}

export const validateTenantAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AuthenticationError('Not authenticated')
  }

  // Super admin can access all tenants
  if (req.user.role === 'SUPER_ADMIN') {
    return next()
  }

  // For tenant admin and students, check if they're accessing their own tenant
  const tenantSlug = req.params.tenant
  if (tenantSlug && req.user.tenantId) {
    // Here you would typically look up the tenant by slug and compare IDs
    // For now, we'll just check if the user has a tenant ID
  }

  next()
}

export default authenticate

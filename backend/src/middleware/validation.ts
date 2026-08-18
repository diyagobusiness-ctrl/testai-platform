import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { ValidationError } from './errorHandler'

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const zodError = error as any
        const errors: Record<string, string[]> = {}
        
        zodError.errors?.forEach((err: any) => {
          const path = err.path.join('.')
          if (!errors[path]) {
            errors[path] = []
          }
          errors[path].push(err.message)
        })

        throw new ValidationError('Validation failed', errors)
      }
      next(error)
    }
  }
}

export default validate

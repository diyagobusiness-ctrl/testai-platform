import express from 'express'
import { register, login, logout, refreshToken, forgotPassword, resetPassword } from '../controllers/authController'
import { validate } from '../middleware/validation'
import { authSchema } from '../utils/validators'

const router = express.Router()

router.post('/register', validate(authSchema.register), register)
router.post('/login', validate(authSchema.login), login)
router.post('/logout', logout)
router.post('/refresh-token', refreshToken)
router.post('/forgot-password', validate(authSchema.forgotPassword), forgotPassword)
router.post('/reset-password', validate(authSchema.resetPassword), resetPassword)

export default router

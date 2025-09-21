
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { signup, login, protectedRoute } from '../controllers/authController.js'
const router = Router()
const authMiddleware = (req, _res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return next({ status: 401, message: 'No token' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.user = decoded
    next()
  } catch (e) {
    return next({ status: 403, message: 'Invalid token' })
  }
}
router.post('/signup', signup)
router.post('/login', login)
router.get('/protected', authMiddleware, protectedRoute)
export default router

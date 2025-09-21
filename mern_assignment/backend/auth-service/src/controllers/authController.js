
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
export const signup = async (req, res) => {
  try {
    const { username, password } = req.body
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ username, password: hash })
    res.json({ id: user._id, username: user.username })
  } catch (err) {
    res.status(400).json({ msg: 'Signup failed', error: String(err) })
  }
}
export const login = async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  if (!user) return res.status(400).json({ msg: 'User not found' })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(400).json({ msg: 'Invalid password' })
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' })
  res.json({ token })
}
export const protectedRoute = async (req, res) => {
  res.json({ msg: 'Access granted', user: req.user })
}

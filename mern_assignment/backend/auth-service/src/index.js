
import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/auth.js'
dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
const { PORT = 4000, MONGO_URI, JWT_SECRET = 'secret' } = process.env
if(!MONGO_URI){
  console.warn('Auth Service: MONGO_URI not set, using localhost fallback')
}
mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/auth-service')
  .then(()=>console.log('Auth: Mongo connected'))
  .catch(e=>console.error('Auth: Mongo error', e))
app.use('/auth', authRoutes)
app.use((err, _req, res, _next)=>{
  const status = err.status || 500
  res.status(status).json({ msg: err.message || 'Server error' })
})
app.listen(PORT, ()=> console.log(`Auth service on ${PORT}`))


import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import coursesRoutes from './routes/courses.js'
dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
const { PORT = 4002, MONGO_URI } = process.env
if(!MONGO_URI){
  console.warn('Course Service: MONGO_URI not set, using localhost fallback')
}
mongoose.connect(MONGO_URI)
  .then(()=>console.log('Courses: Mongo connected'))
  .catch(e=>console.error('Courses: Mongo error', e))
app.use('/courses', coursesRoutes)
app.use((err, _req, res, _next)=>{
  const status = err.status || 500
  res.status(status).json({ msg: err.message || 'Server error' })
})
app.listen(PORT, ()=> console.log(`Courses service on ${PORT}`))


import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import recommendations from './routes/recommendations.js'
dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
const { PORT = 4001 } = process.env
app.use('/recommendations', recommendations)
app.use((err, _req, res, _next)=>{
  const status = err.status || 500
  res.status(status).json({ msg: err.message || 'Server error' })
})
app.listen(PORT, ()=> console.log(`Recommendation service on ${PORT}`))

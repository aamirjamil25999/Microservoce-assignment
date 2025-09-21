
import mongoose from 'mongoose'
const CourseSchema = new mongoose.Schema({
  course_id: String,
  title: String,
  description: String,
  category: String,
  instructor: String,
  duration: String
}, { timestamps: true })
export default mongoose.model('Course', CourseSchema)

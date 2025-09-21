
import { Router } from 'express'
import multer from 'multer'
import { uploadCSV, searchCourses } from '../controllers/courseController.js'
const upload = multer({ dest: 'uploads/' })
const router = Router()
router.post('/upload', upload.single('file'), uploadCSV)
router.get('/search', searchCourses)
export default router

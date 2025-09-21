
import csvParser from 'csv-parser'
import fs from 'fs'
import Course from '../models/Course.js'
import { esClient, ensureIndex } from '../es.js'
import { redis } from '../redis.js'
export const uploadCSV = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file' })
  await ensureIndex()
  const results = []
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', d => results.push(d))
    .on('end', async () => {
      try {
        const docs = await Course.insertMany(results, { ordered: false })
        const body = docs.flatMap(doc => [{ index: { _index: 'courses' } }, {
          course_id: doc.course_id, title: doc.title, description: doc.description,
          category: doc.category, instructor: doc.instructor, duration: doc.duration
        }])
        if (body.length) await esClient.bulk({ refresh: true, body })
        res.json({ msg: 'Uploaded & indexed', inserted: docs.length })
      } catch (err) {
        res.status(500).json({ msg: 'Upload/index failed', error: String(err) })
      } finally {
        fs.unlink(req.file.path, ()=>{})
      }
    })
}
export const searchCourses = async (req, res) => {
  const q = String(req.query.q || '').trim()
  if (!q) return res.json([])
  const cacheKey = `search:${q}`
  const cached = await redis.get(cacheKey)
  if (cached) return res.json(JSON.parse(cached))
  try {
    const resp = await esClient.search({
      index: 'courses',
      query: { multi_match: { query: q, fields: ['title^2','description','instructor','category'] } },
      size: 25
    })
    const hits = resp.hits?.hits || []
    await redis.setex(cacheKey, 3600, JSON.stringify(hits))
    res.json(hits)
  } catch (err) {
    const mongo = await Course.find({
      $or: [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { instructor: new RegExp(q, 'i') },
        { category: new RegExp(q, 'i') },
      ]
    }).limit(25).lean()
    res.json(mongo)
  }
}

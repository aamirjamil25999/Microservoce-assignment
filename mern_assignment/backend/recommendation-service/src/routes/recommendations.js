import { Router } from 'express';

const router = Router();

router.post('/match', (req, res) => {
  const { description = "", skillLevel = "beginner" } = req.body;

  // Dummy courses
  const recs = [
    { title: "Intro to MERN", level: "beginner", category: "web" },
    { title: "Building Microservices with Node", level: "intermediate", category: "backend" },
    { title: "Scaling Search with Elasticsearch", level: "advanced", category: "search" }
  ];

  // Simple filter based on description keyword
  const filtered = recs.filter(course =>
    course.title.toLowerCase().includes(description.toLowerCase()) ||
    course.category.toLowerCase().includes(description.toLowerCase())
  );

  res.json({
    description,
    skillLevel,
    recommendations: filtered.length > 0 ? filtered : recs 
  });
});

export default router;

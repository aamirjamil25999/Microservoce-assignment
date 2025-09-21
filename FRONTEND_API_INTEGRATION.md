# Frontend ↔ Backend API Integration (Fixed)

Framework detected: **next**
Frontend env file created: **.env.local**

Backends:
- Auth: `http://localhost:4000/auth`
- Courses: `http://localhost:4002/courses`
- Recommendations: `http://localhost:4001/recommendations`

Central API modules added/updated:
- `frontend/src/api/client.js`
- `frontend/src/api/auth.js`
- `frontend/src/api/courses.js`
- `frontend/src/api/recommendations.js`

## Local test
From project root:
```bash
npm i axios
node api-smoke-test.mjs
```

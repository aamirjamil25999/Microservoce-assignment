MERN Microservices Assignment — Course Compass

A production-style MERN microservices app with:

Auth service (admin only) — JWT login, hashed passwords (MongoDB)

Course service — CSV upload → MongoDB → Elasticsearch search with Redis cache

Recommendation service — Gemini AI mock (static recommendations)

Frontend (Next.js) — Admin login + course search + recommendations, wired to backend

Dockerized via docker-compose

CI/CD outline + Linux hosting notes + Kafka usage (conceptual)

1) Repository Structure
mern_assignment_fixed/
├─ auth-service/
│  ├─ src/
│  │  ├─ controllers/authController.js
│  │  ├─ models/User.js
│  │  ├─ routes/auth.js
│  │  └─ index.js
│  ├─ Dockerfile
│  └─ package.json
├─ course-service/
│  ├─ src/
│  │  ├─ controllers/courseController.js
│  │  ├─ models/Course.js
│  │  ├─ routes/courses.js
│  │  └─ index.js
│  ├─ Dockerfile
│  └─ package.json
├─ recommendation-service/
│  ├─ src/
│  │  ├─ routes/recommendations.js
│  │  └─ index.js
│  ├─ Dockerfile
│  └─ package.json
├─ frontend/                  ← Next.js app (wired to backend)
│  ├─ src/...
│  └─ package.json
├─ docker-compose.yml
└─ README.md


Default Ports

Auth: 4000

Recommendations: 4001

Courses: 4002

Redis: 6379

Elasticsearch: 9200 (Kibana optional: 5601)

Frontend (Next.js): 3000

2) Prerequisites

Docker Desktop + Docker Compose

Node.js 18+ and npm (for running frontend/)

A MongoDB URI (provided in your assessment or .env)

3) Environment Variables
3.1 auth-service/.env
PORT=4000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=supersecret
CORS_ORIGIN=*

3.2 course-service/.env
PORT=4002
MONGO_URI=<your-mongodb-uri>
ELASTICSEARCH_NODE=http://elasticsearch:9200
REDIS_URL=redis://redis:6379
CORS_ORIGIN=*

3.3 recommendation-service/.env
PORT=4001
# GEMINI_API_KEY=<optional; mocked responses used>
CORS_ORIGIN=*

3.4 frontend/.env.local
NEXT_PUBLIC_AUTH_BASE=http://localhost:4000/auth
NEXT_PUBLIC_COURSE_BASE=http://localhost:4002/courses
NEXT_PUBLIC_RECO_BASE=http://localhost:4001/recommendations


If you prefer a proxy (to avoid CORS), add rewrites in frontend/next.config.js and point frontend calls to /api/....

4) Start the Backend (Docker Compose)

From the repo root mern_assignment_fixed/:

docker compose up -d --build


Check status:

docker compose ps


Useful logs:

docker compose logs -f --tail=120 auth-service
docker compose logs -f --tail=120 course-service
docker compose logs -f --tail=120 recommendation-service


Port in use? Kill any local node on 4000/4001/4002:

# macOS:
sudo lsof -nP -iTCP:4000,4001,4002 -sTCP:LISTEN
kill -9 <PID>

5) Seed & Test — Courses (CSV → MongoDB → ES)
5.1 Upload CSV

Place a CSV (e.g., sample-courses.csv) in mern_assignment_fixed/, then:

curl -i -F "file=@./sample-courses.csv" http://localhost:4002/courses/upload


Expected: {"msg":"Uploaded & indexed","inserted":<n>}

5.2 Search
curl -s "http://localhost:4002/courses/search?q=react"


(Results are cached in Redis for subsequent identical queries.)

6) Admin Auth (JWT)
6.1 Sign up admin
curl -s -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

6.2 Login to get token
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
| sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
echo "TOKEN length: ${#TOKEN}"

6.3 Protected route
curl -i http://localhost:4000/auth/protected \
  -H "Authorization: Bearer $TOKEN"
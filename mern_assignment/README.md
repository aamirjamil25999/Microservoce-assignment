
# MERN Assignment — Single Folder (Frontend + Backend)

This folder contains:
- **project-root/** — backend microservices (auth, course, recommendation)
- **frontend/** — your provided frontend (with integration kit copied)
- **docker-compose.yml** — infra + services
- **README.md** — run steps
- **sample-courses.csv**

## Run Backend Infra + Services
```bash
docker compose up --build
```
- Auth: http://localhost:4000/auth
- Courses: http://localhost:4002/courses
- Recommendations: http://localhost:4001/recommendations

> If Mongo Atlas password contains `@`, URL-encode as `%40` if you see connection issues.

Seed admin:
```bash
curl -X POST http://localhost:4000/auth/signup   -H "Content-Type: application/json"   -d '{"username":"admin","password":"admin123"}'
```

Upload demo CSV:
```bash
curl -F "file=@./sample-courses.csv" http://localhost:4002/courses/upload
```

## Configure Frontend
Frontend `.env` file (already placed):
```
VITE_AUTH_BASE=http://localhost:4000/auth
VITE_COURSE_BASE=http://localhost:4002/courses
VITE_RECO_BASE=http://localhost:4001/recommendations
```

### Start Frontend
Use the scripts defined in your frontend's `package.json` (e.g., Vite/CRA/Next).
Typical Vite dev:
```bash
cd frontend
npm install
npm run dev
```
Open the shown URL (e.g., http://localhost:5173).

### How frontend is integrated
`frontend/src/api` and `frontend/src/hooks` provide ready-made clients and hooks.
Use them in your pages/components to call login/search/recommendations.

## Notes
- CORS is enabled in all services.
- Elasticsearch and Redis must be up before searching.
- Kibana is available at http://localhost:5601 (optional).

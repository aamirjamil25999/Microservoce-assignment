# Backend Integration Applied

- Framework detected: **next**
- Env file created: **.env.local**
```
NEXT_PUBLIC_AUTH_BASE=http://localhost:4000/auth
NEXT_PUBLIC_COURSE_BASE=http://localhost:4002/courses
NEXT_PUBLIC_RECO_BASE=http://localhost:4001/recommendations
```
- Modules created:
  - `src/api/client.js`
  - `src/api/auth.js`
  - `src/api/courses.js`
  - `src/api/recommendations.js`
- Replaced common API paths → backend on 4000/4001/4002.

> If login/search UI uses a different place, just import from `src/api/*`.

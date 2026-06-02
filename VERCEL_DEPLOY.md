# Deploy on Vercel (frontend + backend, one project)

## Project settings (Vercel dashboard)

| Setting | Value |
|---------|--------|
| **Root Directory** | `.` (repo root, not `frontend` only) |
| **Framework Preset** | Other (or leave auto — `vercel.json` controls build) |
| **Node.js Version** | **20.x** (recommended; avoid 24.x unless tested) |

Do **not** use `experimentalServices` in `vercel.json` — that causes **"Invalid vercel.json"**.

## 1. Push to GitHub

Root `vercel.json` + `api/index.js` deploy:
- Static UI from `frontend/dist`
- API from `api/index.js` → Express `backend/app.js`

## 2. Environment variables (Production)

| Variable | Example |
|----------|---------|
| `MONGO_URI` | `mongodb+srv://...@cluster.mongodb.net/student-management` |
| `JWT_SECRET` | long random secret |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | `https://stdmgni.vercel.app` |
| `CLIENT_URL` | `https://stdmgni.vercel.app` |
| `VITE_API_URL` | *(leave empty)* |

**Important:** Use **MongoDB Atlas**, not `localhost`.

Redeploy after changing env vars (frontend vars need a rebuild).

## 3. URLs after deploy

| What | URL |
|------|-----|
| App | `https://your-app.vercel.app/` |
| API health | `https://your-app.vercel.app/api/health` |

## 5. Limitations on Vercel

- **Socket.io** (live notice toasts): works locally only; not reliable on Vercel serverless.
- **File uploads** (`uploads/` folder): ephemeral on serverless; use S3/Cloudinary for production uploads.
- **Seed script:** run locally with Atlas `MONGO_URI`: `cd backend && npm run seed`

## 6. Local development (unchanged)

```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

Frontend `.env` locally:

```
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

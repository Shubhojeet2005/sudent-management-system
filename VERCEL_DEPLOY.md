# Deploy on Vercel (frontend + backend)

## Why you saw that message

Vercel detected **two services** in your repo (`frontend` + `backend`) and requires a root **`vercel.json`** with `experimentalServices`. That file is now in the project root.

## 1. Push to GitHub

Commit and push:

- `vercel.json` (root)
- `backend/app.js`, `backend/index.js`, updated `backend/server.js`
- `frontend/vercel.json`

## 2. Import project on Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
2. Vercel should detect **Frontend** (Vite) and **Backend** (Express).
3. Click **Refresh** if it still asks for `vercel.json`, then continue.

## 3. Environment variables (Project → Settings → Environment Variables)

Set for **Production** (and Preview if you want):

| Variable | Example | Service |
|----------|---------|---------|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/student-management` | Backend |
| `JWT_SECRET` | long random string | Backend |
| `NODE_ENV` | `production` | Backend |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | Backend |
| `CLIENT_URL` | `https://your-app.vercel.app` | Backend |
| `VITE_API_URL` | `/_/backend` | Frontend (monorepo, same project) |

**Important:** Use **MongoDB Atlas**, not `localhost`. Local MongoDB will not work on Vercel.

After the first deploy, replace `your-app.vercel.app` with your real Vercel URL in `CORS_ORIGINS` and `CLIENT_URL`.

### Frontend-only project (e.g. `vercel-frontend-qpf6.vercel.app`)

If you deployed **only** the `frontend/` folder, the app must **not** call `localhost:5001`. In that Vercel project set:

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://YOUR-BACKEND-APP.vercel.app/_/backend` |

Then **Redeploy** the frontend (env vars are baked in at build time).

On the **backend** Vercel project set:

| Variable | Value |
|----------|--------|
| `CORS_ORIGINS` | `https://vercel-frontend-qpf6.vercel.app` |

(Use your real frontend URL.)

## 4. URLs after deploy

| What | URL |
|------|-----|
| App (UI) | `https://your-app.vercel.app/` |
| API health | `https://your-app.vercel.app/_/backend/api/health` |

`VITE_API_URL=/_/backend` keeps the frontend on the same domain (no extra CORS setup).

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

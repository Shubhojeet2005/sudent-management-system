# Student Management System — Backend API

REST API for a university student management portal (MMMUT-oriented). Built with **Node.js**, **Express**, **MongoDB**, **JWT**, **Socket.IO**, and **PDF/Email** utilities.

## Features

- JWT authentication with role-based access (`admin`, `faculty`, `student`)
- CRUD for students, faculty, courses, results, notices, attendance
- File uploads (profile photos, notice attachments, syllabi)
- PDF generation (results, attendance summary)
- Email notifications (welcome, password reset, result published)
- Real-time notices via Socket.IO (`notice:new` event)
- Pagination, search filters, rate limiting, Helmet security headers

## Quick Start

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

API base URL: `http://localhost:5001/api`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `PORT` | No | Default `5001` |
| `CLIENT_URL` | No | Frontend URL for password reset links |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
| `SMTP_*` | No | Email configuration |

## API Overview

### Auth (`/api/auth`)
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/register` | Public (creates `student` role) |
| POST | `/login` | Public |
| POST | `/forgot-password` | Public |
| POST | `/reset-password` | Public |
| GET | `/me` | Private |
| PUT | `/me` | Private |
| PUT | `/password` | Private |
| POST | `/profile-photo` | Private (multipart) |

### Students (`/api/students`)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/me` | Student |
| GET | `/` | Admin, Faculty |
| POST | `/` | Admin |
| GET/PUT/DELETE | `/:id` | Admin (GET: own profile for students) |

### Results (`/api/results`)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/` | All (students see published only) |
| POST | `/` | Admin, Faculty |
| POST | `/:id/publish` | Admin, Faculty |
| GET | `/:id/pdf` | All authorized |

### Notices (`/api/notices`)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/` | Public |
| POST | `/` | Admin, Faculty |
| POST | `/upload` | Admin, Faculty |

### Attendance (`/api/attendance`)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/` | All (students: own records) |
| POST | `/` | Admin, Faculty |
| GET | `/summary/:studentId/:courseId` | Private |

## Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

Paginated lists:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": { "total": 0, "page": 1, "limit": 10, "pages": 1 }
  }
}
```

## Socket.IO

Connect to the same host/port. Listen for:

- `notice:new` — emitted when a notice is created

## Authorization Header

```
Authorization: Bearer <token>
```

## Project Structure

```
backend/
├── config/       # DB, env, socket
├── controllers/  # Route handlers
├── helpers/      # Shared lookups
├── middleware/   # Auth, errors, uploads, rate limit
├── models/       # Mongoose schemas
├── routes/       # Express routers
├── utils/        # Token, email, PDF, pagination
└── uploads/      # Generated/stored files
```

## Scripts

- `npm start` — production
- `npm run dev` — development with auto-reload (`--watch`)

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { validateEnv, env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
	cors({
		origin(origin, callback) {
			if (!origin) return callback(null, true);
			if (env.corsOrigins.includes(origin)) return callback(null, true);
			try {
				const host = new URL(origin).hostname;
				if (host.endsWith('.vercel.app')) return callback(null, true);
			} catch {
				/* ignore */
			}
			callback(new Error(`CORS blocked for origin: ${origin}`));
		},
		credentials: true,
	})
);

if (env.nodeEnv === 'development') {
	app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/** Connect MongoDB once per serverless instance (no-op if already connected) */
app.use(async (req, res, next) => {
	if (mongoose.connection.readyState === 1) {
		return next();
	}
	try {
		validateEnv();
		await connectDB();
		next();
	} catch (err) {
		res.status(503).json({
			success: false,
			message: err.message || 'Database unavailable',
		});
	}
});

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
	res.json({
		success: true,
		data: {
			status: 'ok',
			environment: env.nodeEnv,
			timestamp: new Date().toISOString(),
		},
		message: 'Student Management API is running',
	});
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

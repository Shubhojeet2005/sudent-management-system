import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server as IOServer } from 'socket.io';
import connectDB from './config/db.js';
import { validateEnv, env } from './config/env.js';
import { setIO } from './config/socket.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

dotenv.config();
validateEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
	cors({
		origin: env.corsOrigins,
		credentials: true,
	})
);

if (env.nodeEnv === 'development') {
	app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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

const PORT = env.port;

const startServer = async () => {
	try {
		await connectDB();

		const server = http.createServer(app);
		const io = new IOServer(server, {
			cors: { origin: env.corsOrigins, credentials: true },
		});

		setIO(io);

		io.on('connection', (socket) => {
			socket.join('notices');
			socket.on('disconnect', () => {});
		});

		server.listen(PORT, () => {
			console.log(`API: http://localhost:${PORT}/api`);
			console.log(`Health: http://localhost:${PORT}/api/health`);
			console.log(`Environment: ${env.nodeEnv}`);
		});

		const shutdown = (signal) => {
			console.log(`${signal} received. Shutting down gracefully...`);
			server.close(() => process.exit(0));
		};

		process.on('SIGTERM', () => shutdown('SIGTERM'));
		process.on('SIGINT', () => shutdown('SIGINT'));

		return { app, io, server };
	} catch (err) {
		console.error('Backend startup failed:', err.message);
		process.exit(1);
	}
};

startServer();

import http from 'http';
import { Server as IOServer } from 'socket.io';
import connectDB from './config/db.js';
import { validateEnv, env } from './config/env.js';
import { setIO } from './config/socket.js';
import app from './app.js';

const PORT = env.port;

const startServer = async () => {
	try {
		validateEnv();
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

		server.on('error', (err) => {
			if (err.code === 'EADDRINUSE') {
				console.error(`\nPort ${PORT} is already in use. Another server is still running.`);
				console.error('Fix: run "npm run stop" in the backend folder, then "npm start" again.\n');
			} else {
				console.error('Server error:', err);
			}
			process.exit(1);
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
	} catch (err) {
		console.error('Backend startup failed:', err.message);
		process.exit(1);
	}
};

startServer();

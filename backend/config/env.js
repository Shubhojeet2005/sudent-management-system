import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env wins over a stray shell PORT=3000 (Vite uses 3000)
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const required = ['MONGO_URI', 'JWT_SECRET'];

export const validateEnv = () => {
	const missing = required.filter((key) => !process.env[key]);
	if (missing.length) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}
};

const parsedPort = Number(process.env.PORT);
/** Never bind API to 3000 — that is the Vite frontend port */
const port = parsedPort && parsedPort !== 3000 ? parsedPort : 5001;

const corsFromEnv = process.env.CORS_ORIGINS
	? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
	: ['http://localhost:3000'];

if (process.env.CLIENT_URL && !corsFromEnv.includes(process.env.CLIENT_URL)) {
	corsFromEnv.push(process.env.CLIENT_URL);
}

if (process.env.VERCEL_URL) {
	const vercelOrigin = `https://${process.env.VERCEL_URL}`;
	if (!corsFromEnv.includes(vercelOrigin)) {
		corsFromEnv.push(vercelOrigin);
	}
}

export const env = {
	nodeEnv: process.env.NODE_ENV || 'development',
	port,
	mongoUri: process.env.MONGO_URI,
	jwtSecret: process.env.JWT_SECRET,
	clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
	corsOrigins: corsFromEnv,
};

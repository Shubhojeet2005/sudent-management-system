const required = ['MONGO_URI', 'JWT_SECRET'];

export const validateEnv = () => {
	const missing = required.filter((key) => !process.env[key]);
	if (missing.length) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}
};

export const env = {
	nodeEnv: process.env.NODE_ENV || 'development',
	port: Number(process.env.PORT) || 5001,
	mongoUri: process.env.MONGO_URI,
	jwtSecret: process.env.JWT_SECRET,
	clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
	corsOrigins: process.env.CORS_ORIGINS
		? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
		: ['http://localhost:3000'],
};

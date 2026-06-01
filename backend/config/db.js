import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
	const uri = process.env.MONGO_URI;
	if (!uri) {
		throw new Error('MONGO_URI is not defined in environment variables');
	}

	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		mongoose.set('strictQuery', true);
		cached.promise = mongoose.connect(uri).then((conn) => {
			console.log(`MongoDB connected: ${conn.connection.host}`);
			return conn;
		});
	}

	try {
		cached.conn = await cached.promise;
	} catch (err) {
		cached.promise = null;
		console.error('Error connecting to MongoDB:', err.message);
		throw err;
	}

	return cached.conn;
}

export default connectDB;

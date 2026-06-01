import mongoose from 'mongoose';

async function connectDB() {
	const uri = process.env.MONGO_URI;
	if (!uri) {
		throw new Error('MONGO_URI is not defined in environment variables');
	}

	mongoose.set('strictQuery', true);

	try {
		const conn = await mongoose.connect(uri);
		console.log(`MongoDB connected: ${conn.connection.host}`);
	} catch (err) {
		console.error('Error connecting to MongoDB:', err.message);
		throw err;
	}
}

export default connectDB;

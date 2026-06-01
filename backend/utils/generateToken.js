import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET is not defined in environment variables');
	}
	return secret;
};

/** Sign a JWT for an authenticated user (default 30 days) */
export const generateToken = (userId, expiresIn = '30d') => {
	return jwt.sign({ id: userId }, getJwtSecret(), { expiresIn });
};

/** Verify JWT and return decoded payload */
export const verifyToken = (token) => {
	return jwt.verify(token, getJwtSecret());
};

/** Random token for password reset (stored hashed in DB) */
export const generateResetToken = () => {
	const resetToken = crypto.randomBytes(32).toString('hex');
	const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	const expire = Date.now() + 10 * 60 * 1000; // 10 minutes

	return { resetToken, hashedToken, expire };
};

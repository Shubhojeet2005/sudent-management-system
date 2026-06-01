import User from '../models/User.js';
import { verifyToken } from '../utils/generateToken.js';
import { asyncHandler } from './errorMiddleware.js';

export const protect = asyncHandler(async (req, res, next) => {
	let token;

	if (req.headers.authorization?.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		res.status(401);
		throw new Error('Not authorized, no token');
	}

	const decoded = verifyToken(token);
	const user = await User.findById(decoded.id).select('-password');

	if (!user) {
		res.status(401);
		throw new Error('Not authorized, user not found');
	}

	if (!user.isActive) {
		res.status(403);
		throw new Error('Account is deactivated');
	}

	req.user = user;
	next();
});

export const authorize =
	(...roles) =>
	(req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) {
			res.status(403);
			return next(new Error('Not authorized for this action'));
		}
		next();
	};

/** Attach user when token is valid; continue without user if missing/invalid */
export const optionalProtect = asyncHandler(async (req, res, next) => {
	if (!req.headers.authorization?.startsWith('Bearer')) {
		return next();
	}

	try {
		const token = req.headers.authorization.split(' ')[1];
		const decoded = verifyToken(token);
		req.user = await User.findById(decoded.id).select('-password');
	} catch {
		req.user = null;
	}
	next();
});

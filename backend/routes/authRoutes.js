import express from 'express';
import {
	registerUser,
	registerStudent,
	loginUser,
	loginFaculty,
	getMe,
	updateProfile,
	updatePassword,
	forgotPassword,
	resetPassword,
	uploadProfilePhoto,
} from '../controllers/authController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { uploadProfile, handleUpload } from '../middleware/uploadMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, optionalProtect, registerUser);
router.post('/register/student', authLimiter, optionalProtect, registerStudent);
router.post('/login', authLimiter, loginUser);
router.post('/login/faculty', authLimiter, loginFaculty);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/profile-photo', protect, handleUpload(uploadProfile), uploadProfilePhoto);

export default router;

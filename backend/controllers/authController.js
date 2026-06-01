import crypto from 'crypto';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import { pickStudentProfile, validateStudentProfile } from '../helpers/studentValidation.js';
import { resolveFacultyUser } from '../helpers/profileHelper.js';
import { generateToken, generateResetToken } from '../utils/generateToken.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/sendEmail.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

const formatUser = (user) => ({
	_id: user._id,
	name: user.name,
	email: user.email,
	role: user.role,
	phone: user.phone,
	profilePhoto: user.profilePhoto,
});

const tokenResponse = (user) => ({
	...formatUser(user),
	token: generateToken(user._id),
});

export const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password, phone, profilePhoto } = req.body;
	let { role } = req.body;

	if (!name || !email || !password) {
		res.status(400);
		throw new Error('Name, email, and password are required');
	}

	// Public registration is student-only; admin sets roles via protected route
	if (req.user?.role === 'admin') {
		role = role || 'student';
	} else {
		role = 'student';
	}

	const existingUser = await User.findOne({ email });
	if (existingUser) {
		res.status(400);
		throw new Error('User already exists with this email');
	}

	const user = await User.create({ name, email, password, role, phone, profilePhoto });

	try {
		await sendWelcomeEmail(user);
	} catch {
		// Email is optional when SMTP is not configured
	}

	sendSuccess(res, 201, tokenResponse(user), 'Registration successful');
});

/** Public (or admin) registration: user account + student profile in one step */
export const registerStudent = asyncHandler(async (req, res) => {
	const { name, email, password, phone, profilePhoto } = req.body;
	const profile = pickStudentProfile(req.body);
	const errors = validateStudentProfile(profile);

	if (!name || !email || !password) {
		errors.push('Name, email, and password are required');
	}
	if (password && password.length < 6) {
		errors.push('Password must be at least 6 characters');
	}
	if (errors.length) {
		res.status(400);
		throw new Error(errors.join('. '));
	}

	const existingUser = await User.findOne({ email });
	if (existingUser) {
		res.status(400);
		throw new Error('User already exists with this email');
	}

	const existingEnrollment = await Student.findOne({ enrollmentNo: profile.enrollmentNo });
	if (existingEnrollment) {
		res.status(400);
		throw new Error('Enrollment number is already registered');
	}

	const user = await User.create({
		name,
		email,
		password,
		phone,
		profilePhoto,
		role: 'student',
	});

	let student;
	try {
		student = await Student.create({ user: user._id, ...profile });
	} catch (err) {
		await User.findByIdAndDelete(user._id);
		throw err;
	}

	try {
		await sendWelcomeEmail(user);
	} catch {
		/* optional */
	}

	const studentSummary = {
		_id: student._id,
		enrollmentNo: student.enrollmentNo,
		rollNo: student.rollNo,
		branch: student.branch,
		programme: student.programme,
		semester: student.semester,
		batch: student.batch,
		section: student.section,
		admissionYear: student.admissionYear,
	};

	const isAdmin = req.user?.role === 'admin';
	if (isAdmin) {
		sendSuccess(
			res,
			201,
			{ user: formatUser(user), student: studentSummary },
			'Student registered successfully'
		);
		return;
	}

	sendSuccess(
		res,
		201,
		{ ...tokenResponse(user), student: studentSummary },
		'Registration successful'
	);
});

export const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		res.status(400);
		throw new Error('Email and password are required');
	}

	const user = await User.findOne({ email }).select('+password');
	if (!user || !(await user.matchPassword(password))) {
		res.status(401);
		throw new Error('Invalid email or password');
	}

	if (!user.isActive) {
		res.status(403);
		throw new Error('Account is deactivated');
	}

	user.lastLogin = new Date();
	await user.save();

	sendSuccess(res, 200, tokenResponse(user), 'Login successful');
});

/** Faculty login: employeeId + department (used as credentials) */
export const loginFaculty = asyncHandler(async (req, res) => {
	const { employeeId, department } = req.body;

	if (!employeeId || !department) {
		res.status(400);
		throw new Error('Employee ID and department are required');
	}

	const faculty = await Faculty.findOne({
		employeeId: employeeId.trim().toUpperCase(),
		isActive: true,
	});

	if (!faculty || faculty.department !== department.trim()) {
		res.status(401);
		throw new Error('Invalid employee ID or department');
	}

	const user = await resolveFacultyUser(faculty);

	user.lastLogin = new Date();
	await user.save();

	sendSuccess(
		res,
		200,
		{
			...tokenResponse(user),
			faculty: {
				_id: faculty._id,
				employeeId: faculty.employeeId,
				department: faculty.department,
				designation: faculty.designation,
				name: faculty.name || user.name,
			},
		},
		'Faculty login successful'
	);
});

export const getMe = asyncHandler(async (req, res) => {
	const payload = formatUser(req.user);

	if (req.user.role === 'faculty') {
		const faculty = await Faculty.findOne({ user: req.user._id });
		if (faculty) {
			payload.faculty = {
				_id: faculty._id,
				employeeId: faculty.employeeId,
				department: faculty.department,
				designation: faculty.designation,
				name: faculty.name || req.user.name,
			};
		}
	}

	if (req.user.role === 'student') {
		const student = await Student.findOne({ user: req.user._id });
		if (student) {
			payload.student = {
				_id: student._id,
				enrollmentNo: student.enrollmentNo,
				rollNo: student.rollNo,
				branch: student.branch,
				programme: student.programme,
				semester: student.semester,
				batch: student.batch,
				section: student.section,
				admissionYear: student.admissionYear,
				cgpa: student.cgpa,
			};
		}
	}

	sendSuccess(res, 200, payload);
});

export const updateProfile = asyncHandler(async (req, res) => {
	const { name, phone, profilePhoto } = req.body;
	const user = await User.findByIdAndUpdate(
		req.user._id,
		{ name, phone, profilePhoto },
		{ new: true, runValidators: true }
	).select('-password');

	sendSuccess(res, 200, formatUser(user), 'Profile updated');
});

export const updatePassword = asyncHandler(async (req, res) => {
	const { currentPassword, newPassword } = req.body;

	if (!currentPassword || !newPassword) {
		res.status(400);
		throw new Error('Current and new password are required');
	}

	const user = await User.findById(req.user._id).select('+password');
	if (!(await user.matchPassword(currentPassword))) {
		res.status(401);
		throw new Error('Current password is incorrect');
	}

	user.password = newPassword;
	await user.save();

	sendSuccess(res, 200, null, 'Password updated successfully');
});

export const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });

	if (!user) {
		return sendSuccess(res, 200, null, 'If that email exists, a reset link was sent');
	}

	const { resetToken, hashedToken, expire } = generateResetToken();
	user.resetPasswordToken = hashedToken;
	user.resetPasswordExpire = expire;
	await user.save();

	const resetUrl = `${env.clientUrl}/reset-password/${resetToken}`;

	try {
		await sendPasswordResetEmail(user, resetUrl);
	} catch {
		res.status(503);
		throw new Error('Email service unavailable. Configure SMTP in .env');
	}

	sendSuccess(res, 200, null, 'If that email exists, a reset link was sent');
});

export const resetPassword = asyncHandler(async (req, res) => {
	const { token, password } = req.body;

	if (!token || !password) {
		res.status(400);
		throw new Error('Token and new password are required');
	}

	const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

	const user = await User.findOne({
		resetPasswordToken: tokenHash,
		resetPasswordExpire: { $gt: Date.now() },
	}).select('+password');

	if (!user) {
		res.status(400);
		throw new Error('Invalid or expired reset token');
	}

	user.password = password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save();

	sendSuccess(res, 200, tokenResponse(user), 'Password reset successful');
});

export const uploadProfilePhoto = asyncHandler(async (req, res) => {
	if (!req.file) {
		res.status(400);
		throw new Error('No file uploaded');
	}

	const { fileUrl } = await import('../middleware/uploadMiddleware.js');
	const photoUrl = fileUrl(req, 'profiles', req.file.filename);

	const user = await User.findByIdAndUpdate(
		req.user._id,
		{ profilePhoto: photoUrl },
		{ new: true }
	).select('-password');

	sendSuccess(res, 200, { profilePhoto: user.profilePhoto }, 'Profile photo updated');
});

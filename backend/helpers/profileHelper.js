import crypto from 'crypto';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import User from '../models/User.js';

export const getStudentByUser = (userId) => Student.findOne({ user: userId });
export const getFacultyByUser = (userId) => Faculty.findOne({ user: userId });

/**
 * Ensure a faculties row has a valid users account for JWT auth.
 * Uses name/email/phone from the faculty document when present.
 */
export const resolveFacultyUser = async (faculty) => {
	let user = null;

	if (faculty.user) {
		user = await User.findById(faculty.user);
	}

	const facultyEmail =
		faculty.email?.toLowerCase()?.trim() ||
		`${faculty.employeeId.toLowerCase().replace(/[^a-z0-9]/g, '')}@faculty.mmmut.ac.in`;

	const facultyName =
		faculty.name?.trim() || `${faculty.designation || 'Faculty'} (${faculty.employeeId})`;

	if (!user && faculty.email) {
		user = await User.findOne({ email: faculty.email.toLowerCase().trim() });
	}

	if (!user) {
		const existingEmail = await User.findOne({ email: facultyEmail });
		if (existingEmail) {
			user = existingEmail;
		} else {
			user = await User.create({
				name: facultyName,
				email: facultyEmail,
				password: crypto.randomBytes(24).toString('hex'),
				role: 'faculty',
				phone: faculty.phone || '',
			});
		}
	}

	if (!user.isActive) {
		throw new Error('Account is deactivated');
	}

	user.role = 'faculty';
	if (faculty.name) user.name = faculty.name.trim();
	if (faculty.email) user.email = faculty.email.toLowerCase().trim();
	if (faculty.phone) user.phone = faculty.phone;
	await user.save();

	let facultyUpdated = false;
	if (!faculty.user || faculty.user.toString() !== user._id.toString()) {
		faculty.user = user._id;
		facultyUpdated = true;
	}
	if (!faculty.name) {
		faculty.name = facultyName;
		facultyUpdated = true;
	}
	if (!faculty.email) {
		faculty.email = facultyEmail;
		facultyUpdated = true;
	}
	if (facultyUpdated) {
		await faculty.save();
	}

	return user;
};

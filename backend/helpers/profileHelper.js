import crypto from 'crypto';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import User from '../models/User.js';

const isValidObjectId = (id) =>
	Boolean(id && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id));

export const getStudentByUser = (userId) => Student.findOne({ user: userId });

/** Find faculty profile for logged-in user; auto-relink if user was created on first login */
export const getFacultyForUser = async (userId) => {
	if (!isValidObjectId(userId)) return null;

	let faculty = await Faculty.findOne({ user: userId });
	if (faculty) return faculty;

	const user = await User.findById(userId).select('email name');
	if (!user) return null;

	if (user.email) {
		const email = user.email.toLowerCase().trim();
		faculty = await Faculty.findOne({ email });
		if (!faculty) {
			const slug = email.split('@')[0].replace(/[^a-z0-9]/g, '');
			const candidates = await Faculty.find({ isActive: true });
			faculty = candidates.find(
				(f) => f.employeeId.toLowerCase().replace(/[^a-z0-9]/g, '') === slug
			);
		}
		if (faculty) {
			faculty.user = userId;
			await faculty.save();
			return faculty;
		}
	}

	return null;
};

/** @deprecated use getFacultyForUser */
export const getFacultyByUser = getFacultyForUser;

const buildFacultyEmail = (faculty) =>
	faculty.email?.toLowerCase()?.trim() ||
	`${faculty.employeeId.toLowerCase().replace(/[^a-z0-9]/g, '')}@faculty.mmmut.ac.in`;

const buildFacultyName = (faculty) =>
	faculty.name?.trim() || `${faculty.designation || 'Faculty'} (${faculty.employeeId})`;

/**
 * Ensure a faculties row has a valid users account for JWT auth.
 * Uses name/email/phone from the faculty document when present.
 */
export const resolveFacultyUser = async (faculty) => {
	let user = null;

	if (isValidObjectId(faculty.user)) {
		user = await User.findById(faculty.user);
	} else if (faculty.user) {
		faculty.user = null;
	}

	const facultyEmail = buildFacultyEmail(faculty);
	const facultyName = buildFacultyName(faculty);

	if (!user && faculty.email?.trim()) {
		user = await User.findOne({ email: faculty.email.toLowerCase().trim() });
	}

	if (!user) {
		user = await User.findOne({ email: facultyEmail });
	}

	if (!user) {
		try {
			user = await User.create({
				name: facultyName,
				email: facultyEmail,
				password: crypto.randomBytes(24).toString('hex'),
				role: 'faculty',
				phone: faculty.phone || '',
			});
		} catch (err) {
			if (err.code === 11000) {
				user = await User.findOne({ email: facultyEmail });
			}
			if (!user) throw err;
		}
	}

	if (!user.isActive) {
		throw new Error('Account is deactivated');
	}

	user.role = 'faculty';
	if (faculty.name?.trim()) user.name = faculty.name.trim();
	if (faculty.phone) user.phone = faculty.phone;

	const emailToUse = faculty.email?.trim() ? faculty.email.toLowerCase().trim() : facultyEmail;
	if (user.email !== emailToUse) {
		const taken = await User.findOne({ email: emailToUse, _id: { $ne: user._id } });
		if (!taken) user.email = emailToUse;
	}

	await user.save();

	if (!isValidObjectId(faculty.user) || faculty.user.toString() !== user._id.toString()) {
		faculty.user = user._id;
	}
	if (!faculty.name?.trim()) faculty.name = facultyName;
	if (!faculty.email?.trim()) faculty.email = facultyEmail;

	try {
		await faculty.save();
	} catch (err) {
		if (err.name === 'ValidationError') {
			await Faculty.updateOne(
				{ _id: faculty._id },
				{
					$set: {
						user: user._id,
						name: faculty.name || facultyName,
						email: faculty.email || facultyEmail,
					},
				}
			);
		} else {
			throw err;
		}
	}

	return user;
};

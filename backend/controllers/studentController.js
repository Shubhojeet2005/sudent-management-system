import Student from '../models/Student.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { getStudentByUser, getFacultyForUser } from '../helpers/profileHelper.js';
import { pickStudentProfile, validateStudentProfile } from '../helpers/studentValidation.js';
import { buildFacultyStudentQuery, facultyCanViewStudent } from '../helpers/facultyStudents.js';

const populateOpts = [
	{ path: 'user', select: 'name email phone profilePhoto role' },
	{ path: 'courses', select: 'courseCode title semester credits' },
];

export const studentList = asyncHandler(async (req, res) => {
	const { page, limit, skip } = getPagination(req.query);
	const filter = { isActive: { $ne: false } };

	if (req.query.branch) filter.branch = req.query.branch;
	if (req.query.semester) filter.semester = Number(req.query.semester);

	let searchOr;
	if (req.query.search) {
		searchOr = [
			{ enrollmentNo: { $regex: req.query.search, $options: 'i' } },
			{ rollNo: { $regex: req.query.search, $options: 'i' } },
		];
	}

	if (req.user.role === 'faculty' && !req.query.branch) {
		const profile = await getFacultyForUser(req.user._id);
		const facultyScope = await buildFacultyStudentQuery(profile);
		if (facultyScope) {
			filter.$and = [{ ...(searchOr ? { $or: searchOr } : {}) }, facultyScope].filter(
				(c) => Object.keys(c).length > 0
			);
			if (filter.$and.length === 0) delete filter.$and;
		} else if (searchOr) {
			filter.$or = searchOr;
		}
	} else if (searchOr) {
		filter.$or = searchOr;
	}

	const [students, total] = await Promise.all([
		Student.find(filter).populate(populateOpts).sort({ createdAt: -1 }).skip(skip).limit(limit),
		Student.countDocuments(filter),
	]);

	sendPaginated(res, students, buildPaginationMeta(total, page, limit));
});

export const getStudent = asyncHandler(async (req, res) => {
	const student = await Student.findById(req.params.id).populate(populateOpts);
	if (!student) {
		res.status(404);
		throw new Error('Student not found');
	}

	if (req.user.role === 'student') {
		const own = await getStudentByUser(req.user._id);
		if (!own || own._id.toString() !== student._id.toString()) {
			res.status(403);
			throw new Error('Not authorized to view this profile');
		}
	}

	if (req.user.role === 'faculty') {
		const profile = await getFacultyForUser(req.user._id);
		const allowed = await facultyCanViewStudent(profile, student._id);
		if (!allowed) {
			res.status(403);
			throw new Error(
				'This student is outside your department or courses. You can only view students in your branch or enrolled in your courses.'
			);
		}
	}

	sendSuccess(res, 200, student);
});

export const getMyStudentProfile = asyncHandler(async (req, res) => {
	const student = await getStudentByUser(req.user._id);
	if (!student) {
		res.status(404);
		throw new Error('Student profile not linked to this account');
	}
	await student.populate(populateOpts);
	sendSuccess(res, 200, student);
});

export const createStudent = asyncHandler(async (req, res) => {
	const { user: userId } = req.body;
	if (!userId) {
		res.status(400);
		throw new Error('User id is required to link student profile');
	}

	const profile = pickStudentProfile(req.body);
	const errors = validateStudentProfile(profile);
	if (errors.length) {
		res.status(400);
		throw new Error(errors.join('. '));
	}

	const existingEnrollment = await Student.findOne({ enrollmentNo: profile.enrollmentNo });
	if (existingEnrollment) {
		res.status(400);
		throw new Error('Enrollment number is already registered');
	}

	const student = await Student.create({ user: userId, ...profile });
	await student.populate(populateOpts);
	sendSuccess(res, 201, student, 'Student created');
});

export const updateStudent = asyncHandler(async (req, res) => {
	const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	}).populate(populateOpts);

	if (!student) {
		res.status(404);
		throw new Error('Student not found');
	}

	sendSuccess(res, 200, student, 'Student updated');
});

export const deleteStudent = asyncHandler(async (req, res) => {
	const student = await Student.findByIdAndDelete(req.params.id);
	if (!student) {
		res.status(404);
		throw new Error('Student not found');
	}
	sendSuccess(res, 200, null, 'Student deleted');
});

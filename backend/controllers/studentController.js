import Student from '../models/Student.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { getStudentByUser } from '../helpers/profileHelper.js';

const populateOpts = [
	{ path: 'user', select: 'name email phone profilePhoto role' },
	{ path: 'courses', select: 'courseCode title semester credits' },
];

export const studentList = asyncHandler(async (req, res) => {
	const { page, limit, skip } = getPagination(req.query);
	const filter = {};

	if (req.query.branch) filter.branch = req.query.branch;
	if (req.query.semester) filter.semester = Number(req.query.semester);
	if (req.query.search) {
		filter.$or = [
			{ enrollmentNo: { $regex: req.query.search, $options: 'i' } },
			{ rollNo: { $regex: req.query.search, $options: 'i' } },
		];
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
	const student = await Student.create(req.body);
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

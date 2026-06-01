import Course from '../models/Course.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { getFacultyByUser } from '../helpers/profileHelper.js';

const populateOpts = [
	{ path: 'faculty', select: 'employeeId department designation' },
	{ path: 'enrolledStudents', select: 'enrollmentNo rollNo branch semester' },
];

export const courseList = asyncHandler(async (req, res) => {
	const { page, limit, skip } = getPagination(req.query);
	const filter = { isActive: true };

	if (req.query.branch) filter.branch = req.query.branch;
	if (req.query.semester) filter.semester = Number(req.query.semester);
	if (req.query.academicYear) filter.academicYear = req.query.academicYear;

	if (req.user.role === 'faculty') {
		const profile = await getFacultyByUser(req.user._id);
		if (profile) filter.faculty = profile._id;
	}

	const [courses, total] = await Promise.all([
		Course.find(filter).populate(populateOpts).sort({ semester: 1, courseCode: 1 }).skip(skip).limit(limit),
		Course.countDocuments(filter),
	]);

	sendPaginated(res, courses, buildPaginationMeta(total, page, limit));
});

export const getCourse = asyncHandler(async (req, res) => {
	const course = await Course.findById(req.params.id).populate(populateOpts);
	if (!course) {
		res.status(404);
		throw new Error('Course not found');
	}
	sendSuccess(res, 200, course);
});

export const createCourse = asyncHandler(async (req, res) => {
	const course = await Course.create(req.body);
	await course.populate(populateOpts);
	sendSuccess(res, 201, course, 'Course created');
});

export const updateCourse = asyncHandler(async (req, res) => {
	const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	}).populate(populateOpts);

	if (!course) {
		res.status(404);
		throw new Error('Course not found');
	}

	sendSuccess(res, 200, course, 'Course updated');
});

export const deleteCourse = asyncHandler(async (req, res) => {
	const course = await Course.findByIdAndUpdate(
		req.params.id,
		{ isActive: false },
		{ new: true }
	);

	if (!course) {
		res.status(404);
		throw new Error('Course not found');
	}

	sendSuccess(res, 200, null, 'Course deactivated');
});

export const uploadSyllabusHandler = asyncHandler(async (req, res) => {
	if (!req.file) {
		res.status(400);
		throw new Error('No file uploaded');
	}

	const { fileUrl } = await import('../middleware/uploadMiddleware.js');
	sendSuccess(
		res,
		201,
		{ url: fileUrl(req, 'syllabus', req.file.filename), filename: req.file.filename },
		'Syllabus uploaded'
	);
});

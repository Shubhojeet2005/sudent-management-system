import Course from '../models/Course.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { getFacultyForUser } from '../helpers/profileHelper.js';

const populateOpts = [
	{ path: 'faculty', select: 'employeeId department designation' },
	{ path: 'enrolledStudents', select: 'enrollmentNo rollNo branch semester' },
];

/** Strip invalid faculty id; assign logged-in faculty profile when role is faculty */
const prepareCourseBody = async (req, body) => {
	const data = { ...body };

	if (!data.faculty || data.faculty === '') {
		delete data.faculty;
	}

	if (req.user.role === 'faculty') {
		const profile = await getFacultyForUser(req.user._id);
		if (!profile) {
			res.status(400);
			throw new Error('Faculty profile not found for this account');
		}
		data.faculty = profile._id;
	}

	return data;
};

export const courseList = asyncHandler(async (req, res) => {
	const { page, limit, skip } = getPagination(req.query);
	const filter = { isActive: true };

	if (req.query.branch) filter.branch = req.query.branch;
	if (req.query.semester) filter.semester = Number(req.query.semester);
	if (req.query.academicYear) filter.academicYear = req.query.academicYear;

	if (req.user.role === 'faculty') {
		const profile = await getFacultyForUser(req.user._id);
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
	const data = await prepareCourseBody(req, req.body);
	const course = await Course.create(data);
	await course.populate(populateOpts);
	sendSuccess(res, 201, course, 'Course created');
});

export const updateCourse = asyncHandler(async (req, res) => {
	const data = await prepareCourseBody(req, req.body);
	const course = await Course.findByIdAndUpdate(req.params.id, data, {
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

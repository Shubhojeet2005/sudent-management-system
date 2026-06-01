import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { getStudentByUser } from '../helpers/profileHelper.js';
import { generateAttendancePdf, pdfPublicPath } from '../utils/generatePdf.js';

export const markAttendance = asyncHandler(async (req, res) => {
	const { student, course, markedBy, date, status, remarks } = req.body;

	if (!student || !course || !markedBy || !date) {
		res.status(400);
		throw new Error('student, course, markedBy, and date are required');
	}

	const record = await Attendance.findOneAndUpdate(
		{ student, course, date: new Date(date) },
		{ student, course, markedBy, date: new Date(date), status, remarks },
		{ new: true, upsert: true, runValidators: true }
	)
		.populate('student', 'enrollmentNo rollNo')
		.populate('course', 'courseCode title')
		.populate('markedBy', 'employeeId department');

	sendSuccess(res, 201, record, 'Attendance saved');
});

export const getAttendanceRecords = asyncHandler(async (req, res) => {
	const { page, limit, skip } = getPagination(req.query);
	const filter = {};

	if (req.query.student) filter.student = req.query.student;
	if (req.query.course) filter.course = req.query.course;
	if (req.query.from || req.query.to) {
		filter.date = {};
		if (req.query.from) filter.date.$gte = new Date(req.query.from);
		if (req.query.to) filter.date.$lte = new Date(req.query.to);
	}

	if (req.user.role === 'student') {
		const profile = await getStudentByUser(req.user._id);
		if (!profile) {
			res.status(404);
			throw new Error('Student profile not found');
		}
		filter.student = profile._id;
	}

	const [records, total] = await Promise.all([
		Attendance.find(filter)
			.populate('student', 'enrollmentNo rollNo')
			.populate('course', 'courseCode title')
			.sort({ date: -1 })
			.skip(skip)
			.limit(limit),
		Attendance.countDocuments(filter),
	]);

	sendPaginated(res, records, buildPaginationMeta(total, page, limit));
});

export const getAttendance = asyncHandler(async (req, res) => {
	const { studentId, courseId } = req.params;

	if (req.user.role === 'student') {
		const profile = await getStudentByUser(req.user._id);
		if (!profile || profile._id.toString() !== studentId) {
			res.status(403);
			throw new Error('Not authorized');
		}
	}

	const summary = await Attendance.getSummary(studentId, courseId);
	sendSuccess(res, 200, { student: studentId, course: courseId, ...summary });
});

export const downloadAttendancePdf = asyncHandler(async (req, res) => {
	const { studentId, courseId } = req.params;

	const [student, course] = await Promise.all([
		Student.findById(studentId).populate('user', 'name email'),
		Course.findById(courseId),
	]);

	if (!student || !course) {
		res.status(404);
		throw new Error('Student or course not found');
	}

	const summary = await Attendance.getSummary(studentId, courseId);
	const { filename } = await generateAttendancePdf({ student, course, summary });

	sendSuccess(res, 200, { url: pdfPublicPath(filename), filename }, 'Attendance PDF generated');
});

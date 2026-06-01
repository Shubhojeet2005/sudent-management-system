import path from 'path';
import Result from '../models/Result.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { getStudentByUser } from '../helpers/profileHelper.js';
import { generateResultPdf, pdfPublicPath } from '../utils/generatePdf.js';
import { sendResultPublishedEmail } from '../utils/sendEmail.js';

const populateOpts = [
	{ path: 'student', select: 'enrollmentNo rollNo branch semester', populate: { path: 'user', select: 'name email' } },
	{ path: 'subjects.course', select: 'courseCode title credits' },
];

export const resultList = asyncHandler(async (req, res) => {
	const { page, limit, skip } = getPagination(req.query);
	const filter = {};

	if (req.query.student) filter.student = req.query.student;
	if (req.query.semester) filter.semester = Number(req.query.semester);
	if (req.query.academicYear) filter.academicYear = req.query.academicYear;
	if (req.query.published === 'true') filter.isPublished = true;

	if (req.user.role === 'student') {
		const profile = await getStudentByUser(req.user._id);
		if (!profile) {
			res.status(404);
			throw new Error('Student profile not found');
		}
		filter.student = profile._id;
		filter.isPublished = true;
	}

	const [results, total] = await Promise.all([
		Result.find(filter).populate(populateOpts).sort({ createdAt: -1 }).skip(skip).limit(limit),
		Result.countDocuments(filter),
	]);

	sendPaginated(res, results, buildPaginationMeta(total, page, limit));
});

export const getResult = asyncHandler(async (req, res) => {
	const result = await Result.findById(req.params.id).populate(populateOpts);
	if (!result) {
		res.status(404);
		throw new Error('Result not found');
	}

	if (req.user.role === 'student') {
		const profile = await getStudentByUser(req.user._id);
		if (!result.isPublished || result.student._id.toString() !== profile?._id.toString()) {
			res.status(403);
			throw new Error('Not authorized to view this result');
		}
	}

	sendSuccess(res, 200, result);
});

export const createResult = asyncHandler(async (req, res) => {
	const result = await Result.create(req.body);
	await result.populate(populateOpts);
	sendSuccess(res, 201, result, 'Result created');
});

export const updateResult = asyncHandler(async (req, res) => {
	const result = await Result.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	}).populate(populateOpts);

	if (!result) {
		res.status(404);
		throw new Error('Result not found');
	}

	sendSuccess(res, 200, result, 'Result updated');
});

export const publishResult = asyncHandler(async (req, res) => {
	const result = await Result.findByIdAndUpdate(
		req.params.id,
		{ isPublished: true, publishedAt: new Date() },
		{ new: true }
	).populate(populateOpts);

	if (!result) {
		res.status(404);
		throw new Error('Result not found');
	}

	const userId = result.student?.user?._id || result.student?.user;
	const studentUser = userId ? await User.findById(userId) : null;
	if (studentUser) {
		try {
			await sendResultPublishedEmail(studentUser, result);
		} catch {
			// SMTP optional
		}
	}

	sendSuccess(res, 200, result, 'Result published');
});

export const downloadResultPdf = asyncHandler(async (req, res) => {
	const result = await Result.findById(req.params.id).populate(populateOpts);
	if (!result) {
		res.status(404);
		throw new Error('Result not found');
	}

	if (req.user.role === 'student') {
		const profile = await getStudentByUser(req.user._id);
		if (!result.isPublished || result.student._id.toString() !== profile?._id.toString()) {
			res.status(403);
			throw new Error('Not authorized');
		}
	}

	const { filepath, filename } = await generateResultPdf(result);
	const pdfUrl = pdfPublicPath(filename);

	sendSuccess(res, 200, { url: pdfUrl, filename, filepath: path.basename(filepath) }, 'PDF generated');
});

export const deleteResult = asyncHandler(async (req, res) => {
	const result = await Result.findByIdAndDelete(req.params.id);
	if (!result) {
		res.status(404);
		throw new Error('Result not found');
	}
	sendSuccess(res, 200, null, 'Result deleted');
});

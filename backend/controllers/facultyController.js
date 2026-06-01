import Faculty from '../models/Faculty.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';

const populateOpts = [
	{ path: 'user', select: 'name email phone profilePhoto role' },
	{ path: 'courses', select: 'courseCode title semester' },
];

export const facultyList = asyncHandler(async (req, res) => {
	const { page, limit, skip } = getPagination(req.query);
	const filter = {};

	if (req.query.department) filter.department = req.query.department;
	if (req.query.search) {
		filter.$or = [{ employeeId: { $regex: req.query.search, $options: 'i' } }];
	}

	const [faculty, total] = await Promise.all([
		Faculty.find(filter).populate(populateOpts).sort({ createdAt: -1 }).skip(skip).limit(limit),
		Faculty.countDocuments(filter),
	]);

	sendPaginated(res, faculty, buildPaginationMeta(total, page, limit));
});

export const getFaculty = asyncHandler(async (req, res) => {
	const faculty = await Faculty.findById(req.params.id).populate(populateOpts);
	if (!faculty) {
		res.status(404);
		throw new Error('Faculty not found');
	}
	sendSuccess(res, 200, faculty);
});

export const createFaculty = asyncHandler(async (req, res) => {
	const faculty = await Faculty.create(req.body);
	await faculty.populate(populateOpts);
	sendSuccess(res, 201, faculty, 'Faculty created');
});

export const updateFaculty = asyncHandler(async (req, res) => {
	const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	}).populate(populateOpts);

	if (!faculty) {
		res.status(404);
		throw new Error('Faculty not found');
	}

	sendSuccess(res, 200, faculty, 'Faculty updated');
});

export const deleteFaculty = asyncHandler(async (req, res) => {
	const faculty = await Faculty.findByIdAndDelete(req.params.id);
	if (!faculty) {
		res.status(404);
		throw new Error('Faculty not found');
	}
	sendSuccess(res, 200, null, 'Faculty deleted');
});

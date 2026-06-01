import Notice from '../models/Notice.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { emitNotice } from '../config/socket.js';

export const noticeList = asyncHandler(async (req, res) => {
	const { page, limit, skip } = getPagination(req.query);
	const now = new Date();
	const filter = {
		isActive: true,
		$or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
	};

	if (req.query.category) filter.category = req.query.category;
	if (req.query.audience) filter.targetAudience = req.query.audience;

	const [notices, total] = await Promise.all([
		Notice.find(filter)
			.populate('postedBy', 'name email role')
			.sort({ isPinned: -1, createdAt: -1 })
			.skip(skip)
			.limit(limit),
		Notice.countDocuments(filter),
	]);

	sendPaginated(res, notices, buildPaginationMeta(total, page, limit));
});

export const getNotice = asyncHandler(async (req, res) => {
	const notice = await Notice.findById(req.params.id).populate('postedBy', 'name email role');
	if (!notice || !notice.isActive) {
		res.status(404);
		throw new Error('Notice not found');
	}

	await notice.incrementViews();
	sendSuccess(res, 200, notice);
});

export const createNotice = asyncHandler(async (req, res) => {
	const notice = await Notice.create({
		...req.body,
		postedBy: req.user._id,
	});

	await notice.populate('postedBy', 'name email role');
	emitNotice(notice);

	sendSuccess(res, 201, notice, 'Notice created');
});

export const updateNotice = asyncHandler(async (req, res) => {
	const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	}).populate('postedBy', 'name email role');

	if (!notice) {
		res.status(404);
		throw new Error('Notice not found');
	}

	sendSuccess(res, 200, notice, 'Notice updated');
});

export const deleteNotice = asyncHandler(async (req, res) => {
	const notice = await Notice.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
	if (!notice) {
		res.status(404);
		throw new Error('Notice not found');
	}
	sendSuccess(res, 200, null, 'Notice removed');
});

export const uploadNoticeFile = asyncHandler(async (req, res) => {
	if (!req.file) {
		res.status(400);
		throw new Error('No file uploaded');
	}

	const { fileUrl } = await import('../middleware/uploadMiddleware.js');
	sendSuccess(
		res,
		201,
		{ url: fileUrl(req, 'notices', req.file.filename), filename: req.file.filename },
		'Attachment uploaded'
	);
});

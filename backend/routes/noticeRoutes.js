import express from 'express';
import {
	noticeList,
	getNotice,
	createNotice,
	updateNotice,
	deleteNotice,
	uploadNoticeFile,
} from '../controllers/noticeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadNoticeAttachment, handleUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', noticeList);
router.get('/:id', getNotice);

router.post('/upload', protect, authorize('admin', 'faculty'), handleUpload(uploadNoticeAttachment), uploadNoticeFile);
router.post('/', protect, authorize('admin', 'faculty'), createNotice);
router.put('/:id', protect, authorize('admin', 'faculty'), updateNotice);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteNotice);

export default router;

import express from 'express';
import {
	resultList,
	getResult,
	createResult,
	updateResult,
	publishResult,
	downloadResultPdf,
	deleteResult,
} from '../controllers/resultController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', resultList);
router.post('/', authorize('admin', 'faculty'), createResult);
router.get('/:id/pdf', downloadResultPdf);
router.post('/:id/publish', authorize('admin', 'faculty'), publishResult);
router.get('/:id', getResult);
router.put('/:id', authorize('admin', 'faculty'), updateResult);
router.delete('/:id', authorize('admin'), deleteResult);

export default router;

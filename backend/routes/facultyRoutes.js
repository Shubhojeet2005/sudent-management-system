import express from 'express';
import {
	facultyList,
	getFaculty,
	createFaculty,
	updateFaculty,
	deleteFaculty,
} from '../controllers/facultyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', facultyList);
router.post('/', authorize('admin'), createFaculty);
router.get('/:id', getFaculty);
router.put('/:id', authorize('admin'), updateFaculty);
router.delete('/:id', authorize('admin'), deleteFaculty);

export default router;

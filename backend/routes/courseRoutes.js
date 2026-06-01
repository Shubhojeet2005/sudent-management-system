import express from 'express';
import {
	courseList,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
	uploadSyllabusHandler,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadSyllabus, handleUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', courseList);
router.post('/upload-syllabus', authorize('admin', 'faculty'), handleUpload(uploadSyllabus), uploadSyllabusHandler);
router.post('/', authorize('admin', 'faculty'), createCourse);
router.get('/:id', getCourse);
router.put('/:id', authorize('admin', 'faculty'), updateCourse);
router.delete('/:id', authorize('admin'), deleteCourse);

export default router;

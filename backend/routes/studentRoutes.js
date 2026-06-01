import express from 'express';
import {
	studentList,
	getStudent,
	getMyStudentProfile,
	createStudent,
	updateStudent,
	deleteStudent,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/me', authorize('student'), getMyStudentProfile);
router.get('/', authorize('admin', 'faculty'), studentList);
router.post('/', authorize('admin'), createStudent);
router.get('/:id', getStudent);
router.put('/:id', authorize('admin'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);

export default router;

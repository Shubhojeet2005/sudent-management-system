import express from 'express';
import {
	markAttendance,
	getAttendanceRecords,
	getAttendance,
	downloadAttendancePdf,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAttendanceRecords);
router.post('/', authorize('admin', 'faculty'), markAttendance);
router.get('/summary/:studentId/:courseId/pdf', downloadAttendancePdf);
router.get('/summary/:studentId/:courseId', getAttendance);

export default router;

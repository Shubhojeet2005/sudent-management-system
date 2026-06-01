import Course from '../models/Course.js';
import Student from '../models/Student.js';

/** Branches on the Student model (subset of faculty departments) */
export const STUDENT_BRANCHES = [
	'Computer Science & Engineering',
	'Information Technology',
	'Electronics & Communication Engineering',
	'Electrical Engineering',
	'Mechanical Engineering',
	'Civil Engineering',
	'Chemical Engineering',
];

/** Extra MongoDB filter for faculty listing students */
export const buildFacultyStudentQuery = async (facultyProfile) => {
	if (!facultyProfile) return null;

	const enrolledIds = await Course.find({
		faculty: facultyProfile._id,
		isActive: true,
	}).distinct('enrolledStudents');

	const validEnrolled = enrolledIds.filter(Boolean);
	const or = [];

	if (validEnrolled.length) {
		or.push({ _id: { $in: validEnrolled } });
	}

	if (STUDENT_BRANCHES.includes(facultyProfile.department)) {
		or.push({ branch: facultyProfile.department });
	}

	if (or.length === 0) {
		return null;
	}

	return { $or: or };
};

/** Same rules as student list — if they can see a row, they can open details */
export const facultyCanViewStudent = async (facultyProfile, studentId) => {
	const base = { _id: studentId, isActive: { $ne: false } };

	if (!facultyProfile) {
		return Student.exists(base);
	}

	const scope = await buildFacultyStudentQuery(facultyProfile);
	if (!scope) {
		return Student.exists(base);
	}

	return Student.exists({ ...base, ...scope });
};

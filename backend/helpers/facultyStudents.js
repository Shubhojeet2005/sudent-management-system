import Course from '../models/Course.js';

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

/**
 * Whether a faculty member may view/manage this student.
 * - Students enrolled in the faculty member's courses, or
 * - Students in the same branch when department is a teaching branch, or
 * - All students when department is not a teaching branch (e.g. Mathematics) and no course enrollments yet
 */
export const canFacultyAccessStudent = async (facultyProfile, student) => {
	if (!facultyProfile || !student) return false;

	const enrolledInMyCourse = await Course.exists({
		faculty: facultyProfile._id,
		isActive: true,
		enrolledStudents: student._id,
	});
	if (enrolledInMyCourse) return true;

	if (STUDENT_BRANCHES.includes(facultyProfile.department)) {
		return student.branch === facultyProfile.department;
	}

	// Science / humanities faculty — allow access until courses define enrollment
	return true;
};

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
		// New faculty or non-branch department: list all active students
		return null;
	}

	return { $or: or };
};

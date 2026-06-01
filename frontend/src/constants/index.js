export const BRANCHES = [
	'Computer Science & Engineering',
	'Information Technology',
	'Electronics & Communication Engineering',
	'Electrical Engineering',
	'Mechanical Engineering',
	'Civil Engineering',
	'Chemical Engineering',
];

export const FACULTY_DEPARTMENTS = [
	...BRANCHES,
	'Mathematics',
	'Physics',
	'Chemistry',
	'Humanities',
];

export const PROGRAMMES = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'Ph.D'];
export const SECTIONS = ['A', 'B', 'C', 'D'];
export const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
export const GENDERS = ['Male', 'Female', 'Other'];

export const DESIGNATIONS = [
	'Professor',
	'Associate Professor',
	'Assistant Professor',
	'Lecturer',
	'Guest Faculty',
];

export const COURSE_TYPES = ['Theory', 'Practical', 'Theory + Practical', 'Elective'];

export const NOTICE_CATEGORIES = [
	'Academic',
	'Examination',
	'Placement',
	'Event',
	'Holiday',
	'Fee',
	'General',
];

export const ATTENDANCE_STATUS = ['Present', 'Absent', 'Late', 'Medical Leave'];

export const RESULT_OUTCOMES = ['Pass', 'Fail', 'Promoted', 'Detained'];

export const ROLES = {
	ADMIN: 'admin',
	FACULTY: 'faculty',
	STUDENT: 'student',
};

export const ENROLLMENT_FORMAT = 'MMMUT2024CS001';
export const ENROLLMENT_HINT =
	'MMMUT + admission year + branch code + serial (e.g. MMMUT2024CS001 for CSE, batch 2024)';
export const BATCH_FORMAT = '2024-2028';
export const BATCH_HINT = 'Start year–end year of programme (e.g. 2024-2028)';

/** Enrollment: MMMUT + 4-digit year + branch code (2–3 letters) + serial (2–4 digits), e.g. MMMUT2024CS001 */
const ENROLLMENT_REGEX = /^MMMUT\d{4}[A-Z]{2,3}\d{2,4}$/i;
const BATCH_REGEX = /^\d{4}-\d{4}$/;

export const ENROLLMENT_FORMAT = 'MMMUT2024CS001';
export const ENROLLMENT_HINT =
	'Format: MMMUT + admission year + branch code + serial (e.g. MMMUT2024CS001 for CSE 2024)';
export const BATCH_FORMAT = '2024-2028';
export const BATCH_HINT = 'Format: start year-end year (e.g. 2024-2028)';

export const pickStudentProfile = (body) => {
	const address = body.address || {};
	return {
		enrollmentNo: body.enrollmentNo?.trim().toUpperCase(),
		rollNo: body.rollNo?.trim(),
		branch: body.branch,
		programme: body.programme || 'B.Tech',
		semester: Number(body.semester),
		batch: body.batch?.trim(),
		section: body.section || 'A',
		dob: body.dob ? new Date(body.dob) : undefined,
		gender: body.gender,
		category: body.category || 'General',
		fatherName: body.fatherName?.trim() || '',
		motherName: body.motherName?.trim() || '',
		address: {
			street: address.street?.trim() || body.street?.trim() || '',
			city: address.city?.trim() || body.city?.trim() || '',
			state: address.state?.trim() || body.state?.trim() || '',
			pincode: address.pincode?.trim() || body.pincode?.trim() || '',
		},
		admissionYear: Number(body.admissionYear),
	};
};

export const validateStudentProfile = (profile) => {
	const errors = [];

	if (!profile.enrollmentNo) {
		errors.push('Enrollment number is required');
	} else if (!ENROLLMENT_REGEX.test(profile.enrollmentNo)) {
		errors.push(`Enrollment number must match format ${ENROLLMENT_FORMAT} (${ENROLLMENT_HINT})`);
	}

	if (!profile.rollNo) errors.push('Roll number is required');
	if (!profile.branch) errors.push('Branch is required');
	if (!profile.programme) errors.push('Programme is required');
	if (!profile.semester || profile.semester < 1 || profile.semester > 8) {
		errors.push('Semester must be between 1 and 8');
	}
	if (!profile.batch) {
		errors.push('Batch is required');
	} else if (!BATCH_REGEX.test(profile.batch)) {
		errors.push(`Batch must match format ${BATCH_FORMAT} (${BATCH_HINT})`);
	}
	if (!profile.admissionYear || profile.admissionYear < 2000 || profile.admissionYear > 2100) {
		errors.push('Valid admission year is required');
	}
	if (!profile.gender) errors.push('Gender is required');

	return errors;
};

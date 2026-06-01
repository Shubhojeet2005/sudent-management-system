/**
 * Seeds demo accounts for testing.
 * Run: npm run seed
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';

dotenv.config();

const DEMO_STUDENTS = [
	{
		email: 'student1@mmmut.ac.in',
		password: 'student123',
		name: 'Rahul Sharma',
		enrollmentNo: 'MMMUT2024CS001',
		rollNo: '24CS001',
		semester: 1,
	},
	{
		email: 'student2@mmmut.ac.in',
		password: 'student123',
		name: 'Priya Singh',
		enrollmentNo: 'MMMUT2024CS002',
		rollNo: '24CS002',
		semester: 1,
	},
];

const FACULTY = {
	employeeId: 'MMMUT-FAC-001',
	department: 'Computer Science & Engineering',
	email: 'faculty@mmmut.ac.in',
	password: 'faculty123',
	name: 'Dr. Demo Faculty',
	designation: 'Associate Professor',
};

const ADMIN = {
	email: 'admin@mmmut.ac.in',
	password: 'admin123',
	name: 'System Admin',
};

async function seed() {
	const uri = process.env.MONGO_URI;
	if (!uri) {
		console.error('MONGO_URI missing in .env');
		process.exit(1);
	}

	await mongoose.connect(uri);
	console.log('Connected to MongoDB\n');

	// Admin
	let admin = await User.findOne({ email: ADMIN.email });
	if (!admin) {
		admin = await User.create({ ...ADMIN, role: 'admin' });
		console.log('Created admin:', ADMIN.email, '/ password:', ADMIN.password);
	} else {
		console.log('Admin already exists:', ADMIN.email);
	}

	// Faculty user (required for faculty login)
	let facultyUser = await User.findOne({ email: FACULTY.email });
	if (!facultyUser) {
		facultyUser = await User.create({
			name: FACULTY.name,
			email: FACULTY.email,
			password: FACULTY.password,
			role: 'faculty',
			phone: '9876543210',
		});
		console.log('Created faculty user:', FACULTY.email);
	} else {
		facultyUser.role = 'faculty';
		facultyUser.isActive = true;
		await facultyUser.save();
		console.log('Faculty user exists:', FACULTY.email, '→ role set to faculty');
	}

	// Faculty profile — link ANY existing MMMUT-FAC-001 to this user
	let faculty = await Faculty.findOne({ employeeId: FACULTY.employeeId });
	if (!faculty) {
		faculty = await Faculty.create({
			user: facultyUser._id,
			employeeId: FACULTY.employeeId,
			department: FACULTY.department,
			designation: FACULTY.designation,
			qualification: 'Ph.D.',
			experience: 8,
			isActive: true,
		});
		console.log('Created faculty profile:', FACULTY.employeeId);
	} else {
		faculty.user = facultyUser._id;
		faculty.department = FACULTY.department;
		faculty.isActive = true;
		await faculty.save();
		console.log('Updated faculty profile:', FACULTY.employeeId, '→ linked to user', facultyUser._id.toString());
	}

	// Verify link
	const check = await Faculty.findOne({ employeeId: FACULTY.employeeId }).populate('user');
	if (!check?.user || check.user.role !== 'faculty') {
		console.error('ERROR: Faculty user link failed verification');
	} else {
		console.log('\n--- Faculty login (Faculty tab on /login) ---');
		console.log('Employee ID:', FACULTY.employeeId);
		console.log('Department: ', FACULTY.department);
		console.log('\n--- Optional email login for same faculty ---');
		console.log('Email:   ', FACULTY.email);
		console.log('Password:', FACULTY.password);
	}

	console.log('\n--- Admin login (Student/Admin tab) ---');
	console.log('Email:   ', ADMIN.email);
	console.log('Password:', ADMIN.password);

	// Demo students (same branch as faculty department so faculty can list them)
	for (const s of DEMO_STUDENTS) {
		let user = await User.findOne({ email: s.email });
		if (!user) {
			user = await User.create({
				name: s.name,
				email: s.email,
				password: s.password,
				role: 'student',
			});
			console.log('Created student user:', s.email);
		}

		let student = await Student.findOne({ enrollmentNo: s.enrollmentNo });
		if (!student) {
			await Student.create({
				user: user._id,
				enrollmentNo: s.enrollmentNo,
				rollNo: s.rollNo,
				branch: FACULTY.department,
				programme: 'B.Tech',
				semester: s.semester,
				batch: '2024-2028',
				section: 'A',
				admissionYear: 2024,
				category: 'General',
				gender: 'Male',
			});
			console.log('Created student profile:', s.enrollmentNo);
		} else {
			student.branch = FACULTY.department;
			student.isActive = true;
			await student.save();
			console.log('Student profile exists:', s.enrollmentNo);
		}
	}

	console.log('\n--- Student login (Student/Admin tab) ---');
	console.log('Email:   ', DEMO_STUDENTS[0].email);
	console.log('Password:', DEMO_STUDENTS[0].password);

	await mongoose.disconnect();
	console.log('\nDone.');
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});

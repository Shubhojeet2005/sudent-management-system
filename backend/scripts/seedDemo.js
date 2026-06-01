/**
 * Seeds demo accounts for testing.
 * Run: npm run seed
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
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

const DEFAULT_BRANCH = 'Computer Science & Engineering';

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

	console.log('\nFaculty login: use Employee ID + Department from your faculties collection.');
	console.log('(No demo faculty is created by this seed script.)\n');

	console.log('--- Admin login (Student/Admin tab) ---');
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
				branch: DEFAULT_BRANCH,
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
			student.branch = DEFAULT_BRANCH;
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

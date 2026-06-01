import React from 'react';
import {
	BRANCHES,
	PROGRAMMES,
	SECTIONS,
	CATEGORIES,
	GENDERS,
	ENROLLMENT_FORMAT,
	ENROLLMENT_HINT,
	BATCH_FORMAT,
	BATCH_HINT,
} from '../constants/index.js';

const FieldHint = ({ children }) => (
	<p className="field-hint">{children}</p>
);

const SectionTitle = ({ children }) => (
	<h3 className="form-section-title">{children}</h3>
);

const defaultForm = {
	name: '',
	email: '',
	password: '',
	phone: '',
	enrollmentNo: '',
	rollNo: '',
	branch: BRANCHES[0],
	programme: 'B.Tech',
	semester: 1,
	batch: '2024-2028',
	section: 'A',
	admissionYear: new Date().getFullYear(),
	category: 'General',
	gender: 'Male',
	dob: '',
	fatherName: '',
	motherName: '',
	street: '',
	city: '',
	state: '',
	pincode: '',
};

export { defaultForm as studentRegistrationDefaults };

export default function StudentRegistrationForm({
	form,
	setForm,
	formId = 'student-registration-form',
	showAccountFields = true,
}) {
	const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

	return (
		<div id={formId} className="student-registration-form">
			{showAccountFields && (
				<>
					<SectionTitle>Account (users table)</SectionTitle>
					<div className="form-grid">
						<div className="form-group">
							<label className="label">Full name *</label>
							<input className="input" value={form.name} onChange={set('name')} required />
						</div>
						<div className="form-group">
							<label className="label">Email *</label>
							<input className="input" type="email" value={form.email} onChange={set('email')} required />
						</div>
						<div className="form-group">
							<label className="label">Phone</label>
							<input className="input" value={form.phone} onChange={set('phone')} />
						</div>
						<div className="form-group">
							<label className="label">Password *</label>
							<input
								className="input"
								type="password"
								minLength={6}
								value={form.password}
								onChange={set('password')}
								required
							/>
							<FieldHint>Minimum 6 characters</FieldHint>
						</div>
					</div>
				</>
			)}

			<SectionTitle>Academic (students table)</SectionTitle>
			<div className="form-grid">
				<div className="form-group">
					<label className="label">Enrollment number *</label>
					<input
						className="input"
						value={form.enrollmentNo}
						onChange={set('enrollmentNo')}
						placeholder={ENROLLMENT_FORMAT}
						pattern="MMMUT[0-9]{4}[A-Za-z]{2,3}[0-9]{2,4}"
						title={ENROLLMENT_HINT}
						required
					/>
					<FieldHint>
						Format: <strong>{ENROLLMENT_FORMAT}</strong> — {ENROLLMENT_HINT}
					</FieldHint>
				</div>
				<div className="form-group">
					<label className="label">Roll number *</label>
					<input className="input" value={form.rollNo} onChange={set('rollNo')} placeholder="24CS001" required />
				</div>
				<div className="form-group">
					<label className="label">Branch *</label>
					<select className="select" value={form.branch} onChange={set('branch')} required>
						{BRANCHES.map((b) => (
							<option key={b} value={b}>
								{b}
							</option>
						))}
					</select>
				</div>
				<div className="form-group">
					<label className="label">Programme *</label>
					<select className="select" value={form.programme} onChange={set('programme')} required>
						{PROGRAMMES.map((p) => (
							<option key={p} value={p}>
								{p}
							</option>
						))}
					</select>
				</div>
				<div className="form-group">
					<label className="label">Semester *</label>
					<input
						className="input"
						type="number"
						min={1}
						max={8}
						value={form.semester}
						onChange={set('semester')}
						required
					/>
				</div>
				<div className="form-group">
					<label className="label">Batch *</label>
					<input
						className="input"
						value={form.batch}
						onChange={set('batch')}
						placeholder={BATCH_FORMAT}
						pattern="\d{4}-\d{4}"
						title={BATCH_HINT}
						required
					/>
					<FieldHint>
						Format: <strong>{BATCH_FORMAT}</strong> — {BATCH_HINT}
					</FieldHint>
				</div>
				<div className="form-group">
					<label className="label">Section *</label>
					<select className="select" value={form.section} onChange={set('section')} required>
						{SECTIONS.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
				</div>
				<div className="form-group">
					<label className="label">Admission year *</label>
					<input
						className="input"
						type="number"
						min={2000}
						max={2100}
						value={form.admissionYear}
						onChange={set('admissionYear')}
						required
					/>
					<FieldHint>Should match the year in your enrollment number</FieldHint>
				</div>
			</div>

			<SectionTitle>Personal (students table)</SectionTitle>
			<div className="form-grid">
				<div className="form-group">
					<label className="label">Date of birth</label>
					<input className="input" type="date" value={form.dob} onChange={set('dob')} />
				</div>
				<div className="form-group">
					<label className="label">Gender *</label>
					<select className="select" value={form.gender} onChange={set('gender')} required>
						{GENDERS.map((g) => (
							<option key={g} value={g}>
								{g}
							</option>
						))}
					</select>
				</div>
				<div className="form-group">
					<label className="label">Category *</label>
					<select className="select" value={form.category} onChange={set('category')} required>
						{CATEGORIES.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
				</div>
				<div className="form-group">
					<label className="label">Father&apos;s name</label>
					<input className="input" value={form.fatherName} onChange={set('fatherName')} />
				</div>
				<div className="form-group">
					<label className="label">Mother&apos;s name</label>
					<input className="input" value={form.motherName} onChange={set('motherName')} />
				</div>
			</div>

			<SectionTitle>Address (students table)</SectionTitle>
			<div className="form-grid">
				<div className="form-group" style={{ gridColumn: '1 / -1' }}>
					<label className="label">Street</label>
					<input className="input" value={form.street} onChange={set('street')} />
				</div>
				<div className="form-group">
					<label className="label">City</label>
					<input className="input" value={form.city} onChange={set('city')} />
				</div>
				<div className="form-group">
					<label className="label">State</label>
					<input className="input" value={form.state} onChange={set('state')} />
				</div>
				<div className="form-group">
					<label className="label">Pincode</label>
					<input className="input" value={form.pincode} onChange={set('pincode')} maxLength={6} />
				</div>
			</div>
		</div>
	);
}

export function buildStudentRegistrationPayload(form) {
	return {
		name: form.name,
		email: form.email,
		password: form.password,
		phone: form.phone,
		enrollmentNo: form.enrollmentNo,
		rollNo: form.rollNo,
		branch: form.branch,
		programme: form.programme,
		semester: Number(form.semester),
		batch: form.batch,
		section: form.section,
		admissionYear: Number(form.admissionYear),
		category: form.category,
		gender: form.gender,
		dob: form.dob || undefined,
		fatherName: form.fatherName,
		motherName: form.motherName,
		address: {
			street: form.street,
			city: form.city,
			state: form.state,
			pincode: form.pincode,
		},
	};
}

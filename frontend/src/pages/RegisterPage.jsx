import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import StudentRegistrationForm, {
	studentRegistrationDefaults,
	buildStudentRegistrationPayload,
} from '../components/StudentRegistrationForm.jsx';
import { ENROLLMENT_FORMAT, BATCH_FORMAT } from '../constants/index.js';

export default function RegisterPage() {
	const [form, setForm] = useState({ ...studentRegistrationDefaults });
	const [err, setErr] = useState(null);
	const { registerStudent, loading } = useAuth();
	const navigate = useNavigate();
	const { toast } = useToast();

	const handle = async (e) => {
		e.preventDefault();
		setErr(null);
		try {
			await registerStudent(buildStudentRegistrationPayload(form));
			toast('Account and student profile created!', 'success');
			navigate('/');
		} catch (e) {
			setErr(e.message);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-hero">
				<h1>Join MMMUT Portal</h1>
				<p>
					Register with your account details and academic profile. Fields match the{' '}
					<strong>users</strong> and <strong>students</strong> records in the system.
				</p>
				<ul className="auth-hero-list">
					<li>Enrollment: {ENROLLMENT_FORMAT}</li>
					<li>Batch: {BATCH_FORMAT}</li>
				</ul>
			</div>
			<div className="auth-form-wrap auth-form-wrap--wide">
				<div className="card card-padded register-card">
					<h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Student registration</h2>
					<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
						All academic fields are saved to your student profile and linked to your login.
					</p>
					<form onSubmit={handle}>
						{err && <div className="alert alert-error">{err}</div>}
						<StudentRegistrationForm form={form} setForm={setForm} formId="register-student-form" />
						<button
							type="submit"
							className="btn btn-primary"
							style={{ width: '100%', marginTop: '1.25rem' }}
							disabled={loading}
						>
							{loading ? 'Creating account…' : 'Register as student'}
						</button>
					</form>
					<p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
						Already have an account? <Link to="/login">Sign in</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

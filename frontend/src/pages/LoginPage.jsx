import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';

export default function LoginPage() {
	const [mode, setMode] = useState('student');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [employeeId, setEmployeeId] = useState('');
	const [department, setDepartment] = useState('');
	const [err, setErr] = useState(null);
	const { login, loginFaculty, loading } = useAuth();
	const navigate = useNavigate();
	const { toast } = useToast();

	const handleStudent = async (e) => {
		e.preventDefault();
		setErr(null);
		try {
			await login(email, password);
			toast('Welcome back!', 'success');
			navigate('/');
		} catch (e) {
			setErr(e.message);
		}
	};

	const handleFaculty = async (e) => {
		e.preventDefault();
		setErr(null);
		try {
			await loginFaculty(employeeId, department);
			toast('Welcome, Faculty!', 'success');
			navigate('/');
		} catch (e) {
			setErr(e.message);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-hero">
				<h1>Madan Mohan Malaviya University of Technology</h1>
				<p>
					Students and admins use email login. Faculty use Employee ID and Department to access
					attendance, marks, and notices.
				</p>
			</div>
			<div className="auth-form-wrap">
				<div className="card card-padded" style={{ width: '100%', maxWidth: 420 }}>
					<h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Sign in</h2>

					<div className="tabs" style={{ marginBottom: '1.25rem' }}>
						<button
							type="button"
							className={`tab${mode === 'student' ? ' active' : ''}`}
							onClick={() => {
								setMode('student');
								setErr(null);
							}}
						>
							Student / Admin
						</button>
						<button
							type="button"
							className={`tab${mode === 'faculty' ? ' active' : ''}`}
							onClick={() => {
								setMode('faculty');
								setErr(null);
							}}
						>
							Faculty
						</button>
					</div>

					{err && <div className="alert alert-error">{err}</div>}

					{mode === 'student' ? (
						<form onSubmit={handleStudent}>
							<div className="form-group">
								<label className="label">Email</label>
								<input
									className="input"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@mmmut.ac.in"
									required
								/>
							</div>
							<div className="form-group">
								<label className="label">Password</label>
								<input
									className="input"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>
							<button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
								{loading ? 'Signing in...' : 'Sign in'}
							</button>
						</form>
					) : (
						<form onSubmit={handleFaculty}>
							<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
								Use your <strong>Employee ID</strong> and exact <strong>Department</strong> name as
								password.
							</p>
							<div className="form-group">
								<label className="label">Employee ID</label>
								<input
									className="input"
									value={employeeId}
									onChange={(e) => setEmployeeId(e.target.value)}
									placeholder="e.g. MMMUT-FAC-001"
									required
								/>
							</div>
							<div className="form-group">
								<label className="label">Department</label>
								<select
									className="select"
									value={department}
									onChange={(e) => setDepartment(e.target.value)}
									required
								>
									<option value="">Select department</option>
									<option>Computer Science & Engineering</option>
									<option>Information Technology</option>
									<option>Electronics & Communication Engineering</option>
									<option>Electrical Engineering</option>
									<option>Mechanical Engineering</option>
									<option>Civil Engineering</option>
									<option>Chemical Engineering</option>
									<option>Mathematics</option>
									<option>Physics</option>
									<option>Chemistry</option>
									<option>Humanities</option>
								</select>
							</div>
							<button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
								{loading ? 'Signing in...' : 'Faculty sign in'}
							</button>
						</form>
					)}

					<p style={{ marginTop: '1.25rem', fontSize: '0.85rem', textAlign: 'center' }}>
						<Link to="/forgot-password">Forgot password?</Link>
					</p>
					<p style={{ marginTop: '0.5rem', fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-muted)' }}>
						No account? <Link to="/register">Register as student</Link>
					</p>
					<p style={{ marginTop: '0.5rem', fontSize: '0.85rem', textAlign: 'center' }}>
						<Link to="/notices-public">View public notices</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

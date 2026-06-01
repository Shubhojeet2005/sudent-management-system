import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as authService from '../services/authService.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';

export default function ResetPasswordPage() {
	const { token: urlToken } = useParams();
	const [password, setPassword] = useState('');
	const [token, setToken] = useState(urlToken || '');
	const [err, setErr] = useState(null);
	const { login } = useAuth();
	const navigate = useNavigate();
	const { toast } = useToast();

	const handle = async (e) => {
		e.preventDefault();
		setErr(null);
		try {
			const res = await authService.resetPassword(token, password);
			localStorage.setItem('token', res.token);
			localStorage.setItem('user', JSON.stringify(res.user));
			toast('Password updated!', 'success');
			navigate('/');
			window.location.reload();
		} catch (e) {
			setErr(e.message);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-hero">
				<h1>New password</h1>
				<p>Enter your new password below.</p>
			</div>
			<div className="auth-form-wrap">
				<div className="card card-padded" style={{ width: '100%', maxWidth: 420 }}>
					<form onSubmit={handle}>
						{err && <div className="alert alert-error">{err}</div>}
						{!urlToken && (
							<div className="form-group">
								<label className="label">Reset token</label>
								<input className="input" value={token} onChange={(e) => setToken(e.target.value)} required />
							</div>
						)}
						<div className="form-group">
							<label className="label">New password</label>
							<input
								className="input"
								type="password"
								minLength={6}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
							Update password
						</button>
					</form>
					<p style={{ marginTop: '1rem', textAlign: 'center' }}>
						<Link to="/login">Back to login</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as authService from '../services/authService.js';
import { useToast } from '../hooks/useToast.js';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [sent, setSent] = useState(false);
	const [err, setErr] = useState(null);
	const { toast } = useToast();

	const handle = async (e) => {
		e.preventDefault();
		setErr(null);
		try {
			await authService.forgotPassword(email);
			setSent(true);
			toast('Check your email for reset link', 'success');
		} catch (e) {
			setErr(e.message);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-hero">
				<h1>Reset password</h1>
				<p>We will send a reset link to your registered email.</p>
			</div>
			<div className="auth-form-wrap">
				<div className="card card-padded" style={{ width: '100%', maxWidth: 420 }}>
					<h2 style={{ marginBottom: '1rem' }}>Forgot password</h2>
					{sent ? (
						<div className="alert alert-success">
							If an account exists, a reset link was sent. Check your inbox.
						</div>
					) : (
						<form onSubmit={handle}>
							{err && <div className="alert alert-error">{err}</div>}
							<div className="form-group">
								<label className="label">Email</label>
								<input
									className="input"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
							<button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
								Send reset link
							</button>
						</form>
					)}
					<p style={{ marginTop: '1rem', textAlign: 'center' }}>
						<Link to="/login">Back to login</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

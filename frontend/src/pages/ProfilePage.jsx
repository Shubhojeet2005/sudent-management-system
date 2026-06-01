import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import * as authService from '../services/authService.js';
import { getStoredToken } from '../services/api.js';

export default function ProfilePage() {
	const { user, updateUserLocal } = useAuth();
	const { toast } = useToast();
	const [profile, setProfile] = useState({ name: '', phone: '' });
	const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
	const [photo, setPhoto] = useState(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (user) {
			setProfile({ name: user.name || '', phone: user.phone || '' });
		}
	}, [user]);

	const saveProfile = async (e) => {
		e.preventDefault();
		const t = getStoredToken();
		if (!t) {
			toast('Please sign in again', 'error');
			return;
		}
		setSaving(true);
		try {
			const updated = await authService.updateProfile(profile, t);
			updateUserLocal(updated);
			toast('Profile updated', 'success');
		} catch (e) {
			toast(e.message, 'error');
		} finally {
			setSaving(false);
		}
	};

	const savePassword = async (e) => {
		e.preventDefault();
		const t = getStoredToken();
		if (!t) return;
		setSaving(true);
		try {
			await authService.updatePassword(passwords, t);
			toast('Password changed', 'success');
			setPasswords({ currentPassword: '', newPassword: '' });
		} catch (e) {
			toast(e.message, 'error');
		} finally {
			setSaving(false);
		}
	};

	const uploadPhoto = async () => {
		if (!photo) {
			toast('Choose a photo first', 'error');
			return;
		}
		const t = getStoredToken();
		if (!t) {
			toast('Please sign in again', 'error');
			return;
		}
		setSaving(true);
		try {
			const res = await authService.uploadProfilePhoto(photo, t);
			updateUserLocal({ profilePhoto: res.profilePhoto });
			setPhoto(null);
			toast('Photo updated', 'success');
		} catch (e) {
			toast(e.message, 'error');
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<div className="page-header">
				<h1>Settings</h1>
				<p>Manage your account</p>
			</div>

			<div className="grid-2">
				<div className="card card-padded">
					<h3 style={{ marginBottom: '1rem' }}>Profile</h3>
					<form onSubmit={saveProfile}>
						<div className="form-group">
							<label className="label">Name</label>
							<input
								className="input"
								value={profile.name}
								onChange={(e) => setProfile({ ...profile, name: e.target.value })}
							/>
						</div>
						<div className="form-group">
							<label className="label">Phone</label>
							<input
								className="input"
								value={profile.phone}
								onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
							/>
						</div>
						<p className="small">Email: {user?.email} (cannot change)</p>
						{user?.faculty && (
							<p className="small" style={{ marginTop: 8 }}>
								Faculty ID: {user.faculty.employeeId} · {user.faculty.department}
							</p>
						)}
						<button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={saving}>
							{saving ? 'Saving...' : 'Save profile'}
						</button>
					</form>
				</div>

				<div>
					<div className="card card-padded" style={{ marginBottom: '1rem' }}>
						<h3 style={{ marginBottom: '1rem' }}>Profile photo</h3>
						<div className="avatar" style={{ width: 80, height: 80, fontSize: '1.5rem', marginBottom: '1rem' }}>
							{user?.profilePhoto ? (
								<img src={user.profilePhoto} alt="" />
							) : (
								user?.name?.[0]
							)}
						</div>
						<input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0])} />
						<button
							type="button"
							className="btn btn-secondary btn-sm"
							style={{ marginTop: 8 }}
							onClick={uploadPhoto}
							disabled={saving || !photo}
						>
							{saving ? 'Uploading...' : 'Upload'}
						</button>
					</div>

					<div className="card card-padded">
						<h3 style={{ marginBottom: '1rem' }}>Change password</h3>
						<p className="small" style={{ marginBottom: '1rem' }}>
							Faculty can also use Employee ID + Department on the login page.
						</p>
						<form onSubmit={savePassword}>
							<div className="form-group">
								<label className="label">Current password</label>
								<input
									className="input"
									type="password"
									value={passwords.currentPassword}
									onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
									required
								/>
							</div>
							<div className="form-group">
								<label className="label">New password</label>
								<input
									className="input"
									type="password"
									minLength={6}
									value={passwords.newPassword}
									onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
									required
								/>
							</div>
							<button type="submit" className="btn btn-primary" disabled={saving}>
								Update password
							</button>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}

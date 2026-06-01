import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { getMyProfile } from '../services/studentService.js';

export default function MyProfilePage() {
	const { token } = useAuth();
	const [profile, setProfile] = useState(null);

	useEffect(() => {
		getMyProfile(token).then(setProfile);
	}, [token]);

	if (!profile) {
		return (
			<div className="loading-center">
				<div className="spinner" />
			</div>
		);
	}

	return (
		<>
			<div className="page-header">
				<h1>My Profile</h1>
				<p>Academic record</p>
			</div>
			<div className="card card-padded">
				<div className="form-grid">
					<div>
						<label className="label">Name</label>
						<p>{profile.user?.name}</p>
					</div>
					<div>
						<label className="label">Enrollment</label>
						<p>{profile.enrollmentNo}</p>
					</div>
					<div>
						<label className="label">Branch</label>
						<p>{profile.branch}</p>
					</div>
					<div>
						<label className="label">Semester</label>
						<p>{profile.semester}</p>
					</div>
					<div>
						<label className="label">CGPA</label>
						<p>{profile.cgpa ?? '—'}</p>
					</div>
				</div>
			</div>
		</>
	);
}

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getStudent } from '../services/studentService.js';

export default function StudentDetailPage() {
	const { id } = useParams();
	const { token } = useAuth();
	const [student, setStudent] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getStudent(id, token)
			.then(setStudent)
			.finally(() => setLoading(false));
	}, [id, token]);

	if (loading) {
		return (
			<div className="loading-center">
				<div className="spinner" />
			</div>
		);
	}

	if (!student) return <p>Student not found</p>;

	return (
		<>
			<div className="page-header">
				<div>
					<Link to="/students" style={{ fontSize: '0.85rem' }}>
						← Students
					</Link>
					<h1>{student.user?.name}</h1>
					<p>{student.enrollmentNo}</p>
				</div>
				<span className="badge badge-blue">{student.branch}</span>
			</div>

			<div className="card card-padded">
				<div className="form-grid">
					<div>
						<label className="label">Roll No</label>
						<p>{student.rollNo}</p>
					</div>
					<div>
						<label className="label">Semester</label>
						<p>{student.semester}</p>
					</div>
					<div>
						<label className="label">Programme</label>
						<p>{student.programme}</p>
					</div>
					<div>
						<label className="label">Batch</label>
						<p>{student.batch}</p>
					</div>
					<div>
						<label className="label">Section</label>
						<p>{student.section}</p>
					</div>
					<div>
						<label className="label">CGPA</label>
						<p>{student.cgpa ?? '—'}</p>
					</div>
					<div>
						<label className="label">Email</label>
						<p>{student.user?.email}</p>
					</div>
					<div>
						<label className="label">Phone</label>
						<p>{student.user?.phone || '—'}</p>
					</div>
				</div>
			</div>
		</>
	);
}

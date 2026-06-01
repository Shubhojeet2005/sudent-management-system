import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { listFaculty, createFaculty, deleteFaculty } from '../services/facultyService.js';
import * as authService from '../services/authService.js';
import Modal from '../components/Modal.jsx';
import { FACULTY_DEPARTMENTS, DESIGNATIONS } from '../constants/index.js';

export default function FacultyPage() {
	const { token } = useAuth();
	const { toast } = useToast();
	const [items, setItems] = useState([]);
	const [modal, setModal] = useState(false);
	const [form, setForm] = useState({
		userName: '',
		userEmail: '',
		userPassword: '',
		employeeId: '',
		department: FACULTY_DEPARTMENTS[0],
		designation: 'Assistant Professor',
	});

	const load = () =>
		listFaculty(token, { limit: 50 })
			.then((r) => setItems(r.items))
			.catch((e) => toast(e.message, 'error'));

	useEffect(() => {
		load();
	}, [token]);

	const handleCreate = async (e) => {
		e.preventDefault();
		try {
			const { user } = await authService.register(
				{ name: form.userName, email: form.userEmail, password: form.userPassword, role: 'faculty' },
				token
			);
			await createFaculty(
				{
					user: user._id,
					employeeId: form.employeeId,
					department: form.department,
					designation: form.designation,
				},
				token
			);
			toast('Faculty added', 'success');
			setModal(false);
			load();
		} catch (e) {
			toast(e.message, 'error');
		}
	};

	const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

	return (
		<>
			<div className="page-header">
				<div>
					<h1>Faculty</h1>
					<p>Teaching staff directory</p>
				</div>
				<button type="button" className="btn btn-primary" onClick={() => setModal(true)}>
					<Plus size={16} /> Add faculty
				</button>
			</div>

			<div className="card table-wrap">
				<table className="table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Employee ID</th>
							<th>Department</th>
							<th>Designation</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{items.map((f) => (
							<tr key={f._id}>
								<td>{f.user?.name}</td>
								<td>{f.employeeId}</td>
								<td style={{ fontSize: '0.8rem' }}>{f.department}</td>
								<td>{f.designation}</td>
								<td>
									<button
										type="button"
										className="btn btn-ghost btn-sm"
										onClick={async () => {
											if (!confirm('Delete?')) return;
											await deleteFaculty(f._id, token);
											load();
										}}
									>
										<Trash2 size={14} color="#dc2626" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Modal
				open={modal}
				onClose={() => setModal(false)}
				title="Add faculty"
				wide
				footer={
					<button type="submit" form="fac-form" className="btn btn-primary">
						Create
					</button>
				}
			>
				<form id="fac-form" onSubmit={handleCreate} className="form-grid">
					<div className="form-group">
						<label className="label">Name</label>
						<input className="input" value={form.userName} onChange={set('userName')} required />
					</div>
					<div className="form-group">
						<label className="label">Email</label>
						<input className="input" type="email" value={form.userEmail} onChange={set('userEmail')} required />
					</div>
					<div className="form-group">
						<label className="label">Password</label>
						<input className="input" type="password" value={form.userPassword} onChange={set('userPassword')} required />
					</div>
					<div className="form-group">
						<label className="label">Employee ID</label>
						<input className="input" value={form.employeeId} onChange={set('employeeId')} required />
					</div>
					<div className="form-group">
						<label className="label">Department</label>
						<select className="select" value={form.department} onChange={set('department')}>
							{FACULTY_DEPARTMENTS.map((d) => (
								<option key={d}>{d}</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label className="label">Designation</label>
						<select className="select" value={form.designation} onChange={set('designation')}>
							{DESIGNATIONS.map((d) => (
								<option key={d}>{d}</option>
							))}
						</select>
					</div>
				</form>
			</Modal>
		</>
	);
}

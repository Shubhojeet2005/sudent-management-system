import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { listStudents, deleteStudent } from '../services/studentService.js';
import Modal from '../components/Modal.jsx';
import StudentRegistrationForm, {
	studentRegistrationDefaults,
	buildStudentRegistrationPayload,
} from '../components/StudentRegistrationForm.jsx';

export default function StudentsPage() {
	const { token, isAdmin, registerStudent } = useAuth();
	const { toast } = useToast();
	const [items, setItems] = useState([]);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState({});
	const [modal, setModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [form, setForm] = useState({ ...studentRegistrationDefaults });

	const load = async () => {
		setLoading(true);
		try {
			const res = await listStudents(token, { page, limit: 10, search: search || undefined });
			setItems(res.items);
			setPagination(res.pagination);
		} catch (e) {
			toast(e.message, 'error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, [token, page, search]);

	const handleCreate = async (e) => {
		e.preventDefault();
		try {
			await registerStudent(buildStudentRegistrationPayload(form), token);
			toast('Student created', 'success');
			setModal(false);
			setForm({ ...studentRegistrationDefaults });
			load();
		} catch (e) {
			toast(e.message, 'error');
		}
	};

	const handleDelete = async (id) => {
		if (!confirm('Delete this student?')) return;
		try {
			await deleteStudent(id, token);
			toast('Deleted', 'success');
			load();
		} catch (e) {
			toast(e.message, 'error');
		}
	};

	return (
		<>
			<div className="page-header">
				<div>
					<h1>Students</h1>
					<p>Manage student records and enrollment</p>
				</div>
				{isAdmin && (
					<button type="button" className="btn btn-primary" onClick={() => setModal(true)}>
						<Plus size={16} /> Add student
					</button>
				)}
			</div>

			<div className="search-bar">
				<div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
					<Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
					<input
						className="input"
						style={{ paddingLeft: 36 }}
						placeholder="Search enrollment or roll no..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
					/>
				</div>
			</div>

			<div className="card table-wrap">
				{loading ? (
					<div className="loading-center">
						<div className="spinner" />
					</div>
				) : (
					<table className="table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Enrollment</th>
								<th>Branch</th>
								<th>Sem</th>
								<th>CGPA</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{!loading && items.length === 0 && (
								<tr>
									<td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
										No students found. Ask an admin to add students, or run <code>npm run seed</code> in the backend folder.
									</td>
								</tr>
							)}
							{items.map((s) => (
								<tr key={s._id}>
									<td>{s.user?.name || '—'}</td>
									<td>{s.enrollmentNo}</td>
									<td style={{ maxWidth: 180, fontSize: '0.8rem' }}>{s.branch}</td>
									<td>{s.semester}</td>
									<td>{s.cgpa ?? '—'}</td>
									<td>
										<Link to={`/students/${s._id}`} className="btn btn-ghost btn-sm">
											<Eye size={14} />
										</Link>
										{isAdmin && (
											<button
												type="button"
												className="btn btn-ghost btn-sm"
												onClick={() => handleDelete(s._id)}
											>
												<Trash2 size={14} color="#dc2626" />
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			{pagination.pages > 1 && (
				<div className="pagination">
					<button
						type="button"
						className="btn btn-secondary btn-sm"
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
					>
						Prev
					</button>
					<span style={{ fontSize: '0.85rem' }}>
						Page {page} of {pagination.pages}
					</span>
					<button
						type="button"
						className="btn btn-secondary btn-sm"
						disabled={page >= pagination.pages}
						onClick={() => setPage((p) => p + 1)}
					>
						Next
					</button>
				</div>
			)}

			<Modal
				open={modal}
				onClose={() => setModal(false)}
				title="Add student"
				wide
				footer={
					<>
						<button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>
							Cancel
						</button>
						<button type="submit" form="admin-student-form" className="btn btn-primary">
							Create
						</button>
					</>
				}
			>
				<form id="admin-student-form" onSubmit={handleCreate}>
					<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
						Creates a <strong>users</strong> account and linked <strong>students</strong> profile in one step.
					</p>
					<StudentRegistrationForm form={form} setForm={setForm} formId="admin-student-fields" />
				</form>
			</Modal>
		</>
	);
}

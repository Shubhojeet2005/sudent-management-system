import React, { useEffect, useState } from 'react';
import { Plus, Upload, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { listCourses, createCourse, deleteCourse, uploadSyllabus } from '../services/courseService.js';
import { listFaculty } from '../services/facultyService.js';
import Modal from '../components/Modal.jsx';
import { BRANCHES, COURSE_TYPES } from '../constants/index.js';

export default function CoursesPage() {
	const { token, user, isAdmin, isFaculty } = useAuth();
	const { toast } = useToast();
	const [items, setItems] = useState([]);
	const [faculty, setFaculty] = useState([]);
	const [modal, setModal] = useState(false);
	const [form, setForm] = useState({
		courseCode: '',
		title: '',
		branch: BRANCHES[0],
		semester: 1,
		credits: 3,
		type: 'Theory',
		academicYear: '2024-25',
		faculty: '',
		syllabus: '',
	});

	const load = () => {
		listCourses(token, { limit: 50 })
			.then((r) => setItems(r.items))
			.catch((e) => toast(e.message, 'error'));
	};

	useEffect(() => {
		load();
		if (isAdmin) listFaculty(token, { limit: 100 }).then((r) => setFaculty(r.items));
	}, [token]);

	const handleCreate = async (e) => {
		e.preventDefault();
		try {
			const payload = {
				...form,
				semester: Number(form.semester),
				credits: Number(form.credits),
			};
			if (isFaculty && user?.faculty?._id) {
				payload.faculty = user.faculty._id;
			} else if (!payload.faculty) {
				delete payload.faculty;
			}
			await createCourse(payload, token);
			toast('Course created', 'success');
			setModal(false);
			load();
		} catch (e) {
			toast(e.message, 'error');
		}
	};

	const handleSyllabus = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const res = await uploadSyllabus(file, token);
			setForm((f) => ({ ...f, syllabus: res.url }));
			toast('Syllabus uploaded', 'success');
		} catch (err) {
			toast(err.message, 'error');
		}
	};

	const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

	return (
		<>
			<div className="page-header">
				<div>
					<h1>Courses</h1>
					<p>Academic courses and syllabi</p>
				</div>
				{(isAdmin || isFaculty) && (
					<button type="button" className="btn btn-primary" onClick={() => setModal(true)}>
						<Plus size={16} /> Add course
					</button>
				)}
			</div>

			<div className="card table-wrap">
				<table className="table">
					<thead>
						<tr>
							<th>Code</th>
							<th>Title</th>
							<th>Sem</th>
							<th>Credits</th>
							<th>Faculty</th>
							<th>Syllabus</th>
							{isAdmin && <th></th>}
						</tr>
					</thead>
					<tbody>
						{items.map((c) => (
							<tr key={c._id}>
								<td>
									<strong>{c.courseCode}</strong>
								</td>
								<td>{c.title}</td>
								<td>{c.semester}</td>
								<td>{c.credits}</td>
								<td>{c.faculty?.employeeId || '—'}</td>
								<td>
									{c.syllabus ? (
										<a href={c.syllabus} target="_blank" rel="noreferrer">
											<ExternalLink size={14} />
										</a>
									) : (
										'—'
									)}
								</td>
								{isAdmin && (
									<td>
										<button
											type="button"
											className="btn btn-ghost btn-sm"
											onClick={async () => {
												if (!confirm('Deactivate?')) return;
												await deleteCourse(c._id, token);
												load();
											}}
										>
											<Trash2 size={14} color="#dc2626" />
										</button>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Modal
				open={modal}
				onClose={() => setModal(false)}
				title="New course"
				wide
				footer={
					<button type="submit" form="course-form" className="btn btn-primary">
						Create
					</button>
				}
			>
				<form id="course-form" onSubmit={handleCreate} className="form-grid">
					<div className="form-group">
						<label className="label">Course code</label>
						<input className="input" value={form.courseCode} onChange={set('courseCode')} required />
					</div>
					<div className="form-group">
						<label className="label">Title</label>
						<input className="input" value={form.title} onChange={set('title')} required />
					</div>
					<div className="form-group">
						<label className="label">Branch</label>
						<select className="select" value={form.branch} onChange={set('branch')}>
							{BRANCHES.map((b) => (
								<option key={b}>{b}</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label className="label">Semester</label>
						<input className="input" type="number" min={1} max={8} value={form.semester} onChange={set('semester')} />
					</div>
					<div className="form-group">
						<label className="label">Credits</label>
						<input className="input" type="number" min={1} max={6} value={form.credits} onChange={set('credits')} />
					</div>
					<div className="form-group">
						<label className="label">Type</label>
						<select className="select" value={form.type} onChange={set('type')}>
							{COURSE_TYPES.map((t) => (
								<option key={t}>{t}</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label className="label">Academic year</label>
						<input className="input" value={form.academicYear} onChange={set('academicYear')} />
					</div>
					{isAdmin && faculty.length > 0 && (
						<div className="form-group">
							<label className="label">Faculty</label>
							<select className="select" value={form.faculty} onChange={set('faculty')}>
								<option value="">—</option>
								{faculty.map((f) => (
									<option key={f._id} value={f._id}>
										{f.user?.name} ({f.employeeId})
									</option>
								))}
							</select>
						</div>
					)}
					<div className="form-group">
						<label className="label">Syllabus PDF</label>
						<label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
							<Upload size={14} /> Upload
							<input type="file" accept=".pdf,image/*" hidden onChange={handleSyllabus} />
						</label>
						{form.syllabus && <p className="small">{form.syllabus}</p>}
					</div>
				</form>
			</Modal>
		</>
	);
}

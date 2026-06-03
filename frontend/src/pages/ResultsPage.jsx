import React, { useEffect, useState } from 'react';
import { Plus, Download, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import {
	listResults,
	createResult,
	publishResult,
	downloadResultPdf,
	deleteResult,
} from '../services/resultService.js';
import { listStudents } from '../services/studentService.js';
import { listCourses } from '../services/courseService.js';
import { listMyAttempts } from '../services/quizService.js';
import Modal from '../components/Modal.jsx';

export default function ResultsPage() {
	const { token, isAdmin, isFaculty, isStudent } = useAuth();
	const { toast } = useToast();
	const [view, setView] = useState('semester');
	const [items, setItems] = useState([]);
	const [quizItems, setQuizItems] = useState([]);
	const [students, setStudents] = useState([]);
	const [courses, setCourses] = useState([]);
	const [modal, setModal] = useState(false);
	const [form, setForm] = useState({
		student: '',
		semester: 5,
		academicYear: '2024-25',
		course: '',
		internalMarks: 25,
		externalMarks: 55,
		sgpa: 0,
		cgpa: 0,
		result: 'Pass',
	});

	const load = () =>
		listResults(token, { limit: 50 })
			.then((r) => setItems(r.items))
			.catch((e) => toast(e.message, 'error'));

	const loadQuizResults = () =>
		listMyAttempts(token)
			.then((rows) => setQuizItems(rows))
			.catch((e) => toast(e.message, 'error'));

	useEffect(() => {
		load();
		if (isStudent) loadQuizResults();
		if (isAdmin || isFaculty) {
			listStudents(token, { limit: 100 })
				.then((r) => setStudents(r.items))
				.catch((e) => toast(e.message, 'error'));
			listCourses(token, { limit: 100 }).then((r) => setCourses(r.items));
		}
	}, [token, isStudent, isAdmin, isFaculty]);

	const handleCreate = async (e) => {
		e.preventDefault();
		try {
			await createResult(
				{
					student: form.student,
					semester: Number(form.semester),
					academicYear: form.academicYear,
					sgpa: Number(form.sgpa),
					cgpa: Number(form.cgpa),
					result: form.result,
					subjects: [
						{
							course: form.course,
							internalMarks: Number(form.internalMarks),
							externalMarks: Number(form.externalMarks),
						},
					],
				},
				token
			);
			toast('Result created', 'success');
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
					<h1>Results</h1>
					<p>
						{isStudent
							? 'Semester results and quiz outcomes'
							: 'Semester results and mark sheets'}
					</p>
				</div>
				{(isAdmin || isFaculty) && (
					<button type="button" className="btn btn-primary" onClick={() => setModal(true)}>
						<Plus size={16} /> Add result
					</button>
				)}
			</div>

			{isStudent && (
				<div className="tabs" style={{ marginBottom: '1rem' }}>
					<button
						type="button"
						className={`tab${view === 'semester' ? ' active' : ''}`}
						onClick={() => setView('semester')}
					>
						Semester Results
					</button>
					<button
						type="button"
						className={`tab${view === 'quiz' ? ' active' : ''}`}
						onClick={() => setView('quiz')}
					>
						Quiz Results
					</button>
				</div>
			)}

			{(!isStudent || view === 'semester') && (
				<div className="card table-wrap">
				<table className="table">
					<thead>
						<tr>
							<th>Student</th>
							<th>Sem</th>
							<th>Year</th>
							<th>SGPA</th>
							<th>Status</th>
							<th>Published</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{items.map((r) => (
							<tr key={r._id}>
								<td>{r.student?.enrollmentNo || '—'}</td>
								<td>{r.semester}</td>
								<td>{r.academicYear}</td>
								<td>{r.sgpa}</td>
								<td>
									<span className="badge badge-blue">{r.result}</span>
								</td>
								<td>
									<span className={`badge ${r.isPublished ? 'badge-green' : 'badge-amber'}`}>
										{r.isPublished ? 'Yes' : 'Draft'}
									</span>
								</td>
								<td style={{ display: 'flex', gap: 4 }}>
									<button
										type="button"
										className="btn btn-ghost btn-sm"
										title="Download PDF"
										onClick={async () => {
											const res = await downloadResultPdf(r._id, token);
											window.open(res.url, '_blank');
										}}
									>
										<Download size={14} />
									</button>
									{(isAdmin || isFaculty) && !r.isPublished && (
										<button
											type="button"
											className="btn btn-ghost btn-sm"
											title="Publish"
											onClick={async () => {
												await publishResult(r._id, token);
												toast('Published', 'success');
												load();
											}}
										>
											<Send size={14} />
										</button>
									)}
									{isAdmin && (
										<button
											type="button"
											className="btn btn-ghost btn-sm"
											onClick={async () => {
												if (!confirm('Delete?')) return;
												await deleteResult(r._id, token);
												load();
											}}
										>
											×
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				</div>
			)}

			{isStudent && view === 'quiz' && (
				<div className="card table-wrap">
					<table className="table">
						<thead>
							<tr>
								<th>Quiz</th>
								<th>Course</th>
								<th>Score</th>
								<th>Status</th>
								<th>Submitted</th>
							</tr>
						</thead>
						<tbody>
							{quizItems.length === 0 ? (
								<tr>
									<td colSpan={5} style={{ color: 'var(--text-muted)' }}>
										No quiz attempts yet.
									</td>
								</tr>
							) : (
								quizItems.map((a) => (
									<tr key={a._id}>
										<td>{a.quiz?.title || 'Quiz'}</td>
										<td>{a.quiz?.course?.courseCode || 'General'}</td>
										<td>
											{a.score ?? 0}/{a.totalMarks ?? 0}
										</td>
										<td>
											<span
												className={`badge ${
													a.status === 'submitted'
														? 'badge-green'
														: a.status === 'disqualified'
														? 'badge-red'
														: 'badge-amber'
												}`}
											>
												{a.status === 'disqualified' ? 'Disqualified' : a.status}
											</span>
										</td>
										<td>
											{a.submittedAt
												? new Date(a.submittedAt).toLocaleString()
												: 'In progress'}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			)}

			<Modal
				open={modal}
				onClose={() => setModal(false)}
				title="Create result"
				wide
				footer={
					<button type="submit" form="res-form" className="btn btn-primary">
						Save
					</button>
				}
			>
				<form id="res-form" onSubmit={handleCreate} className="form-grid">
					<div className="form-group">
						<label className="label">Student</label>
						<select className="select" value={form.student} onChange={set('student')} required>
							<option value="">Select</option>
							{students.map((s) => (
								<option key={s._id} value={s._id}>
									{s.enrollmentNo}
								</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label className="label">Course (subject)</label>
						<select className="select" value={form.course} onChange={set('course')} required>
							<option value="">Select</option>
							{courses.map((c) => (
								<option key={c._id} value={c._id}>
									{c.courseCode}
								</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label className="label">Semester</label>
						<input className="input" type="number" min={1} max={8} value={form.semester} onChange={set('semester')} />
					</div>
					<div className="form-group">
						<label className="label">Academic year</label>
						<input className="input" value={form.academicYear} onChange={set('academicYear')} />
					</div>
					<div className="form-group">
						<label className="label">Internal marks</label>
						<input className="input" type="number" value={form.internalMarks} onChange={set('internalMarks')} />
					</div>
					<div className="form-group">
						<label className="label">External marks</label>
						<input className="input" type="number" value={form.externalMarks} onChange={set('externalMarks')} />
					</div>
					<div className="form-group">
						<label className="label">SGPA</label>
						<input className="input" type="number" step="0.01" value={form.sgpa} onChange={set('sgpa')} />
					</div>
					<div className="form-group">
						<label className="label">CGPA</label>
						<input className="input" type="number" step="0.01" value={form.cgpa} onChange={set('cgpa')} />
					</div>
				</form>
			</Modal>
		</>
	);
}

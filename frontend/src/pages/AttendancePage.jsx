import React, { useEffect, useState } from 'react';
import { Plus, Download, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { listAttendance, markAttendance, getSummary, downloadAttendancePdf } from '../services/attendanceService.js';
import { listStudents } from '../services/studentService.js';
import { listCourses } from '../services/courseService.js';
import { listFaculty } from '../services/facultyService.js';
import { getMyProfile } from '../services/studentService.js';
import Modal from '../components/Modal.jsx';
import { ATTENDANCE_STATUS } from '../constants/index.js';

export default function AttendancePage() {
	const { token, user, isAdmin, isFaculty, isStudent } = useAuth();
	const { toast } = useToast();
	const [records, setRecords] = useState([]);
	const [students, setStudents] = useState([]);
	const [courses, setCourses] = useState([]);
	const [faculty, setFaculty] = useState([]);
	const [myProfile, setMyProfile] = useState(null);
	const [modal, setModal] = useState(false);
	const [summary, setSummary] = useState(null);
	const [summarySel, setSummarySel] = useState({ student: '', course: '' });
	const [form, setForm] = useState({
		student: '',
		course: '',
		markedBy: '',
		date: new Date().toISOString().slice(0, 10),
		status: 'Present',
		remarks: '',
	});

	useEffect(() => {
		if (user?.faculty?._id) {
			setForm((f) => ({ ...f, markedBy: user.faculty._id }));
		}
	}, [user]);

	const load = () =>
		listAttendance(token, { limit: 30 })
			.then((r) => setRecords(r.items))
			.catch((e) => toast(e.message, 'error'));

	useEffect(() => {
		load();
		listCourses(token, { limit: 100 }).then((r) => setCourses(r.items));
		if (isAdmin || isFaculty) {
			listStudents(token, { limit: 100 })
				.then((r) => setStudents(r.items))
				.catch((e) => toast(e.message, 'error'));
			if (isAdmin) {
				listFaculty(token, { limit: 100 })
					.then((r) => setFaculty(r.items))
					.catch((e) => toast(e.message, 'error'));
			}
		}
		if (isStudent) getMyProfile(token).then(setMyProfile);
	}, [token, isAdmin, isFaculty, isStudent]);

	const handleMark = async (e) => {
		e.preventDefault();
		try {
			await markAttendance(
				{
					...form,
					markedBy: user?.faculty?._id || form.markedBy,
					date: new Date(form.date).toISOString(),
				},
				token
			);
			toast('Attendance saved', 'success');
			setModal(false);
			load();
		} catch (e) {
			toast(e.message, 'error');
		}
	};

	const loadSummary = async () => {
		const sid = isStudent ? myProfile?._id : summarySel.student;
		const cid = summarySel.course;
		if (!sid || !cid) return toast('Select student and course', 'error');
		try {
			const s = await getSummary(sid, cid, token);
			setSummary(s);
		} catch (e) {
			toast(e.message, 'error');
		}
	};

	const downloadPdf = async () => {
		const sid = isStudent ? myProfile?._id : summarySel.student;
		const cid = summarySel.course;
		try {
			const res = await downloadAttendancePdf(sid, cid, token);
			window.open(res.url, '_blank');
		} catch (e) {
			toast(e.message, 'error');
		}
	};

	const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

	return (
		<>
			<div className="page-header">
				<div>
					<h1>Attendance</h1>
					<p>Track and manage class attendance</p>
				</div>
				{(isAdmin || isFaculty) && (
					<button type="button" className="btn btn-primary" onClick={() => setModal(true)}>
						<Plus size={16} /> Mark attendance
					</button>
				)}
			</div>

			<div className="card card-padded" style={{ marginBottom: '1.5rem' }}>
				<h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
					<BarChart3 size={18} /> Attendance summary
				</h3>
				<div className="form-grid">
					{!isStudent && (
						<div className="form-group">
							<label className="label">Student</label>
							<select
								className="select"
								value={summarySel.student}
								onChange={(e) => setSummarySel({ ...summarySel, student: e.target.value })}
							>
								<option value="">Select</option>
								{students.map((s) => (
									<option key={s._id} value={s._id}>
										{s.enrollmentNo} — {s.user?.name}
									</option>
								))}
							</select>
						</div>
					)}
					<div className="form-group">
						<label className="label">Course</label>
						<select
							className="select"
							value={summarySel.course}
							onChange={(e) => setSummarySel({ ...summarySel, course: e.target.value })}
						>
							<option value="">Select</option>
							{courses.map((c) => (
								<option key={c._id} value={c._id}>
									{c.courseCode} — {c.title}
								</option>
							))}
						</select>
					</div>
				</div>
				<div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
					<button type="button" className="btn btn-secondary btn-sm" onClick={loadSummary}>
						View summary
					</button>
					<button type="button" className="btn btn-secondary btn-sm" onClick={downloadPdf}>
						<Download size={14} /> PDF
					</button>
				</div>
				{summary && (
					<div style={{ marginTop: '1rem' }}>
						<p>
							Present: <strong>{summary.present}</strong> / {summary.total} ({summary.percentage}%)
						</p>
						<div className="progress-bar" style={{ marginTop: 8 }}>
							<div
								className={`progress-bar-fill${Number(summary.percentage) < 75 ? ' low' : ''}`}
								style={{ width: `${summary.percentage}%` }}
							/>
						</div>
					</div>
				)}
			</div>

			<div className="card table-wrap">
				<table className="table">
					<thead>
						<tr>
							<th>Date</th>
							<th>Student</th>
							<th>Course</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{records.map((r) => (
							<tr key={r._id}>
								<td>{new Date(r.date).toLocaleDateString()}</td>
								<td>{r.student?.enrollmentNo || r.student}</td>
								<td>{r.course?.courseCode || r.course}</td>
								<td>
									<span
										className={`badge ${
											r.status === 'Present' || r.status === 'Late' ? 'badge-green' : 'badge-red'
										}`}
									>
										{r.status}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Modal
				open={modal}
				onClose={() => setModal(false)}
				title="Mark attendance"
				footer={
					<button type="submit" form="att-form" className="btn btn-primary">
						Save
					</button>
				}
			>
				<form id="att-form" onSubmit={handleMark}>
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
						<label className="label">Course</label>
						<select className="select" value={form.course} onChange={set('course')} required>
							<option value="">Select</option>
							{courses.map((c) => (
								<option key={c._id} value={c._id}>
									{c.courseCode}
								</option>
							))}
						</select>
					</div>
					{isFaculty && user?.faculty ? (
						<div className="form-group">
							<label className="label">Marked by</label>
							<input className="input" value={user.faculty.employeeId} disabled />
							<input type="hidden" value={form.markedBy} />
						</div>
					) : (
						<div className="form-group">
							<label className="label">Marked by (Faculty)</label>
							<select className="select" value={form.markedBy} onChange={set('markedBy')} required>
								<option value="">Select</option>
								{faculty.map((f) => (
									<option key={f._id} value={f._id}>
										{f.employeeId}
									</option>
								))}
							</select>
						</div>
					)}
					<div className="form-group">
						<label className="label">Date</label>
						<input className="input" type="date" value={form.date} onChange={set('date')} required />
					</div>
					<div className="form-group">
						<label className="label">Status</label>
						<select className="select" value={form.status} onChange={set('status')}>
							{ATTENDANCE_STATUS.map((s) => (
								<option key={s}>{s}</option>
							))}
						</select>
					</div>
				</form>
			</Modal>
		</>
	);
}

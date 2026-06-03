import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Play, Send, Ban, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import Modal from '../components/Modal.jsx';
import { listCourses } from '../services/courseService.js';
import {
	listQuizzes,
	createQuiz,
	publishQuiz,
	startAttempt,
	submitAttempt,
	listAttempts,
} from '../services/quizService.js';

const blankQuestion = () => ({
	prompt: '',
	options: ['', '', '', ''],
	correctOption: 0,
	marks: 1,
});

export default function QuizzesPage() {
	const { token, isFaculty, isStudent, isAdmin, logout } = useAuth();
	const { toast } = useToast();

	const [quizzes, setQuizzes] = useState([]);
	const [courses, setCourses] = useState([]);
	const [attemptsMap, setAttemptsMap] = useState({});
	const [createOpen, setCreateOpen] = useState(false);
	const [attempting, setAttempting] = useState(null);
	const [saving, setSaving] = useState(false);

	const [form, setForm] = useState({
		title: '',
		description: '',
		course: '',
		durationMinutes: 20,
		questions: [blankQuestion()],
	});

	const [answers, setAnswers] = useState({});

	const canCreate = isFaculty || isAdmin;

	const load = async () => {
		try {
			const [q, c] = await Promise.all([
				listQuizzes(token, { limit: 50 }),
				listCourses(token, { limit: 100 }),
			]);
			setQuizzes(q.items || []);
			setCourses(c.items || []);
		} catch (e) {
			toast(e.message, 'error');
		}
	};

	useEffect(() => {
		load();
	}, [token]);

	useEffect(() => {
		if (!attempting || !isStudent) return;
		const onVisibility = async () => {
			if (document.hidden) {
				try {
					await submitAttempt(
						attempting._id,
						{
							answers: Object.entries(answers).map(([questionIndex, selectedOption]) => ({
								questionIndex: Number(questionIndex),
								selectedOption: Number(selectedOption),
							})),
							tabSwitched: true,
						},
						token
					);
				} catch {
					// best effort
				}
				toast('You changed tab. Quiz attempt disqualified.', 'error');
				logout();
			}
		};
		document.addEventListener('visibilitychange', onVisibility);
		return () => document.removeEventListener('visibilitychange', onVisibility);
	}, [attempting, answers, token, isStudent, logout, toast]);

	const addQuestion = () =>
		setForm((prev) => ({ ...prev, questions: [...prev.questions, blankQuestion()] }));

	const removeQuestion = (idx) =>
		setForm((prev) => ({
			...prev,
			questions: prev.questions.filter((_, i) => i !== idx),
		}));

	const setQuestion = (idx, patch) =>
		setForm((prev) => ({
			...prev,
			questions: prev.questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)),
		}));

	const validQuestions = useMemo(
		() =>
			form.questions
				.map((q) => ({
					...q,
					options: q.options.map((o) => o.trim()).filter(Boolean),
				}))
				.filter((q) => q.prompt.trim() && q.options.length >= 2),
		[form.questions]
	);

	const handleCreate = async (e) => {
		e.preventDefault();
		if (!form.title.trim() || validQuestions.length === 0) {
			toast('Add a title and at least one valid question', 'error');
			return;
		}
		setSaving(true);
		try {
			await createQuiz(
				{
					title: form.title,
					description: form.description,
					course: form.course || null,
					durationMinutes: Number(form.durationMinutes),
					questions: validQuestions,
				},
				token
			);
			toast('Quiz created', 'success');
			setCreateOpen(false);
			setForm({
				title: '',
				description: '',
				course: '',
				durationMinutes: 20,
				questions: [blankQuestion()],
			});
			load();
		} catch (e) {
			toast(e.message, 'error');
		} finally {
			setSaving(false);
		}
	};

	const startQuiz = async (quiz) => {
		try {
			const res = await startAttempt(quiz._id, token);
			setAttempting(res.quiz);
			const initial = {};
			res.quiz.questions.forEach((_, idx) => {
				initial[idx] = -1;
			});
			setAnswers(initial);
		} catch (e) {
			toast(e.message, 'error');
		}
	};

	const submitQuiz = async (tabSwitched = false) => {
		if (!attempting) return;
		try {
			const payload = {
				answers: Object.entries(answers).map(([questionIndex, selectedOption]) => ({
					questionIndex: Number(questionIndex),
					selectedOption: Number(selectedOption),
				})),
				tabSwitched,
			};
			const result = await submitAttempt(attempting._id, payload, token);
			toast(
				result.status === 'disqualified'
					? 'Attempt disqualified'
					: `Quiz submitted. Score ${result.score}/${result.totalMarks}`,
				result.status === 'disqualified' ? 'error' : 'success'
			);
			setAttempting(null);
			load();
		} catch (e) {
			toast(e.message, 'error');
		}
	};

	const openAttempts = async (quizId) => {
		try {
			const attempts = await listAttempts(quizId, token);
			setAttemptsMap((prev) => ({ ...prev, [quizId]: attempts }));
		} catch (e) {
			toast(e.message, 'error');
		}
	};

	return (
		<>
			<div className="page-header">
				<div>
					<h1>Exams / Quizzes</h1>
					<p>Faculty can create quizzes. Students can attempt online.</p>
				</div>
				{canCreate && (
					<button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
						<Plus size={16} /> Create quiz
					</button>
				)}
			</div>

			{attempting && (
				<div className="card card-padded" style={{ marginBottom: '1rem', border: '1px solid #ef4444' }}>
					<h3 style={{ marginBottom: 6 }}>{attempting.title}</h3>
					<p className="small" style={{ marginBottom: '1rem' }}>
						Do not switch tabs/windows. If you do, this attempt is auto-disqualified.
					</p>
					{attempting.questions.map((q, idx) => (
						<div key={idx} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
							<p>
								<strong>Q{idx + 1}.</strong> {q.prompt}
							</p>
							{q.options.map((opt, optIdx) => (
								<label key={optIdx} style={{ display: 'block', marginTop: 6 }}>
									<input
										type="radio"
										name={`q-${idx}`}
										checked={Number(answers[idx]) === optIdx}
										onChange={() => setAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
									/>{' '}
									{opt}
								</label>
							))}
						</div>
					))}
					<div style={{ display: 'flex', gap: 8 }}>
						<button className="btn btn-primary" onClick={() => submitQuiz(false)}>
							<Send size={14} /> Submit
						</button>
						<button className="btn btn-secondary" onClick={() => submitQuiz(true)}>
							<Ban size={14} /> Disqualify & Exit
						</button>
					</div>
				</div>
			)}

			<div className="card table-wrap">
				<table className="table">
					<thead>
						<tr>
							<th>Title</th>
							<th>Course</th>
							<th>Duration</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{quizzes.map((quiz) => (
							<React.Fragment key={quiz._id}>
								<tr>
									<td>
										<strong>{quiz.title}</strong>
										<div className="small">{quiz.description || '—'}</div>
									</td>
									<td>{quiz.course?.courseCode || 'General'}</td>
									<td>{quiz.durationMinutes} min</td>
									<td>
										<span className={`badge ${quiz.isPublished ? 'badge-green' : 'badge-blue'}`}>
											{quiz.isPublished ? 'Published' : 'Draft'}
										</span>
									</td>
									<td>
										{isStudent && quiz.isPublished && !attempting && (
											<button className="btn btn-secondary btn-sm" onClick={() => startQuiz(quiz)}>
												<Play size={14} /> Start
											</button>
										)}
										{canCreate && !quiz.isPublished && (
											<button
												className="btn btn-secondary btn-sm"
												onClick={async () => {
													try {
														await publishQuiz(quiz._id, token);
														toast('Quiz published', 'success');
														load();
													} catch (e) {
														toast(e.message, 'error');
													}
												}}
											>
												<CheckCircle2 size={14} /> Publish
											</button>
										)}
										{canCreate && (
											<button
												className="btn btn-ghost btn-sm"
												onClick={() => openAttempts(quiz._id)}
												style={{ marginLeft: 8 }}
											>
												Attempts
											</button>
										)}
									</td>
								</tr>
								{canCreate && attemptsMap[quiz._id] && (
									<tr>
										<td colSpan={5}>
											<div className="small">
												<strong>Attempts:</strong>{' '}
												{attemptsMap[quiz._id].length === 0
													? 'No attempts yet'
													: attemptsMap[quiz._id]
															.map(
																(a) =>
																	`${a.student?.user?.name || a.student?.enrollmentNo}: ${a.score}/${a.totalMarks} (${a.status})`
															)
															.join(' | ')}
											</div>
										</td>
									</tr>
								)}
							</React.Fragment>
						))}
					</tbody>
				</table>
			</div>

			<Modal
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				title="Create quiz"
				wide
				footer={
					<button type="submit" form="quiz-form" className="btn btn-primary" disabled={saving}>
						{saving ? 'Saving...' : 'Create'}
					</button>
				}
			>
				<form id="quiz-form" onSubmit={handleCreate}>
					<div className="form-grid">
						<div className="form-group">
							<label className="label">Title</label>
							<input className="input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
						</div>
						<div className="form-group">
							<label className="label">Course (optional)</label>
							<select
								className="select"
								value={form.course}
								onChange={(e) => setForm((p) => ({ ...p, course: e.target.value }))}
							>
								<option value="">General quiz</option>
								{courses.map((c) => (
									<option key={c._id} value={c._id}>
										{c.courseCode} - {c.title}
									</option>
								))}
							</select>
						</div>
						<div className="form-group">
							<label className="label">Duration (minutes)</label>
							<input
								className="input"
								type="number"
								min={1}
								max={240}
								value={form.durationMinutes}
								onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))}
							/>
						</div>
						<div className="form-group" style={{ gridColumn: '1 / -1' }}>
							<label className="label">Description</label>
							<textarea
								className="input"
								rows={2}
								value={form.description}
								onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
							/>
						</div>
					</div>

					{form.questions.map((q, idx) => (
						<div key={idx} className="card card-padded" style={{ marginBottom: '0.75rem' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
								<strong>Question {idx + 1}</strong>
								{form.questions.length > 1 && (
									<button type="button" className="btn btn-ghost btn-sm" onClick={() => removeQuestion(idx)}>
										Remove
									</button>
								)}
							</div>
							<input
								className="input"
								placeholder="Question text"
								value={q.prompt}
								onChange={(e) => setQuestion(idx, { prompt: e.target.value })}
							/>
							<div className="form-grid" style={{ marginTop: 8 }}>
								{q.options.map((opt, optIdx) => (
									<div className="form-group" key={optIdx}>
										<label className="label">Option {optIdx + 1}</label>
										<input
											className="input"
											value={opt}
											onChange={(e) =>
												setQuestion(idx, {
													options: q.options.map((o, i) => (i === optIdx ? e.target.value : o)),
												})
											}
										/>
									</div>
								))}
								<div className="form-group">
									<label className="label">Correct option</label>
									<select
										className="select"
										value={q.correctOption}
										onChange={(e) => setQuestion(idx, { correctOption: Number(e.target.value) })}
									>
										{q.options.map((_, i) => (
											<option key={i} value={i}>
												Option {i + 1}
											</option>
										))}
									</select>
								</div>
								<div className="form-group">
									<label className="label">Marks</label>
									<input
										className="input"
										type="number"
										min={1}
										value={q.marks}
										onChange={(e) => setQuestion(idx, { marks: Number(e.target.value || 1) })}
									/>
								</div>
							</div>
						</div>
					))}

					<button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}>
						<Plus size={14} /> Add question
					</button>
				</form>
			</Modal>
		</>
	);
}

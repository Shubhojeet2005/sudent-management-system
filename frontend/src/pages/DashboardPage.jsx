import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Award, Megaphone, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { listStudents } from '../services/studentService.js';
import { listCourses } from '../services/courseService.js';
import { listResults } from '../services/resultService.js';
import { listNotices } from '../services/noticeService.js';
import { getMyProfile } from '../services/studentService.js';

export default function DashboardPage() {
	const { token, isAdmin, isFaculty, isStudent, user } = useAuth();
	const [stats, setStats] = useState({ students: 0, courses: 0, results: 0, notices: 0 });
	const [profile, setProfile] = useState(null);
	const [notices, setNotices] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const noticeRes = await listNotices({ limit: 5 });
				setNotices(noticeRes.items);

				if (isStudent) {
					const p = await getMyProfile(token);
					setProfile(p);
				}

				if (isAdmin || isFaculty) {
					const [s, c, r] = await Promise.all([
						listStudents(token, { limit: 1 }),
						listCourses(token, { limit: 1 }),
						listResults(token, { limit: 1 }),
					]);
					setStats({
						students: s.pagination?.total ?? 0,
						courses: c.pagination?.total ?? 0,
						results: r.pagination?.total ?? 0,
						notices: noticeRes.pagination?.total ?? noticeRes.items.length,
					});
				}
			} catch {
				/* partial load ok */
			} finally {
				setLoading(false);
			}
		};
		if (token) load();
	}, [token, isAdmin, isFaculty, isStudent]);

	if (loading) {
		return (
			<div className="loading-center">
				<div className="spinner" />
			</div>
		);
	}

	return (
		<>
			<div className="page-header">
				<div>
					<h1>Welcome, {user?.name?.split(' ')[0]}</h1>
					<p>MMMUT Student Management — {user?.role} dashboard</p>
				</div>
			</div>

			{isStudent && profile && (
				<div className="stat-grid">
					<div className="stat-card">
						<div className="stat-icon" style={{ background: '#dbeafe' }}>
							<TrendingUp color="#1e40af" size={22} />
						</div>
						<div>
							<h3>{profile.cgpa ?? '—'}</h3>
							<p>CGPA</p>
						</div>
					</div>
					<div className="stat-card">
						<div>
							<h3>Sem {profile.semester}</h3>
							<p>{profile.branch}</p>
						</div>
					</div>
					<div className="stat-card">
						<div>
							<h3>{profile.enrollmentNo}</h3>
							<p>Enrollment No.</p>
						</div>
					</div>
				</div>
			)}

			{(isAdmin || isFaculty) && (
				<div className="stat-grid">
					{isAdmin && (
						<div className="stat-card">
							<div className="stat-icon" style={{ background: '#dbeafe' }}>
								<Users color="#1e40af" size={22} />
							</div>
							<div>
								<h3>{stats.students}</h3>
								<p>Students</p>
							</div>
						</div>
					)}
					<div className="stat-card">
						<div className="stat-icon" style={{ background: '#d1fae5' }}>
							<BookOpen color="#059669" size={22} />
						</div>
						<div>
							<h3>{stats.courses}</h3>
							<p>Courses</p>
						</div>
					</div>
					<div className="stat-card">
						<div className="stat-icon" style={{ background: '#fef3c7' }}>
							<Award color="#d97706" size={22} />
						</div>
						<div>
							<h3>{stats.results}</h3>
							<p>Results</p>
						</div>
					</div>
					<div className="stat-card">
						<div className="stat-icon" style={{ background: '#ede9fe' }}>
							<Megaphone color="#7c3aed" size={22} />
						</div>
						<div>
							<h3>{stats.notices}</h3>
							<p>Notices</p>
						</div>
					</div>
				</div>
			)}

			<div className="grid-2">
				<div className="card card-padded">
					<h3 style={{ marginBottom: '1rem' }}>Quick links</h3>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
						<Link to="/courses" className="btn btn-secondary btn-sm">
							Courses
						</Link>
						<Link to="/attendance" className="btn btn-secondary btn-sm">
							Attendance
						</Link>
						<Link to="/results" className="btn btn-secondary btn-sm">
							Results
						</Link>
						<Link to="/notices" className="btn btn-secondary btn-sm">
							Notices
						</Link>
						{(isAdmin || isFaculty) && (
							<Link to="/students" className="btn btn-secondary btn-sm">
								Students
							</Link>
						)}
					</div>
				</div>

				<div className="card card-padded">
					<h3 style={{ marginBottom: '1rem' }}>Latest notices</h3>
					{notices.length === 0 ? (
						<p className="empty-state" style={{ padding: '1rem' }}>
							No notices yet
						</p>
					) : (
						notices.map((n) => (
							<div
								key={n._id}
								className={`notice-card${n.isPinned ? ' pinned' : ''}`}
								style={{ marginBottom: '0.75rem' }}
							>
								<div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
									<strong>{n.title}</strong>
									<span className="badge badge-gray">{n.category}</span>
								</div>
								<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
									{n.content?.slice(0, 120)}
									{n.content?.length > 120 ? '…' : ''}
								</p>
							</div>
						))
					)}
					<Link to="/notices" style={{ fontSize: '0.85rem' }}>
						View all →
					</Link>
				</div>
			</div>
		</>
	);
}

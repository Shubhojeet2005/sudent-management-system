import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
	LayoutDashboard,
	Users,
	GraduationCap,
	BookOpen,
	ClipboardCheck,
	Award,
	Megaphone,
	User,
	LogOut,
	Bell,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { getSocket } from '../lib/socket.js';

const NavItem = ({ to, icon: Icon, children }) => (
	<NavLink
		to={to}
		className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
		end={to === '/'}
	>
		<Icon size={18} />
		{children}
	</NavLink>
);

export default function DashboardLayout({ children }) {
	const { user, logout, isAdmin, isFaculty, isStudent, token } = useAuth();
	const navigate = useNavigate();
	const { toast } = useToast();

	useEffect(() => {
		const socket = getSocket();
		if (!socket) return;

		const handler = (notice) => {
			toast(`New notice: ${notice.title}`, 'success');
		};
		socket.on('notice:new', handler);
		return () => socket.off('notice:new', handler);
	}, [token, toast]);

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	const initials = user?.name
		?.split(' ')
		.map((n) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className="dashboard">
			<aside className="sidebar">
				<div className="sidebar-brand">
					<div className="logo-icon">MU</div>
					<div>
						<span>MMMUT Portal</span>
						<small>Student Management</small>
					</div>
				</div>

				<nav className="sidebar-nav">
					<NavItem to="/" icon={LayoutDashboard}>
						Dashboard
					</NavItem>

					{(isAdmin || isFaculty) && (
						<NavItem to="/students" icon={Users}>
							Students
						</NavItem>
					)}

					{isStudent && (
						<NavItem to="/my-profile" icon={User}>
							My Profile
						</NavItem>
					)}

					{isAdmin && (
						<NavItem to="/faculty" icon={GraduationCap}>
							Faculty
						</NavItem>
					)}

					<NavItem to="/courses" icon={BookOpen}>
						Courses
					</NavItem>

					<NavItem to="/attendance" icon={ClipboardCheck}>
						Attendance
					</NavItem>

					<NavItem to="/results" icon={Award}>
						Results
					</NavItem>

					<NavItem to="/notices" icon={Megaphone}>
						Notices
					</NavItem>

					<NavItem to="/profile" icon={User}>
						Settings
					</NavItem>
				</nav>

				<button
					type="button"
					className="nav-link"
					onClick={handleLogout}
					style={{ marginTop: 'auto', border: 'none', background: 'none', width: '100%', cursor: 'pointer' }}
				>
					<LogOut size={18} />
					Sign out
				</button>
			</aside>

			<div className="main-wrap">
				<header className="topbar">
					<div>
						<span className="badge badge-blue">{user?.role}</span>
					</div>
					<div className="user-menu">
						<Bell size={18} color="#64748b" />
						<div className="avatar">
							{user?.profilePhoto ? (
								<img src={user.profilePhoto} alt="" />
							) : (
								initials
							)}
						</div>
						<div>
							<div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
							<div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
						</div>
					</div>
				</header>
				<main className="page-content">{children}</main>
			</div>
		</div>
	);
}

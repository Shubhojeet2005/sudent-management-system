import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import PublicNoticesPage from './pages/PublicNoticesPage.jsx';

import DashboardPage from './pages/DashboardPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import StudentDetailPage from './pages/StudentDetailPage.jsx';
import MyProfilePage from './pages/MyProfilePage.jsx';
import FacultyPage from './pages/FacultyPage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import NoticesPage from './pages/NoticesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

export default function App() {
	return (
		<AuthProvider>
			<ToastProvider>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/forgot-password" element={<ForgotPasswordPage />} />
					<Route path="/reset-password/:token" element={<ResetPasswordPage />} />
					<Route path="/notices-public" element={<PublicNoticesPage />} />

					<Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

					<Route
						path="/students"
						element={
							<ProtectedRoute roles={['admin', 'faculty']}>
								<StudentsPage />
							</ProtectedRoute>
						}
					/>
					<Route path="/students/:id" element={<ProtectedRoute><StudentDetailPage /></ProtectedRoute>} />

					<Route
						path="/my-profile"
						element={
							<ProtectedRoute roles={['student']}>
								<MyProfilePage />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/faculty"
						element={
							<ProtectedRoute roles={['admin']}>
								<FacultyPage />
							</ProtectedRoute>
						}
					/>

					<Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
					<Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
					<Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
					<Route path="/notices" element={<ProtectedRoute><NoticesPage /></ProtectedRoute>} />
					<Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

					{/* Legacy redirects */}
					<Route path="/notice" element={<Navigate to="/notices" replace />} />

					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</ToastProvider>
		</AuthProvider>
	);
}

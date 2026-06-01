import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import DashboardLayout from './DashboardLayout.jsx';

export default function ProtectedRoute({ children, roles }) {
	const { user, authReady, loading } = useAuth();

	if (!authReady || loading) {
		return (
			<div className="loading-center" style={{ minHeight: '100vh' }}>
				<div className="spinner" />
			</div>
		);
	}

	if (!user) return <Navigate to="/login" replace />;

	if (roles && !roles.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return <DashboardLayout>{children}</DashboardLayout>;
}

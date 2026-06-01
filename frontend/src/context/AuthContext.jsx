import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService.js';
import { getStoredToken, clearAuthStorage } from '../services/api.js';
import { connectSocket, disconnectSocket } from '../lib/socket.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem('user'));
		} catch {
			return null;
		}
	});
	const [token, setToken] = useState(() => getStoredToken());
	const [loading, setLoading] = useState(true);
	const [authReady, setAuthReady] = useState(false);

	const persistAuth = useCallback((newToken, newUser) => {
		if (newToken) {
			localStorage.setItem('token', newToken);
			setToken(newToken);
		}
		if (newUser) {
			localStorage.setItem('user', JSON.stringify(newUser));
			setUser(newUser);
		}
	}, []);

	useEffect(() => {
		const init = async () => {
			const stored = getStoredToken();
			if (!stored) {
				setLoading(false);
				setAuthReady(true);
				return;
			}
			try {
				const me = await authService.getMe(stored);
				setToken(stored);
				setUser(me);
			} catch {
				clearAuthStorage();
				setToken(null);
				setUser(null);
			} finally {
				setLoading(false);
				setAuthReady(true);
			}
		};
		init();
	}, []);

	useEffect(() => {
		if (token) connectSocket();
		else disconnectSocket();
		return () => disconnectSocket();
	}, [token]);

	const login = async (email, password) => {
		setLoading(true);
		try {
			const res = await authService.login(email, password);
			persistAuth(res.token, res.user);
			return res;
		} finally {
			setLoading(false);
		}
	};

	const loginFaculty = async (employeeId, department) => {
		setLoading(true);
		try {
			const res = await authService.loginFaculty(employeeId, department);
			persistAuth(res.token, res.user);
			return res;
		} finally {
			setLoading(false);
		}
	};

	const logout = useCallback(() => {
		clearAuthStorage();
		setToken(null);
		setUser(null);
		disconnectSocket();
	}, []);

	const register = async (payload, adminToken) => {
		setLoading(true);
		try {
			const res = await authService.register(payload, adminToken);
			if (!adminToken) {
				persistAuth(res.token, res.user);
			}
			return res;
		} finally {
			setLoading(false);
		}
	};

	const registerStudent = async (payload, adminToken) => {
		setLoading(true);
		try {
			const res = await authService.registerStudent(payload, adminToken);
			if (!adminToken && res.token) {
				persistAuth(res.token, res.user);
			}
			return res;
		} finally {
			setLoading(false);
		}
	};

	const refreshUser = async () => {
		const t = getStoredToken();
		if (!t) return null;
		const me = await authService.getMe(t);
		persistAuth(t, me);
		return me;
	};

	const updateUserLocal = (partial) => {
		setUser((prev) => {
			const next = { ...prev, ...partial };
			localStorage.setItem('user', JSON.stringify(next));
			return next;
		});
	};

	const isAdmin = user?.role === 'admin';
	const isFaculty = user?.role === 'faculty';
	const isStudent = user?.role === 'student';

	return (
		<AuthContext.Provider
			value={{
				user,
				token: token || getStoredToken(),
				loading,
				authReady,
				login,
				loginFaculty,
				logout,
				register,
				registerStudent,
				refreshUser,
				updateUserLocal,
				setUser,
				isAdmin,
				isFaculty,
				isStudent,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;

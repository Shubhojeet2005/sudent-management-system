import { request, unwrap, upload } from './api.js';

const mapUser = (data) => ({
	_id: data._id,
	name: data.name,
	email: data.email,
	role: data.role,
	phone: data.phone || '',
	profilePhoto: data.profilePhoto || '',
	faculty: data.faculty || null,
	student: data.student || null,
});

export const login = async (email, password) => {
	const res = await request('/api/auth/login', { method: 'POST', body: { email, password } });
	const data = unwrap(res);
	return { token: data.token, user: mapUser(data) };
};

export const loginFaculty = async (employeeId, department) => {
	const res = await request('/api/auth/login/faculty', {
		method: 'POST',
		body: { employeeId, department },
	});
	const data = unwrap(res);
	return { token: data.token, user: mapUser(data) };
};

export const register = async (payload, token) => {
	const res = await request('/api/auth/register', {
		method: 'POST',
		body: payload,
		token,
	});
	const data = unwrap(res);
	return { token: data.token, user: mapUser(data) };
};

/** Creates user + student profile (public signup or admin adding a student) */
export const registerStudent = async (payload, token) => {
	const res = await request('/api/auth/register/student', {
		method: 'POST',
		body: payload,
		token,
	});
	const data = unwrap(res);
	return {
		token: data.token,
		user: mapUser(data),
		student: data.student,
	};
};

export const getMe = async (token) => {
	const res = await request('/api/auth/me', { token });
	return mapUser(unwrap(res));
};

export const updateProfile = async (payload, token) => {
	const res = await request('/api/auth/me', { method: 'PUT', body: payload, token });
	return mapUser(unwrap(res));
};

export const updatePassword = async (payload, token) => {
	await request('/api/auth/password', { method: 'PUT', body: payload, token });
};

export const forgotPassword = async (email) => {
	await request('/api/auth/forgot-password', { method: 'POST', body: { email } });
};

export const resetPassword = async (token, password) => {
	const res = await request('/api/auth/reset-password', {
		method: 'POST',
		body: { token, password },
	});
	const data = unwrap(res);
	return { token: data.token, user: mapUser(data) };
};

export const uploadProfilePhoto = async (file, token) => {
	const res = await upload('/api/auth/profile-photo', { file, field: 'profilePhoto', token });
	return unwrap(res);
};

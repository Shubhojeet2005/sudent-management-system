import { request, unwrap, listItems } from './api.js';

const q = (params) => {
	const s = new URLSearchParams(params).toString();
	return s ? `?${s}` : '';
};

export const listStudents = (token, params = {}) =>
	request(`/api/students${q(params)}`, { token }).then((r) => ({
		items: listItems(r),
		pagination: unwrap(r)?.pagination,
	}));

export const getMyProfile = (token) =>
	request('/api/students/me', { token }).then(unwrap);

export const getStudent = (id, token) =>
	request(`/api/students/${id}`, { token }).then(unwrap);

export const createStudent = (payload, token) =>
	request('/api/students', { method: 'POST', body: payload, token }).then(unwrap);

export const updateStudent = (id, payload, token) =>
	request(`/api/students/${id}`, { method: 'PUT', body: payload, token }).then(unwrap);

export const deleteStudent = (id, token) =>
	request(`/api/students/${id}`, { method: 'DELETE', token });

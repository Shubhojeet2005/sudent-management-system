import { request, unwrap, listItems } from './api.js';

const q = (params) => {
	const s = new URLSearchParams(params).toString();
	return s ? `?${s}` : '';
};

export const listFaculty = (token, params = {}) =>
	request(`/api/faculty${q(params)}`, { token }).then((r) => ({
		items: listItems(r),
		pagination: unwrap(r)?.pagination,
	}));

export const getFaculty = (id, token) =>
	request(`/api/faculty/${id}`, { token }).then(unwrap);

export const createFaculty = (payload, token) =>
	request('/api/faculty', { method: 'POST', body: payload, token }).then(unwrap);

export const updateFaculty = (id, payload, token) =>
	request(`/api/faculty/${id}`, { method: 'PUT', body: payload, token }).then(unwrap);

export const deleteFaculty = (id, token) =>
	request(`/api/faculty/${id}`, { method: 'DELETE', token });

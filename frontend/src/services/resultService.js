import { request, unwrap, listItems } from './api.js';

const q = (params) => {
	const s = new URLSearchParams(params).toString();
	return s ? `?${s}` : '';
};

export const listResults = (token, params = {}) =>
	request(`/api/results${q(params)}`, { token }).then((r) => ({
		items: listItems(r),
		pagination: unwrap(r)?.pagination,
	}));

export const getResult = (id, token) =>
	request(`/api/results/${id}`, { token }).then(unwrap);

export const createResult = (payload, token) =>
	request('/api/results', { method: 'POST', body: payload, token }).then(unwrap);

export const updateResult = (id, payload, token) =>
	request(`/api/results/${id}`, { method: 'PUT', body: payload, token }).then(unwrap);

export const publishResult = (id, token) =>
	request(`/api/results/${id}/publish`, { method: 'POST', token }).then(unwrap);

export const downloadResultPdf = (id, token) =>
	request(`/api/results/${id}/pdf`, { token }).then(unwrap);

export const deleteResult = (id, token) =>
	request(`/api/results/${id}`, { method: 'DELETE', token });

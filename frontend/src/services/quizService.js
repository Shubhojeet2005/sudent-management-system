import { request, unwrap, listItems } from './api.js';

const q = (params) => {
	const s = new URLSearchParams(params).toString();
	return s ? `?${s}` : '';
};

export const listQuizzes = (token, params = {}) =>
	request(`/api/quizzes${q(params)}`, { token }).then((r) => ({
		items: listItems(r),
		pagination: unwrap(r)?.pagination,
	}));

export const getQuiz = (id, token) => request(`/api/quizzes/${id}`, { token }).then(unwrap);

export const createQuiz = (payload, token) =>
	request('/api/quizzes', { method: 'POST', body: payload, token }).then(unwrap);

export const publishQuiz = (id, token) =>
	request(`/api/quizzes/${id}/publish`, { method: 'POST', token }).then(unwrap);

export const startAttempt = (id, token) =>
	request(`/api/quizzes/${id}/start`, { method: 'POST', token }).then(unwrap);

export const submitAttempt = (id, payload, token) =>
	request(`/api/quizzes/${id}/submit`, { method: 'POST', body: payload, token }).then(unwrap);

export const getMyAttempt = (id, token) =>
	request(`/api/quizzes/${id}/attempt/me`, { token }).then(unwrap);

export const listAttempts = (id, token) =>
	request(`/api/quizzes/${id}/attempts`, { token }).then((r) => listItems(r));

export const listMyAttempts = (token) =>
	request('/api/quizzes/attempts/me', { token }).then((r) => listItems(r));

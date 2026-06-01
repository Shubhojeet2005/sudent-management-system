import { request, unwrap, listItems, upload } from './api.js';

const q = (params) => {
	const s = new URLSearchParams(params).toString();
	return s ? `?${s}` : '';
};

export const listCourses = (token, params = {}) =>
	request(`/api/courses${q(params)}`, { token }).then((r) => ({
		items: listItems(r),
		pagination: unwrap(r)?.pagination,
	}));

export const getCourse = (id, token) =>
	request(`/api/courses/${id}`, { token }).then(unwrap);

export const createCourse = (payload, token) =>
	request('/api/courses', { method: 'POST', body: payload, token }).then(unwrap);

export const updateCourse = (id, payload, token) =>
	request(`/api/courses/${id}`, { method: 'PUT', body: payload, token }).then(unwrap);

export const deleteCourse = (id, token) =>
	request(`/api/courses/${id}`, { method: 'DELETE', token });

export const uploadSyllabus = (file, token) =>
	upload('/api/courses/upload-syllabus', { file, field: 'syllabus', token }).then(unwrap);

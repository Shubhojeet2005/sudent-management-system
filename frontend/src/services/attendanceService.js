import { request, unwrap, listItems } from './api.js';

const q = (params) => {
	const s = new URLSearchParams(params).toString();
	return s ? `?${s}` : '';
};

export const listAttendance = (token, params = {}) =>
	request(`/api/attendance${q(params)}`, { token }).then((r) => ({
		items: listItems(r),
		pagination: unwrap(r)?.pagination,
	}));

export const markAttendance = (payload, token) =>
	request('/api/attendance', { method: 'POST', body: payload, token }).then(unwrap);

export const getSummary = (studentId, courseId, token) =>
	request(`/api/attendance/summary/${studentId}/${courseId}`, { token }).then(unwrap);

export const downloadAttendancePdf = (studentId, courseId, token) =>
	request(`/api/attendance/summary/${studentId}/${courseId}/pdf`, { token }).then(unwrap);

import { request, unwrap, listItems, upload } from './api.js';

const q = (params) => {
	const s = new URLSearchParams(params).toString();
	return s ? `?${s}` : '';
};

export const listNotices = (params = {}) =>
	request(`/api/notices${q(params)}`).then((r) => ({
		items: listItems(r),
		pagination: unwrap(r)?.pagination,
	}));

export const getNotice = (id) => request(`/api/notices/${id}`).then(unwrap);

export const createNotice = (payload, token) =>
	request('/api/notices', { method: 'POST', body: payload, token }).then(unwrap);

export const updateNotice = (id, payload, token) =>
	request(`/api/notices/${id}`, { method: 'PUT', body: payload, token }).then(unwrap);

export const deleteNotice = (id, token) =>
	request(`/api/notices/${id}`, { method: 'DELETE', token });

export const uploadAttachment = (file, token) =>
	upload('/api/notices/upload', { file, field: 'attachment', token }).then(unwrap);

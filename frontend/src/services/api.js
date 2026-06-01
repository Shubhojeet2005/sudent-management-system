/** Empty in dev = same-origin + Vite proxy → backend :5001 */
const BASE =
	import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim() !== ''
		? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
		: import.meta.env.DEV
			? ''
			: 'http://localhost:5001';

export const getStoredToken = () => {
	const t = localStorage.getItem('token');
	return t ? t.trim().replace(/^"|"$/g, '') : null;
};

export const clearAuthStorage = () => {
	localStorage.removeItem('token');
	localStorage.removeItem('user');
};

const resolveToken = (token) => token || getStoredToken();

export async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
	const authToken = resolveToken(token);
	const opts = {
		method,
		headers: { ...headers },
	};

	if (body !== undefined && body !== null && method !== 'GET') {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(body);
	}

	if (authToken) {
		opts.headers.Authorization = `Bearer ${authToken}`;
	}

	let res;
	try {
		res = await fetch(`${BASE}${path}`, opts);
	} catch {
		throw new Error(
			'Cannot reach the API server. Open a terminal, run: cd backend && npm start — then try again.'
		);
	}
	const ct = res.headers.get('content-type');
	const data = ct?.includes('application/json') ? await res.json() : null;

	if (res.status === 401) {
		clearAuthStorage();
		const msg = data?.message || 'Session expired. Please sign in again.';
		if (!window.location.pathname.includes('/login')) {
			window.location.href = '/login';
		}
		throw new Error(msg);
	}

	if (!res.ok) {
		throw new Error(data?.message || res.statusText || 'Request failed');
	}

	if (data && data.success === false) {
		throw new Error(data.message || 'Request failed');
	}

	return data;
}

export async function upload(path, { file, field, token }) {
	const authToken = resolveToken(token);
	const fd = new FormData();
	fd.append(field, file);

	const headers = {};
	if (authToken) {
		headers.Authorization = `Bearer ${authToken}`;
	}

	const res = await fetch(`${BASE}${path}`, {
		method: 'POST',
		headers,
		body: fd,
	});

	const data = await res.json();

	if (res.status === 401) {
		clearAuthStorage();
		window.location.href = '/login';
		throw new Error(data?.message || 'Session expired. Please sign in again.');
	}

	if (!res.ok || data?.success === false) {
		throw new Error(data?.message || 'Upload failed');
	}
	return data;
}

export const unwrap = (response) => response?.data ?? response;

export const listItems = (response) => {
	const data = unwrap(response);
	return data?.items ?? (Array.isArray(data) ? data : []);
};

export const getPagination = (response) => {
	const data = unwrap(response);
	return data?.pagination ?? { total: 0, page: 1, limit: 10, pages: 1 };
};

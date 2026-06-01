export const sendSuccess = (res, statusCode = 200, data = null, message = '') => {
	const payload = { success: true };
	if (message) payload.message = message;
	if (data !== null && data !== undefined) payload.data = data;
	res.status(statusCode).json(payload);
};

export const sendPaginated = (res, data, pagination, message = '') => {
	sendSuccess(res, 200, { items: data, pagination }, message);
};

export const getPagination = (query) => {
	const page = Math.max(1, parseInt(query.page, 10) || 1);
	const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
	const skip = (page - 1) * limit;

	return { page, limit, skip };
};

export const buildPaginationMeta = (total, page, limit) => ({
	total,
	page,
	limit,
	pages: Math.ceil(total / limit) || 1,
});

import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, '../uploads');

const ensureDir = (subdir) => {
	const dir = path.join(uploadsRoot, subdir);
	fs.mkdirSync(dir, { recursive: true });
	return dir;
};

const diskStorage = (subdir) =>
	multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, ensureDir(subdir));
		},
		filename: (req, file, cb) => {
			const ext = path.extname(file.originalname);
			const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
			cb(null, `${base}-${Date.now()}${ext}`);
		},
	});

const imageFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image/')) {
		cb(null, true);
	} else {
		cb(new Error('Only image files are allowed'), false);
	}
};

const documentFilter = (req, file, cb) => {
	const allowed = [
		'application/pdf',
		'image/jpeg',
		'image/png',
		'image/webp',
	];
	if (allowed.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Only PDF or image files are allowed'), false);
	}
};

const createUpload = ({ subdir, field, maxSize, filter }) =>
	multer({
		storage: diskStorage(subdir),
		limits: { fileSize: maxSize },
		fileFilter: filter,
	}).single(field);

/** Profile photo upload — field name: profilePhoto */
export const uploadProfile = createUpload({
	subdir: 'profiles',
	field: 'profilePhoto',
	maxSize: 2 * 1024 * 1024,
	filter: imageFilter,
});

/** Notice attachment — field name: attachment */
export const uploadNoticeAttachment = createUpload({
	subdir: 'notices',
	field: 'attachment',
	maxSize: 5 * 1024 * 1024,
	filter: documentFilter,
});

/** Course syllabus — field name: syllabus */
export const uploadSyllabus = createUpload({
	subdir: 'syllabus',
	field: 'syllabus',
	maxSize: 10 * 1024 * 1024,
	filter: documentFilter,
});

/** Build public URL path for a stored file */
export const fileUrl = (req, subdir, filename) => {
	if (!filename) return '';
	const base = `${req.protocol}://${req.get('host')}`;
	return `${base}/uploads/${subdir}/${filename}`;
};

/** Wrap multer middleware so errors reach the global error handler */
export const handleUpload = (uploadMiddleware) => (req, res, next) => {
	uploadMiddleware(req, res, (err) => {
		if (err) {
			res.status(400);
			return next(err);
		}
		next();
	});
};

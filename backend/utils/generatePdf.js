import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfDir = path.join(__dirname, '../uploads/pdfs');

const ensurePdfDir = () => {
	fs.mkdirSync(pdfDir, { recursive: true });
};

const writePdfToFile = (doc, filename) => {
	ensurePdfDir();
	const filepath = path.join(pdfDir, filename);

	return new Promise((resolve, reject) => {
		const stream = fs.createWriteStream(filepath);
		doc.pipe(stream);
		doc.end();

		stream.on('finish', () => resolve({ filepath, filename }));
		stream.on('error', reject);
		doc.on('error', reject);
	});
};

const drawHeader = (doc, title, subtitle) => {
	doc.fontSize(18).font('Helvetica-Bold').text('MMMUT — Student Management', { align: 'center' });
	doc.moveDown(0.3);
	doc.fontSize(14).text(title, { align: 'center' });
	if (subtitle) {
		doc.fontSize(10).font('Helvetica').fillColor('#555').text(subtitle, { align: 'center' });
	}
	doc.moveDown(1);
	doc.fillColor('#000');
};

/**
 * Generate semester result mark sheet PDF.
 * Expects populated result: student (+ user), subjects.course
 */
export const generateResultPdf = async (result) => {
	const student = result.student;
	const user = student?.user;
	const studentName = user?.name || 'Student';
	const enrollmentNo = student?.enrollmentNo || '—';
	const rollNo = student?.rollNo || '—';
	const branch = student?.branch || '—';

	const filename = `result-${enrollmentNo}-sem${result.semester}-${Date.now()}.pdf`;
	const doc = new PDFDocument({ margin: 50, size: 'A4' });

	drawHeader(
		doc,
		'Semester Result',
		`Academic Year ${result.academicYear} · Semester ${result.semester}`
	);

	doc.fontSize(11).font('Helvetica');
	doc.text(`Name: ${studentName}`);
	doc.text(`Enrollment No: ${enrollmentNo}`);
	doc.text(`Roll No: ${rollNo}`);
	doc.text(`Branch: ${branch}`);
	doc.moveDown(1);

	const tableTop = doc.y;
	const col = { code: 50, title: 120, internal: 320, external: 380, total: 440, grade: 500 };

	doc.font('Helvetica-Bold').fontSize(10);
	doc.text('Code', col.code, tableTop);
	doc.text('Subject', col.title, tableTop);
	doc.text('Int.', col.internal, tableTop);
	doc.text('Ext.', col.external, tableTop);
	doc.text('Total', col.total, tableTop);
	doc.text('Grade', col.grade, tableTop);

	doc.moveTo(50, tableTop + 14).lineTo(550, tableTop + 14).stroke();
	doc.font('Helvetica').fontSize(9);

	let y = tableTop + 22;
	(result.subjects || []).forEach((sub) => {
		const course = sub.course || {};
		doc.text(course.courseCode || '—', col.code, y);
		doc.text(course.title || '—', col.title, y, { width: 190 });
		doc.text(String(sub.internalMarks ?? '—'), col.internal, y);
		doc.text(String(sub.externalMarks ?? '—'), col.external, y);
		doc.text(String(sub.totalMarks ?? '—'), col.total, y);
		doc.text(sub.grade || '—', col.grade, y);
		y += 20;
	});

	doc.moveDown(2);
	doc.y = Math.max(doc.y, y + 10);
	doc.font('Helvetica-Bold').fontSize(11);
	doc.text(`SGPA: ${result.sgpa ?? '—'}    CGPA: ${result.cgpa ?? '—'}    Result: ${result.result ?? '—'}`);
	doc.font('Helvetica').fontSize(8).fillColor('#888');
	doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, { align: 'right' });

	return writePdfToFile(doc, filename);
};

/**
 * Generate attendance summary PDF for a student in a course.
 */
export const generateAttendancePdf = async ({ student, course, summary }) => {
	const user = student?.user;
	const filename = `attendance-${student?.enrollmentNo || 'student'}-${Date.now()}.pdf`;
	const doc = new PDFDocument({ margin: 50, size: 'A4' });

	drawHeader(doc, 'Attendance Summary', course?.title || '');

	doc.fontSize(11).font('Helvetica');
	doc.text(`Student: ${user?.name || '—'}`);
	doc.text(`Enrollment No: ${student?.enrollmentNo || '—'}`);
	doc.text(`Course: ${course?.courseCode || '—'} — ${course?.title || '—'}`);
	doc.moveDown(1);

	doc.font('Helvetica-Bold');
	doc.text(`Total Classes: ${summary.total}`);
	doc.text(`Present: ${summary.present}`);
	doc.text(`Absent: ${summary.absent}`);
	doc.text(`Attendance %: ${summary.percentage}%`);

	doc.font('Helvetica').fontSize(8).fillColor('#888');
	doc.moveDown(2);
	doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, { align: 'right' });

	return writePdfToFile(doc, filename);
};

/** Return public URL path segment for a generated PDF filename */
export const pdfPublicPath = (filename) => `/uploads/pdfs/${filename}`;

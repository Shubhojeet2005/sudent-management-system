import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
	if (transporter) return transporter;

	const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

	if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
		throw new Error(
			'Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env'
		);
	}

	transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port: Number(SMTP_PORT) || 587,
		secure: process.env.SMTP_SECURE === 'true',
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASS,
		},
	});

	return transporter;
};

/**
 * Send an email.
 * @param {{ to: string, subject: string, text?: string, html?: string }} options
 */
export const sendEmail = async ({ to, subject, text, html }) => {
	const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

	await getTransporter().sendMail({
		from: `"Student Management" <${from}>`,
		to,
		subject,
		text,
		html: html || text,
	});
};

export const sendWelcomeEmail = async (user) => {
	await sendEmail({
		to: user.email,
		subject: 'Welcome to Student Management System',
		html: `
			<h2>Welcome, ${user.name}!</h2>
			<p>Your account has been created successfully.</p>
			<p><strong>Role:</strong> ${user.role}</p>
			<p>You can now log in and access your dashboard.</p>
		`,
	});
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
	await sendEmail({
		to: user.email,
		subject: 'Password Reset Request',
		html: `
			<h2>Password Reset</h2>
			<p>Hi ${user.name},</p>
			<p>You requested a password reset. Click the link below (valid for 10 minutes):</p>
			<p><a href="${resetUrl}">${resetUrl}</a></p>
			<p>If you did not request this, please ignore this email.</p>
		`,
	});
};

export const sendResultPublishedEmail = async (user, result) => {
	await sendEmail({
		to: user.email,
		subject: `Result Published — Semester ${result.semester}`,
		html: `
			<h2>Result Published</h2>
			<p>Hi ${user.name},</p>
			<p>Your result for <strong>Semester ${result.semester}</strong> (${result.academicYear}) is now available.</p>
			<p><strong>SGPA:</strong> ${result.sgpa} &nbsp;|&nbsp; <strong>CGPA:</strong> ${result.cgpa}</p>
			<p><strong>Outcome:</strong> ${result.result}</p>
			<p>Log in to the portal to view the full mark sheet.</p>
		`,
	});
};

export const sendNoticeEmail = async (user, notice) => {
	await sendEmail({
		to: user.email,
		subject: `[Notice] ${notice.title}`,
		html: `
			<h2>${notice.title}</h2>
			<p><strong>Category:</strong> ${notice.category}</p>
			<p>${notice.content}</p>
		`,
	});
};

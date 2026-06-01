import React, { useEffect, useState } from 'react';
import { Plus, Pin, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { listNotices, createNotice, deleteNotice, uploadAttachment } from '../services/noticeService.js';
import Modal from '../components/Modal.jsx';
import { NOTICE_CATEGORIES } from '../constants/index.js';

export default function NoticesPage() {
	const { token, isAdmin, isFaculty } = useAuth();
	const { toast } = useToast();
	const [items, setItems] = useState([]);
	const [modal, setModal] = useState(false);
	const [form, setForm] = useState({
		title: '',
		content: '',
		category: 'General',
		isPinned: false,
		attachment: '',
	});

	const load = () =>
		listNotices({ limit: 50 })
			.then((r) => setItems(r.items))
			.catch((e) => toast(e.message, 'error'));

	useEffect(() => {
		load();
	}, []);

	const handleCreate = async (e) => {
		e.preventDefault();
		try {
			await createNotice(form, token);
			toast('Notice posted', 'success');
			setModal(false);
			load();
		} catch (e) {
			toast(e.message, 'error');
		}
	};

	const handleFile = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const res = await uploadAttachment(file, token);
			setForm((f) => ({ ...f, attachment: res.url }));
			toast('Attachment uploaded', 'success');
		} catch (err) {
			toast(err.message, 'error');
		}
	};

	const set = (k) => (e) =>
		setForm({
			...form,
			[k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
		});

	return (
		<>
			<div className="page-header">
				<div>
					<h1>Notices</h1>
					<p>Announcements and circulars</p>
				</div>
				{(isAdmin || isFaculty) && (
					<button type="button" className="btn btn-primary" onClick={() => setModal(true)}>
						<Plus size={16} /> Post notice
					</button>
				)}
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
				{items.map((n) => (
					<div key={n._id} className={`card card-padded notice-card${n.isPinned ? ' pinned' : ''}`}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<div>
								{n.isPinned && (
									<span className="badge badge-amber" style={{ marginBottom: 8 }}>
										<Pin size={10} /> Pinned
									</span>
								)}
								<h3 style={{ fontSize: '1.1rem' }}>{n.title}</h3>
								<p style={{ marginTop: 8, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
									{n.content}
								</p>
								<p className="small" style={{ marginTop: 12 }}>
									{n.category} · {n.postedBy?.name || 'Admin'} · {new Date(n.createdAt).toLocaleDateString()}
									{n.views ? ` · ${n.views} views` : ''}
								</p>
								{n.attachment && (
									<a href={n.attachment} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem' }}>
										View attachment
									</a>
								)}
							</div>
							{(isAdmin || isFaculty) && (
								<button
									type="button"
									className="btn btn-ghost btn-sm"
									onClick={async () => {
										if (!confirm('Remove notice?')) return;
										await deleteNotice(n._id, token);
										load();
									}}
								>
									<Trash2 size={14} color="#dc2626" />
								</button>
							)}
						</div>
					</div>
				))}
			</div>

			<Modal
				open={modal}
				onClose={() => setModal(false)}
				title="Post notice"
				wide
				footer={
					<button type="submit" form="notice-form" className="btn btn-primary">
						Publish
					</button>
				}
			>
				<form id="notice-form" onSubmit={handleCreate}>
					<div className="form-group">
						<label className="label">Title</label>
						<input className="input" value={form.title} onChange={set('title')} required />
					</div>
					<div className="form-group">
						<label className="label">Category</label>
						<select className="select" value={form.category} onChange={set('category')}>
							{NOTICE_CATEGORIES.map((c) => (
								<option key={c}>{c}</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label className="label">Content</label>
						<textarea className="textarea" rows={5} value={form.content} onChange={set('content')} required />
					</div>
					<div className="form-group">
						<label>
							<input type="checkbox" checked={form.isPinned} onChange={set('isPinned')} /> Pin to top
						</label>
					</div>
					<div className="form-group">
						<label className="label">Attachment</label>
						<input type="file" accept=".pdf,image/*" onChange={handleFile} />
					</div>
				</form>
			</Modal>
		</>
	);
}

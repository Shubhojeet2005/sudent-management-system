import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listNotices } from '../services/noticeService.js';

export default function PublicNoticesPage() {
	const [items, setItems] = useState([]);

	useEffect(() => {
		listNotices({ limit: 20 }).then((r) => setItems(r.items));
	}, []);

	return (
		<div className="auth-page">
			<div className="auth-hero">
				<h1>Public Notices</h1>
				<p>Official announcements from MMMUT — no login required.</p>
			</div>
			<div className="auth-form-wrap" style={{ alignItems: 'flex-start', overflow: 'auto' }}>
				<div style={{ width: '100%', maxWidth: 640 }}>
					<Link to="/login" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
						← Back to login
					</Link>
					{items.map((n) => (
						<div key={n._id} className="card card-padded notice-card" style={{ marginBottom: '1rem' }}>
							<h3>{n.title}</h3>
							<span className="badge badge-gray">{n.category}</span>
							<p style={{ marginTop: 12, color: 'var(--text-muted)' }}>{n.content}</p>
							<p className="small" style={{ marginTop: 8 }}>
								{new Date(n.createdAt).toLocaleDateString()}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

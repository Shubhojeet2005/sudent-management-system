import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer, wide }) {
	if (!open) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal"
				style={wide ? { maxWidth: 720 } : undefined}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h2>
					<button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
						<X size={18} />
					</button>
				</div>
				<div className="modal-body">{children}</div>
				{footer && <div className="modal-footer">{footer}</div>}
			</div>
		</div>
	);
}

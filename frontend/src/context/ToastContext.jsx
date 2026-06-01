import React, { createContext, useState, useCallback } from 'react';

const ToastContext = createContext();

let id = 0;

export const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);

	const toast = useCallback((message, type = 'info') => {
		const tid = ++id;
		setToasts((t) => [...t, { id: tid, message, type }]);
		setTimeout(() => {
			setToasts((t) => t.filter((x) => x.id !== tid));
		}, 4000);
	}, []);

	return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			<div className="toast-container">
				{toasts.map((t) => (
					<div key={t.id} className={`toast ${t.type}`}>
						{t.message}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
};

export default ToastContext;

import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL?.trim() || (import.meta.env.DEV ? 'http://127.0.0.1:5001' : '');

let socket;

export const connectSocket = () => {
	if (!URL) return null;
	if (!socket) {
		socket = io(URL, { transports: ['websocket', 'polling'] });
	}
	return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};

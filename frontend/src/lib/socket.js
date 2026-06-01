import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let socket;

export const connectSocket = () => {
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

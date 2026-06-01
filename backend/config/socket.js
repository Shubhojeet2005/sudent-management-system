let io;

export const setIO = (socketServer) => {
	io = socketServer;
};

export const getIO = () => io;

export const emitNotice = (notice) => {
	if (io) {
		io.emit('notice:new', notice);
	}
};

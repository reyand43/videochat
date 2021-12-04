class EmptySocketTransport {
    /**
     * @param {Object} io
     * @param {Object} socket
     * @param {Array} routes
     */
    constructor({ io, users, messages, pipeline }) {
        this.io = io;
        this.users = users;
        this.messages = messages;
        this.pipeline = pipeline;
    }

    sendToAll(event, data) {
        this.io.emit(event, data);
    }

    sendToRoom(room, event, data) {
        this.io.to(room).emit(event, data);
    }

    // eslint-disable-next-line class-methods-use-this
    sendToSocket(socket, event, data) {
        if (socket) {
            socket.emit(event, data);
        }
    }
}

module.exports = EmptySocketTransport;

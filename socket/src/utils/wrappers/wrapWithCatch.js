const logger = require('../../config/logger');

module.exports = (func, io, users, messages, pipeline) => async (socket) => {
    try {
        await func(socket, io, users, messages, pipeline);
    } catch (e) {
        logger.error(`\`${e}\``);
        socket.disconnect();
    }
};

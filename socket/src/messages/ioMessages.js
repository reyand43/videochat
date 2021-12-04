const wrapWithCatch = require('../utils/wrappers/wrapWithCatch');
const onConnection = require('../services/common/onConnection');

module.exports = function initIoMessages(io, users, messages, pipeline) {
    io.on('connection', wrapWithCatch(onConnection, io, users, messages, pipeline));
};

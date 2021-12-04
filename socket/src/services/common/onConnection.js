const SocketTransport = require('../../utils/SocketTransport/SocketTransport');
const routes = require('../../routes');

module.exports = async function onConnection(socket, io, users, messages, pipeline) {
    // eslint-disable-next-line no-new
    new SocketTransport({ io, socket, routes, users, messages, pipeline });
};

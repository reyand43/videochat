const process = require('process');
const socket = require('socket.io');
const logger = require('./config/logger');
const { env, socketPort } = require('./config/vars');
const { server: config } = require('./config/socket');
const { version } = require('../package.json');
const initIoMessages = require('./messages/ioMessages');
const UserList = require('./utils/SocketTransport/UserList');
const MessageList = require('./utils/SocketTransport/MessageList');
const { pipeline } = require('stream');
const Pipeline = require('./utils/SocketTransport/Pipeline');

async function start() {
    const io = socket(config);
    const userList = new UserList;
    const messageList = new MessageList;
    const pipeline = new Pipeline;
    initIoMessages(io, userList, messageList, pipeline);
    io.listen(socketPort);
    logger.warn(`kurento socket v${version} server started on port ${socketPort} (${env})`);
}


start().catch((e) => {
    logger.error(e.message);
    process.exit();
});


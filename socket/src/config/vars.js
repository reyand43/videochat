const process = require('process');
require('dotenv').config();

module.exports = {
    socketPort: process.env.SOCKET_PORT,
    kurentoUrl: 'ws://78.46.107.230:8889/kurento',
    iceServers: {
        stun: {kurento: {ip: '64.233.165.127', port: 19302}, browser: 'stun.l.google.com:19302'},
        turns: ["kurentoturn:kurentoturnpassword@78.46.107.230:3486"],
    },
};

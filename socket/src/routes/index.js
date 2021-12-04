const call = require('./v1.call');
const user = require('./v1.user');
const message = require('./v1.message');

const routes = [
    call,
    user,
    message,
];

module.exports = routes;

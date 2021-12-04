const SocketRouter = require('./SocketRouter');
const controller = require('../controllers/socket/user.controller');

const router = new SocketRouter('v1:message:');

router.addRoute(
    'send',
    {},
    controller.addMessage
)

module.exports = router;

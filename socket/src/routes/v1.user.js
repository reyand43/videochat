const SocketRouter = require('./SocketRouter');
const controller = require('../controllers/socket/user.controller');

const router = new SocketRouter('v1:user:');

router.addRoute(
    'name',
    {},
    controller.addUsername
)

module.exports = router;

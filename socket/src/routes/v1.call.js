const SocketRouter = require('./SocketRouter');
const controller = require('../controllers/socket/call.controller');

const router = new SocketRouter('v1:call:');

router.addRoute(
    'offer',
    {},
    controller.listenCallOffer,
);

router.addRoute(
    'answer',
    {},
    controller.listenCallAnswer,
);

router.addRoute(
    'icecandidate',
    {},
    controller.listenCallIcecCandidate,
);

router.addRoute(
    'peer_info',
    {},
    controller.listenCallPeerInfo,
);

module.exports = router;

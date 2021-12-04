async function listenCallOffer(socketTransport, data) {
    socketTransport.initKurentoConnection(data);
}

async function listenCallAnswer(socketTransport, data) {
    socketTransport.sendToOthersInRoom(socketTransport.lessonToken, 'answer', data);
}

async function listenCallIcecCandidate(socketTransport, data) {
    socketTransport.addCandidate(data);
}

async function listenCallPeerInfo(socketTransport, data) {
    socketTransport.sendToOthersInRoom(socketTransport.lessonToken, 'peer_info', data);
}

module.exports = {
    listenCallOffer,
    listenCallAnswer,
    listenCallIcecCandidate,
    listenCallPeerInfo,
};

async function addUsername(socketTransport, data) {
    socketTransport.addUsername(data);
}

async function addMessage(socketTransport, data) {
    socketTransport.addMessage(data);
}

module.exports = {
    addUsername,
    addMessage,
};
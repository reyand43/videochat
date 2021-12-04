const getRandomInt = require('../utils/numbers').getRandomInt;
const { iceServers } = require('../config/vars');
class IceServersProvider {
    getRandomTurn() {
        const turns = iceServers.turns;
        return turns[getRandomInt(0, turns.length - 1)];
    }

    getIceServersForFrontend() {
        const result = [];
        const servers = iceServers;
        const turn = this.getRandomTurn();
        result.push({urls: `stun:${servers.stun.browser}`});

        const [cred, url] = turn.split('@');
        const [username, credential] = cred.split(':');
        result.push({urls: `turn:${url}`, username, credential});
        return result;
    }

    async getIceServersForKurento() {
        const servers = iceServers;
        let stun = servers.stun.kurento;
        const turn = this.getRandomTurn();
        return {turn, stun};
    }
}

module.exports = new IceServersProvider();

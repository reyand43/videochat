const kurentoClient = require('kurento-client');
const { kurentoUrl } = require('./vars');

class Kurento {
    constructor() {
        this.connection = null;
    }

    async getKurentoConnection() {
        if (this.connection) {
            return this.connection;
        }
        this.connection = await kurentoClient(kurentoUrl, {failAfter: 10});
        this.connection.on('disconnected', () => {
            console.log('Kurento.connection', 'Kurento client disconnected');
        });
        this.connection.on('reconnected', () => {
            console.log('Kurento.connection', 'Kurento client reconnected');
        });
        return this.connection;
    }

    async createPipeline() {
        const connection = await this.getKurentoConnection();
        return await connection.create('MediaPipeline');
    }

    async createWebrtcEndpoint(pipeline) {
        const endpoint = await pipeline.create('WebRtcEndpoint');
        return endpoint;
    }

    async retrive(id) {
        try {
            return await this.connection.getMediaobjectById(id);
        } catch (e) {
            return null;
        }
    }
}

module.exports = new Kurento();

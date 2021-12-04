const _ = require('lodash');

const logger = require('../config/logger');

const emptyFunction = () => {};

class SocketRouter {
    constructor(basePath) {
        this.basePath = basePath;
        this.routes = [];
        this.streamRoutes = [];
    }

    /**
     * @param {String} path
     * @param {Object} [options]
     * @param {Boolean} [options.withoutLog]
     * @param {Function} handlers
     */
    addRoute(path, options, ...handlers) {
        this.routes.push([path, options, handlers]);
    }

    /**
     * @param {String} path
     * @param {Object} [options]
     * @param {Boolean} [options.withoutLog]
     * @param {Function} handlers
     */
    addStreamRoute(path, options, ...handlers) {
        this.streamRoutes.push([path, options, handlers]);
    }

    /**
     * @param {SocketTransport} socketTransport
     */
    addSocket(socketTransport) {
        this.routes.map(async ([route, options, handlers]) => {
            const event = `${this.basePath}${route}`;
            socketTransport.addRoute(event, (data, cb) => {
                if (!_.get(options, 'withoutLog', false)) {
                    logger.info(`Receive '${event}' from userId: '${socketTransport.id}'`);
                }

                const callback = cb || emptyFunction;
                this.runHandlers({
                    handlers, socketTransport, data, callback,
                });
            });
        });

        this.streamRoutes.map(async ([route, handlers]) => {
            socketTransport.addStreamRoute(route, (data, cb) => {
                const callback = cb || emptyFunction;

                this.runHandlers({
                    handlers, socketTransport, data, callback,
                });
            });
        });
    }

    // eslint-disable-next-line class-methods-use-this
    async runHandlers({
        handlers, socketTransport, data, cb,
    }) {
        try {
            // eslint-disable-next-line no-restricted-syntax
            for (const h of handlers) {
                // eslint-disable-next-line no-await-in-loop
                await h(socketTransport, data, cb);
            }
        } catch (e) {
            console.log(e);
            socketTransport.disconnect();
        }
    }
}

module.exports = SocketRouter;

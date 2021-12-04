const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format((info) => {
            // eslint-disable-next-line no-param-reassign
            info.message = `_Log ${info.level} on_ ***socket:***\n`
                + `${info.message}`;
            return info;
        })(),
    ),
});

logger.add(new winston.transports.Console({
    format: winston.format.simple(),
}));

logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

module.exports = logger;

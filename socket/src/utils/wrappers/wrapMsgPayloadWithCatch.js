const logger = require('../../config/logger');

module.exports = function wrapMsgPayloadWithCatch(func, io, channel = null) {
    return (msg) => {
        const jsonBody = msg.content.toString();
        const body = JSON.parse(jsonBody);
        func(body, msg, channel, io).catch((e) => {
            const message = `\t*1.Stack*:\n\t\`${e.stack}\``
                + '\n\t*2.Message info*:'
                + `\n\t  \`exchange: ${msg.fields.exchange}`
                + `\n\t  routingKey: ${msg.fields.routingKey}`
                + `\n\t  redelivered: ${msg.fields.redelivered}\``
                + `\n\t*3.Message data*:\n\`${JSON.stringify(body, null, '   ')}\``
                + `\n\t*4.Error*:\n\t\`${e.message}\`\n`;
            logger.error(message);
            setTimeout(() => {
                if (channel) channel.nack(msg);
            }, 10000);
        });
    };
};

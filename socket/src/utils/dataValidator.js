const ApiError = require('../errors/ApiError');

function dataValidator(validator) {
    return async (socketTransport, data) => {
        const errors = await validator(socketTransport, data);

        if (errors) {
            throw new ApiError(400, errors);
        }
    };
}

exports.dataValidator = dataValidator;

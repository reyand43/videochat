function socketValidator(scheme) {
    return (socketTransport, data) => {
        const result = scheme.validate(data);

        if (result.error) {
            throw result.error;
        }
    };
}

exports.socketValidator = socketValidator;

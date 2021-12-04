module.exports = class APIError extends Error {
    constructor(status, ...errors) {
        super();
        this.status = status;
        this.errors = errors;
    }
};

module.exports = function objectToJsonBuffer(object) {
    const jsonObject = JSON.stringify(object);
    return Buffer.from(jsonObject);
};

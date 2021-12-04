const axios = require('axios');

/**
 * Make http request
 * @param {object} data
 * @param {string} data.url
 * @param {string} data.method
 * @param {object} [data.data] - Request body
 * @param {object} [data.params] - Request Url params
 * @param {object} [data.headers]
 * @returns {Promise<Object>}
 */
module.exports = function httpRequest(data) {
    return axios(data);
};

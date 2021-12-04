const _ = require('lodash');

module.exports = function generateRandomString(length = 10, alphabet = 'qweasdzxcrtyfghvbnuiojklmp1234567890') {
    return Array(length).fill(0).reduce((a) => {
        const random = _.random(0, alphabet.length - 1);
        return a + alphabet[random];
    }, '');
};

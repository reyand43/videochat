const _ = require('lodash');

function valuesResolver(value, values) {
    if (_.isArray(values)) {
        return values.includes(value);
    }

    return value === values;
}

exports.valuesResolver = valuesResolver;

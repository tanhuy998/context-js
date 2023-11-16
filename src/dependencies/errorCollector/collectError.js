const metadata = require("../../utils/metadata");
const { HANDLE_ERROR } = require("./constant");

/**
 * @param {Function} _class 
 */
function collectError(_class) {

    const prototype = _class.prototype

    for (const propName in prototype) {

        const prop = prototype[propName];

        if (typeof prop !== 'function') {

            continue;
        }

        const meta = metadata(propName);

        if (!meta) {

            continue;
        }

        resolve(_class, meta);
    }

    return _class;
}

function resolve(_class, _meta) {

    
}

module.exports = collectError;
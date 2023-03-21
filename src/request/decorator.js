const {Middleware} = require('../middleware/middleware.js');

function consumes(_headers) {

    return function(className, prop, descriptor) {

        function handler(req, res, next) {

            for (const type in _headers) {

                const reg = new RegExp(_headers[type]);

                const reqType = type.toLowerCase();

                const hasValue = (req.headers[reqType] || '').match(reg) || undefined;

                if (!req.headers[reqType] || !hasValue) {

                    res.status(400);
                    res.end('The request not match the endpoint conditions');

                    return;
                }
            }

            next();
        }

        return Middleware.before(handler)(className, prop, descriptor);
    }
}

module.exports = {consumes};
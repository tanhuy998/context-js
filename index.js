const callback = require('./callback/preInvokeFunction.js');
const decorator = require('./decorator/decoratorResult.js');
const http = require('./http/httpRouting.js');
const middleware = require('./middleware/middleware.js');
const response = require('./response/responseResult.js');
const baseController = require('./controller/baseController.js');
const requestDispatcher = require('./requestDispatcher.js');


module.exports = {
    ...callback, ...decorator, ...http, ...middleware, ...response, ...baseController, ...requestDispatcher
};
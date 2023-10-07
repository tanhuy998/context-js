//const PreInvokeFunction = require('./src/callback/preInvokeFunction.js');
const controller = require('./src/controller/baseController.js')
const decorator = require('./src/decorator/decoratorResult.js');
const http = require('./src/http/httpRouting.js');
const middleware = require('./src/middleware/middleware.js');
const response = require('./src/response/responseResult.js');
//const baseController = require('./src/controller/baseController.js');
const requestDispatcher = require('./src/requestDispatcher.js');
const responseDecorator = require('./src/response/decorator.js');


const ioc = require('./src/ioc/decorator.js');
const request = require('./src/request/decorator.js');
// const actionResults = {
//     ...require('./src/response/utils/view.js'),
//     ...require('./src/response/utils/redirect.js'),
//     ...require('./src/response/utils/fileResult.js'),
//     ...require('./src/response/utils/download.js'),
// };


module.exports.PreInvokeFunction = require('./src/callback/preInvokeFunction.js');

module.exports.BaseController = controller.BaseController;

module.exports.dispatchable = controller.dispatchable;

module.exports.Endpoint = http.Endpoint;

module.exports.Route = http.Route;

module.exports.routingContext = http.routingContext;

module.exports.Middleware = middleware.Middleware;

module.exports.response = response; // decorator

module.exports.args = requestDispatcher.args;

module.exports.dispatchRequest = requestDispatcher.dispatchRequest;

module.exports.requestParam = requestDispatcher.requestParam;

module.exports.contentType = responseDecorator.contentType;

module.exports.header = responseDecorator.header;

module.exports.responseBody = responseDecorator.responseBody;

//module.exports.BindType = ioc.BindType;

module.exports.autoBind = ioc.autoBind;

module.exports.is = ioc.is;

module.exports.consumes = request.consumes;

//module.exports.actionResult = actionResults;



// module.exports = {
//     PreInvokeFunction , 
//     ...controller, 
//     ...decorator, 
//     ...http, 
//     ...middleware, 
//     response, 
//     ...baseController, 
//     ...requestDispatcher, 
//     ...responseDecorator,
//     ...actionResults,
//     ...request,
//     ...ioc
// };
// const legacy = require('./legacy.js');

// const {stage_0_To_Stage_3_Adapter} = require('./tc39-stage3-decorator/adapterForLegacy.js');

// const {
//     PreInvokeFunction,
//     BaseController,
//     DecoratorResult,
//     DecoratorType,
//     MethodDecorator,
//     PropertyDecorator,
//     ClassDecorator,
//     RouteContext,
//     view,
//     redirect,
//     file,
//     download,
//     ViewResult, 
//     ViewResultError,
//     RedirectResult, 
//     RedirectResultNoContextError,
//     FileResult, 
//     FileResultNoContextError,
//     DownloadResult, 
//     DownloadResultNoContextError,
//     BindingContext,
// } = legacy;

// const exportContent = {
//     PreInvokeFunction,
//     BaseController,
//     DecoratorResult,
//     DecoratorType,
//     MethodDecorator,
//     PropertyDecorator,
//     ClassDecorator,
//     RouteContext,
//     view,
//     redirect,
//     file,
//     download,
//     ViewResult, 
//     ViewResultError,
//     RedirectResult, 
//     RedirectResultNoContextError,
//     FileResult, 
//     FileResultNoContextError,
//     DownloadResult, 
//     DownloadResultNoContextError,
//     BindingContext
// };


// for (const name in legacy) {

//     if (exportContent[name]) continue;

//     exportContent[name] = new Proxy(legacy[name], stage_0_To_Stage_3_Adapter);
// }

// module.exports = {...exportContent, ...websocketContent};

const {stage_0_To_Stage_3_Adapter} = require('./tc39-stage3-decorator/adapterForLegacy.js');
const adapter = stage_0_To_Stage_3_Adapter;

//const PreInvokeFunction = require('./src/callback/preInvokeFunction.js');
const controller = require('./src/controller/baseController.js')
//const decorator = require('./src/decorator/decoratorResult.js');
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

const websocketContent = require('./src/websocket/index.js');

const legacy = require('./legacy.decorators.js');

// const {
//     PreInvokeFunction,
//     BaseController,
//     DecoratorResult,
//     DecoratorType,
//     MethodDecorator,
//     PropertyDecorator,
//     ClassDecorator,
//     RouteContext,
//     view,
//     redirect,
//     file,
//     download,
//     ViewResult, 
//     ViewResultError,
//     RedirectResult, 
//     RedirectResultNoContextError,
//     FileResult, 
//     FileResultNoContextError,
//     DownloadResult, 
//     DownloadResultNoContextError,
//     BindingContext,
// } = legacy;

//module.exports.PreInvokeFunction = PreInvokeFunction;

//module.exports.BaseController = controller.BaseController;

module.exports.dispatchable = new Proxy(controller.dispatchable, adapter);

module.exports.Endpoint = new Proxy(http.Endpoint, adapter);

module.exports.Route = new Proxy(http.Route, adapter);

module.exports.routingContext = new Proxy(http.routingContext, adapter);

module.exports.Middleware = new Proxy(middleware.Middleware, adapter);

module.exports.response = new Proxy(response, adapter); // decorator

module.exports.args = new Proxy(requestDispatcher.args, adapter);

module.exports.dispatchRequest = new Proxy(requestDispatcher.dispatchRequest, adapter);

module.exports.requestParam = new Proxy(requestDispatcher.requestParam, adapter);

module.exports.contentType = new Proxy(responseDecorator.contentType, adapter);

module.exports.header = new Proxy(responseDecorator.header, adapter);

module.exports.responseBody = new Proxy(responseDecorator.responseBody, adapter);

module.exports.autoBind = new Proxy(ioc.autoBind, adapter);

module.exports.is = new Proxy(ioc.is, adapter);

module.exports.consumes = new Proxy(request.consumes, adapter);

//module.exports.actionResult = actionResults;

module.exports.WS = websocketContent.WS;

/** @type websocketContent.WSController */
//module.exports.WSController = websocketContent.WSController;

//module.exports.WSRouter = websocketContent.Router;

//module.exports.BindType = ioc.BindType;
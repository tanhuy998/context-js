/**
 *  @typedef {import('./src/controller/baseController.js').BaseController} BaseController
 *  @typedef {import('./src/controller/baseController.js').dispatchable} dispatchable
 *  @typedef {import('./src/http/httpRouting.js').Endpoint} Endpoint
 *  @typedef {import('./src/http/httpRouting.js').Route} Route
 *  @typedef {import('./src/http/httpRouting.js').routingContext} routingContext
 *  @typedef {import('./src/middleware/middleware.js').Middleware} Middleware
 *  @typedef {import('./src/response/responseResult.js').response} response
 *  @typedef {import('./src/requestDispatcher.js').args} args
 *  @typedef {import('./src/requestDispatcher.js').dispatchRequest} dispatchRequest
 *  @typedef {import('./src/requestDispatcher.js').requestParam} requestParam 
 *  @typedef {import('./src/response/decorator.js').contentType} contentType
 *  @typedef {import('./src/response/decorator.js').header} header
 *  @typedef {import('./src/response/decorator.js').responseBody} responseBody
 *  @typedef {import('./src/ioc/decorator.js').BindType} BindType
 *  @typedef {import('./src/ioc/decorator.js').autoBind} autoBind
 *  @typedef {import('./src/ioc/decorator.js').is} is
 *  @typedef {import('./src/request/decorator.js').consumes} consumes
 *  @typedef {import('./src/request/decorator.js')}
 * 
 *  @typedef {import('./src/websocket/index.js').WS} WS
 *  @typedef {import('./src/websocket/index.js').WSController} WSController
 *  @typedef {import('./src/websocket/index.js').WSRouter} WSRouter
 */

/**
 * @typedef {Object} Test 
 * @property {WSController} [WSController]
 * @property {Function} PreInvokeFunction
 */

class InvalidBabelDecoratorVersion extends Error {

    constructor() {

        super('Invalid Babel configuation for decorators');
    }
}

const babelDecoratorVersion = require('./decoratorVersion.js');
const { ActionResult } = require('./src/response/actionResult.js');

let modules;

let path;

if (babelDecoratorVersion == 'legacy') {

    //modules = require('./legacy.js');

    // module.exports = require('./legacy.js');

    path = './legacy.decorators.js';
}
else if (babelDecoratorVersion == 'stage3') {

    //modules = require('./stage3.js');

    // module.exports = require('./stage3.js')

    path = './stage3.decorators.js'
}
else {

    throw new InvalidBabelDecoratorVersion();
}


const parts = require(path);

const WS = parts.WS;

module.exports = {
    /** @type */
    PreInvokeFunction : require('./src/callback/preInvokeFunction.js'),

    /** @type {dispatchable} */
    dispatchable : parts.dispatchable,

    /**@type  {Endpoint}*/
    Endpoint : parts.Endpoint,

    /**@type {Route} */
    Route : parts.Route,

    /**@type {routingContext} */
    routingContext : parts.routingContext,

    /**@type {Middleware} */
    Middleware : parts.Middleware,

    /**@type {response} */
    response : parts.response, // decorator

    /**@type {args} */
    args : parts.args,

    dispatchRequest : parts.dispatchRequest,

    /**@type {requestParam} */
    requestParam : parts.requestParam,

    /**@type {contentType} */
    contentType : parts.contentType,

    /**@type {header} */
    header : parts.header,

    /**@type {responseBody} */
    responseBody : parts.responseBody,

    /**@type {BindType} */
    BindType : parts.BindType,

    /**@type {autoBind} */
    autoBind : parts.autoBind,

    /**@type {is} */
    is : parts.is,

    /**@type {consumes} */
    consumes : parts.consumes,

    /**@type {ActionResult} */
    actionResult : parts.actionResults,

    /**@type {WS} */
    WS : parts.WS,

    /** @class WSController*/
    WSController : parts.WSController,

    /**@type {WSRouter} */
    WSRouter : parts.Router,
}


//module.exports.BaseController = parts.BaseController;
// /** @type */
// module.exports.PreInvokeFunction = require('./src/callback/preInvokeFunction.js');

// /** @type {BaseController} */
// module.exports.BaseController = parts.BaseController;

// /** @type {dispatchable} */
// module.exports.dispatchable = parts.dispatchable;

// /**@type  {Endpoint}*/
// module.exports.Endpoint = parts.Endpoint;    

// /**@type {Route} */
// module.exports.Route = parts.Route;

// /**@type {routingContext} */
// module.exports.routingContext = parts.routingContext;

// /**@type {Middleware} */
// module.exports.Middleware = parts.Middleware;

// /**@type {response} */
// module.exports.response = parts.response; // decorator

// /**@type {args} */
// module.exports.args = parts.args;

// module.exports.dispatchRequest = parts.dispatchRequest;

// /**@type {requestParam} */
// module.exports.requestParam = parts.requestParam;

// /**@type {contentType} */
// module.exports.contentType = parts.contentType;

// /**@type {header} */
// module.exports.header = parts.header;

// /**@type {responseBody} */
// module.exports.responseBody = parts.responseBody;

// /**@type {BindType} */
// module.exports.BindType = parts.BindType;

// /**@type {autoBind} */
// module.exports.autoBind = parts.autoBind;

// /**@type {is} */
// module.exports.is = parts.is;

// /**@type {consumes} */
// module.exports.consumes = parts.consumes;

// /**@type {ActionResult} */
// module.exports.actionResult = parts.actionResults;

// /**@type {WS} */
// module.exports.WS = websocketContent.WS;

// /** @type {WSController} */
// module.exports.WSController = websocketContent.WSController;

// /**@type {WSRouter} */
// module.exports.WSRouter = websocketContent.Router;

module.exports.decoratorVersion = babelDecoratorVersion;


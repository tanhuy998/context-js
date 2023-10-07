// const PreInvokeFunction = require('./src/callback/preInvokeFunction.js');
// const controller = require('./src/controller/baseController.js')
// const decorator = require('./src/decorator/decoratorResult.js');
// const http = require('./src/http/httpRouting.js');
// const middleware = require('./src/middleware/middleware.js');
// const response = require('./src/response/responseResult.js');
// const baseController = require('./src/controller/baseController.js');
// const requestDispatcher = require('./src/requestDispatcher.js');
// const responseDecorator = require('./src/response/decorator.js')


// module.exports = {
//     PreInvokeFunction , ...controller, ...decorator, ...http, ...middleware, response, ...baseController, ...requestDispatcher, ...responseDecorator
// };

const decorators = require('./decorators.js');

const common = require('./common.js');

const loadedModules = {...decorators, ...common};

module.exports = loadedModules;

const ApplicationContext = require('./src/applicationContext.js');
//const WSController = require('./src/websocket/controller/wsController.js');

const appContextPreset = {
    //RouteContext: modules.RouteContext,
    RouteContext: require('./src/http/httpRouting.js').RouteContext,
    WebsocketContext: require('./src/websocket/websocketContext.js'),
    ioc: {
        //BindingContext: modules.BindingContext,
        BindingContext: require('./src/ioc/decorator.js').BindingContext
    }
}

loadedModules.ApplicationContext = new ApplicationContext(appContextPreset);
//module.exports.enableRuntimeError = require('./src/error/expressErrorHanler.js');


// const actionResults = {
//     ...require('./src/response/utils/view.js'),
//     ...require('./src/response/utils/redirect.js'),
//     ...require('./src/response/utils/fileResult.js'),
//     ...require('./src/response/utils/download.js'),
// };

// const websocketContent = require('./src/websocket/index.js');




// module.exports.consumes = new Proxy(request.consumes, adapter);

// module.exports.actionResult = actionResults;

// module.exports.WS = websocketContent.WS;

// module.exports.WSController = websocketContent.WSController;

// module.exports.WSRouter = websocketContent.Router;
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

class InvalidBabelDecoratorVersion extends Error {

    constructor() {

        super('Invalid Babel configuation for decorators');
    }
}

const babelDecoratorVersion = require('./decoratorVersion.js');

let modules;

if (babelDecoratorVersion == 'legacy') {

    modules = require('./legacy.js');
}
else if (babelDecoratorVersion == 'stage3') {

    modules = require('./stage3.js');
}
else {

    throw new InvalidBabelDecoratorVersion();
}

module.exports = modules;

module.exports.decoratorVersion = babelDecoratorVersion;

const ApplicationContext = require('./src/applicationContext.js');

const appContextPreset = {
    RouteContext: modules.RouteContext,
    ioc: {
        BindingContext: modules.BindingContext,
    }
}

module.exports.ApplicationContext = new ApplicationContext(appContextPreset);
const Response = require('./responseResult.js');
const {preprocessDescriptor} = require('../decorator/utils.js');
const IActionResult = require('./iActionResult.js');
const AsyncActionResult = require('./asyncActionResult.js');
const {MethodDecoratorAsync} = require('../decorator/decoratorResult.js');
//const isPromise = require('../libs/isPromise.js');

async function handleActionResult(returnValue, _controllerObject, _theControllerAction, descriptor, type) {
    
    /**
     *  _theControllerAction param is type of PreInvokeFunction because when applying decorators on a method
     *  the method will be wrapped in PreInvokeFunction for further transformations on the method. 
     */
    if (returnValue instanceof Promise) {

        returnValue = await returnValue;
    }


    if (returnValue instanceof IActionResult) {

        returnValue.setContext(_controllerObject);

        if (returnValue instanceof AsyncActionResult) {

            await returnValue.resolve();
        }
        else {

            returnValue.resolve();
        }
    }
    else {
        
        const res = _controllerObject.httpContext.response;

        res.send(returnValue)
        
    }

    _controllerObject.httpContext.response.end();
    _controllerObject.httpContext.nextMiddleware();
}

function header(...arg) {

    return Response.setHeader(...arg);
}

function contentType(_value) {

    return Response.setHeader('Content-Type', _value);
}

function responseBody(_controllerClass, _action, descriptor) {

    const decoratorResult = preprocessDescriptor(_controllerClass, _action, descriptor);

    decoratorResult.payload['responseBody'] = 1;
    decoratorResult.on('afterResolve', handleActionResult);
    //decoratedResult.transform(catchControllerActionReturnValue, 'responseBody');

    descriptor.value = decoratorResult;

    return descriptor;
}

module.exports = {header, contentType, responseBody};
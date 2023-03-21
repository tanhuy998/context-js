const Response = require('./responseResult.js');
const {preprocessDescriptor} = require('../decorator/utils.js');
const { IActionResult } = require('./actionResult.js');


function handleActionResult(returnValue, _controllerObject, _theControllerAction, descriptor, type) {

    if (returnValue instanceof IActionResult) {

        returnValue.setContext(_controllerObject);

        returnValue.resolve();
    }
    else {
        
        const res = _controllerObject.httpContext.response;

        res.send(returnValue)
        res.end();
    }

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
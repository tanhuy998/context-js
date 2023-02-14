const {preprocessDescriptor} = require('../decorator/utils.js');
const PreInvokeFuncion = require('../callback/preInvokeFunction.js');

function catchControllerActionReturnValue(_controllerAction, ...payload) {

    const res = this.httpContext.response;
    //console.log('resolve response body', _controllerAction);

    // _controllerAction.whenFulfill((_returnValue) => {
    //     console.log('return value:', _returnValue)
    //     res.write(_returnValue);
    // });

    _controllerAction.on('fulfill', (_returnValue) => {
        //console.log('return value:', _returnValue)
        
        res.write(_returnValue);
        //console.log(res.write);
    })

    //console.log('resolve', _controllerAction);
}

function responseBody(_controllerClass, _action, descriptor) {

    const decoratedResult = preprocessDescriptor(_controllerClass, _action, descriptor);

    //const callback = new PreInvokeFuncion(catchControllerActionReturnValue);

    decoratedResult.payload['responseBody'] = 1;
    decoratedResult.transform(catchControllerActionReturnValue, 'responseBody');

    descriptor.value = decoratedResult;
    //console.log('response body');
    return descriptor;
}


const obj = {};

function invokeResponse(_method, ...payload) {

    // context of this here is Controller object
    const [resAction, args] = payload;

    const res = this.httpContext.response;
    //console.log('invoke response', payload) 
    res[resAction](...args);
}

const Response = new Proxy(obj, {
    get: (_target, _methodName) => {

        return function(...args) {

            return function (_controllerClass, _action, descriptor) {
                
                const decoratedResult = preprocessDescriptor(_controllerClass, _action, descriptor);

                //const callback = new PreInvokeFuncion(invokeResponse, ...args);
                decoratedResult.payload['invokeResponse'] = [_methodName, args];

                decoratedResult.transform(invokeResponse, 'invokeResponse');

                descriptor.value = decoratedResult;

                return descriptor;
            } 
        }
    },
    set: () => false
}) 

function contentType(_value) {

    return function () {


    }
}


module.exports = {responseBody, Response}
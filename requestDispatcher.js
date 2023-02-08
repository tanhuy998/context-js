//const Controller = require('../controller/baseController.js').proxy;
const PreInvokeFunction = require('./preInvokeFunction.js');
const {DecoratorResult, DecoratorType} = require('./decoratorResult.js');


const Decorator =  {
    dispatchRequest,
    requestParam
}

function args(..._args) {

    return function (target, key, descriptor) {

        const the_function = descriptor.value;

        if (typeof the_function != 'function') throw new Error('args decorator error: just use decorator for function object');

        const argPassed_funtion  = new PreInvokeFunction(the_function, ..._args);

        descriptor.value = argPassed_funtion;

        return descriptor;
    }
}

function requestParam(...argsInfo) {

    /**
     * 
     * @param {PreInvokeFunction} _theMethod 
     */
    const passRequestParam = function (_theMethod) {


        // context of "this" here is the Controller's context
        const reqParams = this.httpContext.request.params || [];

        const method_params = _theMethod.args;

        const args = method_params.map((name) => {

            return reqParams[name];
        })

        _theMethod.passArgs(...args);
    }

    return function (Class, propName, descriptor) {
        
        //console.log(descriptor.value);
        const the_function = descriptor.value;
        // the param's context here the context when controller is seted-up http context
        if (typeof the_function != 'function') throw new Error('requestParam decorator error: just use decorator for function object');

        const argPassed_method  = new PreInvokeFunction(the_function, ...argsInfo);

        const decoratorResult_action = new PreInvokeFunction(passRequestParam, argPassed_method);

        const decorator_result = new DecoratorResult(DecoratorType.PROPERTY_DECORATOR, argPassed_method, decoratorResult_action);

        descriptor.value = decorator_result;

        //descriptor.value = args().value;
        //console.log('end here');
        return descriptor;
    }
}

function dispatchRequest(controllerObject, controllerAction) {

    return function(req, res, next) {

        controllerObject.setContext(req, res, next);

        // const req_params = req.params;

        // const param_arr = [];

        // for (const key in req_params) {

        //     param_arr.push(req_params[key]);
        // }

        //return controllerAction(...param_arr);



        if (controllerAction instanceof DecoratorResult) {

            //console.log(controllerObject)
            return controllerAction.bind(controllerObject)
                            .resolve();
        }
        
        return controllerAction();
    }
}

module.exports = Decorator;
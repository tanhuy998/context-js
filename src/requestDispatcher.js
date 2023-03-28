//const Controller = require('../controller/baseController.js').proxy;
const PreInvokeFunction = require('./callback/preInvokeFunction.js');
const {DecoratorResult, DecoratorType, MethodDecorator, PropertyDecorator, ClassDecorator} = require('./decorator/decoratorResult.js');
//const BaseController = require('./controller/baseController.js');
const {preprocessDescriptor} = require('./decorator/utils.js');
const {BaseController} = require('./controller/baseController.js');
const reflectFunction = require('./libs/reflectFunction.js');


// const ControllerContextFunctions = {
//     //transformProperty
// }

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
    const passRequestParam = function (_theMethod, ...decoratorResultPayload) {

        // context of "this" here is the Controller's context
        const reqParams = this.httpContext.request.params || {};

        const method_params = decoratorResultPayload || [];

        const args = method_params.map((name) => {

            return reqParams[name];
        })

        _theMethod.passArgs(...args);
    };

    const transformProperty = function(decoratorResultTarget, ...decoratorResultPayload) {
        
        // this context of the function is the controller object
        const reqParams = this.httpContext.request.params || {};
    
        const {propName} = decoratorResultTarget;
        
        const new_value = {};
    
        const length = decoratorResultPayload.length;
    
        if (length == 0) {
    
            this[propName] = reqParams;
    
            return;
        }
    
        if (length == 1) {
    
            const param_name = decoratorResultPayload[0];
    
            this[propName] = reqParams[param_name];
    
            return;
        }
    
        for (const param_name of decoratorResultPayload) {
    
            new_value[param_name] = reqParams[param_name]
        }
    
        this[propName] = new_value;
    };

    const resolveMethod = function(decoratorResult, _class, propName, descriptor) {
        
        // target instanceof PreInvokeFuncion
        decoratorResult.payload['requestParam'] = argsInfo;
        decoratorResult.transform(passRequestParam, 'requestParam');
        //decoratorResult.bind(_targetObject);

        descriptor.value = decoratorResult;

        return descriptor;
    }

    const resolveProperty = function(decoratorResult, _class, propName, descriptor) {

        decoratorResult.payload['requestParam:prop'] = argsInfo;
        decoratorResult.transform(transformProperty, 'requestParam:prop');
        
        descriptor.initializer = () => decoratorResult;
        
        return descriptor;
    }

    return function (_class, propName, descriptor) {
        
        const decoratorResult = preprocessDescriptor(_class, propName, descriptor);
        
        // the param's context here the context when controller is seted-up http context
    
        switch(decoratorResult.constructor.name) {
            
            case 'PropertyDecorator': 
                return resolveProperty(decoratorResult, _class, propName, descriptor);
            case 'MethodDecorator': 
                return resolveMethod(decoratorResult, _class, propName, descriptor);
            default: 
                return descriptor;
        }
    }
}

const HttpContextCatcher = {
    subcribers: [],
    currentContext: {},
    newContext: function(_httpContext) {
        this.currentContext = _httpContext;
    
        for (const subcriber of this.subcribers) {
    
            subcriber.httpContext = _httpContext;
        }
    }
}

function httpContext(_theConstructor) {
    //console.log('httpcontext decorator', _theConstructor)
    HttpContextCatcher.subcribers.push(_theConstructor);

    return _theConstructor;
}

function initContext(arg) {
    
    return function (_theConstructor) {
        //console.log('initContext');
        return _theConstructor;
    }
}





//function dispatchRequest(controllerObject, controllerAction, _controllerClass) {
function dispatchRequest(_controllerClass, _prop) {

    /**
     * 
     * @param {PreinvokeFunction} _targetFunction 
     * @returns 
     */
    function passParameter(_targetFunction) {
        
        //console.log('target', _targetFunction)
        // context of of 'this' here is the controller object
        const transformedFunction = (_targetFunction instanceof PreInvokeFunction) ? _targetFunction : new PreInvokeFunction(_targetFunction);
        const reflection = (_targetFunction instanceof PreInvokeFunction) ? _targetFunction.functionMeta : reflectFunction(_targetFunction);

        const args = reflection.params.map(function(param) {

            const defaultValue = param.defaultValue;

            if (defaultValue) {

                if (param.isTypeOfString) {

                    return undefined;
                }
                else {
    
                    return this.components.get(defaultValue);
                }
            }
        }, this)

        transformedFunction.passArgs(args);

        return transformedFunction;
    }

    function passParameterForStage3(_targetFunction) {

        const transformedFunction = (_targetFunction instanceof PreInvokeFunction) ? _targetFunction : new PreInvokeFunction(_targetFunction);
        const reflection = (_targetFunction instanceof PreInvokeFunction) ? _targetFunction.functionMeta : reflectFunction(_targetFunction);

        const args = reflection.params.map(function(param) {

            const defaultValue = param.defaultValue;

            if (defaultValue) {

                if (param.isTypeOfString) {

                    return undefined;
                }
                else {
    
                    return this.components.get(defaultValue);
                }
            }
        }, this)

        transformedFunction.passArgs(args);

        return transformedFunction;
    }

    /**
     * 
     * @param {*} _controllerObject 
     * @param {*} _action 
     * @returns 
     */
    async function handleRequest(_controllerObject, _action) {

        const controllerAction = _controllerObject[_action];
        
        if (!controllerAction) {

            throw new Error(`Dispatch Error: ${_controllerObject.constructor.name}.${_action} is not defined`);
        }
        else if (!(controllerAction instanceof DecoratorResult) && typeof controllerAction != 'function') {

            throw new Error(`Dispatch Error: ${_controllerObject.constructor.name}.${_action} is not invocable`);
        }

        if (BaseController.supportIoc) {

            if (controllerAction instanceof DecoratorResult) {

                controllerAction.payload['handleRequest'] = '';
                controllerAction.transform(passParameter, 'handleRequest');
    
                return await controllerAction.bind(_controllerObject)
                    .resolve();
    
                //return controllerAction.resolve();
            }
            else {
    
                return await passParameter.bind(_controllerObject)(controllerAction).bind(_controllerObject).resolve();
            }
        }
        else {

            if (controllerAction instanceof DecoratorResult) {
                
                return await controllerAction.bind(_controllerObject)
                    .resolve();
            }
            else {

                return controllerAction.bind(_controllerObject)();
            }
        }
    }

    async function Stage3_handleRequest(_controllerObject, _action) {

        let controllerAction = _controllerObject[_action];
        
        if (!controllerAction) {

            throw new Error(`Dispatch Error: ${_controllerObject.constructor.name}.${_action} is not defined`);
        }
        else if (!(controllerAction instanceof DecoratorResult) && typeof controllerAction != 'function') {

            throw new Error(`Dispatch Error: ${_controllerObject.constructor.name}.${_action} is not invocable`);
        }

        if (controllerAction.name == 'stage3WrapperFunction') {

            controllerAction = controllerAction();
        }
        

        if (BaseController.supportIoc) {

            if (controllerAction instanceof DecoratorResult) {
                
                controllerAction.payload['handleRequest'] = '';
                controllerAction.transform(passParameter, 'handleRequest');
    
                return await controllerAction.bind(_controllerObject)
                    .resolve();
    
                //return controllerAction.resolve();
            }
            else {
                
                const func = passParameter.bind(_controllerObject)(controllerAction);
                
                return await func.bind(_controllerObject).invoke();
            }
        }
        else {

            if (controllerAction instanceof DecoratorResult) {
                
                return await controllerAction.bind(_controllerObject)
                    .resolve();
            }
            else {

                return controllerAction.bind(_controllerObject)();
            }
        }
    }

    return async function (req, res, next) {

        const context = {

            request: req,
            response: res,
            nextMiddleware: next,
            currentRoute: req.path,
            parentRoute: req.baseUrl,
            //routeContext: _router || undefined,
        }
        //BaseController.httpContext = context;
        //HttpContextCatcher.newContext(context);

        let controllerObject;
        
        if (BaseController.supportIoc) {
            
            controllerObject = BaseController.buildController(_controllerClass);
        }
        else {

            controllerObject = new _controllerClass();
        }

        controllerObject.setContext(context);

        await controllerObject.resolveProperty();
        
        //handleRequest(controllerObject, _prop);
        Stage3_handleRequest(controllerObject, _prop);

        //controllerObject.setIocContainer(_IocContext);
    }
}

module.exports = {
    dispatchRequest,
    requestParam,
};
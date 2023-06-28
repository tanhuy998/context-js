//const Controller = require('../controller/baseController.js').proxy;
const PreInvokeFunction = require('./callback/preInvokeFunction.js');
const {DecoratorResult, DecoratorType, MethodDecorator, PropertyDecorator, ClassDecorator} = require('./decorator/decoratorResult.js');
//const BaseController = require('./controller/baseController.js');
const {preprocessDescriptor} = require('./decorator/utils.js');
const {BaseController} = require('./controller/baseController.js');
const HttpContext = require('./httpContext.js');
const ApplicationContext = require('./applicationContext.js');
const reflectFunction = require('./libs/reflectFunction.js');
const {Type} = require('./libs/type.js');
const {ReflectionBabelDecoratorClass_Stage_3} = require('./libs/babelDecoratorClassReflection.js');
const PreInvokeFunctionAsync = require('./callback/preInvokeFunctionAsync.js');


function args(..._args) {

    return function (target, method, descriptor) {

        const decoratorResult = preprocessDescriptor(target, method, descriptor);

        if (!(decoratorResult instanceof MethodDecorator)) {

            throw new Error('decorator @args just applied on method');
        }

        if (decoratorResult.payload['passedArguments']) {

            throw new Error('decorator @args just applied once on a method');
        }

        if (_args.length > 0) {

            decoratorResult.payload['passedArguments'] = _args;
        }

        descriptor.value = decoratorResult;

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



function Stage3_handleRequest(_controllerObject, _action, _appContext) {

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
    
    if (_appContext instanceof ApplicationContext && _appContext.supportIoc) {
    //if (BaseController.supportIoc) {

        if (controllerAction instanceof DecoratorResult) {
            

            //controllerAction.payload['handleRequest'] = '';

            // passArgument transformation using payload of @args to determine what arguments
            // should or what arguments should be inject
            controllerAction.transform(passArguments, 'passedArguments');

            return controllerAction.bind(_controllerObject)
                .resolve();

            //return controllerAction.resolve();
        }
        else {
            
            const func = passParameter.bind(_controllerObject)(controllerAction);
            
            return func.bind(_controllerObject).invoke();
        }
    }
    else {

        if (controllerAction instanceof DecoratorResult) {
            
            return controllerAction.bind(_controllerObject)
                .resolve();
        }
        else {

            return controllerAction.bind(_controllerObject)();
        }
    }


    /**
     * 
     * 
     * @param {PreinvokeFunction} _targetFunction 
     * @returns 
     */
    function passArguments(_targetFunction, ...argsList) {
        // context of of 'this' here is the controller object

        let transformedFunction;

        if (typeof _targetFunction == 'function') {

            if (_targetFunction.constructor.name == 'AsyncFunction') {

                transformedFunction = new PreInvokeFunctionAsync(_targetFunction);
            }
            else {

                transformedFunction = new PreInvokeFunction(_targetFunction);
            }
        }
        else if (_targetFunction instanceof PreInvokeFunction) {

            transformedFunction = _targetFunction;
        }

        //const transformedFunction = (_targetFunction instanceof PreInvokeFunction) ? _targetFunction : new PreInvokeFunction(_targetFunction);
        //const reflection = (_targetFunction instanceof PreInvokeFunction) ? _targetFunction.functionMeta : reflectFunction(_targetFunction);

        const reflection = transformedFunction.functionMeta;

        const theExactFunction = reflection.target;

        const controllerState = this.state;

        const args = (argsList.length > 0) ? resolveComponents(argsList, _appContext.iocContainer, controllerState) : _appContext.iocContainer.resolveArgumentsOf(theExactFunction, controllerState, true);

        transformedFunction.passArgs(...args);

        return transformedFunction;
    }

    function resolveComponents(_list, _iocContainer, _controllerState) {

        return _list.map(function (value) {

            const type = typeof value;

            if (type == 'object' || type == 'function') {

                return _iocContainer.get(value, _controllerState);
            }

            return value;
        })
    }
}

//function dispatchRequest(controllerObject, controllerAction, _controllerClass) {
function dispatchRequest(_controllerClass, _prop, _appContext = undefined) {

    function passParameterForStage3(_targetFunction) {

        let transformedFunction;

        if (typeof _targetFunction == 'function') {

            if (_targetFunction.constructor.name == 'AsyncFunction') {

                transformedFunction = new PreInvokeFunctionAsync(_targetFunction);
            }
            else {

                transformedFunction = new PreInvokeFunction(_targetFunction);
            }
        }
        else if (_targetFunction instanceof PreInvokeFunction) {

            transformedFunction = _targetFunction;
        }

        //transformedFunction = (_targetFunction instanceof PreInvokeFunction) ? _targetFunction : new PreInvokeFunction(_targetFunction);
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
    // function handleRequest(_controllerObject, _action) {

    //     const controllerAction = _controllerObject[_action];
        
    //     if (!controllerAction) {

    //         throw new Error(`Dispatch Error: ${_controllerObject.constructor.name}.${_action} is not defined`);
    //     }
    //     else if (!(controllerAction instanceof DecoratorResult) && typeof controllerAction != 'function') {

    //         throw new Error(`Dispatch Error: ${_controllerObject.constructor.name}.${_action} is not invocable`);
    //     }

    //     if (BaseController.supportIoc) {

    //         if (controllerAction instanceof DecoratorResult) {

    //             controllerAction.payload['handleRequest'] = '';
    //             controllerAction.transform(passArguments, 'args');
    
    //             return controllerAction.bind(_controllerObject)
    //                 .resolve();
    
    //             //return controllerAction.resolve();
    //         }
    //         else {
    
    //             return passParameter.bind(_controllerObject)(controllerAction).bind(_controllerObject).resolve();
    //         }
    //     }
    //     else {

    //         if (controllerAction instanceof DecoratorResult) {
                
    //             return controllerAction.bind(_controllerObject)
    //                 .resolve();
    //         }
    //         else {

    //             return controllerAction.bind(_controllerObject)();
    //         }
    //     }
    // }

    return function (req, res, next) {

        let controllerObject;
        
        if (_appContext instanceof ApplicationContext && _appContext.supportIoc) {
            
            controllerObject = _appContext.buildController(_controllerClass, req, res, next);
        }
        else {

            controllerObject = new _controllerClass();

            const context = new HttpContext(req, res, next);

            controllerObject.setContext(context);
        }

        controllerObject.resolveProperty();
        
        return Stage3_handleRequest(controllerObject, _prop, _appContext);
    }
}

module.exports = {
    Stage3_handleRequest,
    dispatchRequest,
    requestParam,
    args
};
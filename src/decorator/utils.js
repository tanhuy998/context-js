const DecoratorResult = require('./decoratorResult.js');
const DecoratorType = require('./decoratorType.js');
const PropertyDecorator = require('./propertyDecorator.js');
const MethodDecorator = require('./methodDecorator.js');
const MethodDecoratorAsync = require('./methodDecoratorAsync.js');
const PreInvokeFunction = require('../callback/preInvokeFunction.js');
const PreInvokeFunctionAsync = require('../callback/preInvokeFunctionAsync.js');
const decoratorVersion = require('../../decoratorVersion.js');
      

const ControllerContextFunctions = {
    transformProperty
}

function transformProperty(decoratorResultTarget, ...decoratorResultPayload) {
    
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

function preprocessDescriptor(_targetObject, propName, descriptor, decoratorType = DecoratorType.PROPERTY_DECORATOR) {

    //[propName, descriptor] = [descriptor, propName];

    //console.log(descriptor)

    function checkForBabelTransformAsyncFunction(_function) {

       if (!decoratorVersion) return;

       const regex = /^function (.+)\(.*\)( *){(.*)(\s*)return _\1\.apply/;

       const match = _function.toString()
                            .match(regex);
        
        return (match != null);
    }

    function initializeDecoratorResultForFunction(_function) {

        //_function = checkForBabelTransformFunction(_function);

        let transformedTarget;

        const isSync = _function.constructor.name == 'Function';

        //const isAsync = checkForBabelTransformAsyncFunction(_function);

        let decoratorResult;
        
        if (isSync) {

            transformedTarget = new PreInvokeFunction(_function);
            decoratorResult = new MethodDecorator(_targetObject, transformedTarget).bind(_targetObject);
        }
        else {

            transformedTarget = new PreInvokeFunctionAsync(_function);
            decoratorResult = new MethodDecoratorAsync(_targetObject, transformedTarget).bind(_targetObject);
        }

        decoratorResult._targetDescriptor = descriptor;

        return decoratorResult;
    }

    function initializeDecoratorResultForProperty() {

        const decoratorResult = new PropertyDecorator(_targetObject, propName).bind(_targetObject);

        decoratorResult._targetDescriptor = descriptor;

        return decoratorResult;
    }

    if (decoratorType = DecoratorType.PROPERTY_DECORATOR) {

        const the_target_prop = descriptor.value;

        let decoratorResult;
        let the_transformed_prop;
        
        

        if (!(the_target_prop instanceof DecoratorResult)) {
            
            if (typeof the_target_prop === 'function') {
                
                return initializeDecoratorResultForFunction(the_target_prop);
                //the_prop_is_function = true;
                //return decorator;
            }
            else {
                
                // the_transformed_prop = the_target_prop;

                // const decorator = 

                return initializeDecoratorResultForProperty();
            }
            
        }
        else {

            decoratorResult = the_target_prop.bind(_targetObject);
            decoratorResult._targetDescriptor = descriptor;

            return decoratorResult;
        }
    }
}

function acceptMethod(descriptor, decoratorName) {

    if (decoratorResult instanceof MethodDecorator) {

        return;
    }

    throw new Error()
}

function acceptField(descriptor, decoratorName) {

    if (decoratorResult instanceof PropertyDecorator) {

        return;
    }

    throw new Error()
}

module.exports = {
    preprocessDescriptor, transformProperty, ControllerContextFunctions
}
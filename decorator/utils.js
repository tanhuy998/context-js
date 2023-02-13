const {DecoratorType, DecoratorResult, MethodDecorator, PropertyDecorator, ClassDecorator} = require('./decoratorResult.js');
const PreInvokeFunction = require('../callback/preInvokeFunction.js')
      

const ControllerContextFunctions = {
    transformProperty
}

function transformProperty(decoratorResultTarget, ...decoratorResultPayload) {
    //console.log('transform', decoratorResultTarget)
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

    if (decoratorType = DecoratorType.PROPERTY_DECORATOR) {

        const the_target_prop = descriptor.value;

        let decoratorResult;
        let the_transformed_prop;
        // let result;

        // let the_prop_is_function = false;
        

        if (!(the_target_prop instanceof DecoratorResult)) {

            if (typeof the_target_prop == 'function') {

                the_transformed_prop = new PreInvokeFunction(the_target_prop);
                //the_prop_is_function = true;
                return new MethodDecorator(_targetObject, the_transformed_prop).bind(_targetObject);
            }
            else {
                
                the_transformed_prop = the_target_prop;

                return new PropertyDecorator(_targetObject, propName).bind(_targetObject);  
            }
            //decoratorResult = new DecoratorResult(DecoratorType.PROPERTY_DECORATOR, the_transformed_prop);
        }
        else {

            decoratorResult = the_target_prop.bind(_targetObject);

            return decoratorResult;
            //if (decoratorResult._target instanceof PreInvokeFunction) the_prop_is_function = true;
        }
    }
}

module.exports = {
    preprocessDescriptor, transformProperty, ControllerContextFunctions
}
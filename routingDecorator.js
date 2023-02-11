const {preprocessDescriptor} = require('./utils.js')

function endpoint(_method, _path) {


    
    return function(_targetObject, _propName, descriptor) {
        const decoratedResult = preprocessDescriptor(_targetObject, _propName, descriptor);

        if (decoratedResult.constructor.name == 'MethodDecorator') {

            _targetObject.httpContext.router
        }
        else {

            return descriptor;
        }
    }
}
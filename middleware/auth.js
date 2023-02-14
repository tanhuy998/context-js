const {preprocessDescriptor} = require('../decorator/utils');


function authClass(_class) {


    return _class;
}

function authMethod(_class, _method, descriptor) {

    const decoratedResult = preprocessDescriptor(_class, _method, descriptor);

    descriptor.value = decoratedResult;

    return descriptor;
}

function authenticate(...args) {


    if (args.length = 1) {

        const [_class] = args;


        return authClass(_class);
    }
    else if (args.length = 3) {

        const [_class, _method, descriptor] = args;

        return authMethod(_class, _method, descriptor);
    }
}

function Authorize(_role) {

    return function(...args) {

        const result = authenticate(...args);

        if (result.constructor.name == 'MethodDecorator') {

            
        }
        else {


        }
    }
}
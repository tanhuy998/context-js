const {preprocessDescriptor} = require('../decorator/utils');
const {RouteContext} = require('../http/httpRouting.js');
const {Middleware} = require('./middleware.js');

class Authentication {

    static #handler;

    static setHandler(_func) {

        this.#handler = _func;
    }

    static get handler() {

        return this.#handler;
    } 
}

function authOnClass(_class) {

    const symbol = RouteContext.startSession();

    return _class;
}

function authOnMethod(_class, _method, descriptor) {

    const decoratedResult = preprocessDescriptor(_class, _method, descriptor);

    const authenticateFunction =Authentication.handler;

    if (!authenticateFunction) throw new Error('Athenticate error: there\'s no handler function setted to "Authentication"');

    return Middleware.before(authenticateFunction);
}

function authenticate(...args) {


    if (args.length == 0) {


        return function() {

        }
    }
    else if (args.length == 3) {

        const [_class, _method, descriptor] = args;

        return authOnMethod(_class, _method, descriptor);
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

module.exports = {Authentication, authenticate, Authorize};
const BaseController = require('./baseController.js');
const {dispatchRequest, requestParam } = require('./requestDispatcher.js');

function foo() {

    return function (_class, _name, descriptor) {
        console.log('foo')

        return descriptor;
    }
}

class Controller extends BaseController {

    // we must type this line to made the derived class works properly
    static proxy = new Proxy(Controller, BaseController.proxyHandler);

    constructor() {

        super();
    }

    @requestParam('userId', 'name')
    //@foo
    printUserId(userId, name) {

        console.log('the value of "userId" param is:', userId);
    }

    printBody() {

        const req_body = this.httpContext.request.body;

        console.log(req_body);
    }
}


const req = {
    method: 'post',
    params: {
        userId: 1,
        name: 'foo'
    },
    query: {

    },
    body: {
        message: 'Hello World!'
    }
}

const res = {};
const next = () => {};

//const args = [req, res, next]

const handler = dispatchRequest(...Controller.proxy.printUserId);

handler(req, res, next);   

/**
 * in express context 
 *  router.get('/user/:userId/name/:name', handler)
 *  or
 *  router.get('/user/:userId/name/:name', dispatchRequest(...Controller.proxy.printUserId))
 */

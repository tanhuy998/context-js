const BaseController = require('./baseController.js');
const {dispatchRequest, requestParam , httpContext, initContext} = require('./requestDispatcher.js');

function foo(arg) {

    console.log(arg);

    return function (_class, _name, descriptor) {
        console.log('foo handle', descriptor)
        descriptor.value = () => {}
        //console.log(descriptor)
        return descriptor;
    }
}

function bar(_class, _name, descriptor) {
    console.log(this)
    console.log('foo handle', descriptor)
    //descriptor.value = () => {}
    //console.log(descriptor)
    return descriptor;
}

@httpContext
@initContext(123124)
class Controller extends BaseController {

    // we must type this line to made the derived class works properly
    static proxy = new Proxy(Controller, BaseController.proxyHandler);

    @requestParam('userId')
    //@bar
    userId;

    constructor() {

        super();
    }

    @requestParam('userId', 'name')
    //@bar
    printUserId(userId, name) {
        console.log(name);
        console.log('the value of "userId" param is:', userId);

        console.log(this.userId);
    }

    @requestParam('name')
    printBody(name) {

        const req_body = this.httpContext.request.body;

        console.log(req_body, this.userId);
    }
}


const req = {
    method: 'post',
    params: {
        userId: 2,
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
const handler1 = dispatchRequest(...Controller.proxy.printBody);
handler(req, res, next);   
handler1(req, res, next);

//const controller = new Controller({request: req, response: res, nextMiddleware: next});

// console.log(controller)
/**
 * in express context 
 *  router.get('/user/:userId/name/:name', handler)
 *  or
 *  router.get('/user/:userId/name/:name', dispatchRequest(...Controller.proxy.printUserId))
 */

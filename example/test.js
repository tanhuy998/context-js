//require('@babel/register')({ignore: []});
// const {BaseController, annotation, dispatchable} = require('../src/controller/baseController.js');
// const { RouteContext, Endpoint, routingContext, Route} = require('../http/httpRouting.js');
// const {dispatchRequest, requestParam , httpContext, initContext} = require('../requestDispatcher.js');
// const { responseBody, Response, contentType } = require('../response/responseResult.js');
// const {Middleware} = require('../middleware/middleware.js');
//const {Router} = require('./http/httpRouting.js');

const {BaseController, dispatchable, RouteContext, Endpoint, Route, routingContext, requestParam, responseBody, Response, contentType, Middleware} = require('../index.js');

function auth(req, res, next) {

    console.log('auth middleware');
}

const express = {
    Router: () => {
        
        return {
            routeList: {},
            newRequest: function(req, res) {

                const method = req.method;
                const path = req.path ? req.path : '/';

                try {

                    const actionList = this.routeList[method][path];

                    for (const callback of actionList) {

                        callback(req, res, () => {});
                    }
                }
                catch(e) {

                    console.log(e)
                    return;
                }
            },
            get: function(path, _callback) {

                if (!this.routeList['get']) this.routeList['get'] = {};

                if (!this.routeList['get'][path]) this.routeList['get'][path] = [];

                this.routeList['get'][path].push( _callback);
            },
            post: function(path, _callback) {

                if (!this.routeList['post']) this.routeList['post'] = {};

                if (!this.routeList['post'][path]) this.routeList['post'][path] = [];

                this.routeList['post'][path].push( _callback);
            }
        }
    },
    get: function(path) {

        console.log(path, this.prop);

        return function(target, prop, descriptor) {

            return descriptor;
        }
    }
}

@Route.prefix('/admin')
@routingContext()
@dispatchable
class Controller extends BaseController {

    // we must type this line to made the derived class works properly
    // use @dispatchable instead
    // static proxy = new Proxy(Controller, BaseController.proxyHandler);

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

    @Endpoint.get('/value')
    @requestParam('name')
    @contentType('json')
    @responseBody
    printBody(name) {

        const req_body = this.httpContext.request.body;

        console.log(req_body, this.userId);

        return name;
    }

    @requestParam('name')
    @Endpoint.post('/user')
    @Response.writeHead('Content-Type: json')
    func(param) {
        console.log('entering "/path" route');
        console.log('the value of request param "name" is:', param);
    }
}
@Route.prefix('/user')
@routingContext()
@dispatchable
class Another extends BaseController {

    constructor() {

        super();
    }

    @requestParam('qty')
    @Endpoint.get('/value')
    @contentType('josn')
    @responseBody
    print(qty) {

        console.log('Another Controller class', qty)

        return qty;
    }

    @Endpoint.post('/middleware')
    @Middleware.before(auth)
    @Middleware.after(auth)
    test() {

        console.log('test for middleware');
    }
}

const req = {
    method: 'get',
    path: '/user/value',
    params: {
        userId: 2,
        name: 'foo',
        qty: 100
    },
    query: {

    },
    body: {
        message: 'Hello World!'
    }
}

const res = {
    headers: {},
    content: '',
    writeHead: function(_header) {
        console.log('write header:', _header)
    },
    write: function(_content) {

        this.content = _content;
    },
    setHeader: function(_name, value) {

        console.log('setHeader', _name, value);
    },
    send: function(_content) {

        this.write(_content);
    },
    end: function(_content) {

        this.write(_content);
    }    
};
const next = () => {};

RouteContext.init(express);

const router = RouteContext.resolve();

console.log(router.routeList.post['/user/middleware'])
router.newRequest(req, res);
router.newRequest(req, res);

console.log('res content', res.content);

//const args = [req, res, next]

// const handler = dispatchRequest(...Controller.proxy.printUserId);
// const handler1 = dispatchRequest(...Controller.proxy.printBody);
// handler(req, res, next);   
// handler1(req, res, next);

//const controller = new Controller({request: req, response: res, nextMiddleware: next});

// console.log(controller)
/**
 * in express context 
 *  router.get('/user/:userId/name/:name', handler)
 *  or
 *  router.get('/user/:userId/name/:name', dispatchRequest(...Controller.proxy.printUserId))
 */

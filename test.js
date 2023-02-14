//require('@babel/register')({ignore: []});
const {BaseController, annotation, dispatchable} = require('./baseController.js');
const { Route, Endpoint, routingContext } = require('./http/httpRouting.js');
const {dispatchRequest, requestParam , httpContext, initContext} = require('./requestDispatcher.js');
const { responseBody, Response } = require('./response/responseResult.js');
//const {Router} = require('./http/httpRouting.js');

function foo(arg) {

    console.log(arg);

    return function (_class, _name, descriptor) {
        console.log('foo handle', descriptor)
        descriptor.value = () => {}
        //console.log(descriptor)
        return descriptor;
    }
}

function bar(_class, prop, descriptor) {
    console.log('bar', _class, prop, descriptor); 
    return descriptor;
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

//@Route.prefix('/admin')
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


const req = {
    method: 'post',
    path: '/user',
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

const res = {
    headers: {},
    content: '',
    writeHead: function(_header) {
        console.log('write header:', _header)
    },
    write: function(_content) {

        this.content = _content;
    }
};
const next = () => {};

Route.init(express);

const router = Route.resolve();

//console.log(router)
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

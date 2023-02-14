const {dispatchRequest} = require('../requestDispatcher');
const {preprocessDescriptor} = require('../decorator/utils.js');
//const {decoratorContext} = require('../baseController.js');
const PreInvokeFuncion = require('../callback/preInvokeFunction.js');
const extendsDecoratorContext = require('../decoratorContext.js');
const path = require('path');

//@inheritDecoratorContextClass
class RouteContext {

    static #routerObject;
   
    static #callbackQueue = [];

    static #context = {};///////////////////
    static #currentRoutingContext;//////////////////
    
    static currentPrefix = '';

    static get router() {

        return RouteContext.#routerObject;
    }

    static get context() {

        return this.#context;
    }

    constructor() {


    }

    static get currentContext() {

        return RouteContext.#currentRoutingContext;
    } ///////////////

    static init(_express) {

        if (!RouteContext.router) {

            RouteContext.#routerObject = _express.Router();

            //Route.dequeue();
            return;
        }
    }

    static dequeue() {

        const callbackQueue = RouteContext.#callbackQueue;

        const the_router = RouteContext.router;

        for (const callback of callbackQueue) {
            console.log('dequeue');
            callback.bind(the_router).invoke();
        }

        RouteContext.#callbackQueue = [];
    }

    static getControllerClassByRoutingContext(symbol) {

        return RouteContext.context[symbol];
    }

    // this method will be called when there is no express's router object is initialized
    static #dispatchRouter() {

        const currentRoutingContext = RouteContext.currentContext;

        return function(method, path, action) {

            const controllerClass = RouteContext.getControllerClassByRoutingContext(currentRoutingContext);

            //console.log(controllerClass, 1)
            RouteContext.router[method](path, dispatchRequest(controllerClass, action));
        }
    }

    static define(method, _path, _routingContext, _action) {
        console.log('define route', `[${method} ${_path}] in context`, [_routingContext.description], _action)
        //console.log(decoratorContext.currentContext);
        //if (!Route.router) throw new Error('Controller route decorator: router is not set, we must init the "Express" instance to the Route class');
        //const controllerClass = Route.#controllers[_routingContext];

        if (!RouteContext.router) {
            
            const callback = new PreInvokeFuncion(RouteContext.#dispatchRouter())

            callback.passArgs(method, _path, _action);
            
            RouteContext.#queue(callback);
            
            return;
        }

        
        RouteContext.router[method](_path, dispatchRequest(...controllerClass.proxy[_action]));
    }

    
    /**
     * Queue an action for future invocation 
     * To invoke the actions, call RouteContext.dequeue() method
     * common use case:
     *      this method is used when there is no express object configured by init() method
     *      because sometime some specific controller classes is imported before calling RouteContext.init(express) 
     *      so the routing operation will not function properly and throw 'calling property of undefined' Error
     * 
     * @param {*} callback 
     */
    static #queue(callback) {

        RouteContext.#callbackQueue.push(callback);
    }

    static resolve() {
        
        RouteContext.dequeue();

        return RouteContext.router;
    }

    static assignContext(symbol, _constructor) {

        RouteContext.#context[symbol] = _constructor;

    }/////////////////////////

    static defineContext(symbol) {

        //const symbol = Symbol(key);

        RouteContext.#currentRoutingContext = symbol;

        RouteContext.context[symbol] = 1;

        //Route.currentContext
    }////////////////////////
}

const Route = new Proxy(RouteContext, {
    additionMethod: {
        prop: {
            currentRoutePrefix: '',
        },
        prefix: function(_path) {
            //this.additionMethod.prop.currentRoutePrefix = _path;
            RouteContext.currentPrefix = _path;
            //const currentRoutingContext = RouteContext.currentContext;
            //console.log('set prefix')
            //RouteContext.assignContext(currentRoutingContext, );
            //console.log('call prefix', this)
            return (function(_targetContructor) {
                //this.additionMethod.prop.currentRoutePrefix = '';
                RouteContext.currentPrefix = '';
                return _targetContructor;
            });
        }
    },
    get: function (routeContext, _method) {

        if (this.additionMethod[_method]) {
            
            return this.additionMethod[_method].bind(this);
        }

        return function(path) {
            
            const routingContext = RouteContext.currentContext;

            const pathPrefix = RouteContext.currentPrefix;
            //console.log(routingContext);
            path = pathPrefix + path;
            
            return function(_controllerClass, _actionName, descriptor) {

                const decoratedResult = preprocessDescriptor(_controllerClass, _actionName, descriptor);

                descriptor.value = decoratedResult;

                if (decoratedResult.constructor.name == 'MethodDecorator') {

                    routeContext.define(_method, path, routingContext, _actionName);

                    return descriptor;
                }

                return descriptor;
            }
        }
    },
    set: () => {

        return false;
    }
})

const Endpoint = new Proxy(RouteContext, {
    httpMethods: {
        get: 0,
        head: 1,
        post: 2,
        put: 3,
        'delete': 4,
        connect: 5,
        options: 6,
        trace: 7,
        patch: 8,
    },
    get: function(RouteClass, _method) {
        
        if (!this.httpMethods.hasOwnProperty(_method)) throw new Error(`Endpoint decorator error: using invalid http method "${_method}"`);

        return function(path) {

            const routingContext = RouteContext.currentContext;
            //console.log(routingContext);

            const pathPrefix = RouteContext.currentPrefix;
            //console.log(routingContext);
            path = pathPrefix + path;

            return function(_controllerClass, _actionName, descriptor) {

                const decoratedResult = preprocessDescriptor(_controllerClass, _actionName, descriptor);

                descriptor.value = decoratedResult;

                if (decoratedResult.constructor.name == 'MethodDecorator') {

                    RouteClass.define(_method, path, routingContext, _actionName);

                    return descriptor;
                }

                return descriptor;
            }
        }
    },
    set: () => {

        return false;
    }
});

// routingContext annotates the specified controller class is defining route
// if a controller class is not annotated with this annotation
// router will not map the route properly and will throw controller mapping error 
function routingContext() {

    const contextKey = Date.now();
    const symbol = Symbol(contextKey);

    console.log([contextKey], 'context is defined')

    RouteContext.defineContext(symbol);

    return function(_theConstructor) {
    
        // const className = _theConstructor.toString()
        //                     .match(/function\s\w+/)[0]
        //                     .replace('function ', '');
        

        RouteContext.assignContext(symbol, _theConstructor);
        console.log([contextKey], 'was assigned with', _theConstructor);
    
        //decoratorContext.currentClass = _theConstructor;
    
        return _theConstructor;
    }
}

module.exports = {RouteContext, Endpoint, routingContext, Route};
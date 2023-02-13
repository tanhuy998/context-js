const {dispatchRequest} = require('../requestDispatcher');
const {preprocessDescriptor} = require('../decorator/utils.js');
//const {decoratorContext} = require('../baseController.js');
const PreInvokeFuncion = require('../callback/preInvokeFunction.js');
const extendsDecoratorContext = require('../decoratorContext.js');

//@inheritDecoratorContextClass
class Route {

    static #routerObject;
   
    static #callbackQueue = [];

    static #context = {};///////////////////
    static #currentRoutingContext;//////////////////
    
    static get router() {

        return Route.#routerObject;
    }

    static get context() {

        return this.#context;
    }

    constructor() {


    }

    static get currentContext() {

        return Route.#currentRoutingContext;
    } ///////////////

    static init(_express) {

        if (!Route.router) {

            Route.#routerObject = _express.Router();

            //Route.dequeue();
            return;
        }
    }

    static dequeue() {

        const callbackQueue = Route.#callbackQueue;

        const the_router = Route.router;

        for (const callback of callbackQueue) {
            console.log('dequeue');
            callback.bind(the_router).invoke();
        }

        Route.#callbackQueue = [];
    }

    static getControllerClassByRoutingContext(symbol) {

        return Route.context[symbol];
    }

    // this method will be called when there is no express's router object is initialized
    static #dispatchRouter() {

        const currentRoutingContext = Route.currentContext;

        return function(method, path, action) {

            const controllerClass = Route.getControllerClassByRoutingContext(currentRoutingContext);

            //console.log(controllerClass, 1)
            Route.router[method](path, dispatchRequest(controllerClass, action));
        }
    }

    static define(method, _path, _routingContext, _action) {
        console.log('define route', `[${method} ${_path}] in context`, [_routingContext.description], _action)
        //console.log(decoratorContext.currentContext);
        //if (!Route.router) throw new Error('Controller route decorator: router is not set, we must init the "Express" instance to the Route class');
        //const controllerClass = Route.#controllers[_routingContext];

        if (!Route.router) {
            
            const callback = new PreInvokeFuncion(Route.#dispatchRouter())

            callback.passArgs(method, _path, _action);
            
            Route.#queue(callback);
            
            return;
        }

        
        Route.router[method](_path, dispatchRequest(...controllerClass.proxy[_action]));
    }

    
    /**
     * Queue an action for future invocation 
     * To invoke the actions, call Route.dequeue() method
     * common use case:
     *      this method is used when there is no express object configured by init() method
     *      because sometime some specific controller classes is imported before calling Route.init(express) 
     *      so the routing operation will not function properly and throw 'calling property of undefined' Error
     * 
     * @param {*} callback 
     */
    static #queue(callback) {

        Route.#callbackQueue.push(callback);
    }

    static resolve() {
        
        Route.dequeue();

        return Route.router;
    }

    static assignContext(symbol, _constructor) {

        Route.#context[symbol] = _constructor;

    }/////////////////////////

    static defineContext(symbol) {

        //const symbol = Symbol(key);

        Route.#currentRoutingContext = symbol;

        Route.context[symbol] = 1;

        //Route.currentContext
    }////////////////////////
}

const Router = new Proxy(Route, {

    get: (RouteClass, _method) => {

        return function(path) {

            const routingContext = Route.currentContext;
            //console.log(routingContext);

            return function(_controllerClass, _actionName, descriptor) {

                const decoratedResult = preprocessDescriptor(_controllerClass, _actionName, descriptor);

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
})

const Endpoint = new Proxy(Route, {
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

            const routingContext = Route.currentContext;
            //console.log(routingContext);

            return function(_controllerClass, _actionName, descriptor) {

                const decoratedResult = preprocessDescriptor(_controllerClass, _actionName, descriptor);

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

    Route.defineContext(symbol);

    return function(_theConstructor) {
    
        // const className = _theConstructor.toString()
        //                     .match(/function\s\w+/)[0]
        //                     .replace('function ', '');
        

        Route.assignContext(symbol, _theConstructor);
        console.log([contextKey], 'was assigned with', _theConstructor);
    
        //decoratorContext.currentClass = _theConstructor;
    
        return _theConstructor;
    }
}

module.exports = {Route, Endpoint, routingContext, Router};
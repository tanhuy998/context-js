const {dispatchRequest} = require('../requestDispatcher');
const {preprocessDescriptor} = require('../utils.js');
//const {decoratorContext} = require('../baseController.js');
const PreInvokeFuncion = require('../preInvokeFunction.js');

class Route {

    static #routerObject;
    static #controllers = {};
    static #callbackQueue = [];

    static #currentRoutingContext;
    
    static get router() {

        return Route.#routerObject;
    }

    static get currentContext() {

        return Route.#currentRoutingContext;
    }

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

        return Route.#controllers[symbol];
    }

    // this method will be called when there is no express's router object is initialized
    static #dispatchRouter() {

        const currentRoutingContext = Route.currentContext;

        return function(method, path, action) {

            const controllerClass = Route.getControllerClassByRoutingContext(currentRoutingContext);

            console.log(controllerClass)
            Route.router[method](path, dispatchRequest(controllerClass, action));
        }
    }

    static define(httpMethod, _path, _routingContext, _action) {
        console.log('define route', httpMethod, _path, _routingContext, _action)
        //console.log(decoratorContext.currentContext);
        //if (!Route.router) throw new Error('Controller route decorator: router is not set, we must init the "Express" instance to the Route class');
        //const controllerClass = Route.#controllers[_routingContext];

        if (!Route.router) {
            
            const callback = new PreInvokeFuncion(Route.#dispatchRouter())

            callback.passArgs(httpMethod, _path, _action);
            
            Route.#queue(callback);
            
            return;
        }

        
        Route.router[httpMethod](_path, dispatchRequest(...controllerClass.proxy[_action]));
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

    static asignContext(symbol, _constructor) {

        Route.#controllers[symbol] = _constructor;

        console.log(Route.#controllers);
    }

    static defineContext(symbol) {

        //const symbol = Symbol(key);

        Route.#currentRoutingContext = symbol;

        Route.#controllers[symbol] = 1;

        //Route.currentContext
    }
}

const Endpoint = new Proxy(Route, {

    get: (RouteClass, httpMethod) => {

        return function(path) {

            const routingContext = Route.currentContext;
            //console.log(routingContext);

            return function(_controllerClass, _actionName, descriptor) {

                const decoratedResult = preprocessDescriptor(_controllerClass, _actionName, descriptor);

                if (decoratedResult.constructor.name == 'MethodDecorator') {

                    RouteClass.define(httpMethod, path, routingContext, _actionName);

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

// routingContext annotates the specified controller class is defining route
// if a controller class is not annotated with this annotation
// router will not map the route properly and will throw controller mapping error 
function routingContext() {

    const contextKey = Date.now();
    const symbol = Symbol(contextKey);

    console.log('define context', contextKey)

    Route.defineContext(symbol);

    return function(_theConstructor) {
    
        // const className = _theConstructor.toString()
        //                     .match(/function\s\w+/)[0]
        //                     .replace('function ', '');
        

        Route.asignContext(symbol, _theConstructor);
        console.log('asign', contextKey, 'to', _theConstructor);
    
        //decoratorContext.currentClass = _theConstructor;
    
        return _theConstructor;
    }
}

module.exports = {Route, Endpoint, routingContext}
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

    static #session = {};

    static #sessionStack = [];

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

        const registerMiddleware = function(_method, _path, _routeSession, _order = 'beforeController') {

            if (!_routeSession) return;
    
            const middlewareList = _routeSession[_order];
            
            if (!middlewareList) return;

            for (const middleware of middlewareList) {
    
                RouteContext.router[_method](_path, middleware);
            }
        }

        //registerMiddleware.bind(RouteContext);

        return function(method, path, action, _session) {

            const controllerClass = RouteContext.getControllerClassByRoutingContext(currentRoutingContext);

            registerMiddleware(method, path, _session);
            
            RouteContext.router[method](path, dispatchRequest(controllerClass, action));

            registerMiddleware(method, path, _session, 'afterController');
        }
    }

    static define(method, _path, _routingContext, _action, _sessionKey = undefined) {
        //console.log('define route', `[${method} ${_path}] in context`, [_routingContext.description], _action)

        //if (!Route.router) throw new Error('Controller route decorator: router is not set, we must init the "Express" instance to the Route class');
        //const controllerClass = Route.#controllers[_routingContext];
        const length = (this.#sessionStack.length != 0) ? this.#sessionStack.length : 1;

        const currentSessionSymbol = this.#sessionStack[length - 1];
        const currentSession = this.session(currentSessionSymbol);

        if (!RouteContext.router) {
            
            const callback = new PreInvokeFuncion(RouteContext.#dispatchRouter());

            //const session = (_sessionKey) ? this.session(_sessionKey) : undefined;

            callback.passArgs(method, _path, _action, currentSession);
            
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

    static startSession() {

        const key = Date.now();
        const sessionSymbol = Symbol(key);

        this.#session[sessionSymbol] = {
            expires: true,
            beforeController: [],
            afterController: []
        }

        this.#sessionStack.push(sessionSymbol);

        return sessionSymbol;
        // this.#session.expires = false;
        // this.#session.beforeController = [];
        // this.#session.afterController = [];
    }

    static session(_symbol) {

        return this.#session[_symbol];
    }

    static endSession(_symbol) {

        if (this.#session[_symbol]) {

            this.#session[_symbol] = undefined;
            this.#sessionStack.pop();
        }
    }

    static #middleware(_sessionSymbol, _order, ...args) {
        
        const session = this.#session[_sessionSymbol];

        if (!session) return;

        const current = session[_order]; 

        //this.#session[_order] = [...current, ...args];
        this.#session[_sessionSymbol][_order] = [...current, ...args];
    }

    static middlewareBeforeController(_sessionSymbol, ...args) {

        this.#middleware(_sessionSymbol, 'beforeController', ...args);
    }

    static middlewareAfterController(_sessionSymbol, ...args) {

        this.#middleware(_sessionSymbol, 'afterController', ...args);
    }
}

const Route = new Proxy(RouteContext, {
    additionMethod: {
        prop: {
            currentRoutePrefix: '',
        },
        prefix: function(_path) {
            //this.additionMethod.prop.currentRoutePrefix = _path;
            RouteContext.currentPrefix = _path;
            
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
            

            const pathPrefix = RouteContext.currentPrefix;
            
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

    //console.log([contextKey], 'context is defined')

    RouteContext.defineContext(symbol);

    return function(_theConstructor) {    

        RouteContext.assignContext(symbol, _theConstructor);
        //console.log([contextKey], 'was assigned with', _theConstructor);
    
        //decoratorContext.currentClass = _theConstructor;
    
        return _theConstructor;
    }
}

module.exports = {RouteContext, Endpoint, routingContext, Route};
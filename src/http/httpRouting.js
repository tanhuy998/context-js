const {dispatchRequest} = require('../requestDispatcher');
const {preprocessDescriptor} = require('../decorator/utils.js');
//const {decoratorContext} = require('../baseController.js');
const PreInvokeFuncion = require('../callback/preInvokeFunction.js');
const GroupConstraint = require('./groupConstraint.js');
const GlobalConstraintConfiguration = require('./globalConstraitConfiguration.js');
const GroupManager = require('./groupManager.js');



const routeDecoratorHandler = {
    additionMethod: {
        prop: {
            currentRoutePrefix: '',
            routeSet: {},
        },
        state: {
            groupList: new GroupManager(),
            localConstraints: {},
            globalConstraints: {},
        },
        group: function(_groupPath) {
            //this.additionMethod.prop.currentRoutePrefix = _path;
            
            //const groupId = Symbol(Date.now());

            return (function groupLocalConstraint(_targetContructor) {
                //this.additionMethod.prop.currentRoutePrefix = '';
                const currentContext = RouteContext.currentContext;

                this.state.groupList.save(currentContext, _groupPath);

                const localConstraints = this.state.localConstraints;

                if (!localConstraints[currentContext]) {
                    
                    const groupInstance = RouteContext.config.express.Router();

                    localConstraints[currentContext] = new GroupConstraint().group(groupInstance);
                }

                const currentConstraint = localConstraints[currentContext];
                
                const groupInstance = currentConstraint.groupInstance;
                //const groupRoutes = RouteContext.config.express.Router();

                //const globalConstraint = this.state.globalConstraints[_groupPath];

                //currentConstraint.group(groupInstance)

                RouteContext.router.use(_groupPath, groupInstance);

                //RouteContext.currentPrefix = '';
                return _targetContructor;

            }).bind(this);
        },
        _middleware: function(_routingContext, _chain, _middlewarePriority = 'before', _constraintScope = 'localConstraints') {

            //const contextGroups = this.prop.routeSet[_routingContext];
            const currentConstraint = this.state[_constraintScope][_routingContext];
            
            if (!currentConstraint) return;

            switch(_middlewarePriority) {

                case 'before':
                    currentConstraint.before(..._chain);
                    break;
                case 'after':
                    currentConstraint.after(..._chain);
                    break;
                default:
                    return;
            }

            return ;
        },
        constraint: function() {

            return new GlobalConstraintConfiguration(this.state.globalConstraints);
        },
        _getLocalConstraint: function(_routingContext) {

            return this.state.localConstraints[_routingContext];
        }, 
        _getGlobalConstraint: function(_groupPath) {
             
            return this.state.globalConstraints[_groupPath];
        },
        _initializeGroups: function (contextList) {
            
            const contextKeys = Reflect.ownKeys(contextList);
            
            for (const _context of contextKeys) {
                
                const localConstraint = this.state.localConstraints[_context]

                const groupList  = this.state.groupList.getByContext(_context);

                for (const groupPath of groupList) {
                    
                    const globalConstraint = this.state.globalConstraints[groupPath];

                    if (globalConstraint && localConstraint) {
                        
                        localConstraint.mergeConfigWith(globalConstraint);
                    }
                }
            }
        },
        prefix: function(_path) {
            //this.additionMethod.prop.currentRoutePrefix = _path;
            RouteContext.currentPrefix = _path;
            
            return (function(_targetContructor) {
                //this.additionMethod.prop.currentRoutePrefix = '';
                RouteContext.currentPrefix = '';
                return _targetContructor;
            });
        },
        CRUD: function(_path) {

        }
    },
    get: function (routeContext, _method) {

        if (this.additionMethod[_method]) {
            
            //return this.additionMethod[_method].bind(this);
            return this.additionMethod[_method].bind(this.additionMethod);
        }
        
        return (function(path) {
            
            const routingContext = RouteContext.currentContext;
            
            // const pathPrefix = RouteContext.currentPrefix;
            // path = pathPrefix + path;

            return (function(_controllerClass, _actionName, descriptor) {


                const currentSessionSymbol = RouteContext.currentSession;

                const decoratedResult = preprocessDescriptor(_controllerClass, _actionName, descriptor);

                descriptor.value = decoratedResult;

                if (decoratedResult.constructor.name == 'MethodDecorator') {

                    routeContext.define(_method, path, routingContext, _actionName, currentSessionSymbol);

                    return descriptor;
                }

                return descriptor;

            });

        }).bind(this)
    },
    set: () => {

        return false;
    }
}


//@inheritDecoratorContextClass
class RouteContext {

    static #routerObject;
   
    static #callbackQueue = [];

    static #context = {};///////////////////
    static #currentRoutingContext;//////////////////
    
    static currentPrefix = '';

    static #session = {};
    static #currentSession;

    static #sessionPool = [];

    static controllerAction = {};

    static #isResolved = false;

    static #config = {};

    static get isResolved() {

        return this.#isResolved;
    }

    // static #hooks = {
    //     beforeDefine: [],
    //     afterDefine: []
    // };

    static get router() {

        return RouteContext.#routerObject;
    }

    static get context() {

        return this.#context;
    }

    static get config() {

        return this.#config;
    }

    constructor() {


    }

    static get currentContext() {

        return RouteContext.#currentRoutingContext;
    } ///////////////

    static get currentSession() {

        return RouteContext.#currentSession;
    }

    static init(_express) {

        this.#config.express = _express;

        if (!RouteContext.router) {

            RouteContext.#routerObject = _express.Router();

            //Route.dequeue();
            return;
        }
    }

    static dequeue() {

        const callbackQueue = RouteContext.#callbackQueue;

        const the_router = RouteContext.router;

        Route._initializeGroups(this.#context);

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

        const routingContext = RouteContext.currentContext;

        const currentSessionSymbol = RouteContext.currentSession;

        const registerMiddleware = function(_method, _path, _routeSession, _order = 'beforeController') {

            if (!_routeSession) return;
    
            const middlewareList = _routeSession[_order];
            
            if (!middlewareList) return;
            
            /**
             *  notice: loop will be removed in the next patch
             */
            for (const middleware of middlewareList) {
    
                RouteContext.router[_method](_path, middleware);
            }
        }
        
        const combineMiddlewareChain = function (_routingContext, _controllerClass, _controllerAcion, _session) {

            const controllerClass = RouteContext.getControllerClassByRoutingContext(routingContext);
    
            const before = (_session) ? _session['beforeController'] : [];
    
            const after = (_session) ? _session['afterController'] : [];
    
            const chain = [...before, dispatchRequest(_controllerClass, _controllerAcion), ...after];
    
            return chain;
        };
        
        const mergeRouteWithGroupLocalConstraint = function(_routingContext, _routeMethod, _routePrefix, _childPath, _controllerAcion,  _currentHandlersChain) {

            //const contextGroup = routeDecoratorHandler.additionMethod.prop.routeSet[_routingContext];
            const localConstraint = routeDecoratorHandler.additionMethod.state.localConstraints[_routingContext];

            if (localConstraint) {

                const before = localConstraint.middlewareBefore;
                const after = localConstraint.middlewareAfter;

                localConstraint.groupInstance[_routeMethod](_childPath, ...before, ..._currentHandlersChain, ...after);
            }
            else {

                const fullPath = _routePrefix + _childPath;

                RouteContext.router[_routeMethod](fullPath, _currentHandlersChain);
            }

            //const groups = (contextGroup) ? Object.keys(contextGroup) : [];

            // if (groups.length > 0) {
                
            //     routeDecoratorHandler.additionMethod.state.context[_routingContext].groupRoutes[_routeMethod](_childPath, _currentHandlersChain);

            //     for (const groupPrefix of groups) {

            //         const currentGroup = contextGroup[groupPrefix];

            //         if (currentGroup.isInitialized == false) {

            //             Route._initializeGroup(_routingContext, groupPrefix);

            //         }

            //         const fullPath = groupPrefix + _childPath;

            //         //console.log(fullPath, _currentHandlersChain)

            //         //currentGroup.groupRoutes[_routeMethod](_childPath, _currentHandlersChain);


            //         //console.log(_routingContext, currentGroup.groupRoutes)
            //         //const {middlewareBefore, middlewareAfter} = contextGroup[groupPrefix];

            //         //const handlers = [...middlewareBefore, _currentHandlersChain, ...middlewareAfter];

            //         //const fullPath = groupPrefix + _childPath;

            //         // will be changed to use sub router instead of declaring route immediately
            //         //RouteContext.router[_routeMethod](fullPath, handlers);

            //         //console.log(_routingContext, currentGroup.groupInstance);
            //     }
            // }
            // else {
                
            //     RouteContext.router[_routeMethod](_routePrefix + _childPath, _currentHandlersChain);
            // }
        }

        return function(method, _routePrefix, path, _action) {

            const session = RouteContext.session(currentSessionSymbol);

            let validSession = undefined;

            if (session) {

                const {context, action} = session.meta;

                const matchContext = (routingContext == context);
                const matchAction = (_action == action);

                validSession = (matchContext && matchAction) ? session: undefined;
            }
            
            //const middleWare = (matchContext && matchAction) ? registerMiddleware : () => {};

            const controllerClass = RouteContext.getControllerClassByRoutingContext(routingContext);

            //registerMiddleware(method, path, _session);
            // middleWare(method, path, session);
            
            // RouteContext.router[method](path, dispatchRequest(controllerClass, _action));

            // //registerMiddleware(method, path, _session, 'afterController');
            // middleWare(method, path, session, 'afterController');

            

            const routeHandlers = combineMiddlewareChain(routingContext, controllerClass, _action, validSession);

            return mergeRouteWithGroupLocalConstraint(routingContext, method, _routePrefix, path, _action, routeHandlers);
        }
    }

    // static beforeDefine(_callback) {

    //     this.#hooks.beforeDefine.push(_callback);
    // }

    // static afterDefine(_callback) {

    //     this.#hooks.afterDefine.push(_callback);
    // }

    // static callHooks(_name) {

    //     const hooks = this.#hooks[_name];

    //     if (!hooks) return;

    //     for (const callback of hooks) {

    //         callback();
    //     }

    //     this.#hooks[_name] = [];
    // }

    /**
     * define a atomic route
     * 
     * @param {*} method 
     * @param {*} _path 
     * @param {*} _routingContext 
     * @param {*} _action 
     * @param {*} _sessionKey 
     * @returns 
     */
    static define(method, _path, _routingContext, _action, _sessionKey = undefined) {

        const callback = new PreInvokeFuncion(RouteContext.#dispatchRouter());

            //const session = (_sessionKey) ? this.session(_sessionKey) : undefined;
        
        const routePrefix = this.currentPrefix;
            
        callback.passArgs(method, routePrefix, _path, _action);
            
        RouteContext.#queue(callback);
            
        return;

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

    static freeup() {

        if (!this.#isResolved) return;


    }

    static resolve() {
        if (!this.#routerObject) throw new Error('Router not found: you must call Route.init(express) before resolving routes')

        RouteContext.dequeue();

        this.#isResolved = true;

        this.freeup();

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

    static startSession(_context = undefined, _action = undefined) {

        const key = Date.now();
        const sessionSymbol = Symbol(key);

        this.#session[sessionSymbol] = {
            expires: false,
            beforeController: [],
            afterController: [],
            meta: {
                context: _context,
                action: _action
            }
        }

        return sessionSymbol;
    }

    static session(_symbol) {

        return this.#session[_symbol];
    }

    static assignSessionContext(_sessionSymbol, _contextSymbol) {

        if (!this.session(_sessionSymbol)) return false;

        if (!this.#context[_contextSymbol]) return false;

        this.session(_sessionSymbol).meta.context = _contextSymbol;
    }

    static assignSessionAction(_sessionSymbol, _action) {

        if (!_sessionSymbol) return false;

        if (!_action) return false;

        this.session(_sessionSymbol).meta.action = _action;
    }

    static switchSession (_symbol) {

        if (!this.session(_symbol)) throw new Error('RouteContext session error: switch to undefined routing session');

        this.#currentSession = _symbol;
    }

    static endSession(_symbol) {

        if (this.#session[_symbol]) {

            this.#session[_symbol].expires = true;

            return true;
        }

        return false;
    }

    static #registerMiddleware(_sessionSymbol, _order, ...args) {
        
        const session = this.#session[_sessionSymbol];

        if (!session) return;
        
        const currentMiddlewares = session[_order]; 

        this.#session[_sessionSymbol][_order] = undefined;
        //this.#currentSession = _sessionSymbol;
        //this.#session[_order] = [...current, ...args];
        this.#session[_sessionSymbol][_order] = [...currentMiddlewares, ...args];
    }

    static middlewareBeforeController(_sessionSymbol, _actionName, ...args) {

        return this.#registerMiddleware(_sessionSymbol, 'beforeController', ...args);
    }

    static middlewareAfterController(_sessionSymbol, _actionName, ...args) {

        return this.#registerMiddleware(_sessionSymbol, 'afterController', ...args);
    }
}

const Route = new Proxy(RouteContext, routeDecoratorHandler);

const Endpoint = new Proxy(RouteContext, {
    httpMethods: {
        GET: 'get',
        HEAD: 'head',
        POST: 'post',
        PUT: 'put',
        DELETE: 'delete',
        CONNECT: 'connect',
        OPTIONS: 'options',
        TRACE: 'trace',
        PATCH: 'patch',
    },
    get: function(RouteClass, _method) {
        
        //if (!this.httpMethods.hasOwnProperty(_method)) throw new Error(`Endpoint decorator error: using invalid http method "${_method}"`);
        if (!this.httpMethods[_method]) throw new Error(`Endpoint decorator error: using invalid http method "${_method}"`);

        const correctName = this.httpMethods[_method];

        return Route[correctName];
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

    RouteContext.defineContext(symbol);
    
    return function(_theConstructor) {    

        RouteContext.assignContext(symbol, _theConstructor);
        
        return _theConstructor;
    }
}

module.exports = {RouteContext, Endpoint, routingContext, Route};
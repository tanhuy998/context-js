const WSRouter = require('./router/wsRouter.js');
const dispatch = require('./dispatch.js');
const {METADATA} = require('../constants.js');
const NamespaceManager = require('./namespaceManager.js');
const filter = require('./decorators/filter.js');
const {Stage3_handleRequest} = require('../requestDispatcher.js');
const {once} = require('node:events');
const { error } = require('node:console');
const ClientContext = require('./clientContext.js');
class WebsocketContext {

    static #iocContainer;
    //static #router = new WSRouter();
    static #ioServer;

    static #appContext;

    static #wsServerInstance;

    static #contexts = new Map();

    static #currentContext;

    static #namespaceManager = new NamespaceManager();

    static #globalRouter;

    static get globalRouter() {

        return this.#globalRouter;
    }

    static get namespaceManager() {

        return this.#namespaceManager;
    }

    static setApplicationContext(_context) {

        if (typeof _context == 'object' && _context.constructor.name == 'ApplicationContext') {

            this.#appContext = _context;
        }
    }

    static setIoc(_container) {

        this.#iocContainer = _container;
    }

    /**
     *  Manage channel that is registered on a specific context
     * 
     * @param {Symbol} _contextSymbol 
     * @returns 
     */
    static manage(_contextSymbol) {
        
        const context = this.#contexts.get(_contextSymbol);

        if (!context) {

            return;
        }

        const controllerClass = context.target;

        if (!controllerClass) {

            return;
        }

        let prefix = controllerClass[METADATA].channelPrefix;
        
        prefix = prefix ? prefix + ':' : '';

        const {router, channels} = context;

        // typeof channels = Map
        for (const channel of channels.entries()) {

            const [event, action] = channel;

            const fullEventChannel = prefix + event;
            
            fullEventChannel.replace(/(\:{2,})/g, ':');

            router.channel(fullEventChannel, dispatch(controllerClass, action, this.#appContext));
        }
    }

    static assignContext(_contextSymbol, _class) {

        if (!this.#contexts.has(_contextSymbol)) {

            return;
        }

        const context = this.#contexts.get(_contextSymbol);

        context.target = _class;
    }

    /**
     * 
     * @param {string} _channel 
     * @param {string} _controllerAction 
     */
    static initChannel(_channel, _controllerAction) {

        const currentContext = this.#currentContext;

        if (!currentContext) {

            throw new Error('cannot init channel for controller whose context didn\'t been setted');
        }

        const contextMetadata = this.#contexts.get(currentContext);

        // contextMetadata.channels.push({
        //     event: _channel,
        //     action: _controllerAction,
        // })

        if (contextMetadata.channels.has(_channel)) {

            //throw new Error('cannot duplicate a channel on a single context');
        }

        contextMetadata.channels.set(_channel, _controllerAction);
    }

    static initFilers(_channel, filters = []) {

        if (!filters.length || filters.length === 0) return;

        const currentContext = this.#currentContext;

        if (!currentContext) {

            throw new Error('cannot init channel for controller whose context didn\'t been setted');
        }

        const contextMetadata = this.#contexts.get(currentContext);

        const contextFilters = contextMetadata.filters;

        if (!contextFilters.has(_channel)) {

            contextFilters.set(_channel, []);
        }

        contextFilters.get(_channel).push(filters);
    }

    static addErrorHandlers(_contextKey, ...handlerCallbacks) {

        if (!handlerCallbacks.length) {

            return;
        }

        const context = this.#contexts.get(_contextKey);

        if (!context) {

            return;
        }
        
        const {errorHandlers} = context;

        errorHandlers.push(...handlerCallbacks);
    }

    static newContext() {

        const contextSymbol = Symbol(Date.now());

        this.#currentContext = contextSymbol;

        this.#contexts.set(contextSymbol, {
            target: null,
            //namspaces: new Set(),  //namespaces is metadata is stored on controller class
            channels: new Map(),
            filters: new Map(),
            errorHandlers: [],
            router: new WSRouter(),
        })

        return contextSymbol;
    }

    static defineNamespace() {


    }

    static currentNamspaceContext() {

        return this.#currentContext;
    }

    static setServer(_ioServer) {

        this.#ioServer = _ioServer;
    }

    static #initRouterPresetMiddlewares(_router) {

        const appContext = this.#appContext;

        if (!appContext.supportIoc) {

            return;
        }

        _router.use(function (event, r, next) {

            const clientState = event.sender.data.controllerState;

            if (clientState) {

                return next(); 
            }

            const ControllerState = require('../controller/controllerState.js');

            const controllerState = appContext.iocContainer.get(ControllerState);

            event.sender.data.controllerState = controllerState;

            controllerState.override(event.constructor, event.constructor, {
                defaultInstance: event,
                iocContainer: appContext.iocContainer
            });

            next();
        })
    }

    static resolve() {
        
        const ioServer = this.#ioServer;

        if (!ioServer) {

            throw new Error('cannot resolve the websocket server');
        }

        const routingUnit = new Map();

        const interceptors = new Map();

        for (const context of this.#contexts.values()) {

            const {target, router, errorHandlers} = context;

            const namespaces = target[METADATA].socketNamespaces;

            const classMeta = target[METADATA];

            const classFilters = classMeta.filters || [];

            const channelPrefixes = classMeta?.channelPrefixes;

            const eventHandlingRouter = this.#initContextRouter(channelPrefixes, {_subChannelRouter: router, _classFilters: classFilters}) || router;

            //this.#initInterceptor(finalRouter, classMeta)

            const classInterceptors = classMeta.interceptors;

            this.#initDefaultErrorHandler(context);

            this.#initRouterPresetMiddlewares(eventHandlingRouter);

            this.#initErrorHandler(router, ...errorHandlers);

            for (const nsp of namespaces.values() || []) {

                if (classInterceptors) {

                    if (!interceptors.has(nsp)) {

                        interceptors.set(nsp, []);
                    }

                    interceptors.get(nsp).push(...classInterceptors);
                }

                if (!routingUnit.has(nsp)) {

                    routingUnit.set(nsp, new WSRouter());
                }

                const nspRouter = routingUnit.get(nsp);

                nspRouter.use(eventHandlingRouter);
            }
        }

        for (const unit of routingUnit.entries()) {

            const [nsp, router] = unit;

            if (interceptors.has(nsp)) {

                const nspInterceptors = interceptors.get(nsp);

                ioServer.of(nsp).use(...nspInterceptors);
            }

            ioServer.of(nsp).use(router);
        }

        WSRouter.mount();
    }

    static #initInterceptor(_router, _classMeta) {

        const {interceptors} = _classMeta;

        if (!Array.isArray(interceptors)) {

            return;
        }

        for (cb of interceptors) {


        }
    }

    static #initDefaultErrorHandler(_context) {

        const {target, router} = _context;

        const defaultErrorHandler = target?.prototype?.onError;

        if (typeof defaultErrorHandler !== 'function') {

            return;
        }

        this.#initErrorHandler(router, defaultErrorHandler);
    }

    static #initErrorHandler(_router, ...handlers) {

        const applicationContext = this.#appContext;

        for (const handler of handlers || []) {

            _router.use(async function (error, event, response, next) {
                
                const controller = event.controller;

                const newControllerContext = new ClientContext(event, response, next);

                controller.setContext(newControllerContext);

                controller.next = next;

                controller.error = error;
                
                overrideControllerComponent(controller, {
                    abstract: Error,
                    instance: error
                });

                let controllerAction;
                
                if (handler.name === 'stage3WrapperFunction') {

                    const decoratorResult = handler(); // the return type of a wrrapper funtion is intanceof DecoraotorResult
                    
                    controllerAction =  decoratorResult._target.callback.name;
                }
                else {

                    controllerAction = handler.name;
                }
                
                try {
                    
                    // for inject dependencies to the method
                    const result = await Stage3_handleRequest(controller, controllerAction, applicationContext);

                    if (result) {

                        controller.error = result;
                        next(result);
                    }
                }
                catch (error) {

                    next(error);
                }
            });
        }

        function overrideControllerComponent(_controller, {abstract, concrete, instance}) {

            if (!instance) {

                return;
            }

            concrete = concrete || abstract || instance.constructor;
            abstract = abstract || instance.constructor;

            _controller.state.override(abstract, concrete, {
                defaultInstance: instance,
                iocContainer: applicationContext.iocContainer
            })
        }
    }
    
    /**
     *  init class base router whether a context was define class base channel prefixes
     * 
     * @param {Set.entries | Array} _prefixes 
     * @returns {Array}
     */
    static #initContextRouter(_prefixes = [], {_subChannelRouter, _classFilters}) {

        const noPrefixDefined =  (_prefixes?.size == 0 || _prefixes.length === 0);
        const noFilterDefined = _classFilters?.length === 0;

        const hasFilter = !noFilterDefined;
        //if ((_prefixes?.size === 0 || _prefixes.length === 0) && _classFilters?.length === 0) {
        if (noPrefixDefined && noFilterDefined) {

            return undefined;
        }

        
        const classRouter = new WSRouter();
        const subChannels = _subChannelRouter.channels;

        /**
         *  Case 1: when no prefixes defined
         */
        if (noPrefixDefined) {

            classRouter.use(layer(subChannels));

            if (hasFilter) {

                classRouter.use(_classFilters);
            }

            classRouter.use(_subChannelRouter);
            
            return classRouter;
        }

        /**
         *  otherwise
         */
        const channels = [];

        classRouter.use(layer(channels));

        if (hasFilter) {
            
            classRouter.use(_classFilters);
        }

        for (const prefix of _prefixes.values() || _prefixes) {

            classRouter.use(prefix, _subChannelRouter);

            for (const subChannel of subChannels || []) {

                channels.push(`${prefix}:${subChannel}`);
            }
        }

        return classRouter;



        function layer(list = []) {

            return function(e, r, next) {
                
                const met = true;

                if (!Array.isArray(list) || list.length == 0) {

                    met = false;
                }
                console.log(list, met);
                const eventChannel = e.channel;
                
                if (met && list.includes(eventChannel)) {
                    console.log('match', list, eventChannel)
                    next();
                }
                else {
                    console.log(1)                    
                    const AbortHandling = require('./router/abortRouterException.js');

                    next(new AbortHandling());
                }
            }
        }
    }
}

module.exports = WebsocketContext;
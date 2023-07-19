const WSRouter = require('./router/wsRouter.js');
const dispatch = require('./dispatch.js');
const {METADATA} = require('../constants.js');
const NamespaceManager = require('./namespaceManager.js');
class WebsocketContext {

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


    static newContext() {

        const contextSymbol = Symbol(Date.now());

        this.#currentContext = contextSymbol;

        this.#contexts.set(contextSymbol, {
            target: null,
            //namspaces: new Set(),  //namespaces is metadata is stored on controller class
            channels: new Map(),
            router: new WSRouter(),
        })

        return contextSymbol;
    }

    static defineNamespace() {


    }

    static currentNamspaceContext() {

        return this.#currentContext;
    }

    // static addHandshakeMiddleware(_fn) {

    //     if (typeof _fn !== 'function') {

    //         throw new Error('Middleware must be a function');
    //     }

    //     this.#handshakeMiddleware.push(_fn);
    // }

    // static addSocketMiddleware(_fn) {

    //     if (typeof _fn !== 'function') {

    //         throw new Error('Middleware must be a function');
    //     }

    //     this.#socketMiddleware.push(_fn);
    // }

    // static setupGlobalRouter(_context) {

    //     if (!this.#globalRouter) {

    //         this.#globalRouter = ;
    //     }

    //     return this.#globalRouter;
    // }

    static setServer(_ioServer) {

        this.#ioServer = _ioServer;
    }

    static resolve() {
        
        const ioServer = this.#ioServer;

        if (!ioServer) {

            throw new Error('cannot resolve the websocket server');
        }



        for (const context of this.#contexts.values()) {

            const {target, router} = context;

            const namespaces = target[METADATA].socketNamespaces;

            const classMeta = target[METADATA];

            const finalRouter = this.#initContextRouter(classMeta?.channelPrefixes?.values(), router) || router;

            for (const iterator of namespaces.values() || []) {

                const nsp = iterator;

                // channelPrefixes instanceof Set
                

                ioServer.of(nsp).use(finalRouter);
            }
        }
    }
    
    /**
     *  init class base router whether a context was define class base channel prefixes
     * 
     * @param {Set.entries | Array} _prefixes 
     * @returns {Array}
     */
    static #initContextRouter(_prefixes = [], _subChannelRouter) {

        if (_prefixes?.size === 0 || _prefixes.length === 0) {

            return undefined;
        }

        const classRouter = new WSRouter();

        for (const prefix of _prefixes) {

            classRouter.use(prefix, _subChannelRouter);
        }

        return classRouter;
    }
}

module.exports = WebsocketContext;
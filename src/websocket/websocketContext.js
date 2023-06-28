const WSRouter = require('./router/wsRouter.js');
const dispatch = require('./dispatch.js');
const {METADATA} = require('../constants.js');

class WebsocketContext {

    //static #router = new WSRouter();
    static #ioServer;

    static #appContext;

    static #wsServerInstance;

    static #contexts = new Map();

    static #currentContext;

    static manage(_contextSymbol) {

        const context = this.#contexts.get(_contextSymbol);

        if (!context) {

            return;
        }

        const controllerClass = context.target;

        if (!controllerClass) {

            return;
        }

        const {router, channels} = context;

        for (const channel of channels) {

            const {event, action} = channel;

            router.channel(event, dispatch(controllerClass, action), this.#appContext);
        }
    }

    static assignContext(_contextSymbol, _class) {

        if (this.#contexts.has(_contextSymbol)) {

            throw new Error('internal error: websocket context is already been setted');
        }

        this.#contexts.set(_contextSymbol, _class);
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

        contextMetadata.channels.push({
            event: _channel,
            action: _controllerAction,
        })
    }


    static newContext() {

        const contextSymbol = Symbol(Date.now());

        this.#currentContext = contextSymbol;

        this.#contexts.set(contextSymbol, {
            target: null,
            //namspaces: new Set(),  //namespaces is metadata is stored on controller class
            channels: new Array(),
            router: new WSRouter(),
        })

        return contextSymbol;
    }

    static defineNamespace() {


    }

    static currentNamspaceContext() {

        return this.#currentContext;
    }

    static assignContext(_namspaceContext) {


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

    static setServer(_ioServer) {

        this.#ioServer = _ioServer;
    }

    static resolve() {
        
        const ioServer = this.#ioServer;

        if (!ioServer) {

            throw new Error('cannot resolve the websocket server');
        }

        for (const context of this.#contexts) {

            const {target, router} = context;

            const namespaces = target[METADATA].namespaces;

            for (const iterator of namespaces) {

                const nsp = iterator.value;

                ioServer.of(nsp).use(router);
            }
        }
    }
}

module.exports = WebsocketContext;
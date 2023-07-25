const WSEvent = require('./wsEvent.js');
const RouteHandler = require('./routeHandler.js');
const RuntimeError = require('../../error/rumtimeError.js');
const ResponseError = require('../../error/responseError.js');
//const { types } = require('@babel/core');
const {METADATA} = require('../../constants.js');
const ErrorHandler = require('./errorHandler.js');


/**
 *  WSRouter mananages events for each incomming socket connection
 */
class WSRouter extends Function {

    static get DEFAULT_CHANNEL() {

        return '\u03A9';
    }

    static get ERROR_CHANNEL() {

        return '\u20AC';
    }

    #maxSyncTask = 100;

    [METADATA] = {
        isRouter: true,
    }

    maxSyncTask(_number) {

        if (typeof _number !== 'number') {

            throw new TypeError('_number must be type of number');
        }

        if (_number == 0) {

            throw new Error('number of sync task must be greater than 0');
        }

        this.#maxSyncTask = Math.floor(_number);
    }

    #channelList = new Map();

    #layeredChannel;

    #currentEventError;

    #errorHandler;

    #genericHandler;

    #prefix;

    #errorHandlerStack;

    get channelList() {

        return this.#channelList;
    }

    get defaultChannel() {

        return this.#channelList.get(WSRouter.DEFAULT_CHANNEL);
    }

    static count = 0;
    #id;
    get id() {

        return this.#id;
    }

    constructor() {

        super();
        
        this.#id = WSRouter.count++;

        return new Proxy(this, {
            apply: function(target, _this, _args) {

                const [firstArg, next, ...rest] = _args;

                if (Array.isArray(firstArg)) {

                    
                }
                else if (_args.length >= 3) {

                    // const [event, response, next, currentChannel] = _args;

                    // // (currentChannel);

                    // if (currentChannel) {

                    //     target.handleIncomingEvent(currentChannel, event, next);
                    // }
                    // else {

                    //     target.handleIncomingEvent(event.channel, event, next);
                    // }

                }
                else if (_args.length === 2) {

                    //target.nextFunction = next;
                    target.manage(..._args);
                    next();
                }
            },
            get: function (target, prop) {

                const theProp = target[prop];

                return typeof theProp == 'function' ? theProp.bind(target) : theProp;
            }
        });
    }


    prefix(_str) {

        if (!_str) {

            throw new TypeError('_str is not type of string');
        }

        this.#prefix = _str;
    }

    /**
     *  Manage each incomming packet
     * 
     * @param {Socket} _socket 
     */
    manage(_socket) {

        const validateAndResolve = function (_firstArg, _next) {

            ////// ('validate');

            const calleeArgsLength = arguments.length;

            if (calleeArgsLength === 2) {

                const [event, ...args] = _firstArg;

                const eventObject = this.#preparePayload(event, _socket, args);

                const footPrint = {
                    event: eventObject,            // WSEvent
                    eventDispatcher: this,         // type of WSRouter
                    dispatchError: null       // typeof Function
                }

                this.handleIncomingEvent(event, footPrint, _next);

                //next();

                return;
            }
        }

        _socket.use(validateAndResolve.bind(this));
        //_socket.use(this);
    }

    handleDispatchedEvent(wsEvent, response, next) {


    }

    // /**
    //  * 
    //  * @param {string} _event 
    //  */
    // #resolveHandler(_event) {

    //     const prefix = this.#prefix ? this.#prefix + ':' : '';
        
    //     if (prefix) {

    //        _event = this.#resolveCurrentChannelOf(_event);
    //     }

    //     // ('resolve handler', _event);
    //     //return this.#channelList.get(_event);

    //     return this.#resolveChannel(_event);
    // }


    /**
     * 
     * @param {string} _str 
     * @param {string} _prefix 
     * @returns 
     */
    #replacePrefix(_str, _prefix) {

        if (typeof _prefix !== 'string') {

            throw new TypeError(`_prefix must be type of string`);
        }

        const prefix = new RegExp(`^${_prefix}(:+)`)

        return _str.replace(prefix, '');
    }

    #resolveCurrentChannelOf(_channel) {

        // ('channel', _channel)

        if (this.#prefix) {

            return this.#replacePrefix(_channel, this.#prefix);
        }
        else {


        }

        // (_channel, '-', result);

        return result;
    }

    /**
     * 
     * @param {string} _requestChannel 
     * @returns {Array} 
     */
    #resolveChannel(_requestChannel) {

        const key = 0, value = 1;
  
        if (this.#layeredChannel) {

            for (const entry of this.#layeredChannel.entries()) {

                const entryKey = entry[key];
    
                const pattern = new RegExp(`^${entryKey}(\:.+)*`);
    
                if (_requestChannel.match(pattern)) {
                    
                    return [...entry];
                }
            }
        }   
        
        const handler = this.#channelList.get(_requestChannel);

        return [_requestChannel, handler];
    }

    /**
     * hanndle for each incomming event from the client
     * 
     * @param {string} _channel 
     * @param {WSEvent} _event
     * @param {Function} serverNextfunction the 'next' function refer to next middleware of the server
     */
    //handleIncomingEvent(_channel, _socket, args = [], socketNextfunction) {
    handleIncomingEvent(_channel, { event, eventDispatcher, dispatchError}, socketNextfunction) {

        const [firstPart] = _channel.split(':', 1);

        //let handler = this.#channelList.get(_channel) || this.#channelList.get(firstPart) || this.#tryRegexPattern(_channel);

        const defaultHandler = this.#channelList.get(WSRouter.DEFAULT_CHANNEL);

        const [currentChannel, routeHandler] = this.#resolveChannel(_channel);

        const _this = this;

        const handlerArgs = [event, event.response, this.#replacePrefix(_channel, currentChannel)];

        const eventPack = {
            handlerArguments: handlerArgs,
            pushError,
            lastNextFunction: socketNextfunction,
            eventDispatcher: eventDispatcher
        };

        if (defaultHandler) {

            return defaultHandler.handle(0, {
                handlerArguments: handlerArgs,
                pushError,
                lastNextFunction: handleRoute
            })
        }
        else {

            return handleRoute();
        }


        function handleRoute() {


            if (!routeHandler) {

                return socketNextfunction();
            }

            return routeHandler.handle(0, eventPack);
        }

        function pushError(error) {
            const router = _this;

            router.pushError(error, {
                eventObject: event,
                //lastNextFunction: socketNextfunction,
                globalErrorHandler: dispatchError || socketNextfunction
            });
        }
    }



    #handleError(_error, _event, globalErrorHandler) {

        // false is the abort signal to end channel handler sequence
        if (_error === false) {
    
            return;
        }
    
        const errorHandler = this.#errorHandler;
    
        if (_error instanceof ResponseError) {
    
            return socketNextfunction(_error.data);
        }
    
        if (!errorHandler) {
            //// ('no error handler')
            return globalErrorHandler(_error.origin || _error);
        }
    
        const theExacError = _error.origin || _error;
    
        const errorHandlingPack = {
            handlerArguments: [theExacError, _event, _event.response],
            event: _event,
            error: theExacError,
            lastNextFunction: function(error) {
    
                if (error) {
    
                    globalErrorHandler(error);
                }
            }
        }
        
        errorHandler.handle(0, errorHandlingPack);
    }

    // for async functions to push error back to router to handle
    pushError(_error, {eventObject, globalErrorHandler}) {
        ////// ('push error')
        this.#handleError(_error, eventObject, globalErrorHandler);
    }

    #preparePayload(_event, _socket, args) {

        const lastElement = args[args.length -1];

        if (typeof lastElement === 'function') {

            args.splice(args.length -1, 1);
        }

        return new WSEvent(_event, _socket, {
            args: args,
            response: lastElement,
        })
    }
 
    #getFromLayeredChannels(_event) {

        const channlList = this.#layeredChannel;

        const key = 0, value = 1;

        for (const entry of channlList.entries()) {

            const channel = entry[key];

            const regex = new RegExp(`^${channel}`);

            if (_event.match(regex)) {

                return entry;
            }
        }

        return undefined;
    }

    use(..._handlers) {

        if (_handlers.length == 0) {

            throw new TypeError('_handlers must be type of function, undefined given');
        }


        const [firstArg, ...rest] = arguments;

        if (typeof firstArg === 'string') {

            this.channel(firstArg, ...rest);
        }
        else {

            this.channel(WSRouter.DEFAULT_CHANNEL, ...arguments);
        }
    }

    #pushHandler(_targetSet, ..._handler) {


    }

    channel(_pattern, ..._handlers) {

        if (typeof _pattern !== 'string') {

            throw new TypeError('channel pattern must be a type of string');
        }

        if (_handlers.length == 0) {

            throw new TypeError('_handlers must be type of function, undefined given');
        }

        
        const newHandlersChain = this.#combineHandlers(_pattern, _handlers);

        const currentHandlersChain = this.#channelList.get(_pattern);
        
        if (!newHandlersChain) {
            // if there is no RouteHandler is mapped
            // it's mean the current mapping just push ErrorHandler(s)
            return;
        }

        if (currentHandlersChain) {
            
            currentHandlersChain.pushBack(newHandlersChain);
        }
        else {

            this.#channelList.set(_pattern, newHandlersChain);
        }

        const isLayerChannel = this.#layeredChannel?.get(_pattern);

        // update the layerChannel 
        if (isLayerChannel === true) {

            const updatedHandlerChain = this.#channelList.get(_pattern);

            this.#layeredChannel.set(_pattern, updatedHandlerChain);
        }
    }

    /**
     * 
     * @param {Array} _handlers 
     */
    #combineHandlers(_pattern, _handlers) {

        const flattened = _handlers.flat(Infinity);

        const routeHandlerConfig = {
            router: this,
            maxSyncTask: this.#maxSyncTask
        };

        let handler;

        let isLayerChannel = false;

        for (let callback of flattened) {

            if (typeof callback !== 'function') {

                throw new TypeError('_handler must be a function');
            }

            if (typeof callback === 'function' && callback.length > 3) {
                
                this.#pushErrorHandler(callback);

                continue;
            }

            if (callback instanceof WSRouter) {

                const router = callback;

                router.prefix(_pattern);

                //router.mergeWithHigherOrderConfig(currentConfig);

                isLayerChannel = true;
            }

            const node = new RouteHandler(callback, routeHandlerConfig);

            if (!handler) {
                
                handler = node;
            }
            else {

                handler.pushBack(node);
            }
        }

        if (isLayerChannel) {

            this.#markLayeredChannel(_pattern);
        }

        return handler;
    }

    /**
     * set Flag on to layered channel
     * 
     * @param {string} _pattern 
     */
    #markLayeredChannel(_pattern) {

        if (!this.#layeredChannel) {

            this.#layeredChannel = new Map();
        }

        this.#layeredChannel.set(_pattern, true);
    }

    mergeWithHigherOrderConfig({maxSyncTask, errorHandler}) {

        this.maxSyncTask(maxSyncTask);

        if (errorHandler) {

            this.#appendErrorHandler(errorHandler);
        }
    }

    exportConfig() {

        const ERROR_CHANNEL = WSRouter.ERROR_CHANNEL;

        return {
            maxSyncTask: this.#maxSyncTask,
            errorHandlers: this.#channelList.get(ERROR_CHANNEL),
        }
    }

    /**
     * 
     * @param {ErrorHandler} _errorHandler 
     */
    #appendErrorHandler(_errorHandler) {

        if (!(_errorHandler instanceof ErrorHandler)) {

            throw new TypeError('_errorHandler must be type of ErrorHandler');
        }

        const thisErrorHandlerChain = this.#errorHandler;

        this.#errorHandler = _errorHandler;

        if (thisErrorHandlerChain) {

            _errorHandler.pushBack(thisErrorHandlerChain);
        }
    }

    #pushErrorHandler(_func) {
        
        const newNode = new ErrorHandler(_func, {
            router: this,
            maxSyncTask: this.#maxSyncTask
        });

        if (!this.#errorHandler) {
        
            this.#errorHandler = newNode;
        }
        else {
            
            this.#errorHandler.pushBack(newNode);
        }
    }
}

module.exports = WSRouter;
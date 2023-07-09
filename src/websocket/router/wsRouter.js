const WSEvent = require('./wsEvent.js');
const RouteHandler = require('./routeHandler.js');
const RuntimeError = require('../../error/rumtimeError.js');
const ResponseError = require('../../error/responseError.js');
/**
 *  WSRouter mananages events for each incomming socket connection
 */
class WSRouter extends Function {

    #channelList = new Map();

    // #wsServerNextFunction;

    // set nextFunction(_callback) {

    //     this.#wsServerNextFunction = _callback;
    // }

    #currentEventError;

    #errorHandler;

    constructor() {

        super();

        return new Proxy(this, {
            apply: function(target, _this, _args) {

                const [firstArg, next, ...rest] = _args;

                if (Array.isArray(firstArg)) {

                    
                }
                else {

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

    /**
     *  Manage each incomming packet
     * 
     * @param {Socket} _socket 
     */
    manage(_socket) {

        const validateAndResolve = function (_firstArg, _next) {

            //console.log('validate');

            const calleeArgsLength = arguments.length;

            if (calleeArgsLength === 2) {

                const [event, ...args] = _firstArg;

                this.handleIncomingEvent(event, _socket, args, _next);

                //next();

                return;
            }
        }

        _socket.use(validateAndResolve.bind(this));
        //_socket.use(this);
    }

    /**
     * hanndle for each incomming event from the client
     * 
     * @param {string} _event 
     * @param {Socket} _socket
     * @param {Array} args 
     * @param {Function} serverNextfunction the 'next' function refer to next middleware of the server
     */
    handleIncomingEvent(_event, _socket, args = [], socketNextfunction) {

        const [firstPart] = _event.split(':', 1);

        let handler = this.#channelList.get(_event) || this.#channelList.get(firstPart) || this.#tryRegexPattern(_event);

        if (!handler) {

            socketNextfunction();
            return;
        }

        const eventObj = this.#preparePayload(_event, _socket, args);

        const eventPack = {
            handlerArguments: [eventObj, eventObj.response],
            lastNextFunction: socketNextfunction
        };

        //handler.handle(0, eventObj, eventObj.response, socketNextfunction);
        handler.handle(0, eventPack);

        console.log('router handled', _event, handler);
    }

    #handleError(_error, _event, socketNextfunction) {

        const errorHandler = this.#errorHandler;

        if (_error instanceof ResponseError) {

            return socketNextfunction(_error.data);
        }

        if (!errorHandler) {
            console.log('no error handler')
            return socketNextfunction(_error.origin || _error);
        }

        const errorHandlingPack = {
            handlerArguments: [_error, _event, _event.response],
            lastNextFunction: function(error) {

                if (error) {

                    socketNextfunction(error);
                }
            }
        }

        errorHandler.handle(0, errorHandlingPack);

        // if (_error instanceof RuntimeError) {

        //     try {

        //         errorHandler.handle(0, _error.origin, _event, _event.response);
        //     }
        //     catch (error) {

        //         socketNextfunction(error.origin || error);

        //         return;
        //     }
        // }
        // else {

        //     return socketNextfunction(_error.origin || _error)
        // }
    }

    // for async functions to push error back to router to handle
    pushError(_error, {eventObject, lastNextFunction}) {
        console.log('push error')
        this.#handleError(_error, eventObject, lastNextFunction);
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

    // #generateHandlersChain(_event, _socket, _args, _handlers) {

    //     let refFunction = () => {};

    //     for (const i = _handlers.length -1; i >= 0; --i) {

    //         const handler = _handlers[i];

    //         refFunction = this.#generateNextFunction(_event, _socket, _args, {handler, next: refFunction});

    //         if (refFunction.error) {

    //             const theError = _theFunction.error
    
    //             this.#pushError(theError);

    //             break;
    //         }
    //     }

    //     return refFunction;
    // }

    // #generateNextFunction(_event, _socket, _args, {handler, next}) {

    //     const ressult = function(error = undefined) {

    //         if (error) {

    //             this.#hanleError(error);

    //             return;
    //         }

    //         if (typeof handler !== 'function') {

    //             return new TypeError('_handler is not a function');
    //         }

    //         if (handler instanceof WSRouter) {

    //             handler.handleIncomingEvent(splittedEvent, _socket, _args, next);

    //         }
    //         else {

    //             handler(_socket, _args, next);
    //         }
    //     }

    //     return ressult.bind(this);
    // }
 
    #tryRegexPattern(_event) {

        return undefined;
    }

    channel(_pattern, ..._handlers) {

        if (typeof _pattern !== 'string') {

            throw new TypeError('channel pattern must be a type of string');
        }

        if (_handlers.length == 0) {

            throw new TypeError('_handlers must be type of function, undefined given');
        }

        let newHandlersChain;

        for (const callback of _handlers) {

            if (typeof callback !== 'function') {

                throw new TypeError('_handler must be a function');
            }

            if (callback.length > 3) {

                this.#pushErrorHandler(callback);

                continue;
            }

            const node = new RouteHandler(callback, this);

            if (!newHandlersChain) {

                newHandlersChain = node;
            }
            else {

                newHandlersChain.pushBack(node);
            }
        }

        const currentHandlersChain = this.#channelList.get(_pattern);

        if (currentHandlersChain) {

            currentHandlersChain.pushBack(newHandlersChain);
        }
        else {

            this.#channelList.set(_pattern, newHandlersChain);
        }
    }

    #pushErrorHandler(_func) {

        /**
         *  the error handler funciton is wrapped in order to catch error thrown 
         *  by the Routehandler and then return it back to the next handler         
         */
        const errorFunction = async function () {

            try {

                await _func(...arguments);
            }
            catch(error) {

                if (error instanceof RuntimeError) {

                    error.breakpoint.resume();
                }
                else {

                    throw error;
                }
            }
        }

        if (!this.#errorHandler) {

            this.#errorHandler = new RouteHandler(errorFunction, this);
        }
        else {

            this.#errorHandler.pushBack(new RouteHandler(errorFunction, this));
        }
    }
}

module.exports = WSRouter;
const RouteError = require('./routeError.js');
const BreakPoint = require('./breakPoint.js');
const {T_WeakTypeNode} = require('../../libs/linkedList.js');
const RuntimeError = require('../../error/rumtimeError.js');
const {EventEmitter} = require('node:events');
const {types} = require('node:util');

const {ProgressTracker, ProgressState} = require('../../libs/progressTracker.js');
const { type } = require('node:os');

module.exports = class RouteHandler extends T_WeakTypeNode{

    /**
     *  RouteHandler original type is linked list
     *  the event context is passed through each node of the linked list 
     *  errors are collected on each node and then dispatch back to the router for handling error
     */


    static get MAX_SYNC_TASK() {

        return 100;
    }


    #tempContext;
    #router;

    #errorCatcher = new EventEmitter();

    // #progression;

    // #currentProgress;

    // get progression() {

    //     return this.#progression;
    // }

    get callbackFunction() {

        return this.data;
    }

    get router() {

        return this.#router;
    }

    constructor(_callback, _router) {

        if (typeof _callback !== 'function') {

            throw new TypeError('_callback is not type of function');
        } 

        super(_callback);

        //this.#progression = new ProgressTracker('next');

        this.#router = _router;

        this.#Init();
    }

    #Init() {

        const _this = this;

        // const currentProgress = new ProgressTracker('current');

        // this.#progression.track(currentProgress);

        // this.#currentProgress = currentProgress;

        this.#errorCatcher.on('error', function(error) {


        })
    }

    #checkIfCallable(_value) {

        const isFunction = typeof _value !== 'function';
        const isProxy = types.isProxy(_value);

        if (!isFunction && !isProxy) {

            throw new TypeError('handler must be function ${typeof}');
        }
    }

    setNext(_node) {

        this.#checkIfCallable(_node._value);

        super.setNext(_node);
    }

    // /**
    //  *  @override
    //  */
    // pushBack(_node) {

    //     const next = this.next;

    //     if (!next) {

    //         this.#progression.track(_node.progression);
    //     }

    //     super.pushBack(_node);
    // }

    
    handle(_taskCount = 0, _eventPack) {

        const _this = this;

        const {handlerArguments, lastNextFunction} = _eventPack;

        const nextHandler = this.next;

        /**
         *  Handler will catches error that throwns by next function 
         */
        try {

            const theHandlerFunction = this.callbackFunction;

            console.log('route handler chain', theHandlerFunction.constructor.name)

            const next = nextFunction;

            const handlerResult = theHandlerFunction(...handlerArguments, next);


            if (handlerResult instanceof Promise) {

                const router = this.#router;

                handlerResult.catch((error) => {

                    console.log('route handler catch async error')
                    router.pushError(error, _eventPack);
                });
            }
        }
        catch (error) {

            this.#router.pushError(error, _eventPack);
        }



        function nextFunction(error) {

            console.log('next called', (error)? 'error' : '');

            if (error) {

                // throwing error here in order to interupt the functionality of the current handler
                throw error;
            }

            if (!nextHandler) {

                lastNextFunction();

                return;
            }

            if (++_taskCount === RouteHandler.MAX_SYNC_TASK) {

                //setImmediate(nextHandler.handle.bind(nextHandler), 0, _eventPack);

                setImmediate((_eventPack) => {

                    nextHandler.handle(0, _eventPack);

                }, _eventPack);
            }
            else {

                nextHandler.handle(_taskCount, _eventPack);
            }
        }
    }

    #throwRuntimeError(error) {

        const breakpoint = new BreakPoint(this, ...this.#tempContext);
        const runtimeError = new RouteError(error, {breakpoint: breakpoint});

        throw runtimeError;
    }

    #prepareRuntimeError(error) {

        const breakpoint = new BreakPoint(this, ...this.#tempContext);
        const runtimeError = new RouteError(error, {breakpoint: breakpoint});

        return runtimeError;
    }
}
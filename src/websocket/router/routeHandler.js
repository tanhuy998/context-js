const RouteError = require('./routeError.js');
const BreakPoint = require('./breakPoint.js');
const {T_WeakTypeNode} = require('../../libs/linkedList.js');
const RuntimeError = require('../../error/rumtimeError.js');
const {EventEmitter} = require('node:events');
const {types} = require('node:util');
const {METADATA} = require('../../constants.js');
const {ProgressTracker, ProgressState} = require('../../libs/progressTracker.js');
const { type } = require('node:os');
//const WSRouter = require('./wsRouter.js');

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

    #maxSyncTask;

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

    get maxSyncTask() {

        return this.#maxSyncTask || RouteHandler.MAX_SYNC_TASK;
    }


    constructor(_callback, {router, maxSyncTask}) {

        if (typeof _callback !== 'function') {

            throw new TypeError('_callback is not type of function');
        } 

        super(_callback);

        //this.#progression = new ProgressTracker('next');

        this.#maxSyncTask = maxSyncTask || RouteHandler.MAX_SYNC_TASK;
        this.#router = router;

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

        const {handlerArguments, lastNextFunction, pushError} = _eventPack;

        const nextHandler = this.next;

        const maxSyncTask  = this.#maxSyncTask;

        /**
         *  Handler will catches error that throwns by next function 
         */
        try {

            const theHandler = this.callbackFunction;

            //console.log('route handler chain', theHandlerFunction.constructor.name)

            const next = nextFunction;

            const [event, res, preprocessdChannel] = handlerArguments;

            let handlerResult;

            //console.log('handle', preprocessdChannel);

            if (theHandler[METADATA] && theHandler[METADATA].isRouter) {
                // use METADATA property in order to get rid of circular denpendency
                // in checking if the handler is a router

                handlerResult = theHandler.handleIncomingEvent(preprocessdChannel, event, next);
            }
            else {

                handlerResult = theHandler(event, res, next);
            }


            if (handlerResult instanceof Promise) {

                //const router = this.#router;

                handlerResult.catch((error) => {

                    //console.log('route handler catch async error')
                    //router.pushError(error, _eventPack);

                    pushError(error);
                });
            }
        }
        catch (error) {

            //this.#router.pushError(error, _eventPack);
            pushError(error);
        }



        function nextFunction(error) {

            //console.log('next called', (error)? 'error' : '');

            if (error) {

                // throwing error here in order to interupt the functionality of the current handler
                throw error;
            }

            if (!nextHandler) {

                lastNextFunction();

                return;
            }

            if (++_taskCount > maxSyncTask) {

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
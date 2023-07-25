const RouteError = require('./routeError.js');
const BreakPoint = require('./breakPoint.js');
const {T_WeakTypeNode} = require('../../libs/linkedList.js');
const {EventEmitter} = require('node:events');
const {types} = require('node:util');
const {METADATA} = require('../../constants.js');

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

    get callbackFunction() {

        return this.data;
    }

    get router() {

        return this.#router;
    }

    get maxSyncTask() {

        return this.#maxSyncTask || RouteHandler.MAX_SYNC_TASK;
    }

    static count = 0;
    #id;
    get id() {

        return this.#id;
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

        this.#id = RouteHandler.count++;
    }

    #Init() {

        const _this = this;

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
        
        this.#checkIfCallable(_node.value);

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

        const {handlerArguments, lastNextFunction, pushError, eventDispatcher} = _eventPack;

        const nextHandler = this.next;

        const maxSyncTask  = this.#maxSyncTask;

        /**
         *  Handler will catches error that throwns by next function 
         */
        try {

            const theHandler = this.callbackFunction;

            const next = nextFunction;

            const [event, res, preprocessdChannel] = handlerArguments;

            let handlerResult;

            if (theHandler[METADATA] && theHandler[METADATA].isRouter) {
                // use METADATA property in order to get rid of circular denpendency
                // in checking if the handler is a router

                const footPrint = {
                    event,                      // WSEvent
                    eventDispatcher,            // type of WSRouter
                    dispatchError: pushError    // typeof Function
                }

                handlerResult = theHandler.handleIncomingEvent(preprocessdChannel, footPrint, next);
            }
            else {

                handlerResult = theHandler(event, res, next);
            }


            if (handlerResult instanceof Promise) {

                //const router = this.#router;

                handlerResult.catch((error) => {

                    pushError(error);
                });
            }
        }
        catch (error) {

            //this.#router.pushError(error, _eventPack);
            pushError(error);
        }



        function nextFunction(error) {

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
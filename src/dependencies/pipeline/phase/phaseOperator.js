const HandlerKind = require('../handlerKind.js');
const HanlderInitializeError = require('../../errors/pipeline/handlerInitializeError.js');
const ContextHandler = require('../../handler/contextHandler.js');

/**
 * @typedef {import('../../handler/contextHandler.js')} ContextHandler
 * @typedef {import('../payload/payload.js')} Payload
 * @typedef {import('../payload/breakpoint.js')} BreakPoint
 * @typedef {import('../../handler/contextHandler.js')} ContextHandler
 * @typedef {import('../../handler/errorHandler.js')} ErrorHandler
 * @typedef {import('../../context/context.js')} Context
 */


// const functionTraps = {
//     /**
//      * 
//      * @param {Function} target 
//      * @param {Object} _this 
//      * @param {Iterable} args 
//      * @returns 
//      */
//     apply: function(target, _this, args) {

//         /**@type {Context} */
//         const context = _this.context;
//         const DI = context?.global?.DI;
        
//         if (args.length > 0 || typeof DI?.invoke !== 'function') {
            
//             return target.call(_this, ...args);
//         }
        
//         return DI.invoke(_this, target, context);
//     }
// }

// const traps = {
//     /**
//      * @param {ContextHandler} target 
//      * @param {string} prop 
//      * @returns 
//      */
//     get: function(target, prop) {

//         const theProp = target[prop];
        
//         if (typeof theProp !== 'function') {

//             return theProp;
//         }

//         return new Proxy(theProp, functionTraps);
//     }
// };

module.exports = class PhaseOperator {

    /**@type {Payload | BreakPoint} */
    #payload;

    /**@type {ContextHandler} */
    #handlerInstance;

    #handlerAbstract;

    #kind;
    
    /**@returns {Payload | BreakPoint}*/
    get payload() {

        return this.#payload;
    }

    /**@returns {ContextHandler | ErrorHandler | any} */
    get handlerInstance() {

        return this.#handlerInstance;
    }

    /**@returns {boolean} */
    get hasErrorHandler() {

        if (this.#kind === HandlerKind.FUNCTION) {

            return false;
        }

        return typeof this.#handlerAbstract?.prototype.onError === 'function';
    }

    /**
     * 
     * @param {Payload | BreakPoint} _payload 
     * @param {*} _handlerAbstract 
     * @param {*} _kindOfHandler 
     */
    constructor(_payload, _handlerAbstract, _kindOfHandler) {

        this.#payload = _payload
        this.#handlerAbstract = _handlerAbstract;
        this.#kind = _kindOfHandler;

        this.#init();
    }

    #init() {

        if (!this.#kind) {

            this.#kind = HandlerKind.classify(this.handlerAbstract);
        }
    }

    /**
     * 
     * @param {Array<any>} _additionalArgs 
     * @returns 
     */
    operate(_additionalArgs = []) {

        return this.#prepareThenInvoke('handle', _additionalArgs);
    }

    // #handleInternalError(_error) {

    //     if (!this.hasErrorHandler) {

    //         throw _error;
    //     }

    //     const handlerInstance = this.#handlerInstance;
        
    //     if (!handlerInstance) {

    //         throw _error;
    //     }

    //     const _fn = this.#prepare('onError');

    //     return _fn();
    // }

    /**
     * 
     * @param {Payload} _payload 
     */
    #prepareThenInvoke(_methodName = 'handle', _additionalArgs = []) {

        const _payload = this.#payload;

        const handler = this.#initiateHandler();

        const context = _payload.context;
        
        if (handler === undefined) {
            
            throw new HanlderInitializeError(this, this._pipeline, context, this.#handlerAbstract)
        }

        this.#injectComponents(handler, context);
        
        return this.#classifyThenReturnFunction(handler, _methodName, _additionalArgs);
    }

    #classifyThenReturnFunction(handler, _methodName, _additionalArgs = []) {

        const _payload = this.#payload;

        const context = _payload.context;

        const DI = _payload.context.global.DI;
       
        if (this.#kind === HandlerKind.REGULAR) {
            
            //const wrapper = new Proxy(handler, traps);
            
            this.#handlerInstance = handler;
            
            return handler[_methodName].call(handler);
        }

        let fn, args, obj;

        if (this.#kind === HandlerKind.FUNCTION) {
            
            args = DI.resolveArguments(handler, context) ?? [];

            args = (args.length > 0) ? [...args, ..._additionalArgs] : [_payload.lastHandledValue, context, _payload, ..._additionalArgs];             
            
            obj = null;

            fn = handler;
        }
        else if (this.#kind === HandlerKind.ES6_CLASS) {
            
            args = DI.resolveArguments(handler[_methodName], context) ?? [];

            obj = handler;

            fn = handler[_methodName];
        }

       
        if (args instanceof Promise) {
           
            return args.then(async (_asyncArgs = []) => {
                
                const _args = [];

                for (const e of _asyncArgs) {
                    
                    _args.push(await e);
                }
                
                return fn.call(obj, ..._args);
            })
        }
        else {
            
            return fn.call(obj, ...args);
        }
    }

    /**
     * 
     * @param {Object | Function} _handlerInstance 
     * @param {Context} _context 
     */
    #injectComponents(_handlerInstance) {

        const _context = this.#payload.context;

        const globalContext = _context.global;

        if (typeof globalContext === 'function') {

            const config = {
                context: _context
            }

            if (this.#kind === HandlerKind.FUNCTION || this.#kind === HandlerKind.PIPELINE) {

                return;
            }

            // inject fields first
            globalContext.DI?.inject(_handlerInstance, config);
        }
    }

    /**
     * 
     * @param {Payload} _payload 
     * @returns 
     */
    #initiateHandler() {

        const _payload = this.#payload;

        const kind = this.#kind;

        const handlerAbstract = this.#handlerAbstract;
        
        const devise = _payload.lastHandledValue;

        const context = _payload.context;
        console.log('phase operation', handlerAbstract)
        switch (kind) {
            case HandlerKind.ES6_CLASS:
                return new handlerAbstract();
            case HandlerKind.REGULAR:
                return this.#resolveContextHandlerInstance(handlerAbstract, _payload);
            case HandlerKind.FUNCTION:
                return handlerAbstract;
            default:
                return undefined;
        }
    }

    /**
     * 
     * @param {ContextHandler} _HandlerClass 
     * @param {Payload} _payload 
     * 
     * @returns {ContextHandler}
     */
    #resolveContextHandlerInstance(_HandlerClass, _payload) {

        const context = _payload.context;

        const handlerObj = new _HandlerClass(context, _payload.lastHandledValue);
        console.log(1);
        context.scope.override(ContextHandler, _HandlerClass, {
            defaultInstance: handlerObj
        });

        return handlerObj;
    }
}
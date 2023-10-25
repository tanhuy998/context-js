const HandlerKind = require('../handlerKind.js');
const HanlderInitializeError = require('../../errors/pipeline/handlerInitializeError.js');

/**
 * @typedef {import('../../handler/constextHandler.js')} ContextHandler
 * @typedef {import('../payload/payload.js')} Payload
 */


const functionTraps = {
    /**
     * 
     * @param {Function} target 
     * @param {Object} _this 
     * @param {Iterable} args 
     * @returns 
     */
    apply: function(target, _this, args) {

        /**@type {Context} */
        const context = _this.context;
        const DI = context?.global?.DI;
        
        if (args.length > 0 || typeof DI?.invoke !== 'function') {
            
            return target.call(_this, ...args);
        }
        
        return DI.invoke(_this, target, context);
    }
}

const traps = {
    /**
     * @param {ContextHandler} target 
     * @param {string} prop 
     * @returns 
     */
    get: function(target, prop) {

        const theProp = target[prop];

        if (typeof theProp !== 'function') {

            return theProp;
        }

        return new Proxy(theProp, functionTraps);
    }
};

module.exports = class PhaseOperator {

    /**@type {Payload} */
    #payload;

    /**@type {ContextHandler} */
    #handlerInstance;

    #handlerAbstract;

    #kind;

    get payload() {

        return this.#payload;
    }

    get handlerInstance() {

        return this.#handlerInstance;
    }

    
    get hasErrorHandler() {

        if (this.#kind === HandlerKind.FUNCTION) {

            return false;
        }

        return typeof this.#handlerAbstract?.prototype.onError === 'function';
    }

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

    async operate() {

        try {

            const handle = this.#prepare();

            return await handle();
        }
        catch (error) {

            return await this.#handleInternalError(error);
        }
    }

    #handleInternalError(_error) {

        if (!this.hasErrorHandler) {

            throw _error;
        }

        const handlerInstance = this.#handlerInstance;
        
        if (!handlerInstance) {

            throw _error;
        }

        return this.#prepare('onError')
    }

    /**
     * 
     * @param {Payload} _payload 
     */
    #prepare(_methodName = 'handle') {

        const _payload = this.#payload;

        const handler = this.#initiateHandler();

        const context = _payload.context;
        
        if (handler === undefined) {

            throw new HanlderInitializeError(this, this._pipeline, context, this.#handlerAbstract)
        }

        this.#injectComponents(handler, context);

        return this.#classifyThenReturnHandleFunction(handler, _methodName);
    }

    #classifyThenReturnHandleFunction(handler, _methodName) {

        const _payload = this.#payload;

        const context = _payload.context;

        const DI = _payload.context.global.DI;

        if (this.#kind === HandlerKind.FUNCTION) {

            const args = DI.resolveArguments(handler, context) ?? [];

            this.#handlerInstance = null;

            return handler.bind(null, ...(args.length > 0 ? args : [_payload]));
        }
        else if (this.#kind === HandlerKind.ES6_CLASS) {

            this.#handlerInstance = handler;

            const args = DI.resolveArguments(handler[_methodName], context) ?? [];
            
            return handler[_methodName].bind(handler, ...args);
        }
        else {

            const wrapper = new Proxy(handler, traps);

            this.#handlerInstance = wrapper;

            return wrapper[_methodName].bind(wrapper);
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
        
        const devise = _payload.last;

        const context = _payload.context;

        switch (kind) {
            case HandlerKind.ES6_CLASS:
                return new handlerAbstract();
            case HandlerKind.REGULAR:
                return new handlerAbstract(context, devise);
            case HandlerKind.FUNCTION:
                return handlerAbstract;
            default:
                return undefined;
        }
    }
}